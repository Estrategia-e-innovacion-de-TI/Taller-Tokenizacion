export type Enlace = {
  id: string;
  href: string;
  label: string;
  note?: string;
  starred?: boolean;
};

export type EnlaceGroup = {
  id: string;
  title: string;
  items: Enlace[];
};

/** Catálogo alineado con `recursos/Enlaces_de_interes.md` + guía RWA. */
export const ENLACES_GRUPOS: EnlaceGroup[] = [
  {
    id: "mercado",
    title: "Mercado RWA y visión institucional",
    items: [
      {
        id: "rwa-xyz",
        href: "https://www.rwa.xyz/",
        label: "RWA.xyz",
        note: "dashboard de activos tokenizados",
        starred: true,
      },
      {
        id: "mckinsey-tokenization",
        href: "https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-tokenization",
        label: "McKinsey — What is tokenization?",
        note: "definición institucional",
        starred: true,
      },
      {
        id: "mckinsey-waves",
        href: "https://www.mckinsey.com/industries/financial-services/our-insights/from-ripples-to-waves-the-transformational-power-of-tokenizing-assets",
        label: "McKinsey — From ripples to waves",
        note: "visión de mercado",
        starred: true,
      },
      {
        id: "coingecko-rwa",
        href: "https://assets.coingecko.com/reports/2025/CoinGecko-2025-RWA-Report.pdf",
        label: "CoinGecko 2025 RWA Report (PDF)",
      },
    ],
  },
  {
    id: "fundamentos",
    title: "Fundamentos (guía RWA)",
    items: [
      {
        id: "eth-rwa",
        href: "https://ethereum.org/es/real-world-assets/",
        label: "Ethereum.org — Real-World Assets",
        starred: true,
      },
      {
        id: "chainlink-rwa",
        href: "https://chain.link/education-hub/real-world-assets-rwas-explained",
        label: "Chainlink — RWA Explained",
        starred: true,
      },
      {
        id: "chainlink-how",
        href: "https://chain.link/education-hub/how-to-tokenize-an-asset",
        label: "Chainlink — How to Tokenize an Asset",
        starred: true,
      },
      {
        id: "chainlink-what",
        href: "https://chain.link/education-hub/tokenization",
        label: "Chainlink — What Is Tokenization?",
      },
      {
        id: "centrifuge",
        href: "https://docs.centrifuge.io/user/concepts/tokenization/",
        label: "Centrifuge — Tokenization",
      },
      {
        id: "patrick-collins",
        href: "https://www.youtube.com/watch?v=KNUchSEtQV0",
        label: "Tutorial — How to Tokenize a RWA (YouTube)",
      },
      {
        id: "taxonomy",
        href: "https://arxiv.org/abs/2606.08534",
        label: "Taxonomy of RWA Tokenization (arXiv)",
      },
      {
        id: "sok",
        href: "https://arxiv.org/abs/2604.06608",
        label: "SoK of RWA Tokenization (arXiv)",
      },
    ],
  },
  {
    id: "banca",
    title: "TradFi / banca",
    items: [
      {
        id: "kinexys",
        href: "https://www.jpmorgan.com/kinexys/index",
        label: "J.P. Morgan — Kinexys",
        starred: true,
      },
      {
        id: "kinexys-ats",
        href: "https://www.jpmorgan.com/kinexys/asset-tokenization",
        label: "Kinexys — Asset Tokenization",
        starred: true,
      },
      {
        id: "sgforge",
        href: "https://sgforge.com/",
        label: "Société Générale — SG-FORGE",
        starred: true,
      },
      {
        id: "agora",
        href: "https://www.bis.org/about/bisih/topics/fmis/agora.htm",
        label: "BIS — Project Agorá",
        starred: true,
      },
      {
        id: "agora-pdf",
        href: "https://www.bis.org/publ/othp110.pdf",
        label: "BIS — informe Agorá (PDF)",
      },
      {
        id: "guardian",
        href: "https://www.mas.gov.sg/schemes-and-initiatives/project-guardian",
        label: "MAS — Project Guardian",
        starred: true,
      },
      {
        id: "coindesk-repo",
        href: "https://www.coindesk.com/business/2024/06/24/dont-tell-anyone-but-private-blockchains-handle-over-15t-of-securities-financing-a-month",
        label: "CoinDesk — repo en DLT privado",
      },
    ],
  },
  {
    id: "colombia",
    title: "Colombia — marco local",
    items: [
      {
        id: "sfc-piloto",
        href: "https://www.superfinanciera.gov.co/publicaciones/10105340/innovasfcproyecto-piloto-permitira-que-entidades-del-sistema-financiero-en-alianza-con-plataformas-de-criptoactivos-realicen-pruebas-temporales-en-laarenera-de-la-sfc-10105340/",
        label: "SFC — piloto criptoactivos / laArenera",
        starred: true,
      },
      {
        id: "sfc-boletin",
        href: "https://www.superfinanciera.gov.co/publicaciones/10106486/normativanormativa-generalboletin-juridico-superintendencia-financieraboletin-juridico-numero-criptomonedas-criptoactivos-proyecto-piloto-10106486/",
        label: "SFC — boletín jurídico criptoactivos",
        starred: true,
      },
      {
        id: "banrep",
        href: "https://www.banrep.gov.co/es/publicaciones-investigacion/documento-tecnico-criptoactivos",
        label: "Banrep — Documento técnico criptoactivos",
        starred: true,
      },
      {
        id: "expedit",
        href: "https://expeditcapital.com/es/blog/es-viable-y-legal-la-tokenizacion-de-activos-financieros-en-colombia",
        label: "Expedit — ¿Es viable tokenizar en Colombia?",
      },
    ],
  },
  {
    id: "stack",
    title: "Estándares / stack de la demo",
    items: [
      {
        id: "erc3643",
        href: "https://www.erc3643.org/",
        label: "ERC-3643",
        note: "tokens permissioned",
        starred: true,
      },
      {
        id: "turnkey",
        href: "https://docs.turnkey.com/",
        label: "Turnkey docs",
      },
      {
        id: "permissionless",
        href: "https://docs.pimlico.io/permissionless",
        label: "permissionless.js",
      },
      {
        id: "pimlico",
        href: "https://docs.pimlico.io/",
        label: "Pimlico",
      },
      {
        id: "viem",
        href: "https://viem.sh/",
        label: "viem",
      },
      {
        id: "foundry",
        href: "https://book.getfoundry.sh/",
        label: "Foundry Book",
      },
      {
        id: "eip4337",
        href: "https://eips.ethereum.org/EIPS/eip-4337",
        label: "EIP-4337",
      },
    ],
  },
];

const byId = new Map(
  ENLACES_GRUPOS.flatMap((g) => g.items).map((e) => [e.id, e]),
);

export function enlace(id: string): Enlace {
  const e = byId.get(id);
  if (!e) throw new Error(`Enlace desconocido: ${id}`);
  return e;
}

export function enlaces(...ids: string[]): Enlace[] {
  return ids.map(enlace);
}
