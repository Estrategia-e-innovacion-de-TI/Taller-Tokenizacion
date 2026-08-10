import { Link } from "react-router-dom";

const stats = [
  { label: "Valor del inmueble", value: "5.000 M COP" },
  { label: "Participación mínima", value: "100.000 COP · 1 RENT" },
  { label: "Costo de gas", value: "Patrocinado · 0 ETH" },
];

export function HomePage() {
  return (
    <div>
      <div className="h-1.5 bg-amarillo" aria-hidden />
      <section className="container-app py-16 md:py-24">
        <p className="eyebrow">Taller para banca · Colombia</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
          Tokenización de activos
          <span className="block text-naranja">caso RENT</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-negro/65">
          Inmueble de 5.000 millones de pesos, participación desde 100.000 COP,
          rentas proporcionales. Billetera embebida o caliente, sin pagar ETH de
          gas.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link to="/demo" className="btn-primary">
            Ir a la demo
          </Link>
          <Link to="/conceptos" className="btn-secondary">
            Ver conceptos
          </Link>
        </div>
        <p className="mt-4 max-w-xl text-sm text-negro/50">
          <strong className="text-negro/70">Demo</strong> = practicar on-chain ·{" "}
          <strong className="text-negro/70">Conceptos</strong> = guía RWA +
          profundizar
        </p>

        <dl className="mt-14 grid gap-px overflow-hidden border border-negro/10 bg-negro/10 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-blanco p-5">
              <dt className="eyebrow">{s.label}</dt>
              <dd className="mt-1 font-display text-lg font-bold text-negro">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-2xl border-l-4 border-amarillo pl-4 text-sm text-negro/55">
          Demo educativa en testnet. No constituye oferta pública ni producto
          autorizado por la Superintendencia Financiera de Colombia.
        </p>
      </section>
    </div>
  );
}
