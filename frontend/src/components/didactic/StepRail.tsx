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
  return (
    <nav className="sticky top-0 z-20 border-b border-borde bg-tarjeta/90 backdrop-blur-md">
      <ol className="container-app flex gap-1.5 overflow-x-auto py-3">
        {steps.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                className={`whitespace-nowrap rounded-[var(--radius-full)] px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? "bg-negro text-blanco shadow-sm"
                    : "text-muted hover:bg-zebra hover:text-negro"
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
