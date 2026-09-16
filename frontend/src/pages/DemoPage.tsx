import { useState } from "react";
import { getAddress, isAddress, type Address } from "viem";
import { useAuth } from "../lib/auth";
import { useBalances } from "../lib/useBalances";
import { useWorkshopTx } from "../lib/useWorkshopTx";
import {
  FAUCET_AMOUNT_COPW,
  PRICE_PER_RENT_COPW,
  PROPERTY_VALUE_COP,
  formatCopLabel,
} from "../lib/format-cop";
import { contractsConfigured, sepoliaAddressUrl } from "../lib/viem";
import { AccountingPanel } from "../components/didactic/AccountingPanel";
import { DemoGuide } from "../components/didactic/DemoGuide";
import { SectionFrame } from "../components/didactic/SectionFrame";
import { StepRail } from "../components/didactic/StepRail";
import { TxExplainer } from "../components/didactic/TxExplainer";

const steps = [
  { id: "guia", label: "00 Guía", accent: "amarillo" },
  { id: "cuenta", label: "01 Cuenta", accent: "amarillo" },
  { id: "faucet", label: "02 Faucet", accent: "azul" },
  { id: "compra", label: "03 Comprar", accent: "naranja" },
  { id: "deposito", label: "04 Depositar", accent: "rosado" },
  { id: "claim", label: "05 Claim", accent: "verde" },
  { id: "transferir", label: "06 Transferir", accent: "azul" },
  { id: "contabilidad", label: "07 Libros", accent: "naranja" },
] as const;

type StepId = (typeof steps)[number]["id"];

