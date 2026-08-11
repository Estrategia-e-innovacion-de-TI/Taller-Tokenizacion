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
  type GasMode,
  type TxExplainerState,
} from "./viem";

const idleExplainer = (title = ""): TxExplainerState => ({
  status: "idle",
  title,
  detail: "",
});

type Call = {
  to: Address;
  data: Hex;
  value?: bigint;
};

/**
 * MetaMask: sendTransaction EOA (pagas gas), llamadas en serie.
 * Email: Kernel UserOp + paymaster; varias llamadas van en un solo batch
 * para evitar AA25 (nonce inválido entre UserOps seguidas).
 */
export function useWorkshopTx() {
  const auth = useAuth();
  const [explainer, setExplainer] = useState<TxExplainerState>(idleExplainer());

  const resetExplainer = useCallback(() => setExplainer(idleExplainer()), []);

  const gasSponsored =
    auth.mode === "email" && Boolean(auth.smartAccountClient);

  const busy =
    explainer.status === "preparing" ||
    explainer.status === "signing" ||
    explainer.status === "sponsored" ||
    explainer.status === "submitted";

  const run = useCallback(
    async (opts: {
      title: string;
      detail: string;
      calls: Call[];
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
      if (opts.calls.length === 0) {
        setExplainer({
          status: "error",
          title: opts.title,
          detail: opts.detail,
          error: "No hay llamadas para enviar.",
        });
        return null;
      }

      const sponsored =
        auth.mode === "email" && Boolean(auth.smartAccountClient);
      const gasMode: GasMode =
        auth.mode === "wallet"
          ? "wallet"
          : sponsored
            ? "sponsored"
            : "email";

      setExplainer({
        status: "preparing",
        title: opts.title,
        detail: `${opts.detail} · ${opts.functionLabel}`,
        gasSponsored: sponsored,
        gasMode,
      });

      try {
        let hash: Hash;

        if (sponsored && auth.smartAccountClient) {
          setExplainer((s) => ({
            ...s,
            status: "signing",
            detail:
              opts.calls.length > 1
                ? "Firmando lote (approve + acción) con Turnkey…"
                : "Firma la UserOperation (Turnkey) — Pimlico patrocina el gas.",
          }));
          setExplainer((s) => ({
            ...s,
            status: "sponsored",
            detail:
              opts.calls.length > 1
                ? "Paymaster Pimlico · una UserOp con varias llamadas…"
                : "Paymaster Pimlico cubre el gas · enviando UserOperation…",
          }));

          const userOpHash = await auth.smartAccountClient.sendUserOperation({
            calls: opts.calls.map((c) => ({
              to: c.to,
              data: c.data,
              value: c.value ?? 0n,
            })),
          });

          setExplainer((s) => ({
            ...s,
            status: "submitted",
            detail: "UserOp enviada · esperando inclusión en bloque…",
          }));

          const receipt =
            await auth.smartAccountClient.waitForUserOperationReceipt({
              hash: userOpHash,
            });
          hash = receipt.receipt.transactionHash;
        } else if (auth.mode === "wallet" && auth.walletClient) {
          const account = auth.walletClient.account;
          if (!account) {
            throw new Error("No hay cuenta asociada al wallet client.");
          }

          setExplainer((s) => ({
            ...s,
            status: "signing",
            gasSponsored: false,
            gasMode: "wallet",
            detail:
              opts.calls.length > 1
                ? "Firma en MetaMask (varias txs seguidas). Pagas gas en ETH."
                : "Firma en MetaMask. Pagas el gas en ETH de Sepolia (sin patrocinio).",
          }));

          let lastHash: Hash | null = null;
          for (let i = 0; i < opts.calls.length; i++) {
            const call = opts.calls[i]!;
            setExplainer((s) => ({
              ...s,
              status: "signing",
              detail: `Firma en MetaMask (${i + 1}/${opts.calls.length})…`,
            }));
            lastHash = (await auth.walletClient.sendTransaction({
              account,
              to: call.to,
              data: call.data,
              value: call.value ?? 0n,
              chain: auth.walletClient.chain ?? chain,
            })) as Hash;
            setExplainer((s) => ({
              ...s,
              status: "submitted",
              hash: lastHash!,
              detail: `Tx ${i + 1}/${opts.calls.length} enviada · esperando confirmación…`,
            }));
            await auth.publicClient.waitForTransactionReceipt({
              hash: lastHash,
            });
          }
          hash = lastHash!;
        } else {
          throw new Error(
            "Login email sin smart account patrocinada. Reconecta el correo (hace falta VITE_PIMLICO_API_KEY).",
          );
        }

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
        const raw = e instanceof Error ? e.message : "Transacción fallida";
        const friendly = raw.includes("AA25")
          ? "Nonce de la smart account inválido (UserOp previa en curso o colisión). Espera unos segundos y reintenta; si persiste, Salir y vuelve a entrar con el correo."
          : raw;
        setExplainer({
          status: "error",
          title: opts.title,
          detail: opts.detail,
          error: friendly,
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
      calls: [
        {
          to: addresses.copw,
          data: encodeFunctionData({
            abi: abis.copw,
            functionName: "faucet",
          }),
        },
      ],
      functionLabel: "COPW.faucet()",
    });
  }, [run]);

  const buyRent = useCallback(
    async (amount: bigint) => {
      const cost = amount * 100_000n * 100n;
      return run({
        title: "Comprar RENT",
        detail: `Aprobar COPW y comprar ${amount.toString()} RENT`,
        calls: [
          {
            to: addresses.copw,
            data: encodeFunctionData({
              abi: abis.copw,
              functionName: "approve",
              args: [addresses.sale, cost],
            }),
          },
          {
            to: addresses.sale,
            data: encodeFunctionData({
              abi: abis.sale,
              functionName: "buy",
              args: [amount],
            }),
          },
        ],
        functionLabel: "approve + PropertySale.buy (lote)",
      });
    },
    [run],
  );

  const depositYield = useCallback(
    async (amountCopw: bigint) => {
      return run({
        title: "Depositar renta",
        detail: "Aprobar COPW y fondear el mes de rendimientos",
        calls: [
          {
            to: addresses.copw,
            data: encodeFunctionData({
              abi: abis.copw,
              functionName: "approve",
              args: [addresses.distributor, amountCopw],
            }),
          },
          {
            to: addresses.distributor,
            data: encodeFunctionData({
              abi: abis.distributor,
              functionName: "depositYield",
              args: [amountCopw],
            }),
          },
        ],
        functionLabel: "approve + depositYield (lote)",
      });
    },
    [run],
  );

  const claim = useCallback(async () => {
    return run({
      title: "Claim de renta",
      detail: "Retirar rendimientos proporcionales a tu RENT",
      calls: [
        {
          to: addresses.distributor,
          data: encodeFunctionData({
            abi: abis.distributor,
            functionName: "claim",
          }),
        },
      ],
      functionLabel: "YieldDistributor.claim()",
    });
  }, [run]);

  const transferRent = useCallback(
    async (to: Address, amount: bigint) => {
      if (amount <= 0n) {
        setExplainer({
          status: "error",
          title: "Transferir RENT",
          detail: "Mercado secundario P2P",
          error: "La cantidad debe ser al menos 1 RENT.",
        });
        return null;
      }
      return run({
        title: "Transferir RENT",
        detail: `Enviar ${amount.toString()} RENT a ${to}`,
        calls: [
          {
            to: addresses.rent,
            data: encodeFunctionData({
              abi: abis.rent,
              functionName: "transfer",
              args: [to, amount],
            }),
          },
        ],
        functionLabel: "RENT.transfer(to, amount)",
      });
    },
    [run],
  );

  return {
    explainer,
    resetExplainer,
    busy,
    faucet,
    buyRent,
    depositYield,
    claim,
    transferRent,
    gasSponsored,
  };
}
