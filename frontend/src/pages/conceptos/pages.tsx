import { Link } from "react-router-dom";
import { CasoFicha } from "../../components/didactic/CasoFicha";
import { ConceptExpand } from "../../components/didactic/ConceptExpand";
import { ContractLinks } from "../../components/didactic/ContractLinks";
import { DeepLinks } from "../../components/didactic/DeepLinks";
import { CASO_SECCIONES, casosPorProblema } from "../../data/casos-uso";
import { enlaces } from "../../data/enlaces";

export function ConceptoTokenizacion() {
  return (
    <>
      <h2 className="font-display text-xl font-bold">¿Qué es tokenizar?</h2>
      <p>
        Representar derechos económicos sobre un activo real (aquí un inmueble)
        como un token en blockchain. <strong>RENT</strong> no es el título
        registral: es la participación económica de la demo.
      </p>
      <p>
        Valor del inmueble: 5.000 M COP · 50.000 RENT · 100.000 COP por token.
      </p>
      <p>
        En producción bancaria aparecerían KYC, custodia y, a menudo, estándares
        permissioned (p. ej. ERC-3643). En esta demo el camino es abierto a
        propósito.
      </p>

      <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
        Clic para profundizar
      </p>
      <div className="flex flex-wrap gap-2">
        <ConceptExpand
          term="RWA"
          accent="amarillo"
          summary="Real-World Asset: el activo o derecho del mundo real representado on-chain. Guía completa en Conceptos → Guía RWA."
          links={enlaces("eth-rwa", "chainlink-rwa", "mckinsey-tokenization")}
        >
          <Link
            to="/conceptos/guia-rwa"
            className="font-semibold underline decoration-naranja"
          >
            Abrir Guía RWA →
          </Link>
        </ConceptExpand>
        <ConceptExpand
          term="RENT en la demo"
          accent="naranja"
          summary="1 RENT = 100.000 COP de participación. Supply 50.000 sobre un inmueble de 5.000 M COP. Las rentas se claim proporcionales al balance."
          links={enlaces("mckinsey-tokenization", "rwa-xyz")}
        >
          <Link to="/demo" className="font-semibold underline decoration-naranja">
            Ir a la demo →
          </Link>
        </ConceptExpand>
        <ConceptExpand
          term="ERC-3643"
          accent="verde"
          summary="Estándar permissioned para security tokens: identidad, elegibilidad y restricciones de transferencia. Contraste con el ERC-20 abierto de RENT."
          links={enlaces("erc3643", "centrifuge")}
        />
        <ConceptExpand
          term="Colombia · SFC"
          accent="azul"
          summary="El piloto laArenera y los documentos de la SFC / Banrep enmarcan cómo se prueban criptoactivos con entidades vigiladas. Esta demo no es producto autorizado."
          links={enlaces("sfc-piloto", "banrep", "expedit")}
        />
      </div>

      <DeepLinks
        items={enlaces(
          "mckinsey-tokenization",
          "mckinsey-waves",
          "rwa-xyz",
          "erc3643",
          "sfc-piloto",
        ).map((e) => ({
          href: e.href,
          label: e.label,
          note: e.note,
        }))}
      />
      <p className="mt-4 text-sm">
        <Link
          to="/conceptos/enlaces"
          className="font-semibold underline decoration-azul"
        >
          Ver todos los enlaces de interés →
        </Link>
      </p>
    </>
  );
}

