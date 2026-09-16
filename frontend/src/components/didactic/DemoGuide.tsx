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
    how: "Correo (OTP, gas patrocinado) o MetaMask (pagas ETH).",
  },
  {
    id: "faucet",
    n: "02",
    title: "Faucet",
    how: "Pide 5.000.000 COPW de demo. No es dinero real.",
  },
  {
    id: "compra",
    n: "03",
    title: "Comprar",
    how: "1 RENT = 100.000 COP. El COPW de la compra va al treasury.",
  },
  {
    id: "deposito",
    n: "04",
    title: "Depositar",
    how: "Aporta COPW al pool de renta del periodo.",
  },
  {
    id: "claim",
    n: "05",
    title: "Claim",
    how: "Retira tu parte: renta × (tu RENT / supply).",
  },
  {
    id: "transferir",
    n: "06",
    title: "Transferir",
    how: "Cede RENT a otra address. Ideal: claim antes.",
  },
  {
    id: "contabilidad",
    n: "07",
    title: "Libros",
    how: "Revisa tu posición y el estado del protocolo.",
  },
];

const realLifePhases = [
  { n: "1", title: "Activo y derecho" },
  { n: "2", title: "Marco legal / SPV" },
  { n: "3", title: "Custodia y datos" },
  { n: "4", title: "Cumplimiento" },
  { n: "5", title: "Emisión primaria" },
  { n: "6", title: "Vida del activo" },
];

type Props = {
  onGoToStep: (id: string) => void;
};

export function DemoGuide({ onGoToStep }: Props) {
  return (
    <section id="guia" className="py-8 md:py-10">
      <div className="container-app">
        <StepHeader
          eyebrow="Antes de empezar"
          title="Qué vas a hacer en esta sesión"
          subtitle="Siete acciones on-chain. La teoría está en Conceptos; aquí se practica."
          accent="amarillo"
        />

        <ol className="mt-8 divide-y divide-borde border-y border-borde">
          {guideSteps.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onGoToStep(s.id)}
                className="grid w-full grid-cols-[3rem_1fr_auto] items-baseline gap-x-3 py-3.5 text-left hover:bg-zebra focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-negro"
              >
                <span className="font-display text-lg font-extrabold text-negro">
                  {s.n}
                </span>
                <span>
                  <span className="block text-sm font-bold text-negro">
                    {s.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{s.how}</span>
                </span>
                <span className="text-xs font-semibold text-muted">Ir →</span>
              </button>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => onGoToStep("cuenta")}
          className="banner-amarillo mt-8 w-full cursor-pointer"
          aria-label="Ir al paso 01 Cuenta"
        >
          Empezar · 01 Cuenta
        </button>

        <p className="eyebrow mt-12">En la vida real (resumen)</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          Tokenizar no es subir un PDF a la cadena. Es empaquetar un derecho
          (SPV, custodia, KYC) y representarlo con un token. Esta demo solo
          enseña la capa de mecanismos.
        </p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {realLifePhases.map((p) => (
            <li key={p.n} className="border-t border-borde pt-3">
              <p className="font-display text-lg font-extrabold text-negro">{p.n}</p>
              <p className="mt-1 text-sm font-bold text-negro">{p.title}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-muted">
          Detalle en{" "}
          <Link to="/conceptos/guia-rwa" className="link-accent">
            Conceptos · Guía RWA
          </Link>
          .
        </p>

        <div className="mt-10">
          <ContractLinks />
        </div>
      </div>
    </section>
  );
}
