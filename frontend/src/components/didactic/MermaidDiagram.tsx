import { useEffect, useId, useRef, useState } from "react";

const NEGRO = "#2C2A29";
const BLANCO = "#F7F7F7";

/** Ancho / alto máximos del SVG renderizado (px). */
const MAX_W = 220;
const MAX_H = 260;

let mermaidReady: Promise<typeof import("mermaid").default> | null = null;

function loadMermaid() {
  if (!mermaidReady) {
    mermaidReady = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: "Manrope, sans-serif",
        themeVariables: {
          fontSize: "10px",
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
          padding: 4,
          htmlLabels: true,
          nodeSpacing: 10,
          rankSpacing: 14,
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

  const scale = Math.min(MAX_W / rawW, MAX_H / rawH, 1);
  const w = Math.round(rawW * scale);
  const h = Math.round(rawH * scale);

  svgEl.setAttribute("width", String(w));
  svgEl.setAttribute("height", String(h));
  svgEl.style.width = `${w}px`;
  svgEl.style.height = `${h}px`;
  svgEl.style.maxWidth = `${MAX_W}px`;
  svgEl.style.maxHeight = `${MAX_H}px`;
  svgEl.style.display = "block";

  svgEl.querySelectorAll("rect, polygon, path, circle, ellipse").forEach((el) => {
    const stroke = el.getAttribute("stroke");
    if (stroke && stroke !== "none") el.setAttribute("stroke-width", "1");
  });
}

type Props = {
  chart: string;
  caption?: string;
  className?: string;
};

/** Diagrama Mermaid pequeño (lazy-load + escala forzada). */
export function MermaidDiagram({ chart, caption, className = "" }: Props) {
  const reactId = useId().replace(/:/g, "");
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

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
        if (svgEl) fitSvg(svgEl);
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

  return (
    <figure
      className={`my-2 inline-block max-w-[220px] border border-negro/10 bg-blanco p-2 ${className}`}
    >
      {loading && !error ? (
        <p className="text-center text-[10px] text-negro/40">Cargando…</p>
      ) : null}
      {error ? (
        <p className="text-xs text-naranja">Diagrama no disponible</p>
      ) : (
        <div ref={hostRef} className="flex justify-center leading-none" />
      )}
      {caption ? (
        <figcaption className="mt-1.5 text-center text-[10px] leading-snug text-negro/45">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
