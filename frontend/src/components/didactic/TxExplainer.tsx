import type { TxExplainerState } from "../../lib/viem";

const statusLabel: Record<TxExplainerState["status"], string> = {
  idle: "Listo",
  preparing: "Preparando",
  signing: "Firma",
  sponsored: "Gas patrocinado",
  submitted: "Enviada",
  confirmed: "Confirmada",
  error: "Error",
};

export function TxExplainer({ state }: { state: TxExplainerState }) {
  if (state.status === "idle" && !state.title) return null;

  return (
    <div className="mt-6 border border-negro/10 bg-blanco p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wider uppercase text-negro/50">
          Qué está pasando
        </span>
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${
            state.status === "confirmed"
              ? "bg-verde/20 text-negro"
              : state.status === "error"
                ? "bg-naranja/20 text-negro"
                : state.status === "sponsored"
                  ? "bg-azul/20 text-negro"
                  : "bg-amarillo/30 text-negro"
          }`}
        >
          {statusLabel[state.status]}
        </span>
        <span className="text-xs text-negro/50">Gas patrocinado · no se usa ETH</span>
      </div>
      {state.title ? (
        <p className="mt-2 font-display text-sm font-bold">{state.title}</p>
      ) : null}
      <p className="mt-1 text-sm leading-relaxed text-negro/70">{state.detail}</p>
      {state.hash ? (
        <a
          className="mt-2 inline-block text-sm text-azul underline"
          href={`https://sepolia.etherscan.io/tx/${state.hash}`}
          target="_blank"
          rel="noreferrer"
        >
          Ver en Basescan
        </a>
      ) : null}
      {state.error ? (
        <p className="mt-2 text-sm text-naranja">{state.error}</p>
      ) : null}
    </div>
  );
}
