/** Paleta de acentos compartida por los componentes didácticos (chips, diagramas).
 *  Fondos suaves = tonalidades 100 de Design.json.
 */
export type Accent = "amarillo" | "verde" | "naranja" | "rosado" | "azul";

export const ACCENT_BORDER: Record<Accent, string> = {
  amarillo: "border-l-amarillo",
  verde: "border-l-verde",
  naranja: "border-l-naranja",
  rosado: "border-l-rosado",
  azul: "border-l-azul",
};

export const ACCENT_CHIP: Record<Accent, string> = {
  amarillo: "border-amarillo/40 bg-amarillo-100",
  verde: "border-verde/40 bg-verde-100",
  naranja: "border-naranja/40 bg-naranja-100",
  rosado: "border-rosado/50 bg-rosado-100",
  azul: "border-azul/40 bg-azul-100",
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
  amarillo: "#FDDA24",
  verde: "#00C389",
  naranja: "#FF7F41",
  rosado: "#F5B6CD",
  azul: "#59CBE8",
};
