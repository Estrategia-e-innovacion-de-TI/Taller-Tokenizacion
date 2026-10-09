import type { Accent } from "../components/didactic/accent";

/** Agrupación por problema de negocio (no por marca). */
export type CasoProblema =
  | "liquidez"
  | "emision"
  | "colateral"
  | "liquidacion"
  | "cercano"
  | "colombia";

export type CasoUso = {
  id: string;
  actor: string;
  problema: CasoProblema;
  /** Qué fricción de negocio ataca. */
  buscaResolver: string;
  /** Mecanismo / producto con el que lo ataca. */
  comoResuelve: string;
  /** Dato o hito de lo que se consiguió; omitir si no hay cifra/hito limpio. */
  logro?: string;
  fecha?: string;
  enlaceIds: string[];
  accent?: Accent;
};

export const CASO_SECCIONES: {
  id: CasoProblema;
  title: string;
  intro: string;
}[] = [
  {
    id: "liquidez",
    title: "Fondos y liquidez",
    intro: "Treasuries y fondos de mercado monetario con liquidación más ágil.",
  },
  {
    id: "emision",
    title: "Emisión de deuda e instrumentos",
    intro: "Sacar un bono o security token al mercado y administrarlo en digital.",
  },
  {
    id: "colateral",
    title: "Repo y colateral",
    intro: "Usar activos de alta calidad como garantía sin mover el título físico.",
  },
  {
    id: "liquidacion",
    title: "Depósitos y liquidación",
    intro: "Dinero de banco o de banco central para pagar al instante, también entre países.",
  },
  {
    id: "cercano",
    title: "Sectores cercanos",
    intro: "El mismo patrón de derechos económicos fuera del core banking.",
  },
  {
    id: "colombia",
    title: "Colombia · marco local",
    intro: "Sandbox y documentos oficiales. No son producto autorizado por la SFC.",
  },
];

