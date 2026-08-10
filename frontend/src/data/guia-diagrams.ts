/** Diagramas Mermaid minimalistas — sin estilos por nodo (tema global). */
import type { NodeNote } from "../components/didactic/MermaidDiagram";

export const CHART_CICLO = `
flowchart TD
  A[Activo real] --> B[Especificación del token]
  B --> C[Blockchain]
  C --> D[Datos off-chain]
  D --> E[Emisión]
  E --> F[Gestión del activo]
`;

export const NOTES_CICLO: Record<string, NodeNote> = {
  "Activo real": {
    title: "Activo real",
    body: "El punto de partida: inmueble, bono, crédito, oro… algo con valor económico verificable fuera de la cadena.",
    accent: "amarillo",
  },
  "Especificación del token": {
    title: "Especificación del token",
    body: "Se define qué representa el token (derecho económico, fracción, deuda) y bajo qué wrapper legal.",
    accent: "naranja",
  },
  Blockchain: {
    title: "Blockchain",
    body: "La red donde vive el contrato y las reglas de transferencia — en el taller, Ethereum Sepolia.",
    accent: "azul",
  },
  "Datos off-chain": {
    title: "Datos off-chain",
    body: "Información que no vive on-chain: NAV, KYC, custodia, valoración. Debe mantenerse sincronizada con el token.",
    accent: "rosado",
  },
  Emisión: {
    title: "Emisión",
    body: "Mint de los tokens hacia los primeros holders, normalmente tras verificación legal y de cumplimiento.",
    accent: "verde",
  },
  "Gestión del activo": {
    title: "Gestión del activo",
    body: "Ciclo de vida continuo: reportes, distribución de rentas, redención. No termina en la emisión.",
    accent: "amarillo",
  },
};


export const CHART_ARQUITECTURA = `
flowchart TB
  ACT[Activo real]
  CUST[Custodia / legal]
  LW[SPV / Trust]
  OFF[Off-chain: KYC · NAV · Core]
  ORC[Oráculo / API]
  BC[Blockchain: token · rules]
  HOLD[Token holders]
  ACT --> CUST --> LW --> OFF --> ORC --> BC --> HOLD
`;

export const NOTES_ARQUITECTURA: Record<string, NodeNote> = {
  "Activo real": {
    title: "Activo real",
    body: "El activo o derecho subyacente: inmueble, bono, crédito, treasury. Todo lo demás existe para representarlo con fidelidad.",
    accent: "amarillo",
  },
  "Custodia / legal": {
    title: "Custodia / legal",
    body: "Quién resguarda el activo físico o el derecho, y bajo qué marco legal responde ante los holders del token.",
    accent: "naranja",
  },
  "SPV / Trust": {
    title: "SPV / Trust",
    body: "Vehículo legal (sociedad, fideicomiso) que aísla el activo y define qué derecho económico recibe el token holder.",
    accent: "naranja",
  },
  "Off-chain: KYC · NAV · Core": {
    title: "Off-chain: KYC · NAV · Core",
    body: "Sistemas tradicionales que no viven en blockchain: identidad de inversionistas, valoración del activo (NAV), core bancario.",
    accent: "rosado",
  },
  "Oráculo / API": {
    title: "Oráculo / API",
    body: "Puente de datos entre el mundo off-chain y el contrato on-chain. Sin él, el token se desincroniza del activo real.",
    accent: "azul",
  },
  "Blockchain: token · rules": {
    title: "Blockchain: token · rules",
    body: "El contrato inteligente: emisión, transferencia y reglas de cumplimiento codificadas (p. ej. ERC-3643).",
    accent: "verde",
  },
  "Token holders": {
    title: "Token holders",
    body: "Los inversionistas finales, dueños de la participación económica representada por el token.",
    accent: "amarillo",
  },
};

export const CHART_HIBRIDA = `
flowchart LR
  OFF[Off-chain] --> O[Oracle] --> ON[On-chain]
`;

export const NOTES_HIBRIDA: Record<string, NodeNote> = {
  "Off-chain": {
    title: "Off-chain",
    body: "Ownership legal, custodia y valoración del activo — viven fuera de la blockchain.",
    accent: "rosado",
  },
  Oracle: {
    title: "Oracle",
    body: "Canal que lleva datos verificados del mundo real hacia el contrato on-chain (precio, reservas, NAV).",
    accent: "azul",
  },
  "On-chain": {
    title: "On-chain",
    body: "El token, sus reglas de transferencia y el settlement parcial — viven en la blockchain.",
    accent: "verde",
  },
};

