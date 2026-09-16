import type { ReactNode } from "react";
import type { Accent } from "./accent";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent: Accent;
  /** Acción alineada a la derecha del título (p. ej. “Actualizar”). */
  action?: ReactNode;
};

export function StepHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <span className="block h-1 w-12 bg-amarillo" aria-hidden />
        <p className="eyebrow mt-4">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-negro md:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  );
}
