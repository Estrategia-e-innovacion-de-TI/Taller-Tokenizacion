type LinkItem = {
  href: string;
  label: string;
  note?: string;
};

export function DeepLinks({
  title = "Para profundizar",
  items,
  divider = true,
}: {
  title?: string;
  items: LinkItem[];
  divider?: boolean;
}) {
  return (
    <div className={divider ? "mt-8 border-t border-negro/10 pt-6" : "mt-2"}>
      <p className="text-xs font-semibold tracking-[0.12em] text-negro/50 uppercase">
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.href} className="text-sm">
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-negro underline decoration-azul decoration-2 underline-offset-2 hover:decoration-naranja"
            >
              {item.label}
            </a>
            {item.note ? (
              <span className="text-negro/55"> — {item.note}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
