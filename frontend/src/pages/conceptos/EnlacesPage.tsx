import { Link } from "react-router-dom";
import { ConceptSection } from "../../components/didactic/ConceptSection";
import { DeepLinks } from "../../components/didactic/DeepLinks";
import { ENLACES_GRUPOS } from "../../data/enlaces";

export function EnlacesPage() {
  return (
    <div>
      <header className="pb-2">
        <h2 className="font-display text-2xl font-extrabold">
          Enlaces de interés
        </h2>
        <p className="mt-2 text-negro/65">
          Catálogo del taller (prioridad ★). También vive en{" "}
          <code className="text-xs">recursos/Enlaces_de_interes.md</code>. Vuelve
          a la{" "}
          <Link
            to="/conceptos/guia-rwa"
            className="font-semibold underline decoration-azul"
          >
            Guía RWA
          </Link>{" "}
          para el recorrido guiado.
        </p>
      </header>
      {ENLACES_GRUPOS.map((g, i) => (
        <ConceptSection key={g.id} title={g.title} first={i === 0}>
          <DeepLinks
            title="Enlaces"
            divider={false}
            items={g.items.map((e) => ({
              href: e.href,
              label: `${e.starred ? "★ " : ""}${e.label}`,
              note: e.note,
            }))}
          />
        </ConceptSection>
      ))}
    </div>
  );
}
