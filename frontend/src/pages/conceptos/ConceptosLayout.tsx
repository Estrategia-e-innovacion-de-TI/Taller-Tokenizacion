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
    <div className="container-app py-10">
      <p className="kicker">Lectura · sin transacciones</p>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Conceptos</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Lectura interactiva: clic en términos para profundizar. Sin
        transacciones — la práctica está en Demo.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-borde pb-6">
        {items.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            className={`tab ${
              loc.pathname === i.to ? "tab-active" : "tab-idle"
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
