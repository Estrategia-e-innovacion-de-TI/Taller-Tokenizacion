import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { useBalances } from "../../lib/useBalances";
import { formatCopLabel, truncateAddress } from "../../lib/format-cop";
import { sepoliaAddressUrl } from "../../lib/viem";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-semibold tracking-wide ${
    isActive ? "text-negro underline decoration-amarillo decoration-2 underline-offset-4" : "text-negro/55 hover:text-negro"
  }`;

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const balances = useBalances();

  return (
    <div className="min-h-screen">
      <header className="border-b border-negro/10">
        <div className="container-app flex flex-wrap items-center justify-between gap-4 py-4">
          <Link to="/" className="font-display text-lg font-extrabold tracking-tight">
            Taller <span className="text-naranja">RENT</span>
          </Link>
          <nav className="flex flex-wrap gap-5">
            <NavLink to="/demo" className={linkClass}>
              Demo
            </NavLink>
            <NavLink to="/conceptos" className={linkClass}>
              Conceptos
            </NavLink>
          </nav>
        </div>
        <div className="border-t border-negro/5 bg-negro/[0.02]">
          <div className="container-app flex flex-wrap items-center gap-x-6 gap-y-2 py-2 text-xs">
            <span
              className={`rounded px-2 py-0.5 font-semibold text-negro ${
                auth.mode === "email"
                  ? "bg-verde/20"
                  : auth.mode === "wallet"
                    ? "bg-naranja/15"
                    : "bg-negro/5"
              }`}
            >
              {auth.mode === "email"
                ? "Email · gas patrocinado"
                : auth.mode === "wallet"
                  ? "MetaMask · pagas gas"
                  : "Gas: email patrocinado · MetaMask no"}
            </span>
            <span className="text-negro/55">Sepolia</span>
            {auth.isConnected ? (
              <>
                <span className="text-negro/45">
                  {auth.mode === "email" ? "Cuenta email" : "Cuenta"}
                </span>
                <a
                  className="font-mono text-negro/90 underline decoration-negro/20 underline-offset-2 hover:decoration-azul"
                  href={sepoliaAddressUrl(auth.smartAccountAddress!)}
                  target="_blank"
                  rel="noreferrer"
                  title={auth.smartAccountAddress!}
                >
                  {truncateAddress(auth.smartAccountAddress!, 6)}
                </a>
                <span>COPW {formatCopLabel(balances.copw)}</span>
                <span>RENT {balances.rent.toString()}</span>
                <button type="button" onClick={auth.disconnect} className="btn-secondary text-xs">
                  Salir
                </button>
              </>
            ) : (
              <span className="text-negro/45">Sin cuenta conectada</span>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-negro/10 py-8 text-center text-xs text-negro/45">
        Demo educativa en testnet. No es oferta pública ni producto autorizado por la SFC.
      </footer>
    </div>
  );
}
