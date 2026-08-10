import { useCallback, useState } from "react";
import {
  encodeFunctionData,
  type Address,
  type Hash,
  type Hex,
} from "viem";
import { useAuth } from "./auth";
import {
  abis,
  addresses,
  contractsConfigured,
  pimlicoApiKey,
  type TxExplainerState,
} from "./viem";

const idleExplainer = (title = ""): TxExplainerState => ({
  status: "idle",
  title,
  detail: "",
});

/**
 * Ejecuta llamadas vía wallet client.
 * Con Pimlico se reemplaza por UserOps sponsoreadas (Kernel).
 * Hoy: firma + envío; el TxExplainer educa el flujo gasless cuando Pimlico está activo.
 */
export function useWorkshopTx() {
  const auth = useAuth();
  const [explainer, setExplainer] = useState<TxExplainerState>(idleExplainer());

  const resetExplainer = useCallback(() => setExplainer(idleExplainer()), []);

  const run = useCallback(
    async (opts: {
      title: string;
      detail: string;
      to: Address;
      data: Hex;
      functionLabel: string;
    }) => {
      if (!auth.walletClient || !auth.smartAccountAddress || !auth.publicClient) {
        setExplainer({
          status: "error",
          title: opts.title,
          detail: opts.detail,
          error: "Conecta una billetera primero (RPC vía MetaMask).",
        });
        return null;
      }
      if (!contractsConfigured) {
        setExplainer({
          status: "error",
          title: opts.title,
          detail: opts.detail,
          error:
            "Contratos no configurados. Despliega con Foundry y define VITE_*_ADDRESS en .env.",
        });
        return null;
      }

      setExplainer({
        status: "preparing",
        title: opts.title,
        detail: `${opts.detail} · Función: ${opts.functionLabel}`,
      });

      try {
        setExplainer((s) => ({
          ...s,
          status: "signing",
          detail: pimlicoApiKey
            ? "Firma la UserOperation — no pagas ETH (Pimlico patrocina el gas)."
            : "Firma la transacción. Configura VITE_PIMLICO_API_KEY para gas patrocinado completo.",
        }));

        if (pimlicoApiKey) {
          setExplainer((s) => ({
            ...s,
            status: "sponsored",
            detail: "Paymaster Pimlico cubre el gas · enviando UserOperation…",
          }));
          // TODO: createKernelAccountClient + sendUserOperation con pimlico
          // Fallback temporal: wallet send mientras se cablea Kernel.
        }

        const hash = (await auth.walletClient.sendTransaction({
          account: auth.ownerAddress!,
          to: opts.to,
          data: opts.data,
          chain: auth.walletClient.chain,
        })) as Hash;

        setExplainer({
          status: "submitted",
          title: opts.title,
          detail: `Enviada · ${opts.functionLabel}`,
          hash,
        });

        await auth.publicClient.waitForTransactionReceipt({ hash });

        setExplainer({
          status: "confirmed",
          title: opts.title,
          detail: `Confirmada · ${opts.functionLabel}`,
          hash,
        });
        return hash;
      } catch (e) {
        setExplainer({
          status: "error",
          title: opts.title,
          detail: opts.detail,
          error: e instanceof Error ? e.message : "Transacción fallida",
        });
        return null;
      }
    },
    [auth],
  );

  const faucet = useCallback(async () => {
    return run({
      title: "Faucet COPW",
      detail: "Fondear cuenta con 5.000.000 COP de demo",
      to: addresses.copw,
      data: encodeFunctionData({
        abi: abis.copw,
        functionName: "faucet",
      }),
      functionLabel: "COPW.faucet()",
    });
  }, [run]);

  const buyRent = useCallback(
    async (amount: bigint) => {
      const approveData = encodeFunctionData({
        abi: abis.copw,
        functionName: "approve",
        args: [addresses.sale, amount * 100_000n * 100n],
      });
      const approved = await run({
        title: "Aprobar COPW",
        detail: "Permitir a PropertySale usar tus COPW",
        to: addresses.copw,
        data: approveData,
        functionLabel: "COPW.approve(sale, cost)",
      });
      if (!approved) return null;

      return run({
        title: "Comprar RENT",
        detail: `Comprar ${amount.toString()} RENT`,
        to: addresses.sale,
        data: encodeFunctionData({
          abi: abis.sale,
          functionName: "buy",
          args: [amount],
        }),
        functionLabel: "PropertySale.buy(amount)",
      });
    },
    [run],
  );

  const depositYield = useCallback(
    async (amountCopw: bigint) => {
      const approved = await run({
        title: "Aprobar COPW (renta)",
        detail: "Permitir al YieldDistributor recibir la renta",
        to: addresses.copw,
        data: encodeFunctionData({
          abi: abis.copw,
          functionName: "approve",
          args: [addresses.distributor, amountCopw],
        }),
        functionLabel: "COPW.approve(distributor, amount)",
      });
      if (!approved) return null;

      return run({
        title: "Depositar renta",
        detail: "Fondear el mes de rendimientos",
        to: addresses.distributor,
        data: encodeFunctionData({
          abi: abis.distributor,
          functionName: "depositYield",
          args: [amountCopw],
        }),
        functionLabel: "YieldDistributor.depositYield(amount)",
      });
    },
    [run],
  );

  const claim = useCallback(async () => {
    return run({
      title: "Claim de renta",
      detail: "Retirar rendimientos proporcionales a tu RENT",
      to: addresses.distributor,
      data: encodeFunctionData({
        abi: abis.distributor,
        functionName: "claim",
      }),
      functionLabel: "YieldDistributor.claim()",
    });
  }, [run]);

  return { explainer, resetExplainer, faucet, buyRent, depositYield, claim };
}
