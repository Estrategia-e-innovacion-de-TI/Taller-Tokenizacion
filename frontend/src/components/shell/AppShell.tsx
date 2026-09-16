import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { useBalances } from "../../lib/useBalances";
import { formatCopLabel, truncateAddress } from "../../lib/format-cop";
import { sepoliaAddressUrl } from "../../lib/viem";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `border-b-2 px-2 py-1.5 text-sm font-bold tracking-wide transition-colors ${
    isActive
      ? "border-amarillo text-negro"
      : "border-transparent text-muted hover:text-negro"
  }`;

export function AppShell({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const balances = useBalances();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-borde bg-tarjeta/95 backdrop-blur-md">
        <div className="container-app flex flex-wrap items-center justify-between gap-4 py-3.5">
          <Link to="/" className="flex items-center gap-3 font-display text-lg font-extrabold tracking-tight">
            <span className="h-8 w-1 bg-amarillo" aria-hidden />
            Taller RENT
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/demo" className={linkClass}>
              Demo
            </NavLink>
            <NavLink to="/conceptos" className={linkClass}>
              Conceptos
            </NavLink>
          </nav>
        </div>
        <div className="border-t border-borde bg-zebra/90">
          <div className="container-app flex flex-wrap items-center gap-x-4 gap-y-2 py-2 text-xs">
            <span
              className={`chip normal-case tracking-normal ${
                auth.mode === "email"
                  ? "bg-verde-100"
                  : auth.mode === "wallet"
                    ? "bg-naranja-100"
                    : "border border-borde bg-tarjeta"
              }`}
            >
              {auth.mode === "email"
                ? "Email · gas patrocinado"
                : auth.mode === "wallet"
                  ? "MetaMask · pagas gas"
                  : "Gas: email patrocinado · MetaMask no"}
            </span>
            <span className="chip border border-borde bg-tarjeta normal-case tracking-normal text-muted">
              Sepolia
            </span>
            {auth.isConnected ? (
              <>
                <span className="text-subtle">
                  {auth.mode === "email" ? "Cuenta email" : "Cuenta"}
                </span>
                <a
                  className="font-mono text-negro underline decoration-borde underline-offset-2 hover:decoration-amarillo"
                  href={sepoliaAddressUrl(auth.smartAccountAddress!)}
                  target="_blank"
                  rel="noreferrer"
                  title={auth.smartAccountAddress!}
                >
                  {truncateAddress(auth.smartAccountAddress!, 6)}
                </a>
                <span className="font-bold">COPW {formatCopLabel(balances.copw)}</span>
                <span className="font-bold">RENT {balances.rent.toString()}</span>
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
      <main className="flex-1">{children}</main>
      <footer className="border-t border-borde py-6 text-center text-[10px] tracking-wide text-folio uppercase">
        Demo educativa en testnet. No es oferta pública ni producto autorizado por la SFC.
      </footer>
    </div>
  );
}
