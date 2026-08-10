import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  children: ReactNode;
  /** Primera sección: sin borde superior. */
  first?: boolean;
};

/** Sección de conceptos con división visual clara. */
export function ConceptSection({ id, title, children, first = false }: Props) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 space-y-3 ${
        first
          ? "pt-2"
          : "mt-10 border-t-2 border-negro/10 pt-10"
      }`}
    >
      <div className="flex items-stretch gap-3">
        <span className="w-1 shrink-0 bg-amarillo" aria-hidden />
        <h3 className="font-display text-xl font-bold text-negro">{title}</h3>
      </div>
      <div className="space-y-3 pl-4">{children}</div>
    </section>
  );
}