export function ConceptoCasosBanca() {
  return (
    <>
      <h2 className="font-display text-xl font-bold">
        Casos de uso · banca y sectores cercanos
      </h2>
      <p>
        Cada tarjeta responde tres cosas: <strong>qué busca resolver</strong>,{" "}
        <strong>cómo lo resuelve</strong> y <strong>qué se consiguió</strong>{" "}
        (si hay dato público). No son oferta ni producto autorizado en Colombia.
      </p>

      {CASO_SECCIONES.map((sec) => {
        const casos = casosPorProblema(sec.id);
        if (casos.length === 0) return null;
        return (
          <section key={sec.id} className="mt-8">
            <h3 className="font-display text-lg font-bold">{sec.title}</h3>
            <p className="text-sm text-negro/60">{sec.intro}</p>
            <div className="mt-4 grid gap-4">
              {casos.map((c) => (
                <CasoFicha key={c.id} caso={c} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-6 text-sm">
        ¿Qué hace el equipo después? →{" "}
        <Link
          to="/conceptos/siguientes-pasos"
          className="font-semibold underline decoration-naranja"
        >
          Siguientes pasos
        </Link>
      </p>

      <DeepLinks
        title="Enlaces oficiales y de referencia"
        items={enlaces(
          "kinexys",
          "kinexys-ats",
          "buidl",
          "hsbc-orion",
          "sgforge",
          "hqla",
          "agora",
          "agora-pdf",
          "guardian",
          "rwa-xyz",
          "sfc-piloto",
          "coindesk-repo",
        ).map((e) => ({
          href: e.href,
          label: e.label,
          note: e.note,
        }))}
      />
    </>
  );
}

export function ConceptoSiguientesPasos() {
  return (
    <>
      <h2 className="font-display text-xl font-bold">
        Después del taller · siguientes pasos
      </h2>
      <p>
        Objetivo: pasar de la demo a una idea <strong>materializable</strong> por
        un equipo de negocio + tecnología + riesgo/legal — sin saltar a mainnet.
      </p>

      <ol className="mt-4 list-decimal space-y-4 pl-5">
        <li>
          <strong>Mapear el caso interno (½ día).</strong> Activo o derecho,
          quién custodia, quién liquida, quién hace KYC, cashflow esperado.
          Escribirlo en una página.
        </li>
        <li>
          <strong>Canvas de tokenización (1–2 días).</strong> Qué va on-chain vs
          off-chain; ledger público vs permissioned; dinero de liquidación
          (depósito tokenizado, stablecoin regulada, rails actuales).
        </li>
        <li>
          <strong>Spike técnico (1–2 semanas).</strong> Fork de esta demo con{" "}
          <em>su</em> activo mock: listar gaps (ERC-3643 / identity, roles,
          oráculos, pausas, reportes). No hace falta producción.
        </li>
        <li>
          <strong>Sandbox y gobierno (paralelo).</strong> En Colombia: interlocución
          con riesgo/legal y, si aplica, marco tipo laArenera (SFC). Ver{" "}
          <Link
            to="/conceptos/casos-banca"
            className="font-semibold underline decoration-azul"
          >
            Casos · Colombia
          </Link>
          .
        </li>
        <li>
          <strong>Go / no-go.</strong> ¿Hay sponsor de negocio, rails de pago
          claros y custodia definida? Si falta uno de los tres, el siguiente
          paso es cerrar ese hueco — no escribir más contratos.
        </li>
      </ol>

      <div className="mt-6 flex flex-wrap gap-2">
        <ConceptExpand
          term="Entregable mínimo del spike"
          accent="amarillo"
          summary="Diagrama de 1 página + lista de gaps vs la demo + decisión: piloto interno, sandbox, o aparcar."
          links={enlaces("chainlink-how", "erc3643")}
        />
        <ConceptExpand
          term="Qué no hacer de inmediato"
          accent="naranja"
          summary="Subir la demo a mainnet, prometar rentabilidad, o saltarse custodia/KYC. El taller es mecanismo, no producto."
          links={enlaces("sfc-piloto", "banrep")}
        />
        <ConceptExpand
          term="Inspiración de mercado"
          accent="verde"
          summary="Relee 1–2 fichas de Casos de uso del mismo problema que tu mapa interno (liquidez, emisión, colateral…)."
          links={enlaces("rwa-xyz", "mckinsey-waves")}
        >
          <Link
            to="/conceptos/casos-banca"
            className="font-semibold underline decoration-verde"
          >
            Abrir Casos de uso →
          </Link>
        </ConceptExpand>
      </div>

      <DeepLinks
        items={enlaces(
          "chainlink-how",
          "erc3643",
          "sfc-piloto",
          "guardian",
          "agora",
        ).map((e) => ({
          href: e.href,
          label: e.label,
          note: e.note,
        }))}
      />
    </>
  );
}

export function ConceptoCopw() {
  return (
    <>
      <h2 className="font-display text-xl font-bold">COPW</h2>
      <p>
        Mock de pesos colombianos (2 decimals). El faucet entrega 5.000.000 COP
        por claim para fondear cuentas en testnet.
      </p>
      <p>
        No es el peso de curso legal ni un producto del Banco de la República.
        Sirve para comprar RENT y repartir rentas sin bridges.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ConceptExpand
          term="¿Es dinero real?"
          accent="naranja"
          summary="No. Es un ERC-20 de demo. Banrep deja claro que los criptoactivos no son moneda de curso legal en Colombia."
          links={enlaces("banrep", "sfc-piloto")}
        />
        <ConceptExpand
          term="Análogo bancario"
          accent="verde"
          summary="Depósitos tokenizados o stablecoins reguladas (p. ej. EURCV). Ver también la POC de depósitos en la Guía RWA."
          links={enlaces("sgforge", "agora")}
        >
          <Link
            to="/conceptos/guia-rwa#poc"
            className="font-semibold underline decoration-azul"
          >
            Guía RWA · POC depósitos →
          </Link>
        </ConceptExpand>
      </div>

      <DeepLinks
        items={enlaces("banrep", "sgforge", "agora").map((e) => ({
          href: e.href,
          label: e.label,
          note: e.note,
        }))}
      />
    </>
  );
}

export function ConceptoAA() {
  return (
    <>
      <h2 className="font-display text-xl font-bold">Account abstraction</h2>
      <p>
        ERC-4337: con login por email el usuario firma una <em>UserOperation</em>;
        un bundler la incluye en bloque y un <em>paymaster</em> (Pimlico) paga el
        gas.
      </p>
      <p>
        Si entras con MetaMask, no hay patrocinio: firmas como EOA y pagas ETH de
        Sepolia. El paymaster aplica solo a la vía embebida (Privy).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ConceptExpand
          term="UserOperation"
          accent="azul"
          summary="Intención firmada por el usuario que el bundler empaqueta en una transacción on-chain. Sustituye el modelo “EOA paga gas en ETH”."
          links={enlaces("eip4337", "permissionless")}
        />
        <ConceptExpand
          term="Paymaster"
          accent="verde"
          summary="Contrato que patrocina el gas solo en la vía email. Con MetaMask el usuario paga gas; Pimlico no interviene."
          links={enlaces("pimlico", "permissionless")}
        />
        <ConceptExpand
          term="Privy / embedded"
          accent="amarillo"
          summary="Billetera embebida vía email (TEE + Shamir): UX bancaria sin seed phrase, y es la vía con gas patrocinado."
          links={enlaces("privy")}
        />
      </div>

      <DeepLinks
        items={enlaces("permissionless", "pimlico", "privy", "eip4337").map(
          (e) => ({
            href: e.href,
            label: e.label,
            note: e.note,
          }),
        )}
      />
    </>
  );
}

export function ConceptoContratos() {
  return (
    <>
      <h2 className="font-display text-xl font-bold">Contratos</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <code>COPW</code> — dinero de demo + faucet
        </li>
        <li>
          <code>RENT</code> — participación del inmueble
        </li>
        <li>
          <code>PropertySale</code> — compra primaria
        </li>
        <li>
          <code>YieldDistributor</code> — rentas proporcionales
        </li>
      </ul>
      <p>
        Código en <code>contracts/src</code> (Foundry). Sin super-admin:
        cualquiera puede faucet, comprar, depositar renta y claim.
      </p>

      <div className="mt-6">
        <ContractLinks />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ConceptExpand
          term="YieldDistributor"
          accent="verde"
          summary="Patrón dividend-per-token: depositYield actualiza el acumulado; claim paga según tu RENT / supply. Tokens nuevos no cobran renta pasada (onMint)."
          links={enlaces("foundry")}
        />
        <ConceptExpand
          term="Vs ERC-3643"
          accent="naranja"
          summary="Estos contratos son didácticos y abiertos. Un security token real añadiría identity registry y transfer restrictions."
          links={enlaces("erc3643")}
        />
      </div>

      <DeepLinks
        items={enlaces("foundry", "viem", "erc3643").map((e) => ({
          href: e.href,
          label: e.label,
          note: e.note,
        }))}
      />
    </>
  );
}
