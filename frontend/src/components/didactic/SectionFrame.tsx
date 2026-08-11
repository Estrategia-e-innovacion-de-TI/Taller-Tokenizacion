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
  /** Rótulo de la tarjeta de acción (izquierda). */
  actionLabel?: string;
  children: ReactNode;
  aside?: ReactNode;
  /** Bloque a ancho completo debajo de las dos columnas (tx, addresses). */
  footer?: ReactNode;
};

/**
 * Bloque de paso de la demo: encabezado, dos tarjetas de igual altura
 * (acción | “Qué está pasando”) y un pie a ancho completo.
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
}: Props) {
  return (
    <section className="py-8 md:py-10">
      <div className="container-app">
        <StepHeader
          eyebrow={`${code} · ${label}`}
          title={title}
          subtitle={subtitle}
          accent={accent}
        />

        <div
          className={`mt-8 grid gap-6 md:gap-8 ${
            aside ? "md:grid-cols-2 md:items-stretch" : ""
          }`}
        >
          <div className="flex min-w-0 flex-col border border-negro/10 bg-blanco p-5 md:p-6">
            <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
              {actionLabel}
            </p>
            <div className="mt-4 flex flex-col gap-4">{children}</div>
          </div>
          {aside ? (
            <aside className="min-w-0 border border-negro/10 bg-blanco p-5 md:p-6">
              {aside}
            </aside>
          ) : null}
        </div>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </section>
  );
}
