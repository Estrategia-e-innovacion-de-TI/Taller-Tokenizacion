import type { ReactNode } from "react";

const accentMap = {
  amarillo: "bg-amarillo",
  verde: "bg-verde",
  naranja: "bg-naranja",
  rosado: "bg-rosado",
  azul: "bg-azul",
} as const;

export type Accent = keyof typeof accentMap;

type Props = {
  code: string;
  label: string;
  title: string;
  subtitle: string;
  accent: Accent;
  children: ReactNode;
  aside?: ReactNode;
};

export function SectionFrame({
  code,
  label,
  title,
  subtitle,
  accent,
  children,
  aside,
}: Props) {
  return (
    <section className="border-b border-negro/10 py-12 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-[1.4fr_1fr] md:gap-12">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${accentMap[accent]}`}
            />
            <span className="text-xs font-semibold tracking-[0.12em] text-negro/60 uppercase">
              {code} · {label}
            </span>
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-negro md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-negro/70">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
        </div>
        {aside ? (
          <aside className="border border-negro/10 bg-blanco p-5 md:p-6">
            {aside}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