export const CHART_TRANSFER_3643 = `
flowchart TD
  U[Usuario] --> T["transfer()"]
  T --> Q{¿Autorizado?}
  Q -->|No| N[Rechazar]
  Q -->|Sí| Y[Transferir]
  style Q fill:#FFD204,stroke:#2C2A29,color:#2C2A29
`;

export const NOTES_TRANSFER_3643: Record<string, NodeNote> = {
  Usuario: {
    title: "Usuario",
    body: "Quien inicia la transferencia del security token — puede ser el holder o un operador autorizado.",
    accent: "amarillo",
  },
  "transfer()": {
    title: "transfer()",
    body: "A diferencia del ERC-20 abierto, aquí la función consulta un módulo de compliance antes de mover balances.",
    accent: "azul",
  },
  "¿Autorizado?": {
    title: "¿Autorizado?",
    body: "El contrato de identidad/compliance valida KYC, elegibilidad y restricciones (país, límites, lockups) del receptor.",
    accent: "naranja",
  },
  Rechazar: {
    title: "Rechazar",
    body: "Si el receptor no es elegible, la transacción revierte — el activo nunca cambia de manos.",
    accent: "naranja",
  },
  Transferir: {
    title: "Transferir",
    body: "Solo si pasa la validación se actualizan los balances, igual que en un ERC-20 estándar.",
    accent: "verde",
  },
};

export const CHART_TREASURY = `
flowchart TD
  USD[USD] --> CUST[Custodian]
  CUST --> UST[US Treasury]
  UST --> FUND[Fund / SPV]
  FUND --> TOK[RWA Token]
  TOK --> INV[Investor]
`;

export const NOTES_TREASURY: Record<string, NodeNote> = {
  USD: {
    title: "USD",
    body: "Capital que entra al vehículo — normalmente en efectivo o stablecoin como on-ramp.",
    accent: "amarillo",
  },
  Custodian: {
    title: "Custodian",
    body: "Entidad regulada que resguarda el efectivo y los títulos del Treasury en nombre del fondo.",
    accent: "naranja",
  },
  "US Treasury": {
    title: "US Treasury",
    body: "El activo subyacente real: bonos del tesoro de EE. UU., de bajo riesgo y alta liquidez.",
    accent: "azul",
  },
  "Fund / SPV": {
    title: "Fund / SPV",
    body: "Vehículo legal que agrupa los Treasuries y emite participaciones tokenizadas sobre ellos.",
    accent: "rosado",
  },
  "RWA Token": {
    title: "RWA Token",
    body: "Representación on-chain de la participación en el fondo — el ejemplo de referencia es BlackRock BUIDL.",
    accent: "verde",
  },
  Investor: {
    title: "Investor",
    body: "Quien recibe el token y, según el diseño, puede redimirlo o transferirlo dentro de las reglas del fondo.",
    accent: "amarillo",
  },
};

export const CHART_CREDIT = `
flowchart TD
  CO[Empresa] --> LOAN[Préstamo]
  LOAN --> SPV[SPV / Fund]
  SPV --> TOK[Token]
  TOK --> INV[Investors]
`;

export const NOTES_CREDIT: Record<string, NodeNote> = {
  Empresa: {
    title: "Empresa",
    body: "El deudor real que recibe financiamiento — origen del flujo de caja que respalda el token.",
    accent: "amarillo",
  },
  Préstamo: {
    title: "Préstamo",
    body: "El activo crediticio: términos, tasa, plazo y garantías que definen el riesgo.",
    accent: "naranja",
  },
  "SPV / Fund": {
    title: "SPV / Fund",
    body: "Vehículo que agrupa uno o varios préstamos y estructura el waterfall de pagos hacia los inversionistas.",
    accent: "rosado",
  },
  Token: {
    title: "Token",
    body: "Representa la participación en el pool de crédito — su valor depende del desempeño de los préstamos.",
    accent: "verde",
  },
  Investors: {
    title: "Investors",
    body: "Reciben los flujos de pago según seniority; asumen el riesgo de default del prestatario.",
    accent: "azul",
  },
};

export const CHART_REAL_ESTATE = `
flowchart TD
  P[Inmueble] --> TOK[RENT]
  TOK --> HOLD[Inversores]
  TOK --> Y[Claim rentas]
`;