function WhatHappens({
  items,
}: {
  items: { label: string; body: string }[];
}) {
  return (
    <div>
      <p className="eyebrow">Qué ocurre en este paso</p>
      <dl className="mt-4 divide-y divide-borde">
        {items.map((item) => (
          <div key={item.label} className="py-3 first:pt-0 last:pb-0">
            <dt className="text-sm font-bold text-negro">{item.label}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">{item.body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function NeedAccount({ onGo }: { onGo: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2)] border border-borde bg-zebra px-4 py-3">
      <p className="text-sm text-negro">
        Entra con email o MetaMask para ejecutar esta acción.
      </p>
      <button type="button" onClick={onGo} className="btn-primary">
        Ir a cuenta
      </button>
    </div>
  );
}

function StatusStrip({
  copw,
  rent,
  pending,
  connected,
}: {
  copw: string;
  rent: string;
  pending: string;
  connected: boolean;
}) {
  const cells = [
    { label: "COPW", value: connected ? copw : "—" },
    { label: "RENT", value: connected ? rent : "—" },
    { label: "Renta pendiente", value: connected ? pending : "—" },
  ];
  return (
    <dl className="container-app grid grid-cols-3 gap-px overflow-hidden border-y border-borde bg-borde">
      {cells.map((c) => (
        <div key={c.label} className="bg-tarjeta px-4 py-3">
          <dt className="text-[11px] font-bold tracking-wide text-subtle uppercase">
            {c.label}
          </dt>
          <dd className="mt-1 font-display text-lg font-bold text-negro">{c.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function PublicAddress({
  label,
  address,
  hint,
}: {
  label: string;
  address: string;
  hint?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="card">
      <p className="eyebrow">{label}</p>
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-muted">{hint}</p>
      ) : null}
      <p className="mt-3 break-all font-mono text-sm leading-relaxed text-negro">
        {address}
      </p>
      <div className="mt-3 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => void copy()}
          className="btn-ghost text-xs"
        >
          {copied ? "Copiada" : "Copiar"}
        </button>
        <a
          className="btn-ghost text-xs"
          href={sepoliaAddressUrl(address)}
          target="_blank"
          rel="noreferrer"
        >
          Ver en Etherscan
        </a>
      </div>
    </div>
  );
}

function StepPager({
  active,
  onSelect,
}: {
  active: StepId;
  onSelect: (id: StepId) => void;
}) {
  const idx = steps.findIndex((s) => s.id === active);
  const prev = idx > 0 ? steps[idx - 1] : null;
  const next = idx >= 0 && idx < steps.length - 1 ? steps[idx + 1] : null;

  return (
    <div className="border-t border-borde bg-tarjeta">
      <div className="container-app flex flex-wrap items-center justify-between gap-3 py-4">
        {prev ? (
          <button
            type="button"
            onClick={() => onSelect(prev.id)}
            className="btn-secondary"
          >
            Anterior · {prev.label.replace(/^\d+\s/, "")}
          </button>
        ) : (
          <span />
        )}
        <p className="text-xs font-semibold tracking-wide text-folio">
          Paso {idx + 1} de {steps.length}
        </p>
        {next ? (
          <button
            type="button"
            onClick={() => onSelect(next.id)}
            className="btn-primary"
          >
            Continuar · {next.label.replace(/^\d+\s/, "")}
          </button>
        ) : (
          <span className="text-sm font-semibold text-muted">Fin del recorrido</span>
        )}
      </div>
    </div>
  );
}

const fieldClass = "field";
const fieldNarrowClass = "field-sm";
const labelClass = "flex flex-col gap-1.5 text-sm font-semibold text-negro";

/**
 * Demo en modo wizard: un solo paso visible (sin scroll largo).
 */
export function DemoPage() {
  const [active, setActive] = useState<StepId>("guia");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [buyAmount, setBuyAmount] = useState(1);
  const [yieldMillions, setYieldMillions] = useState(1);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState(1);
  const auth = useAuth();
  const balances = useBalances();
  const tx = useWorkshopTx();

  /** 1 millón COP en unidades on-chain (2 decimals). */
  const millionCopw = 1_000_000n * 100n;
  const yieldAmountCopw = BigInt(yieldMillions) * millionCopw;
  const maxYieldMillions =
    balances.copw > 0n ? Number(balances.copw / millionCopw) : 0;
  const canDeposit =
    auth.isConnected &&
    !tx.busy &&
    yieldMillions >= 1 &&
    balances.copw >= yieldAmountCopw;

  const transferAddressOk = isAddress(transferTo.trim());
  const canTransfer =
    auth.isConnected &&
    !tx.busy &&
    transferAddressOk &&
    transferAmount >= 1 &&
    balances.rent >= BigInt(transferAmount);

  const showOwnerAddress =
    auth.mode === "email" &&
    Boolean(auth.ownerAddress) &&
    auth.ownerAddress?.toLowerCase() !==
      auth.smartAccountAddress?.toLowerCase();

  const txFooter =
    tx.explainer.status === "idle" && !tx.explainer.title ? undefined : (
      <TxExplainer state={tx.explainer} />
    );

  const goTo = (id: StepId) => {
    setActive(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const needsAccount =
    !auth.isConnected &&
    active !== "guia" &&
    active !== "cuenta";
  const accountNotice = needsAccount ? (
    <NeedAccount onGo={() => goTo("cuenta")} />
  ) : null;

  return (
    <div className="pb-8">
      <div className="container-app py-6 md:py-7">
        <p className="kicker">Demo · Sepolia</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
          Recorrido on-chain
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">
          Una acción por pantalla. Los saldos se actualizan después de cada
          transacción.
        </p>
        {!contractsConfigured ? (
          <p className="alert-error mt-3" role="alert">
            Faltan addresses de contratos en <code>.env</code>. Puedes recorrer la
            UI; las txs on-chain requieren el deploy Foundry.
          </p>
        ) : null}
      </div>

      <StepRail
        steps={[...steps]}
        active={active}
        onSelect={(id) => goTo(id as StepId)}
      />

      {active !== "guia" ? (
        <StatusStrip
          connected={auth.isConnected}
          copw={formatCopLabel(balances.copw)}
          rent={balances.rent.toString()}
          pending={formatCopLabel(balances.pending)}
        />
      ) : null}

      <div className="min-h-[50vh]">
        {active === "guia" ? <DemoGuide onGoToStep={(id) => goTo(id as StepId)} /> : null}

        {active === "cuenta" ? (
          <SectionFrame
            code="01"
            label="Cuenta"
            title="Entra con email o billetera"
            subtitle="Email con gas patrocinado, o MetaMask pagando su propio gas."
            accent="amarillo"
            actionLabel="Ingreso"
            aside={
              <WhatHappens
                items={[
                  {
                    label: "Email",
                    body: "Turnkey firma. Kernel + Pimlico pagan el gas. Los tokens llegan a la smart account, no al owner.",
                  },
                  {
                    label: "MetaMask",
                    body: "Firmas como EOA y pagas ETH de Sepolia. Sin patrocinio.",
                  },
                ]}
              />
            }
            footer={
              auth.isConnected && auth.smartAccountAddress ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <PublicAddress
                    label={
                      auth.mode === "email"
                        ? "Dirección pública de tu cuenta"
                        : "Dirección pública"
                    }
                    address={auth.smartAccountAddress}
                    hint={
                      auth.mode === "email"
                        ? "Smart account Kernel ligada al correo. Aquí llegan COPW y RENT."
                        : "EOA de MetaMask (pagas gas)."
                    }
                  />
                  {showOwnerAddress && auth.ownerAddress ? (
                    <PublicAddress
                      label="Owner Turnkey (firma)"
                      address={auth.ownerAddress}
                      hint={`Creada con el correo${auth.email ? ` ${auth.email}` : ""}. Firma las UserOps; no guarda los tokens.`}
                    />
                  ) : null}
                </div>
              ) : undefined
            }
          >
            {!auth.pendingEmailOtp ? (
              <>
                <label className={labelClass}>
                  Correo
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@banco.com"
                    disabled={auth.isConnected}
                    className={`${fieldClass} disabled:opacity-60`}
                  />
                </label>
                <button
                  type="button"
                  disabled={auth.connecting || !email || auth.isConnected}
                  aria-busy={auth.connecting}
                  onClick={() => void auth.connectEmail(email)}
                  className="btn-primary mt-auto w-full sm:w-auto"
                >
                  {auth.connecting ? "Conectando…" : "Continuar con email"}
                </button>
                {!auth.isConnected && auth.turnkeyClientState === "error" ? (
                  <p className="alert-error" role="alert">
                    Turnkey no inició. Allowed Origins debe incluir{" "}
                    <code className="text-xs">{window.location.origin}</code>.
                  </p>
                ) : null}
                {!auth.isConnected &&
                auth.turnkeyClientState === "loading" ? (
                  <p className="text-xs text-negro/50">
                    Inicializando Turnkey…
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-negro/70">
                  Enviamos un código a <strong>{auth.pendingEmailOtp}</strong>.
                  Revísalo e ingrésalo abajo.
                </p>
                <label className={labelClass}>
                  Código OTP
                  <input
                    type="text"
                    inputMode="text"
                    autoComplete="one-time-code"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={9}
                    value={otpCode}
                    onChange={(e) =>
                      setOtpCode(e.target.value.replace(/\s+/g, ""))
                    }
                    placeholder="Código del correo"
                    className={`${fieldClass} font-mono tracking-widest`}
                  />
                </label>
                <p className="text-xs text-negro/50">
                  Usa el código más reciente. Si falla, «Reenviar código» (el
                  anterior queda inválido).
                </p>
                <button
                  type="button"
                  disabled={
                    auth.connecting ||
                    otpCode.replace(/\s+/g, "").length < 6
                  }
                  onClick={() => void auth.verifyEmailOtp(otpCode)}
                  className="btn-primary mt-auto w-full sm:w-auto"
                >
                  Verificar código
                </button>
                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    disabled={auth.connecting}
                    onClick={() => {
                      setOtpCode("");
                      void auth.connectEmail(auth.pendingEmailOtp!);
                    }}
                    className="btn-ghost text-sm"
                  >
                    Reenviar código
                  </button>
                  <button
                    type="button"
                    disabled={auth.connecting}
                    onClick={() => {
                      setOtpCode("");
                      auth.cancelEmailOtp();
                    }}
                    className="btn-ghost text-sm"
                  >
                    Cambiar correo
                  </button>
                </div>
              </>
            )}
            {auth.isConnected ? (
              <button
                type="button"
                disabled={auth.connecting}
                onClick={() => auth.disconnect()}
                className="btn-secondary self-start"
              >
                Salir / desconectar
              </button>
            ) : (
              <button
                type="button"
                disabled={auth.connecting}
                onClick={() => void auth.connectWallet()}
                className="btn-secondary self-start"
              >
                Conectar billetera
              </button>
            )}
            {auth.error ? (
              <p className="alert-error" role="alert">{auth.error}</p>
            ) : null}
            {auth.isConnected ? (
              <p className="rounded-[var(--radius-2)] border border-verde/40 bg-verde-100 px-3 py-2 text-sm text-negro">
                Conectado
                {auth.mode === "email" && auth.email ? ` · ${auth.email}` : ""}
                {auth.mode === "wallet" ? " · MetaMask" : ""}. Siguiente: faucet.
              </p>
            ) : null}
          </SectionFrame>
        ) : null}

        {active === "faucet" ? (
          <SectionFrame
            code="02"
            label="Faucet"
            title="Fondea tu cuenta con COPW"
            subtitle="5.000.000 COP de demo por claim. No es dinero real."
            accent="amarillo"
            actionLabel="Fondeo"
            notice={accountNotice}
            aside={
              <WhatHappens
                items={[
                  {
                    label: "Contrato",
                    body: "Llamas COPW.faucet() desde tu cuenta.",
                  },
                  {
                    label: "Uso",
                    body: "Con ese saldo compras RENT (desde 100.000 COP) y aportas renta.",
                  },
                  {
                    label: "Saldo actual",
                    body: formatCopLabel(balances.copw),
                  },
                ]}
              />
            }
            footer={txFooter}
          >
            <p className="text-sm text-muted">
              Un claim cada hora por address. El monto es fijo.
            </p>
            <button
              type="button"
              disabled={!auth.isConnected || tx.busy}
              aria-busy={tx.busy}
              onClick={async () => {
                await tx.faucet();
                await balances.refresh();
              }}
              className="btn-primary mt-auto w-full sm:w-auto"
            >
              {tx.busy ? "Procesando…" : `Obtener ${formatCopLabel(FAUCET_AMOUNT_COPW)}`}
            </button>
          </SectionFrame>
        ) : null}

        {active === "compra" ? (
          <SectionFrame
            code="03"
            label="Comprar"
            title="Participación en RENT"
            subtitle={`Inmueble valuado en ${PROPERTY_VALUE_COP.toLocaleString("es-CO")} COP. Ticket desde 100.000 COP = 1 RENT.`}
            accent="amarillo"
            actionLabel="Compra"
            notice={accountNotice}
            aside={
              <WhatHappens
                items={[
                  {
                    label: "Firmas",
                    body: "Email: un lote (approve + buy). MetaMask: dos firmas.",
                  },
                  {
                    label: "Destino del COPW",
                    body: "Va al treasury. No entra al pool de renta.",
                  },
                  {
                    label: "Costo de esta compra",
                    body: `${buyAmount} × ${formatCopLabel(PRICE_PER_RENT_COPW)} = ${formatCopLabel(BigInt(buyAmount) * PRICE_PER_RENT_COPW)}`,
                  },
                ]}
              />
            }
            footer={txFooter}
          >
            <label className={labelClass}>
              Cantidad de RENT
              <input
                type="number"
                min={1}
                max={50}
                value={buyAmount}
                onChange={(e) =>
                  setBuyAmount(Math.max(1, Number(e.target.value) || 1))
                }
                className={fieldNarrowClass}
              />
              <span className="text-xs font-normal text-muted">
                Obligatorio. Entero entre 1 y 50.
              </span>
            </label>
            <button
              type="button"
              disabled={!auth.isConnected || tx.busy}
              aria-busy={tx.busy}
              onClick={async () => {
                await tx.buyRent(BigInt(buyAmount));
                await balances.refresh();
              }}
              className="btn-primary mt-auto w-full sm:w-auto"
            >
              {tx.busy
                ? "Procesando…"
                : `Comprar ${buyAmount} RENT`}
            </button>
          </SectionFrame>
        ) : null}

        {active === "deposito" ? (
          <SectionFrame
            code="04"
            label="Depositar"
            title="Fondea la renta del periodo"
            subtitle="Cualquiera puede aportar COPW al pool. Eso actualiza el acumulado por token."
            accent="amarillo"
            actionLabel="Depósito"
            notice={accountNotice}
            aside={
              <WhatHappens
                items={[
                  {
                    label: "Contrato",
                    body: "YieldDistributor.depositYield reparte el aporte sobre el supply de RENT.",
                  },
                  {
                    label: "Tu saldo COPW",
                    body: formatCopLabel(balances.copw),
                  },
                  {
                    label: "Tope ahora",
                    body: auth.isConnected
                      ? `Hasta ${maxYieldMillions} millón${maxYieldMillions === 1 ? "" : "es"} COP.`
                      : "Entra a una cuenta para ver el tope.",
                  },
                ]}
              />
            }
            footer={txFooter}
          >
            <label className={labelClass}>
              Millones de COP
              <input
                type="number"
                min={1}
                max={maxYieldMillions > 0 ? maxYieldMillions : undefined}
                value={yieldMillions}
                onChange={(e) =>
                  setYieldMillions(Math.max(1, Number(e.target.value) || 1))
                }
                className={fieldNarrowClass}
              />
              <span className="text-xs font-normal text-muted">
                No uses el número completo del saldo. 1 = un millón de COP.
              </span>
            </label>
            <p className="text-sm text-muted">
              Vas a depositar{" "}
              <strong className="text-negro">{formatCopLabel(yieldAmountCopw)}</strong>
            </p>
            {auth.isConnected && balances.copw < yieldAmountCopw ? (
              <p className="alert-error" role="alert">
                No te alcanza (tienes {formatCopLabel(balances.copw)}).
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {[1, 2, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={!auth.isConnected || n > maxYieldMillions}
                  onClick={() => setYieldMillions(n)}
                  className={`tab ${
                    yieldMillions === n ? "tab-active" : "tab-idle"
                  }`}
                >
                  {n}M
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!canDeposit}
              aria-busy={tx.busy}
              onClick={async () => {
                await tx.depositYield(yieldAmountCopw);
                await balances.refresh();
              }}
              className="btn-primary mt-auto w-full sm:w-auto"
            >
              {tx.busy
                ? "Procesando…"
                : `Depositar ${formatCopLabel(yieldAmountCopw)}`}
            </button>
          </SectionFrame>
        ) : null}

        {active === "claim" ? (
          <SectionFrame
            code="05"
            label="Claim"
            title="Cobra tu parte proporcional"
            subtitle="Solo retiras lo acumulado a tu favor según tu balance de RENT."
            accent="amarillo"
            actionLabel="Cobro"
            notice={accountNotice}
            aside={
              <WhatHappens
                items={[
                  {
                    label: "Fórmula",
                    body: "Pago ≈ renta acumulada × (tu RENT / supply).",
                  },
                  {
                    label: "Pendiente",
                    body: formatCopLabel(balances.pending),
                  },
                  {
                    label: "Tu RENT",
                    body: balances.rent.toString(),
                  },
                ]}
              />
            }
            footer={txFooter}
          >
            <p className="text-sm text-muted">
              Si el pendiente es 0, la transacción revertirá. Deposita renta
              antes (paso 04).
            </p>
            <button
              type="button"
              disabled={!auth.isConnected || tx.busy}
              aria-busy={tx.busy}
              onClick={async () => {
                await tx.claim();
                await balances.refresh();
              }}
              className="btn-primary mt-auto w-full sm:w-auto"
            >
              {tx.busy
                ? "Procesando…"
                : `Cobrar ${formatCopLabel(balances.pending)}`}
            </button>
          </SectionFrame>
        ) : null}

        {active === "transferir" ? (
          <SectionFrame
            code="06"
            label="Transferir"
            title="Mercado secundario P2P"
            subtitle="Cedes RENT a otra address. Sin order book: transferencia ERC-20 directa."
            accent="amarillo"
            actionLabel="Transferencia"
            notice={accountNotice}
            aside={
              <WhatHappens
                items={[
                  {
                    label: "Contrato",
                    body: "RENT.transfer(destino, cantidad). Token abierto a propósito.",
                  },
                  {
                    label: "En un RWA regulado",
                    body: "Suele haber whitelist (p. ej. ERC-3643) antes de mover el token.",
                  },
                  {
                    label: "Antes de ceder",
                    body: "Haz claim si hay renta pendiente: el distributor no la reasigna al transferir.",
                  },
                ]}
              />
            }
            footer={txFooter}
          >
            <label className={labelClass}>
              Destino
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x…"
                spellCheck={false}
                autoComplete="off"
                className={`${fieldClass} font-mono text-sm`}
              />
              <span className="text-xs font-normal text-muted">
                Address 0x… de 42 caracteres. Obligatorio.
              </span>
            </label>
            {transferTo.trim() && !transferAddressOk ? (
              <p className="alert-error" role="alert">
                Address inválida. Revisa el formato 0x…
              </p>
            ) : null}
            <label className={labelClass}>
              Cantidad de RENT
              <input
                type="number"
                min={1}
                max={balances.rent > 0n ? Number(balances.rent) : undefined}
                value={transferAmount}
                onChange={(e) =>
                  setTransferAmount(Math.max(1, Number(e.target.value) || 1))
                }
                className={fieldNarrowClass}
              />
            </label>
            {auth.isConnected && balances.rent < BigInt(transferAmount) ? (
              <p className="alert-error" role="alert">
                No tienes suficiente RENT (tienes {balances.rent.toString()}).
              </p>
            ) : null}
            <button
              type="button"
              disabled={!canTransfer}
              aria-busy={tx.busy}
              onClick={async () => {
                const to = getAddress(transferTo.trim()) as Address;
                await tx.transferRent(to, BigInt(transferAmount));
                await balances.refresh();
              }}
              className="btn-primary mt-auto w-full sm:w-auto"
            >
              {tx.busy ? "Procesando…" : "Transferir RENT"}
            </button>
          </SectionFrame>
        ) : null}

        {active === "contabilidad" ? (
          <AccountingPanel balances={balances} />
        ) : null}
      </div>

      <StepPager active={active} onSelect={goTo} />
    </div>
  );
}
