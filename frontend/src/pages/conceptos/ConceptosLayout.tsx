import { Link, Outlet, Navigate, useLocation } from "react-router-dom";

const items = [
  { to: "/conceptos/guia-rwa", label: "Guía RWA" },
  { to: "/conceptos/tokenizacion", label: "Tokenización" },
  { to: "/conceptos/casos-banca", label: "Casos banca" },
  { to: "/conceptos/copw", label: "COPW" },
  { to: "/conceptos/account-abstraction", label: "Account abstraction" },
  { to: "/conceptos/contratos", label: "Contratos" },
  { to: "/conceptos/enlaces", label: "Enlaces" },
];

export function ConceptosLayout() {
  const loc = useLocation();
  if (loc.pathname === "/conceptos") {
    return <Navigate to="/conceptos/guia-rwa" replace />;
  }

  const wide =
    loc.pathname.includes("guia-rwa") || loc.pathname.includes("enlaces");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold">Conceptos</h1>
      <p className="mt-2 text-negro/60">
        Lectura interactiva: clic en términos para profundizar. Sin
        transacciones — la práctica está en Demo.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 border-b-2 border-negro/10 pb-6">
        {items.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            className={`px-3 py-1.5 text-sm font-semibold ${
              loc.pathname === i.to
                ? "bg-amarillo text-negro"
                : "border border-negro/10 text-negro/60"
            }`}
          >
            {i.label}
          </Link>
        ))}
      </div>
      <article
        className={`prose-sm mt-8 space-y-3 text-negro/80 ${
          wide ? "max-w-4xl" : "max-w-2xl"
        }`}
      >
        <Outlet />
      </article>
    </div>
  );
}