export const NOTES_REAL_ESTATE: Record<string, NodeNote> = {
  Inmueble: {
    title: "Inmueble",
    body: "El activo de la demo: valuado en 5.000 M COP, sin SPV ni KYC — el foco es el mecanismo on-chain.",
    accent: "amarillo",
  },
  RENT: {
    title: "RENT",
    body: "Token ERC-20 que representa la participación fraccionada: 1 RENT = 100.000 COP.",
    accent: "naranja",
  },
  Inversores: {
    title: "Inversores",
    body: "Compran RENT en PropertySale y quedan expuestos proporcionalmente al desempeño del inmueble.",
    accent: "verde",
  },
  "Claim rentas": {
    title: "Claim rentas",
    body: "YieldDistributor reparte lo depositado según el balance de RENT de cada inversionista (dividend-per-token).",
    accent: "azul",
  },
};

export const CHART_RUTA = `
flowchart TD
  S1[1 Fundamentos] --> S2[2 Lifecycle]
  S2 --> S3[3 Legal / SPV]
  S3 --> S4[4 ERC-20]
  S4 --> S5[5 ERC-3643]
  S5 --> S6[6 Oráculos]
  S6 --> S7[7 Custody]
  S7 --> S8[8 Compliance]
  S8 --> S9[9 POC]
`;

export const NOTES_RUTA: Record<string, NodeNote> = {
  "1 Fundamentos": {
    title: "1. Fundamentos",
    body: "Qué es un RWA y por qué el token no es el título — punto de partida conceptual.",
    accent: "amarillo",
  },
  "2 Lifecycle": {
    title: "2. Lifecycle",
    body: "El ciclo completo: especificación, emisión, gestión y eventual redención del activo.",
    accent: "naranja",
  },
  "3 Legal / SPV": {
    title: "3. Legal / SPV",
    body: "El wrapper jurídico que ancla el token a un derecho exigible fuera de la cadena.",
    accent: "rosado",
  },
  "4 ERC-20": {
    title: "4. ERC-20",
    body: "El estándar fungible abierto — el que usa RENT/COPW en este taller.",
    accent: "verde",
  },
  "5 ERC-3643": {
    title: "5. ERC-3643",
    body: "El estándar permissioned típico de security tokens: KYC, elegibilidad, freeze, forced transfer.",
    accent: "verde",
  },
  "6 Oráculos": {
    title: "6. Oráculos",
    body: "Cómo se sincronizan precio, NAV o reservas del mundo real con el contrato on-chain.",
    accent: "azul",
  },
  "7 Custody": {
    title: "7. Custody",
    body: "Quién resguarda el activo subyacente y las llaves — institucional vs. autocustodia.",
    accent: "azul",
  },
  "8 Compliance": {
    title: "8. Compliance",
    body: "Marco regulatorio aplicable: KYC/AML, límites de inversionistas, jurisdicción.",
    accent: "naranja",
  },
  "9 POC": {
    title: "9. POC",
    body: "Llevarlo a un caso concreto — en este taller, el flujo de deposit token bancario.",
    accent: "amarillo",
  },
};

export const CHART_POC = `
flowchart TD
  BANK[Banco / depósito] --> CORE[Core banking]
  CORE --> TOK[Deposit token]
  TOK --> USER[Usuario]
`;

export const NOTES_POC: Record<string, NodeNote> = {
  "Banco / depósito": {
    title: "Banco / depósito",
    body: "El dinero fiat que un cliente mantiene en el banco — el origen del respaldo 1:1.",
    accent: "amarillo",
  },
  "Core banking": {
    title: "Core banking",
    body: "El sistema tradicional que reconcilia el saldo real con lo que se representa on-chain.",
    accent: "naranja",
  },
  "Deposit token": {
    title: "Deposit token",
    body: "Representación on-chain del depósito bancario. COPW en la demo es un mock pedagógico de esta idea.",
    accent: "verde",
  },
  Usuario: {
    title: "Usuario",
    body: "Recibe el token y puede transferirlo u operarlo, con camino de redención de vuelta a fiat.",
    accent: "azul",
  },
};

export const CHART_CLAVE = `
flowchart LR
  REAL[Mundo real] <-.->|Interoperabilidad| CHAIN[Blockchain]
`;

export const NOTES_CLAVE: Record<string, NodeNote> = {
  "Mundo real": {
    title: "Mundo real",
    body: "Activo, derechos legales, custodia, identidad y datos — todo lo que el token debe reflejar con fidelidad.",
    accent: "naranja",
  },
  Blockchain: {
    title: "Blockchain",
    body: "El token, sus reglas y el settlement — solo una pieza del sistema completo, no el sistema en sí.",
    accent: "azul",
  },
};
