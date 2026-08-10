import { Link } from "react-router-dom";
import { ConceptExpand } from "../../components/didactic/ConceptExpand";
import { ConceptSection } from "../../components/didactic/ConceptSection";
import { DeepLinks } from "../../components/didactic/DeepLinks";
import { MermaidDiagram } from "../../components/didactic/MermaidDiagram";
import { enlace, enlaces } from "../../data/enlaces";
import {
  CHART_ARQUITECTURA,
  CHART_CICLO,
  CHART_CLAVE,
  CHART_CREDIT,
  CHART_HIBRIDA,
  CHART_POC,
  CHART_REAL_ESTATE,
  CHART_RUTA,
  CHART_TRANSFER_3643,
  CHART_TREASURY,
  NOTES_ARQUITECTURA,
  NOTES_CICLO,
  NOTES_CLAVE,
  NOTES_CREDIT,
  NOTES_HIBRIDA,
  NOTES_POC,
  NOTES_REAL_ESTATE,
  NOTES_RUTA,
  NOTES_TRANSFER_3643,
  NOTES_TREASURY,
} from "../../data/guia-diagrams";

const sections = [
  { id: "fundamentos", label: "01 Fundamentos" },
  { id: "arquitectura", label: "02 Arquitectura" },
  { id: "estandares", label: "03 Estándares" },
  { id: "casos", label: "04 Casos de uso" },
  { id: "ruta", label: "05 Ruta" },
  { id: "poc", label: "06 POC depósitos" },
] as const;

