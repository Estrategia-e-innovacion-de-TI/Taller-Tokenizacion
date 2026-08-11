import type { TxExplainerState } from "../../lib/viem";
import { sepoliaTxUrl } from "../../lib/viem";

const statusLabel: Record<TxExplainerState["status"], string> = {
  idle: "Listo",
  preparing: "Preparando",
  signing: "Firma",
  sponsored: "Gas patrocinado",
  submitted: "Enviada",
  confirmed: "Confirmada",
  error: "Error",
};

const gasHint: Record<NonNullable<TxExplainerState["gasMode"]>, string> = {
  sponsored: "Gas patrocinado · no se usa ETH",
  wallet: "MetaMask · pagas ETH de Sepolia",
  email: "Email · firma Turnkey (ETH si no hay paymaster)",
};

const pendingStatuses = new Set([
  "preparing",
  "signing",
  "sponsored",
  "submitted",
]);

export function TxExplainer({ state }: { state: TxExplainerState }) {
  if (state.status === "idle" && !state.title) return null;

  const hint =
    (state.gasMode && gasHint[state.gasMode]) ||
    (state.gasSponsored
      ? gasHint.sponsored
      : "Gas según modo de conexión");

  const pending = pendingStatuses.has(state.status);

  return (
    <div className="border border-negro/10 bg-blanco p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
          Tx
        </span>
        <span
          className={`inline-flex items-center gap-2 px-2 py-0.5 text-xs font-semibold ${
            state.status === "confirmed"
              ? "bg-verde/20 text-negro"
              : state.status === "error"
                ? "bg-naranja/20 text-negro"
                : state.status === "sponsored"
                  ? "bg-azul/20 text-negro"
                  : "bg-amarillo/30 text-negro"
          }`}
        >
          {pending ? (
            <span
              className="tx-spinner inline-block h-3 w-3 rounded-full border-2 border-negro/25 border-t-negro"
              aria-hidden
            />
          ) : null}
          {statusLabel[state.status]}
        </span>
        <span className="text-xs text-negro/50">{hint}</span>
      </div>

      {pending ? (
        <div className="mt-4 overflow-hidden bg-negro/5" aria-hidden>
          <div className="tx-progress h-1 bg-amarillo" />
        </div>
      ) : null}

      {state.title ? (
        <p className="mt-3 font-display text-sm font-bold text-negro">
          {state.title}
        </p>
      ) : null}
      <p className="mt-1 text-sm leading-relaxed text-negro/70">{state.detail}</p>
      {state.hash ? (
        <a
          className="mt-3 inline-block text-sm font-semibold text-negro underline decoration-azul decoration-2 underline-offset-2"
          href={sepoliaTxUrl(state.hash)}
          target="_blank"
          rel="noreferrer"
        >
          Ver en Etherscan
        </a>
      ) : null}
      {state.error ? (
        <p className="mt-3 break-words text-sm text-naranja">{state.error}</p>
      ) : null}
    </div>
  );
}
