/** Diagramas Mermaid minimalistas — sin estilos por nodo (tema global). */

export const CHART_CICLO = `
flowchart TD
  A[Activo real] --> B[Especificación del token]
  B --> C[Blockchain]
  C --> D[Datos off-chain]
  D --> E[Emisión]
  E --> F[Gestión del activo]
`;

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

export const CHART_HIBRIDA = `
flowchart LR
  OFF[Off-chain] --> O[Oracle] --> ON[On-chain]
`;

export const CHART_TRANSFER_3643 = `
flowchart TD
  U[Usuario] --> T["transfer()"]
  T --> Q{¿Autorizado?}
  Q -->|No| N[Rechazar]
  Q -->|Sí| Y[Transferir]
  style Q fill:#FFD204,stroke:#2C2A29,color:#2C2A29
`;

export const CHART_TREASURY = `
flowchart TD
  USD[USD] --> CUST[Custodian]
  CUST --> UST[US Treasury]
  UST --> FUND[Fund / SPV]
  FUND --> TOK[RWA Token]
  TOK --> INV[Investor]
`;

export const CHART_CREDIT = `
flowchart TD
  CO[Empresa] --> LOAN[Préstamo]
  LOAN --> SPV[SPV / Fund]
  SPV --> TOK[Token]
  TOK --> INV[Investors]
`;

export const CHART_REAL_ESTATE = `
flowchart TD
  P[Inmueble] --> TOK[RENT]
  TOK --> HOLD[Inversores]
  TOK --> Y[Claim rentas]
`;

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

export const CHART_POC = `
flowchart TD
  BANK[Banco / depósito] --> CORE[Core banking]
  CORE --> TOK[Deposit token]
  TOK --> USER[Usuario]
`;

export const CHART_CLAVE = `
flowchart LR
  REAL[Mundo real] <-.->|Interoperabilidad| CHAIN[Blockchain]
`;