export const CASOS_USO: CasoUso[] = [
  {
    id: "buidl",
    actor: "BlackRock · BUIDL",
    problema: "liquidez",
    buscaResolver:
      "Que un fondo de tesoros de EE. UU. se pueda suscribir, transferir y liquidar sin los plazos clásicos de T+1/T+2.",
    comoResuelve:
      "Tokeniza participaciones del fondo (underlying: treasuries). El inversor institucional tiene el derecho económico on-chain y el activo sigue custodiado off-chain.",
    logro:
      "Referencia dominante en dashboards RWA desde 2024 (AUM variable; ver RWA.xyz). Producto institucional, no retail abierto.",
    fecha: "2024–",
    enlaceIds: ["buidl", "rwa-xyz"],
    accent: "amarillo",
  },
  {
    id: "kinexys-mmf",
    actor: "J.P. Morgan · Kinexys",
    problema: "liquidez",
    buscaResolver:
      "Mover fondos y activos entre clientes del banco sin fricción de horarios, corresponsales y conciliación manual.",
    comoResuelve:
      "Red permissioned del propio banco (antes Onyx): tokeniza money market funds y rails de pago programables dentro de su perímetro (KYC y dinero de banco).",
    logro:
      "En producción desde ~2020. Casos públicos de tokenización de fondos y pagos programables para clientes institucionales.",
    fecha: "2020–",
    enlaceIds: ["kinexys", "kinexys-ats"],
    accent: "amarillo",
  },
  {
    id: "hsbc-orion",
    actor: "HSBC · Orion",
    problema: "emision",
    buscaResolver:
      "Emitir un bono, llevar el registro de tenedores y pagar cupones sin un back-office fragmentado entre custodios y mercados.",
    comoResuelve:
      "Plataforma de ciclo de vida de bonos digitales: emisión, distribución cross-border y eventos corporativos sobre DLT, con agentes y marco regulado.",
    logro:
      "Emisiones digitales públicas (p. ej. notas nativas digitales y programas verdes institucionales, incl. BEI). En producción desde ~2021.",
    fecha: "2021–",
    enlaceIds: ["hsbc-orion"],
    accent: "naranja",
  },
  {
    id: "sgforge",
    actor: "Société Générale · SG-FORGE",
    problema: "emision",
    buscaResolver:
      "Emitir valores digitales y un euro tokenizado que un banco pueda usar en cadenas públicas sin salirse de MiCA.",
    comoResuelve:
      "Filial regulada: security tokens + stablecoin EUR CoinVertible (EURCV) respaldada, operable en público o permissioned según el producto.",
    logro:
      "EURCV en circulación desde 2023 como ejemplo de dinero tokenizado con licencia UE. SG-FORGE opera como filial desde 2018.",
    fecha: "2018– · EURCV 2023–",
    enlaceIds: ["sgforge"],
    accent: "naranja",
  },
  {
    id: "hqla",
    actor: "HQLAx / Broadridge DLR",
    problema: "colateral",
    buscaResolver:
      "Usar bonos de alta calidad (HQLA) como garantía intradía sin enviar el título físico ni bloquearlo días en un custodio.",
    comoResuelve:
      "El activo permanece custodiado; en DLT se transfiere el derecho de disposición. Repo y movilidad de colateral entre bancos y custodios.",
    logro:
      "Uso productivo a escala. Reportes de mercado sitúan el securities financing en redes privadas en el orden de billones USD al mes.",
    fecha: "2019–",
    enlaceIds: ["hqla", "coindesk-repo"],
    accent: "verde",
  },
  {
    id: "kinexys-repo",
    actor: "J.P. Morgan · repo intradía",
    problema: "colateral",
    buscaResolver:
      "Liberar liquidez durante el día operativo sin un repo overnight clásico ni movimiento de títulos.",
    comoResuelve:
      "Repo tokenizado sobre Kinexys: la garantía y el efectivo se registran en la red del banco con contrapartes seleccionadas.",
    logro:
      "Casos documentados de repo intradía en red bank-led (piloto avanzado / producción con contrapartes).",
    fecha: "2022–",
    enlaceIds: ["kinexys", "coindesk-repo"],
    accent: "verde",
  },
  {
    id: "agora",
    actor: "BIS · Project Agorá",
    problema: "liquidacion",
    buscaResolver:
      "Liquidar pagos cross-border sin cadenas de corresponsales lentas y costosas.",
    comoResuelve:
      "Diseño conjunto BIS + bancos centrales y comerciales: depósitos y reservas tokenizados como dinero de liquidación.",
    logro:
      "Informe público del BIS (2024–) con arquitectura y participantes. Es diseño e investigación, no un producto retail.",
    fecha: "2024–",
    enlaceIds: ["agora", "agora-pdf"],
    accent: "azul",
  },
  {
    id: "guardian",
    actor: "MAS · Project Guardian",
    problema: "liquidacion",
    buscaResolver:
      "Probar fondos, FX y depósitos tokenizados con bancos reales, bajo supervisión, antes de una norma definitiva.",
    comoResuelve:
      "Sandbox de Singapur: cohortes de bancos y asset managers operan casos acotados con la MAS como supervisor.",
    logro:
      "Varias cohortes activas desde 2022 (fondos, FX, depósitos). Referencia de cómo un regulador escala pruebas.",
    fecha: "2022–",
    enlaceIds: ["guardian"],
    accent: "azul",
  },
  {
    id: "inmobiliario",
    actor: "Inmobiliario / infraestructura",
    problema: "cercano",
    buscaResolver:
      "Fraccionar un inmueble o un proyecto de infraestructura para que más inversores entren con tickets menores.",
    comoResuelve:
      "Token de participación económica (rentas / flujos) ligado a un vehículo o derecho, no necesariamente al folio registral.",
    logro:
      "Tramo real-estate creciente en dashboards RWA. Madurez desigual: fondos y startups; pocos bancos en producción plena.",
    fecha: "en curso",
    enlaceIds: ["rwa-xyz", "eth-rwa"],
    accent: "rosado",
  },
  {
    id: "factoring",
    actor: "Factoring / supply chain",
    problema: "cercano",
    buscaResolver:
      "Que un proveedor cobre antes una factura sin ceder el control opaco del derecho de cobro.",
    comoResuelve:
      "El derecho de cobro se representa on-chain; inversores fondean un pool y el cobro se rastrea hasta el claim.",
    logro:
      "Plataformas tipo Centrifuge en producción en niches (2019–). Banca corporativa suele entrar como partner, no como emisor único.",
    fecha: "2019–",
    enlaceIds: ["centrifuge", "chainlink-how"],
    accent: "rosado",
  },
  {
    id: "seguros",
    actor: "Seguros / pensiones",
    problema: "cercano",
    buscaResolver:
      "Dar a un afiliado o tomador una participación trazable en un vehículo, con liquidez secundaria controlada.",
    comoResuelve:
      "Tokens de participación en el portafolio + reglas de quién puede transferir (permissioned) y reporte al regulador.",
    logro:
      "Aún exploratorio en LatAm: estudios y pilots. El ritmo lo marcan actuariado y compliance, no el smart contract.",
    fecha: "exploratorio",
    enlaceIds: ["mckinsey-waves", "rwa-xyz"],
    accent: "rosado",
  },
  {
    id: "sfc",
    actor: "SFC · laArenera",
    problema: "colombia",
    buscaResolver:
      "Probar alianzas cripto–entidad vigilada sin abrir una licencia general de tokenización.",
    comoResuelve:
      "Sandbox temporal: entidades del sistema financiero, en alianza con plataformas, hacen pruebas acotadas bajo supervisión.",
    logro:
      "Piloto público (2024–). No equivale a autorización de producto ni a tokenizar activos a escala.",
    fecha: "2024–",
    enlaceIds: ["sfc-piloto", "sfc-boletin"],
    accent: "azul",
  },
  {
    id: "banrep",
    actor: "Banrep · criptoactivos",
    problema: "colombia",
    buscaResolver:
      "Dejar claro qué es (y qué no es) un criptoactivo frente al peso de curso legal.",
    comoResuelve:
      "Documento técnico y conceptos de Junta: marco de riesgos, naturaleza jurídica y límites vs moneda.",
    logro:
      "Posición institucional vigente: los criptoactivos no son moneda de curso legal. Es marco, no un producto tokenizado.",
    fecha: "marco vigente",
    enlaceIds: ["banrep", "expedit"],
    accent: "azul",
  },
];

export function casosPorProblema(problema: CasoProblema): CasoUso[] {
  return CASOS_USO.filter((c) => c.problema === problema);
}
