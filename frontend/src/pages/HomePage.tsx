import { Link } from "react-router-dom";

const kpis = [
  { value: "5.000", unit: "M COP", label: "Valor del inmueble" },
  { value: "100 mil", unit: "COP", label: "Participación mínima · 1 RENT" },
  { value: "0", unit: "ETH", label: "Gas con email · MetaMask paga" },
];

const flow = [
  { name: "Cuenta", role: "Email o MetaMask" },
  { name: "Faucet", role: "5 M COPW" },
  { name: "Comprar", role: "Mint de RENT" },
  { name: "Renta", role: "Depositar + claim" },
  { name: "Libros", role: "Posición on-chain" },
];

export function HomePage() {
  return (
    <div>
      <section className="bg-negro text-blanco">
        <div className="h-1 bg-amarillo" aria-hidden />
        <div className="container-app py-16 md:py-20">
          <p className="kicker-on-dark">Taller para banca · Colombia</p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-extrabold leading-[0.98] tracking-tight md:text-6xl">
            Tokenización de activos
            <span className="mt-2 block">Caso RENT</span>
          </h1>
          <span className="mt-7 block h-1 w-16 bg-amarillo" aria-hidden />
          <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-blanco/75">
            Inmueble de 5.000 millones de pesos. Participación desde 100.000 COP.
            Rentas proporcionales en Sepolia.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link to="/demo" className="btn-primary">
              Ir a la demo
            </Link>
            <Link
              to="/conceptos"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-2)] border border-blanco/30 bg-transparent px-5 py-2.5 text-sm font-bold tracking-tight text-tarjeta transition-colors hover:bg-tarjeta/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amarillo"
            >
              Ver conceptos
            </Link>
          </div>
          <p className="mt-5 text-sm text-blanco/55">
            Demo = practicar on-chain · Conceptos = guía RWA
          </p>
        </div>
      </section>

      <section className="container-app py-14 md:py-16">
        <p className="kicker">Recorrido</p>
        <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight md:text-3xl">
          Cinco pasos. Una sesión.
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-5">
          {flow.map((n, i) => (
            <li key={n.name} className="flow-node relative">
              {i < flow.length - 1 ? (
                <span
                  className="pointer-events-none absolute top-3 left-[4.5rem] hidden h-px w-[calc(100%-1.25rem)] bg-gris-claro sm:block"
                  aria-hidden
                />
              ) : null}
              <p className="font-display text-xl font-bold text-negro">{n.name}</p>
              <p className="mt-1 text-sm text-muted">{n.role}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 grid gap-8 border-t border-borde pt-10 sm:grid-cols-3">
          {kpis.map((k) => (
            <div key={k.label}>
              <p className="kpi-value">
                {k.value}
                <span className="kpi-unit"> {k.unit}</span>
              </p>
              <p className="kpi-label">{k.label}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 rounded-[var(--radius-2)] border border-borde bg-tarjeta px-5 py-4 text-center text-sm font-semibold text-muted">
          Demo educativa en testnet. No es oferta pública ni producto autorizado
          por la SFC.
        </p>
      </section>
    </div>
  );
}
