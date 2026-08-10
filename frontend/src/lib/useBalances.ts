import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth";
import { abis, addresses, contractsConfigured } from "./viem";

export function useBalances() {
  const { smartAccountAddress, isConnected, publicClient } = useAuth();
  const [copw, setCopw] = useState(0n);
  const [rent, setRent] = useState(0n);
  const [pending, setPending] = useState(0n);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (
      !isConnected ||
      !smartAccountAddress ||
      !contractsConfigured ||
      !publicClient
    ) {
      setCopw(0n);
      setRent(0n);
      setPending(0n);
      return;
    }
    setLoading(true);
    try {
      const [c, r, p] = await Promise.all([
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
      ]);
      setCopw(c);
      setRent(r);
      setPending(p);
    } catch {
      // Contratos no desplegados / red incorrecta en la billetera
    } finally {
      setLoading(false);
    }
  }, [isConnected, smartAccountAddress, publicClient]);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 12_000);
    return () => clearInterval(id);
  }, [refresh]);

  return { copw, rent, pending, loading, refresh };
}
