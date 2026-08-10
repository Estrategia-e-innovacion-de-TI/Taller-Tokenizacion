import { useId, useState, type ReactNode } from "react";
import type { Enlace } from "../../data/enlaces";
import { ACCENT_BORDER, ACCENT_CHIP, type Accent } from "./accent";

type Props = {
  term: string;
  summary: string;
  children?: ReactNode;
  links?: Enlace[];
  accent?: Accent;
};

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
        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-left text-sm font-semibold text-negro transition ${ACCENT_CHIP[accent]} ${
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
          className={`mt-2 border border-negro/10 border-l-4 bg-blanco p-4 ${ACCENT_BORDER[accent]}`}
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
                    className="link-accent"
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
