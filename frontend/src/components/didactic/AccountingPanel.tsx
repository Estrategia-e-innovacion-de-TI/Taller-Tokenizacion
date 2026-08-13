import { useAuth } from "../../lib/auth";
import {
  PROPERTY_VALUE_COP,
  formatCop,
  formatCopLabel,
  truncateAddress,
} from "../../lib/format-cop";
import { sepoliaAddressUrl } from "../../lib/viem";
import { formatBpsPercent, useBalances } from "../../lib/useBalances";
import { ContractLinks } from "./ContractLinks";
import { StepHeader } from "./StepHeader";

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-0.5 border-b border-negro/10 py-2.5 last:border-b-0">
      <p className="text-sm text-negro/70">{label}</p>
      <p className="text-right font-mono text-sm font-semibold text-negro">
        {value}
      </p>
      {hint ? (
        <p className="col-span-2 text-xs text-negro/40">{hint}</p>
      ) : null}
    </div>
  );
}

type Props = {
  balances: ReturnType<typeof useBalances>;
};

/**
 * Contabilidad didáctica: posición del usuario + libro del protocolo.
 */
export function AccountingPanel({ balances }: Props) {
  const auth = useAuth();

  return (
    <section id="contabilidad" className="py-8 md:py-10">
      <div className="container-app">
        <StepHeader
          eyebrow="07 · Contabilidad"
          title="Posición y protocolo"
          subtitle="Lecturas on-chain en Sepolia. Se actualiza tras cada tx y cada 12 s."
          accent="naranja"
          action={
            <button
              type="button"
              onClick={() => void balances.refresh()}
              disabled={balances.loading}
              className="btn-ghost text-sm"
            >
              {balances.loading ? "Actualizando…" : "Actualizar"}
            </button>
          }
        />

        <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-start md:gap-10">
          <div className="min-w-0 border border-negro/10 bg-blanco p-5 md:p-6">
            <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
              Tu posición
            </p>
            {auth.isConnected && auth.smartAccountAddress ? (
              <p className="mt-1 font-mono text-xs text-negro/50">
                <a
                  href={sepoliaAddressUrl(auth.smartAccountAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent"
                  title={auth.smartAccountAddress}
                >
                  {truncateAddress(auth.smartAccountAddress, 6)}
                </a>
              </p>
            ) : (
              <p className="mt-1 text-xs text-negro/45">
                Conecta una cuenta para ver saldos personales.
              </p>
            )}
            <div className="mt-4">
              <Row
                label="COPW"
                value={formatCopLabel(balances.copw)}
                hint="Stablecoin de demo"
              />
              <Row
                label="RENT"
                value={balances.rent.toString()}
                hint="Participaciones (decimals = 0)"
              />
              <Row
                label="% del inmueble"
                value={formatBpsPercent(balances.ownershipBps)}
                hint={`Sobre ${balances.maxSupply.toString()} RENT`}
              />
              <Row
                label="Valor nocional"
                value={`${formatCop(balances.propertyShareCop, 0)} COP`}
                hint={`Proporción de ${PROPERTY_VALUE_COP.toLocaleString("es-CO")} COP`}
              />
              <Row
                label="Renta pendiente"
                value={formatCopLabel(balances.pending)}
                hint="Claimable vía YieldDistributor"
              />
            </div>
          </div>

          <div className="min-w-0 border border-negro/10 bg-blanco p-5 md:p-6">
            <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
              Protocolo
            </p>
            <p className="mt-1 text-xs text-negro/45">
              Libro mayor del caso RENT (views públicas).
            </p>
            <div className="mt-4">
              <Row
                label="Supply RENT"
                value={`${balances.rentSupply.toString()} / ${balances.maxSupply.toString()}`}
                hint={`${formatBpsPercent(balances.supplyBps)} del tope`}
              />
              <Row
                label="Valor del inmueble"
                value={`${PROPERTY_VALUE_COP.toLocaleString("es-CO")} COP`}
              />
              <Row
                label="Renta depositada (hist.)"
                value={formatCopLabel(balances.totalDeposited)}
                hint="Suma de depositYield"
              />
              <Row
                label="Pool COPW (distributor)"
                value={formatCopLabel(balances.poolCopw)}
                hint="Renta depositada aún no claimada · no es el pago de compra"
              />
              <Row
                label="Treasury COPW (compras)"
                value={formatCopLabel(balances.treasuryCopw)}
                hint="Destino del COPW en PropertySale.buy · primario"
              />
              {balances.treasury ? (
                <div className="border-b border-negro/10 py-2.5 last:border-b-0">
                  <p className="text-sm text-negro/70">Address treasury</p>
                  <a
                    href={sepoliaAddressUrl(balances.treasury)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-accent mt-1 inline-block break-all font-mono text-xs"
                    title={balances.treasury}
                  >
                    {truncateAddress(balances.treasury, 6)}
                  </a>
                  <p className="mt-0.5 text-xs text-negro/40">
                    Ver saldo COPW en Etherscan
                  </p>
                </div>
              ) : null}
              <Row
                label="Época / depósitos"
                value={balances.epochId.toString()}
                hint="Cada depositYield incrementa epochId"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <ContractLinks title="Contratos del protocolo" />
        </div>
      </div>
    </section>
  );
}
