import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div>
      <div className="h-2 bg-amarillo" aria-hidden />
      <div className="mx-auto grid max-w-5xl gap-0 px-4 py-16 md:grid-cols-[auto_1fr] md:gap-10 md:py-24">
        <div
          className="mb-6 hidden w-3 self-stretch bg-azul md:mb-0 md:block"
          aria-hidden
        />
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-negro/50 uppercase">
            Taller para banca · Colombia
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Tokenización de activos
            <span className="block text-naranja">caso RENT</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-negro/65">
            Inmueble de 5.000 millones de pesos, participación desde 100.000 COP,
            rentas proporcionales. Billetera embebida o caliente, sin pagar ETH de
            gas.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/demo"
              className="bg-naranja px-6 py-3 text-sm font-bold text-negro"
            >
              Ir a la demo
            </Link>
            <Link
              to="/conceptos"
              className="border border-negro/20 px-6 py-3 text-sm font-semibold"
            >
              Conceptos
            </Link>
          </div>
          <p className="mt-4 max-w-xl text-sm text-negro/50">
            <strong className="text-negro/70">Demo</strong> = practicar on-chain ·{" "}
            <strong className="text-negro/70">Conceptos</strong> = guía RWA +
            profundizar
          </p>
          <p className="mt-12 max-w-2xl border-l-4 border-amarillo pl-4 text-sm text-negro/55">
            Demo educativa en testnet. No constituye oferta pública ni producto
            autorizado por la Superintendencia Financiera de Colombia.
          </p>
        </div>
      </div>
      <div className="flex h-3">
        <div className="flex-1 bg-verde" />
        <div className="flex-1 bg-rosado" />
        <div className="flex-1 bg-azul" />
        <div className="flex-1 bg-naranja" />
      </div>
    </div>
  );
}
