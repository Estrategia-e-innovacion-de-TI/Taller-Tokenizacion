import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import {
  MAX_SUPPLY_RENT,
  PRICE_PER_RENT_COPW,
  PROPERTY_VALUE_COP,
} from "./format-cop";
import { abis, addresses, contractsConfigured } from "./viem";

export type AccountingSnapshot = {
  /** COPW del usuario (2 decimales) */
  copw: bigint;
  /** RENT del usuario (enteros) */
  rent: bigint;
  /** Renta claimable en COPW */
  pending: bigint;
  /** Supply total de RENT emitido */
  rentSupply: bigint;
  /** Tope de supply (contrato o constante) */
  maxSupply: bigint;
  /** Suma histórica depositada al YieldDistributor */
  totalDeposited: bigint;
  /** Época / Nº de depósitos de renta */
  epochId: bigint;
  /** COPW aún en el distributor (pool claimable global) */
  poolCopw: bigint;
  loading: boolean;
};

const empty: Omit<AccountingSnapshot, "loading"> = {
  copw: 0n,
  rent: 0n,
  pending: 0n,
  rentSupply: 0n,
  maxSupply: MAX_SUPPLY_RENT,
  totalDeposited: 0n,
  epochId: 0n,
  poolCopw: 0n,
};

/**
 * Contabilidad on-chain: posición del usuario + estado del protocolo.
 */
export function useBalances() {
  const { smartAccountAddress, isConnected, publicClient } = useAuth();
  const [state, setState] = useState<AccountingSnapshot>({
    ...empty,
    loading: false,
  });

  const refresh = useCallback(async () => {
    if (!contractsConfigured || !publicClient) {
      setState({ ...empty, loading: false });
      return;
    }

    setState((s) => ({ ...s, loading: true }));
    try {
      const protocolReads = Promise.all([
        publicClient.readContract({
          address: addresses.rent,
          abi: abis.rent,
          functionName: "totalSupply",
        }) as Promise<bigint>,
        publicClient.readContract({
          address: addresses.rent,
          abi: abis.rent,
          functionName: "MAX_SUPPLY",
        }) as Promise<bigint>,
        publicClient.readContract({
          address: addresses.distributor,
          abi: abis.distributor,
          functionName: "totalDeposited",
        }) as Promise<bigint>,
        publicClient.readContract({
          address: addresses.distributor,
          abi: abis.distributor,
          functionName: "epochId",
        }) as Promise<bigint>,
        publicClient.readContract({
          address: addresses.copw,
          abi: abis.copw,
          functionName: "balanceOf",
          args: [addresses.distributor],
        }) as Promise<bigint>,
      ]);

      const userReads =
        isConnected && smartAccountAddress
          ? Promise.all([
              publicClient.readContract({
                address: addresses.copw,
                abi: abis.copw,
                functionName: "balanceOf",
                args: [smartAccountAddress],
              }) as Promise<bigint>,
              publicClient.readContract({
                address: addresses.rent,
                abi: abis.rent,
                functionName: "balanceOf",
                args: [smartAccountAddress],
              }) as Promise<bigint>,
              publicClient.readContract({
                address: addresses.distributor,
                abi: abis.distributor,
                functionName: "pendingYield",
                args: [smartAccountAddress],
              }) as Promise<bigint>,
            ])
          : Promise.resolve([0n, 0n, 0n] as const);

      const [[rentSupply, maxSupply, totalDeposited, epochId, poolCopw], [copw, rent, pending]] =
        await Promise.all([protocolReads, userReads]);

      setState({
        copw,
        rent,
        pending,
        rentSupply,
        maxSupply,
        totalDeposited,
        epochId,
        poolCopw,
        loading: false,
      });
    } catch {
      setState({ ...empty, loading: false });
    }
  }, [isConnected, smartAccountAddress, publicClient]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 12_000);
    return () => clearInterval(id);
  }, [refresh]);

  const ownershipBps =
    state.maxSupply > 0n ? (state.rent * 10_000n) / state.maxSupply : 0n;
  const notionalCopw = state.rent * PRICE_PER_RENT_COPW;
  const propertyShareCop =
    state.maxSupply > 0n
      ? (PROPERTY_VALUE_COP * state.rent) / state.maxSupply
      : 0n;
  const supplyBps =
    state.maxSupply > 0n
      ? (state.rentSupply * 10_000n) / state.maxSupply
      : 0n;

  return {
    ...state,
    ownershipBps,
    notionalCopw,
    propertyShareCop,
    supplyBps,
    refresh,
  };
}

/** Formatea basis points (10000 = 100%) con 2 decimales. */
export function formatBpsPercent(bps: bigint): string {
  const whole = bps / 100n;
  const frac = bps % 100n;
  return `${whole.toString()},${frac.toString().padStart(2, "0")}%`;
}
