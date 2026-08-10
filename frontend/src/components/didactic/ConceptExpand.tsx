import { useId, useState, type ReactNode } from "react";
import type { Enlace } from "../../data/enlaces";

type Props = {
  term: string;
  summary: string;
  children?: ReactNode;
  links?: Enlace[];
  accent?: "amarillo" | "verde" | "naranja" | "rosado" | "azul";
};

const accentBorder = {
  amarillo: "border-l-amarillo",
  verde: "border-l-verde",
  naranja: "border-l-naranja",
  rosado: "border-l-rosado",
  azul: "border-l-azul",
} as const;

const accentChip = {
  amarillo: "border-amarillo bg-amarillo/30",
  verde: "border-verde bg-verde/25",
  naranja: "border-naranja bg-naranja/25",
  rosado: "border-rosado bg-rosado/40",
  azul: "border-azul bg-azul/25",
} as const;

/** Término clicable: expande explicación y enlaces de interés. */
export function ConceptExpand({
  term,
  summary,
  children,
  links = [],
  accent = "azul",
}: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="my-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-left text-sm font-semibold text-negro transition ${accentChip[accent]} ${
          open ? "ring-2 ring-negro/15" : "hover:ring-2 hover:ring-negro/10"
        }`}
      >
        <span aria-hidden className="text-xs opacity-70">
          {open ? "−" : "+"}
        </span>
        {term}
      </button>
      {open ? (
        <div
          id={panelId}
          className={`mt-2 border border-negro/10 border-l-4 bg-blanco p-4 ${accentBorder[accent]}`}
        >
          <p className="text-sm leading-relaxed text-negro/75">{summary}</p>
          {children ? (
            <div className="mt-3 space-y-2 text-sm text-negro/70">{children}</div>
          ) : null}
          {links.length > 0 ? (
            <ul className="mt-4 space-y-1.5 border-t border-negro/10 pt-3">
              <li className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
                Enlaces de interés
              </li>
              {links.map((l) => (
                <li key={l.id} className="text-sm">
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline decoration-azul decoration-2 underline-offset-2 hover:decoration-naranja"
                  >
                    {l.starred ? "★ " : ""}
                    {l.label}
                  </a>
                  {l.note ? (
                    <span className="text-negro/50"> — {l.note}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
