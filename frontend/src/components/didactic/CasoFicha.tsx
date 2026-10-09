import type { CasoUso } from "../../data/casos-uso";
import { enlaces } from "../../data/enlaces";
import { ACCENT_BORDER, ACCENT_CHIP } from "./accent";

type Props = {
  caso: CasoUso;
};

/** Tarjeta abierta: problema → mecanismo → dato de lo conseguido. */
export function CasoFicha({ caso }: Props) {
  const accent = caso.accent ?? "azul";
  const links = enlaces(...caso.enlaceIds);

  return (
    <article
      className={`card not-prose ${ACCENT_BORDER[accent]} border-l-4`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="font-display text-lg font-bold text-negro">
          {caso.actor}
        </h4>
        {caso.fecha ? (
          <p className="text-xs font-semibold tracking-wide text-muted">
            {caso.fecha}
          </p>
        ) : null}
      </header>

      <p className="eyebrow mt-5">Busca resolver</p>
      <p className="mt-1.5 text-base leading-relaxed text-negro">
        {caso.buscaResolver}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="eyebrow">Cómo lo resuelve</p>
          <p className="mt-1.5 text-sm leading-relaxed text-negro/80">
            {caso.comoResuelve}
          </p>
        </div>
        <div
          className={`rounded-[var(--radius-2)] border px-4 py-3 ${ACCENT_CHIP[accent]}`}
        >
          <p className="eyebrow">Qué se consiguió</p>
          {caso.logro ? (
            <p className="mt-1.5 text-sm leading-relaxed text-negro">
              {caso.logro}
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-muted">
              Sin cifra o hito público comparable.
            </p>
          )}
        </div>
      </div>

      {links.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-borde pt-3 text-sm">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-accent"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
