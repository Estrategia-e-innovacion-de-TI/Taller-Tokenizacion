import { useCallback, useState } from "react";
import {
  encodeFunctionData,
  type Address,
  type Hash,
  type Hex,
} from "viem";
import { useAuth } from "./auth";
import { chain } from "./viem";
import {
  abis,
  addresses,
  contractsConfigured,
  type TxExplainerState,
} from "./viem";

const idleExplainer = (title = ""): TxExplainerState => ({
  status: "idle",
  title,
  detail: "",
});

/**
 * MetaMask: sendTransaction EOA (pagas gas).
 * Email: Kernel UserOp + paymaster Pimlico (gas patrocinado).
 */
export function useWorkshopTx() {
  const auth = useAuth();
  const [explainer, setExplainer] = useState<TxExplainerState>(idleExplainer());

  const resetExplainer = useCallback(() => setExplainer(idleExplainer()), []);

  const gasSponsored =
    auth.mode === "email" && Boolean(auth.smartAccountClient);

  const run = useCallback(
    async (opts: {
      title: string;
      detail: string;
      to: Address;
      data: Hex;
      functionLabel: string;
    }) => {
      const connected =
        auth.mode === "email"
          ? Boolean(auth.smartAccountClient && auth.smartAccountAddress)
          : Boolean(auth.walletClient && auth.smartAccountAddress);

      if (!connected || !auth.publicClient) {
        setExplainer({
          status: "error",
          title: opts.title,
          detail: opts.detail,
          error: "Conecta con email o billetera primero.",
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

      const sponsored =
        auth.mode === "email" && Boolean(auth.smartAccountClient);
      const gasMode =
        auth.mode === "wallet"
          ? ("wallet" as const)
          : sponsored
            ? ("sponsored" as const)
            : ("email" as const);

      setExplainer({
        status: "preparing",
        title: opts.title,
        detail: `${opts.detail} · Función: ${opts.functionLabel}`,
        gasSponsored: sponsored,
        gasMode,
      });

      try {
        let hash: Hash;

        if (sponsored && auth.smartAccountClient) {
          setExplainer((s) => ({
            ...s,
            status: "signing",
            gasSponsored: true,
            gasMode: "sponsored",
            detail:
              "Firma la UserOperation (Turnkey) — Pimlico patrocina el gas.",
          }));
          setExplainer((s) => ({
            ...s,
            status: "sponsored",
            detail: "Paymaster Pimlico cubre el gas · enviando UserOperation…",
          }));

          hash = (await auth.smartAccountClient.sendTransaction({
            account: auth.smartAccountClient.account,
            chain,
            to: opts.to,
            data: opts.data,
            value: 0n,
          })) as Hash;
        } else if (auth.mode === "wallet" && auth.walletClient) {
          setExplainer((s) => ({
            ...s,
            status: "signing",
            gasSponsored: false,
            gasMode: "wallet",
            detail:
              "Firma en MetaMask. Pagas el gas en ETH de Sepolia (sin patrocinio).",
          }));

          const account = auth.walletClient.account;
          if (!account) {
            throw new Error("No hay cuenta asociada al wallet client.");
          }

          hash = (await auth.walletClient.sendTransaction({
            account,
            to: opts.to,
            data: opts.data,
            chain: auth.walletClient.chain,
          })) as Hash;
        } else {
          throw new Error(
            "Login email sin smart account patrocinada. Reconecta el correo (hace falta VITE_PIMLICO_API_KEY).",
          );
        }

        setExplainer({
          status: "submitted",
          title: opts.title,
          detail: `Enviada · ${opts.functionLabel}`,
          hash,
          gasSponsored: sponsored,
          gasMode,
        });

        await auth.publicClient.waitForTransactionReceipt({ hash });

        setExplainer({
          status: "confirmed",
          title: opts.title,
          detail: `Confirmada · ${opts.functionLabel}`,
          hash,
          gasSponsored: sponsored,
          gasMode,
        });
        return hash;
      } catch (e) {
        setExplainer({
          status: "error",
          title: opts.title,
          detail: opts.detail,
          error: e instanceof Error ? e.message : "Transacción fallida",
          gasSponsored: sponsored,
          gasMode,
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

  return {
    explainer,
    resetExplainer,
    faucet,
    buyRent,
    depositYield,
    claim,
    gasSponsored,
  };
}
