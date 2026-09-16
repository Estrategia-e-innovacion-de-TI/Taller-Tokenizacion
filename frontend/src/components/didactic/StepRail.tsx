type Step = { id: string; label: string; accent: string };

export function StepRail({
  steps,
  active,
  onSelect,
}: {
  steps: Step[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const idx = Math.max(
    0,
    steps.findIndex((s) => s.id === active),
  );
  const progress = ((idx + 1) / steps.length) * 100;

  return (
    <nav
      className="sticky top-0 z-20 border-b border-borde bg-tarjeta/95 backdrop-blur-md"
      aria-label="Pasos de la demo"
    >
      <div
        className="h-1 bg-zebra"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={idx + 1}
        aria-label={`Paso ${idx + 1} de ${steps.length}`}
      >
        <div
          className="h-full bg-amarillo transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="container-app flex gap-1 overflow-x-auto py-3">
        {steps.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                aria-current={isActive ? "step" : undefined}
                className={`whitespace-nowrap border-b-2 px-3 py-1.5 text-xs font-bold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-negro ${
                  isActive
                    ? "border-amarillo text-negro"
                    : "border-transparent text-muted hover:text-negro"
                }`}
              >
                {s.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