export function GuiaRwaPage() {
  return (
    <div>
      <header className="pb-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-naranja uppercase">
          Guía de estudio
        </p>
        <h2 className="mt-1 font-display text-2xl font-extrabold md:text-3xl">
          Tokenización de Activos del Mundo Real (RWA)
        </h2>
        <p className="mt-3 text-negro/65">
          Versión interactiva de la guía del taller. Haz clic en los términos
          para profundizar. La práctica on-chain está en la{" "}
          <Link to="/demo" className="font-semibold underline decoration-naranja">
            Demo
          </Link>
          .
        </p>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Secciones de la guía">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="border border-negro/15 px-2.5 py-1 text-xs font-semibold text-negro/70 hover:border-negro/40"
            >
              {s.label}
            </a>
          ))}
          <Link
            to="/conceptos/enlaces"
            className="border border-azul bg-azul px-2.5 py-1 text-xs font-semibold"
          >
            Todos los enlaces →
          </Link>
        </nav>
      </header>

      <ConceptSection id="fundamentos" title="1. Fundamentos" first>
        <p>
          Un RWA es un activo del mundo real (oro, inmueble, bono, crédito…)
          representado on-chain como token. El token suele ser un{" "}
          <strong>derecho económico o legal</strong>, no el título físico en sí.
        </p>
        <MermaidDiagram
          chart={CHART_CICLO}
          notes={NOTES_CICLO}
          caption="Ciclo general de tokenización"
        />
        <div className="flex flex-wrap gap-2">
          <ConceptExpand
            term="¿Qué es un RWA?"
            accent="amarillo"
            summary="Real-World Asset: representación tokenizada de un activo o derecho fuera de la cadena. En la demo, RENT es participación económica sobre un inmueble — no el folio de matrícula."
            links={enlaces("eth-rwa", "chainlink-rwa", "mckinsey-tokenization")}
          />
          <ConceptExpand
            term="Legal wrapper / SPV"
            accent="naranja"
            summary="Capa jurídica (SPV, trust, fondo) que define qué derecho representa el token. Sin este wrapper, el token no tiene ancla legal clara."
            links={enlaces("taxonomy", "sok")}
          />
        </div>
        <DeepLinks
          title="Leer primero"
          items={enlaces("eth-rwa", "chainlink-rwa", "mckinsey-waves").map((e) => ({
            href: e.href,
            label: e.label,
            note: e.note,
          }))}
        />
      </ConceptSection>

      <ConceptSection id="arquitectura" title="2. Arquitectura">
        <p>
          No es solo <em>Activo → ERC-20</em>. Un diseño institucional apila
          mundo real, custodia legal, sistemas off-chain, oráculos y reglas
          on-chain.
        </p>
        <MermaidDiagram
          chart={CHART_ARQUITECTURA}
          notes={NOTES_ARQUITECTURA}
          caption="Capas de una arquitectura RWA institucional"
        />
        <MermaidDiagram
          chart={CHART_HIBRIDA}
          notes={NOTES_HIBRIDA}
          caption="Arquitectura híbrida: off-chain ↔ oracle ↔ on-chain"
        />
        <div className="flex flex-wrap gap-2">
          <ConceptExpand
            term="Arquitectura híbrida"
            accent="verde"
            summary="Ownership, custodia y valoración viven off-chain; el token, las reglas de transferencia y el settlement parcial viven on-chain. El oráculo / API es el puente."
            links={enlaces("taxonomy", "sok", "chainlink-how")}
          />
          <ConceptExpand
            term="Oráculo"
            accent="rosado"
            summary="Canal que lleva datos del mundo real (precio, reservas, NAV) a la blockchain. Sin oráculo confiable, el token se desacopla del activo."
            links={enlaces("chainlink-rwa", "patrick-collins")}
          />
          <ConceptExpand
            term="Proof of Reserve"
            accent="azul"
            summary="Prueba on-chain o verificable de que el respaldo (efectivo, treasuries, oro) existe y cubre los tokens emitidos."
            links={enlaces("patrick-collins", "rwa-xyz")}
          />
        </div>
      </ConceptSection>

      <ConceptSection id="estandares" title="3. Estándares">
        <p>
          La demo usa ERC-20 abierto (RENT / COPW). En banca suele aparecer
          compliance on-chain (p. ej. ERC-3643).
        </p>
        <MermaidDiagram
          chart={CHART_TRANSFER_3643}
          notes={NOTES_TRANSFER_3643}
          caption="Transferencia con restricciones (estilo ERC-3643)"
        />
        <div className="flex flex-wrap gap-2">
          <ConceptExpand
            term="ERC-20"
            accent="amarillo"
            summary="Fungible: balanceOf, transfer, approve. Ideal para participación fraccionada (como RENT) cuando no hay whitelist."
            links={enlaces("foundry", "viem")}
          />
          <ConceptExpand
            term="ERC-721 / 1155"
            accent="naranja"
            summary="721 = único (un inmueble concreto). 1155 = varios tipos en un contrato. Menos comunes para fondos fungibles."
          />
          <ConceptExpand
            term="ERC-3643"
            accent="verde"
            summary="Permissioned: KYC/AML, elegibilidad, restricciones de transferencia, freeze, forced transfer, mint/burn y redemption. Estándar típico de security tokens."
            links={enlaces("erc3643", "centrifuge")}
          />
        </div>
      </ConceptSection>

      <ConceptSection id="casos" title="4. Casos de uso">
        <div className="space-y-8">
          <div className="border-t border-negro/10 pt-6 first:border-t-0 first:pt-0">
            <p className="text-xs font-semibold tracking-wider text-negro/45 uppercase">
              Treasury / bonos
            </p>
            <MermaidDiagram chart={CHART_TREASURY} notes={NOTES_TREASURY} />
            <ConceptExpand
              term="Profundizar Treasury"
              accent="amarillo"
              summary="Preguntas clave: ¿quién es dueño del Treasury? ¿NAV? ¿intereses? ¿redención? BlackRock BUIDL es la referencia de mercado."
              links={enlaces("rwa-xyz", "kinexys-ats")}
            />
          </div>
          <div className="border-t border-negro/10 pt-6">
            <p className="text-xs font-semibold tracking-wider text-negro/45 uppercase">
              Private credit
            </p>
            <MermaidDiagram chart={CHART_CREDIT} notes={NOTES_CREDIT} />
            <ConceptExpand
              term="Profundizar crédito"
              accent="naranja"
              summary="Cash flows, default, waterfall, seniority y redención. Centrifuge es un buen punto de estudio técnico."
              links={enlaces("centrifuge", "sok")}
            />
          </div>
          <div className="border-t border-negro/10 pt-6">
            <p className="text-xs font-semibold tracking-wider text-negro/45 uppercase">
              Real estate · demo RENT
            </p>
            <MermaidDiagram chart={CHART_REAL_ESTATE} notes={NOTES_REAL_ESTATE} />
            <ConceptExpand
              term="Profundizar real estate"
              accent="verde"
              summary="Fractional ownership y rentas proporcionales. En la demo no hay SPV ni KYC: el foco es el mecanismo on-chain."
              links={enlaces("eth-rwa", "mckinsey-tokenization")}
            >
              <Link
                to="/demo"
                className="font-semibold underline decoration-naranja"
              >
                Ir a la demo RENT →
              </Link>
            </ConceptExpand>
          </div>
        </div>
        <p className="text-sm text-negro/60">
          Casos bancarios globales (Kinexys, SG-FORGE, Agorá…):{" "}
          <Link
            to="/conceptos/casos-banca"
            className="font-semibold underline decoration-azul"
          >
            ver Casos banca
          </Link>
          .
        </p>
      </ConceptSection>

      <ConceptSection id="ruta" title="5. Ruta de aprendizaje">
        <MermaidDiagram
          chart={CHART_RUTA}
          notes={NOTES_RUTA}
          caption="Orden sugerido de estudio"
        />
        <div className="flex flex-wrap gap-2">
          <ConceptExpand
            term="Preguntas de arquitectura"
            accent="azul"
            summary="No te quedes en “¿cómo creo el token?”. Pregunta ownership, legal, custody, valuation, oracle, compliance, redemption, settlement y mercado secundario."
            links={enlaces("taxonomy", "sok")}
          />
          <ConceptExpand
            term="Tutorial práctico"
            accent="naranja"
            summary="Patrick Collins recorre Solidity, collateral, Chainlink Functions, price feeds, redemption y Proof of Reserve."
            links={enlaces("patrick-collins", "chainlink-how")}
          />
        </div>
      </ConceptSection>

      <ConceptSection id="poc" title="6. POC: tokenización de depósitos">
        <p>
          Escenario bancario: depósito en el core → token on-chain (1 ≈ 1 COP)
          con KYC y redención. COPW en la demo es un mock pedagógico de esa idea.
        </p>
        <MermaidDiagram chart={CHART_POC} notes={NOTES_POC} caption="Flujo deposit token" />
        <div className="flex flex-wrap gap-2">
          <ConceptExpand
            term="Deposit token"
            accent="verde"
            summary="Representación on-chain de un depósito bancario. Requiere reconciliación con el core, reglas de transferencia y camino de redención a fiat."
            links={enlaces("agora", "sgforge", "banrep")}
          />
          <ConceptExpand
            term="Colombia · marco"
            accent="amarillo"
            summary="Piloto SFC (laArenera), documentos Banrep sobre criptoactivos. COPW no es moneda de curso legal."
            links={enlaces("sfc-piloto", "banrep", "expedit")}
          />
        </div>
        <DeepLinks
          title="Enlaces de esta sección"
          items={[enlace("agora"), enlace("sgforge"), enlace("banrep")].map(
            (e) => ({
              href: e.href,
              label: e.label,
              note: e.note,
            }),
          )}
        />
      </ConceptSection>

      <ConceptSection title="Idea clave">
        <MermaidDiagram
          chart={CHART_CLAVE}
          notes={NOTES_CLAVE}
          caption="Tokenización = interoperabilidad mundo real ↔ blockchain"
        />
        <p className="border-l-4 border-amarillo pl-3 text-sm text-negro/65">
          <strong>RWA no es solo mint de un token.</strong> Es conectar activo,
          derechos legales, custodia, datos, identidad, compliance, blockchain y
          settlement.
        </p>
      </ConceptSection>
    </div>
  );
}
