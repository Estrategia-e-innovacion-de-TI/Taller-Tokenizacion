import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { useBalances } from "../../lib/useBalances";
import { formatCopLabel, truncateAddress } from "../../lib/format-cop";
import { sepoliaAddressUrl } from "../../lib/viem";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-semibold tracking-wide transition-colors ${
    isActive
      ? "text-negro underline decoration-amarillo decoration-2 underline-offset-4"
      : "text-muted hover:text-negro"
  }`;

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const balances = useBalances();

  return (
    <div className="min-h-screen">
      <header className="border-b border-borde bg-tarjeta/90 backdrop-blur-md">
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
        <div className="border-t border-borde bg-zebra/80">
          <div className="container-app flex flex-wrap items-center gap-x-5 gap-y-2 py-2.5 text-xs">
            <span
              className={`chip ${
                auth.mode === "email"
                  ? "bg-verde-100"
                  : auth.mode === "wallet"
                    ? "bg-naranja-100"
                    : "bg-tarjeta border border-borde"
              }`}
            >
              {auth.mode === "email"
                ? "Email · gas patrocinado"
                : auth.mode === "wallet"
                  ? "MetaMask · pagas gas"
                  : "Gas: email patrocinado · MetaMask no"}
            </span>
            <span className="chip border border-borde bg-tarjeta text-muted">Sepolia</span>
            {auth.isConnected ? (
              <>
                <span className="text-subtle">
                  {auth.mode === "email" ? "Cuenta email" : "Cuenta"}
                </span>
                <a
                  className="font-mono text-negro underline decoration-borde underline-offset-2 hover:decoration-azul"
                  href={sepoliaAddressUrl(auth.smartAccountAddress!)}
                  target="_blank"
                  rel="noreferrer"
                  title={auth.smartAccountAddress!}
                >
                  {truncateAddress(auth.smartAccountAddress!, 6)}
                </a>
                <span className="font-semibold">COPW {formatCopLabel(balances.copw)}</span>
                <span className="font-semibold">RENT {balances.rent.toString()}</span>
                <button type="button" onClick={auth.disconnect} className="btn-secondary !px-3 !py-1 text-xs">
                  Salir
                </button>
              </>
            ) : (
              <span className="text-subtle">Sin cuenta conectada</span>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-borde py-8 text-center text-xs text-subtle">
        Demo educativa en testnet. No es oferta pública ni producto autorizado por la SFC.
      </footer>
    </div>
  );
}
