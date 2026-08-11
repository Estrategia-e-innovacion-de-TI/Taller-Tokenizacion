import {
  addresses,
  contractsConfigured,
  sepoliaAddressUrl,
} from "../../lib/viem";
import { truncateAddress } from "../../lib/format-cop";

const contracts = [
  {
    key: "copw" as const,
    name: "COPW",
    role: "Stablecoin de demo · faucet",
  },
  {
    key: "rent" as const,
    name: "RENT",
    role: "Participación del inmueble",
  },
  {
    key: "sale" as const,
    name: "PropertySale",
    role: "Compra primaria (mint)",
  },
  {
    key: "distributor" as const,
    name: "YieldDistributor",
    role: "Pool de renta · claim",
  },
] as const;

/**
 * Enlaces Sepolia Etherscan a los contratos del taller.
 */
export function ContractLinks({
  title = "Contratos en Etherscan",
  compact = false,
}: {
  title?: string;
  compact?: boolean;
}) {
  if (!contractsConfigured) {
    return (
      <div className="border border-negro/10 bg-blanco p-5 md:p-6">
        <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
          {title}
        </p>
        <p className="mt-2 text-sm text-negro/55">
          Direcciones no configuradas (`VITE_*_ADDRESS` en `.env`).
        </p>
      </div>
    );
  }

  return (
    <div className="border border-negro/10 bg-blanco p-5 md:p-6">
      <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
        {title}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-negro/55">
        Ethereum Sepolia · abre el contrato y revisa transacciones / tokens.
      </p>
      <ul className={compact ? "mt-3 space-y-2" : "mt-4 space-y-0"}>
        {contracts.map((c) => {
          const address = addresses[c.key];
          return (
            <li
              key={c.key}
              className={
                compact
                  ? "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                  : "grid gap-1 border-b border-negro/10 py-3 last:border-b-0 sm:grid-cols-[minmax(0,11rem)_1fr_auto] sm:items-baseline sm:gap-x-4"
              }
            >
              <div>
                <p className="text-sm font-bold text-negro">{c.name}</p>
                {!compact ? (
                  <p className="text-xs text-negro/45">{c.role}</p>
                ) : null}
              </div>
              {!compact ? (
                <p className="font-mono text-xs text-negro/60 break-all">
                  {address}
                </p>
              ) : (
                <p className="font-mono text-xs text-negro/50">
                  {truncateAddress(address, 5)}
                </p>
              )}
              <a
                href={sepoliaAddressUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent text-sm shrink-0"
              >
                Ver en Etherscan
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
