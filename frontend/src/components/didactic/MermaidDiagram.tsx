import { useEffect, useId, useRef, useState } from "react";
import { ACCENT_BORDER, type Accent } from "./accent";

const NEGRO = "#2C2A29";
const BLANCO = "#F7F7F7";

/** Ancho / alto objetivo del SVG renderizado (px, escala también hacia arriba). */
const MAX_W = 560;
const MAX_H = 420;
/** Tope de ampliación para que diagramas triviales (2-3 nodos) no queden absurdos. */
const MAX_SCALE = 2.2;

let mermaidReady: Promise<typeof import("mermaid").default> | null = null;

function loadMermaid() {
  if (!mermaidReady) {
    mermaidReady = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: "CIBFontSans, sans-serif",
        themeVariables: {
          fontSize: "13px",
          primaryColor: BLANCO,
          primaryTextColor: NEGRO,
          primaryBorderColor: NEGRO,
          secondaryColor: BLANCO,
          tertiaryColor: BLANCO,
          lineColor: NEGRO,
          textColor: NEGRO,
          mainBkg: BLANCO,
          nodeBorder: NEGRO,
          clusterBkg: BLANCO,
          clusterBorder: NEGRO,
          titleColor: NEGRO,
          edgeLabelBackground: BLANCO,
        },
        flowchart: {
          curve: "linear",
          padding: 8,
          htmlLabels: true,
          nodeSpacing: 18,
          rankSpacing: 26,
          useMaxWidth: false,
        },
      });
      return mermaid;
    });
  }
  return mermaidReady;
}

function fitSvg(svgEl: SVGSVGElement) {
  const vb = svgEl.viewBox?.baseVal;
  const rawW =
    vb && vb.width > 0
      ? vb.width
      : Number.parseFloat(svgEl.getAttribute("width") || "0") ||
        svgEl.getBoundingClientRect().width;
  const rawH =
    vb && vb.height > 0
      ? vb.height
      : Number.parseFloat(svgEl.getAttribute("height") || "0") ||
        svgEl.getBoundingClientRect().height;

  if (!rawW || !rawH) return;

  const scale = Math.min(MAX_W / rawW, MAX_H / rawH, MAX_SCALE);
  const w = Math.round(rawW * scale);
  const h = Math.round(rawH * scale);

  svgEl.setAttribute("width", String(w));
  svgEl.setAttribute("height", String(h));
  svgEl.style.width = `${w}px`;
  svgEl.style.height = `${h}px`;
  svgEl.style.maxWidth = "100%";
  svgEl.style.display = "block";

  svgEl.querySelectorAll("rect, polygon, path, circle, ellipse").forEach((el) => {
    const stroke = el.getAttribute("stroke");
    if (stroke && stroke !== "none") el.setAttribute("stroke-width", "1");
  });
}

export type NodeNote = {
  title: string;
  body: string;
  accent?: Accent;
};

/** Vincula clic/teclado en los nodos del SVG cuyo texto coincide con una clave de `notes`. */
function wireInteractiveNodes(
  svgEl: SVGSVGElement,
  notes: Record<string, NodeNote>,
  onOpen: (key: string) => void,
) {
  const keys = Object.keys(notes);
  if (keys.length === 0) return;

  svgEl.querySelectorAll<SVGGElement>(".node").forEach((group) => {
    const label = group.textContent?.trim() ?? "";
    const key = keys.find((k) => label === k || label.includes(k));
    if (!key) return;

    group.classList.add("mmd-node--clickable");
    group.dataset.noteKey = key;
    group.setAttribute("tabindex", "0");
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `Ver detalle: ${notes[key].title}`);

    const open = () => onOpen(key);
    group.addEventListener("click", open);
    group.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
}

type Props = {
  chart: string;
  caption?: string;
  className?: string;
  /** Notas por nodo: clave = texto exacto del nodo en el chart. Si se pasa, los nodos son clicables. */
  notes?: Record<string, NodeNote>;
};

/** Diagrama Mermaid (lazy-load + escala forzada), con nodos clicables opcionales. */
export function MermaidDiagram({ chart, caption, className = "", notes }: Props) {
  const reactId = useId().replace(/:/g, "");
  const hostRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setActiveKey(null);

    const run = async () => {
      if (!hostRef.current) return;
      try {
        setLoading(true);
        const mermaid = await loadMermaid();
        const id = `mmd-${reactId}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, chart.trim());
        if (cancelled || !hostRef.current) return;
        hostRef.current.innerHTML = svg;
        const svgEl = hostRef.current.querySelector("svg");
        if (svgEl) {
          fitSvg(svgEl);
          if (notesRef.current) {
            wireInteractiveNodes(svgEl, notesRef.current, (key) =>
              setActiveKey((cur) => (cur === key ? null : key)),
            );
          }
        }
        setError(null);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Error al renderizar diagrama",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.querySelectorAll<SVGGElement>("[data-note-key]").forEach((g) => {
      g.classList.toggle("mmd-node--active", g.dataset.noteKey === activeKey);
    });
  }, [activeKey]);

  const activeNote = activeKey && notes ? notes[activeKey] : null;
  const hasNotes = !!notes && Object.keys(notes).length > 0;

  return (
    <figure
      className={`my-4 mx-auto w-fit max-w-full border border-negro/10 bg-blanco p-3 ${className}`}
    >
      {loading && !error ? (
        <p className="text-center text-xs text-negro/40">Cargando…</p>
      ) : null}
      {error ? (
        <p className="text-xs text-naranja">Diagrama no disponible</p>
      ) : (
        <div className="overflow-x-auto">
          <div ref={hostRef} className="flex justify-center leading-none" />
        </div>
      )}
      {hasNotes ? (
        <p className="mt-2 text-center text-[11px] font-semibold tracking-wider text-negro/40 uppercase">
          Clic en un nodo para profundizar
        </p>
      ) : null}
      {activeNote ? (
        <div
          className={`mt-2 border border-negro/10 border-l-4 bg-blanco p-3 text-left ${
            ACCENT_BORDER[activeNote.accent ?? "azul"]
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-display text-sm font-bold">{activeNote.title}</p>
            <button
              type="button"
              onClick={() => setActiveKey(null)}
              aria-label="Cerrar detalle"
              className="text-negro/40 hover:text-negro"
            >
              ×
            </button>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-negro/70">
            {activeNote.body}
          </p>
        </div>
      ) : null}
      {caption ? (
        <figcaption className="mt-1.5 text-center text-xs leading-snug text-negro/45">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

