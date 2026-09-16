import type { ReactNode } from "react";
import { StepHeader } from "./StepHeader";
import type { Accent } from "./accent";

export type { Accent };

type Props = {
  code: string;
  label: string;
  title: string;
  subtitle: string;
  accent: Accent;
  actionLabel?: string;
  children: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  /** Aviso encima de las columnas (p. ej. falta cuenta). */
  notice?: ReactNode;
};

/**
 * Paso de la demo: tarea a la izquierda, contexto a la derecha.
 */
export function SectionFrame({
  code,
  label,
  title,
  subtitle,
  accent,
  actionLabel = "Acción",
  children,
  aside,
  footer,
  notice,
}: Props) {
  return (
    <section className="py-8 md:py-10">
      <div className="container-app">
        <StepHeader
          eyebrow={`Paso ${code} · ${label}`}
          title={title}
          subtitle={subtitle}
          accent={accent}
        />

        {notice ? <div className="mt-6">{notice}</div> : null}

        <div
          className={`mt-8 grid gap-6 lg:gap-8 ${
            aside ? "lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start" : ""
          }`}
        >
          <div className="card relative flex min-w-0 flex-col overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-1 bg-amarillo" aria-hidden />
            <p className="eyebrow">{actionLabel}</p>
            <div className="mt-4 flex flex-1 flex-col gap-4">{children}</div>
          </div>
          {aside ? (
            <aside className="min-w-0 rounded-[var(--radius-3)] border border-borde bg-zebra p-5 md:p-6">
              {aside}
            </aside>
          ) : null}
        </div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </section>
  );
}
