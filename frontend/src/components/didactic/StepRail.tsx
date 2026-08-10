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
    <nav className="sticky top-0 z-20 border-b border-negro/10 bg-blanco/95 backdrop-blur">
      <ol className="container-app flex gap-1 overflow-x-auto py-3">
        {steps.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? "bg-negro text-blanco"
                    : "text-negro/60 hover:bg-negro/5"
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
