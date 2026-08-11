/** Paleta de acentos compartida por los componentes didácticos (chips, diagramas). */
export type Accent = "amarillo" | "verde" | "naranja" | "rosado" | "azul";

export const ACCENT_BORDER: Record<Accent, string> = {
  amarillo: "border-l-amarillo",
  verde: "border-l-verde",
  naranja: "border-l-naranja",
  rosado: "border-l-rosado",
  azul: "border-l-azul",
};

export const ACCENT_CHIP: Record<Accent, string> = {
  amarillo: "border-amarillo bg-amarillo/30",
  verde: "border-verde bg-verde/25",
  naranja: "border-naranja bg-naranja/25",
  rosado: "border-rosado bg-rosado/40",
  azul: "border-azul bg-azul/25",
};

/** Barra corta de wayfinding sobre el título de cada paso. */
export const ACCENT_BAR: Record<Accent, string> = {
  amarillo: "bg-amarillo",
  verde: "bg-verde",
  naranja: "bg-naranja",
  rosado: "bg-rosado",
  azul: "bg-azul",
};

export const ACCENT_HEX: Record<Accent, string> = {
  amarillo: "#FFD204",
  verde: "#00C587",
  naranja: "#FF803A",
  rosado: "#FFB8D2",
  azul: "#01CDEB",
};
