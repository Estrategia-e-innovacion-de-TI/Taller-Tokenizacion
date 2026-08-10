import { Link } from "react-router-dom";
import { ConceptExpand } from "../../components/didactic/ConceptExpand";
import { DeepLinks } from "../../components/didactic/DeepLinks";
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
        Casos de banca que tokeniza
      </h2>
      <p>
        A escala mundial, los bancos usan tokenización sobre todo para{" "}
        <strong>liquidación wholesale</strong>,{" "}
        <strong>colateral intradía</strong> y{" "}
        <strong>emisión digital de instrumentos</strong> — no necesariamente
        sobre cadenas públicas abiertas como esta demo.
      </p>

      <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
        Clic para profundizar
      </p>
      <div className="flex flex-wrap gap-2">
        <ConceptExpand
          term="J.P. Morgan · Kinexys"
          accent="amarillo"
          summary="Plataforma bank-led (antes Onyx): pagos programables, repo intradía y tokenización de activos como money market funds."
          links={enlaces("kinexys", "kinexys-ats", "coindesk-repo")}
        />
        <ConceptExpand
          term="SG-FORGE"
          accent="naranja"
          summary="Filial de Société Générale: security tokens y stablecoin EUR CoinVertible (EURCV) en cadenas públicas, alineada a MiCA."
          links={enlaces("sgforge")}
        />
        <ConceptExpand
          term="Project Agorá"
          accent="azul"
          summary="Iniciativa BIS + bancos centrales y comerciales sobre depósitos y reservas tokenizados para liquidación cross-border."
          links={enlaces("agora", "agora-pdf")}
        />
        <ConceptExpand
          term="Project Guardian"
          accent="verde"
          summary="Sandbox de la MAS (Singapur) con bancos globales: fondos, FX y depósitos tokenizados."
          links={enlaces("guardian", "rwa-xyz")}
        />
      </div>

      <h3 className="mt-6 font-display text-lg font-bold">
        Emisión y activos digitales
      </h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>HSBC — Orion</strong>: emisión y ciclo de vida de bonos
          digitales; emisiones verdes (p. ej. BEI) y distribución cross-border.
        </li>
        <li>
          <strong>UBS</strong>: notas y fondos tokenizados para clientes
          institucionales.
        </li>
      </ul>

      <h3 className="mt-6 font-display text-lg font-bold">
        Repo, colateral y depósitos
      </h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Broadridge DLR / HQLAx</strong>: repo y movilidad de colateral
          HQLA en DLT a escala institucional.
        </li>
        <li>
          <strong>BlackRock BUIDL</strong>: treasuries tokenizados — referencia
          en dashboards RWA.
        </li>
      </ul>

      <p className="mt-4 border-l-4 border-amarillo pl-3 text-sm text-negro/70">
        La demo RENT enseña el mecanismo (participación + renta). En banca real
        el mismo patrón aparece con KYC, permissioned ledgers y liquidación en
        dinero de banco o de banco central.
      </p>

      <DeepLinks
        title="Enlaces oficiales y de referencia"
        items={enlaces(
          "kinexys",
          "kinexys-ats",
          "sgforge",
          "agora",
          "agora-pdf",
          "guardian",
          "rwa-xyz",
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
        ERC-4337: el usuario firma una <em>UserOperation</em>; un bundler la
        incluye en bloque. Un <em>paymaster</em> (Pimlico) paga el gas.
      </p>
      <p>
        Por eso en la demo no necesitas ETH: solo apruebas y observas el
        TxExplainer.
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
          summary="Contrato que patrocina el gas. En la demo, Pimlico cubre Sepolia para que el ejecutivo no compre ETH de testnet."
          links={enlaces("pimlico", "permissionless")}
        />
        <ConceptExpand
          term="Turnkey / embedded"
          accent="amarillo"
          summary="Billetera embebida vía email (Auth Proxy): la UX bancaria típica evita seed phrases en manos del ejecutivo."
          links={enlaces("turnkey")}
        />
      </div>

      <DeepLinks
        items={enlaces("permissionless", "pimlico", "turnkey", "eip4337").map(
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
