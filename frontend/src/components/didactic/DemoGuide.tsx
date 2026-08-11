import { Link } from "react-router-dom";
import { ContractLinks } from "./ContractLinks";
import { StepHeader } from "./StepHeader";

type GuideStep = {
  id: string;
  n: string;
  title: string;
  how: string;
};

const guideSteps: GuideStep[] = [
  {
    id: "cuenta",
    n: "01",
    title: "Cuenta",
    how: "Entra con correo (OTP + gas patrocinado) o con MetaMask (pagas ETH).",
  },
  {
    id: "faucet",
    n: "02",
    title: "Faucet",
    how: "Pide 5.000.000 COPW de demo. Es el combustible para comprar y aportar renta.",
  },
  {
    id: "compra",
    n: "03",
    title: "Comprar",
    how: "Elige cuántos RENT. approve COPW + buy = mint de participación (100.000 COP = 1 RENT).",
  },
  {
    id: "deposito",
    n: "04",
    title: "Depositar",
    how: "Aporta COPW al pool de renta del periodo. Alimenta el acumulado; aún no cobras.",
  },
  {
    id: "claim",
    n: "05",
    title: "Claim",
    how: "Retira tu parte: renta × (tu RENT / supply). Entra COPW a tu cuenta.",
  },
  {
    id: "transferir",
    n: "06",
    title: "Transferir",
    how: "Cede RENT a otra address (secundario P2P). Ideal: claim antes.",
  },
  {
    id: "contabilidad",
    n: "07",
    title: "Libros",
    how: "Revisa tu posición y el estado del protocolo (supply, pool, época).",
  },
];

/** Fases institucionales de tokenización (vida real). */
const realLifePhases = [
  {
    n: "1",
    title: "Activo y derecho",
    body: "Defines qué se tokeniza: el inmueble, un flujo de renta, o un derecho económico. El token suele representar un derecho legal, no “el ladrillo” en sí.",
  },
  {
    n: "2",
    title: "Marco legal / SPV",
    body: "Se estructura un vehículo (SPV, trust, fondo) que aísla el activo y fija qué derechos tienen los tenedores del token.",
  },
  {
    n: "3",
    title: "Custodia y datos",
    body: "Custodia del activo o del título, valoración (NAV), oráculos o APIs que conectan el mundo real con la cadena.",
  },
  {
    n: "4",
    title: "Cumplimiento",
    body: "KYC/AML, elegibilidad de inversores, posibles límites de transferencia (p. ej. ERC-3643). En banca: SFC, sandbox, rails en COP.",
  },
  {
    n: "5",
    title: "Emisión (primaria)",
    body: "Se emite el token y se coloca: suscripción, pago (stablecoin o dinero bancario) y mint a cuentas elegibles.",
  },
  {
    n: "6",
    title: "Vida del activo",
    body: "Rentas, reportes, gobernanza, mercado secundario permissioned y, al final, redención o liquidación.",
  },
];

type Props = {
  onGoToStep: (id: string) => void;
};

/**
 * Guía: tokenización en la vida real vs recorrido de esta demo.
 */
export function DemoGuide({ onGoToStep }: Props) {
  return (
    <section id="guia" className="py-8 md:py-10">
      <div className="container-app">
        <StepHeader
          eyebrow="Antes de empezar"
          title="Cómo se tokeniza (de verdad)"
          subtitle="En la vida real es un proceso legal + operativo + on-chain. Esta demo solo enseña la capa de mecanismos (compra, renta, claim, transferencia)."
          accent="amarillo"
        />

        {/* Vida real */}
        <div className="mt-8 border border-negro/10 bg-blanco p-5 md:p-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
            En la vida real
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-negro/65">
            Tokenizar no es “subir un PDF a la blockchain”. Es empaquetar un
            derecho sobre un activo con custodia, cumplimiento y reglas de
            transferencia — y luego representar ese derecho con un token.
          </p>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {realLifePhases.map((p) => (
              <li key={p.n} className="border-t border-negro/10 pt-4">
                <p className="font-mono text-xs font-semibold text-negro/40">
                  Fase {p.n}
                </p>
                <p className="mt-1 text-sm font-bold text-negro">{p.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-negro/60">
                  {p.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-negro/55">
            Profundiza en{" "}
            <Link to="/conceptos/guia-rwa" className="link-accent">
              Conceptos · Guía RWA
            </Link>{" "}
            (SPV, oráculos, compliance, redención).
          </p>
        </div>

        {/* Demo vs real + pasos */}
        <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-start md:gap-10">
          <div className="min-w-0 border border-negro/10 bg-blanco p-5 md:p-6">
            <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
              Qué simplifica esta demo
            </p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-negro/75">
              <p>
                <strong className="text-negro">Caso:</strong> inmueble de 5.000 M
                COP → token RENT (100.000 COP = 1 participación, tope 50.000).
              </p>
              <p>
                <strong className="text-negro">Sin SPV ni KYC:</strong> cualquiera
                con cuenta puede comprar y transferir. En producción eso sería
                permissioned.
              </p>
              <p>
                <strong className="text-negro">COPW</strong> es stablecoin de
                taller (no es dinero real). La renta se reparte on-chain con
                dividend-per-token.
              </p>
              <p>
                <strong className="text-negro">Gas:</strong> con email lo
                patrocina Pimlico; con MetaMask pagas ETH de Sepolia.
              </p>
              <p className="border-l-2 border-negro/15 pl-3 text-negro/55">
                Demo educativa en testnet. No es oferta pública ni producto
                autorizado por la SFC.
              </p>
            </div>
          </div>

          <div className="min-w-0 border border-negro/10 bg-blanco p-5 md:p-6">
            <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
              Cómo se hace aquí (pasos)
            </p>
            <ol className="mt-4 space-y-0">
              {guideSteps.map((s) => (
                <li
                  key={s.id}
                  className="border-b border-negro/10 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => onGoToStep(s.id)}
                    className="grid w-full grid-cols-[2.5rem_1fr] gap-x-3 py-3 text-left transition-colors hover:bg-negro/[0.03]"
                  >
                    <span className="font-mono text-sm font-semibold text-negro/40">
                      {s.n}
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-negro">
                        {s.title}
                      </span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-negro/60">
                        {s.how}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-negro/45">
              Toca un paso para ir directo · ~15–20 min
            </p>
          </div>
        </div>

        <div className="mt-8">
          <ContractLinks />
        </div>
      </div>
    </section>
  );
}
