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

function WhatHappens({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
        Qué está pasando
      </p>
      <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-negro/70">
        {children}
      </div>
    </div>
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
    <div className="border border-negro/10 bg-blanco p-5 md:p-6">
      <p className="text-xs font-semibold tracking-[0.12em] text-negro/45 uppercase">
        {label}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-negro/55">{hint}</p>
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
    <div className="border-t border-negro/10">
      <div className="container-app flex flex-wrap items-center justify-between gap-3 py-4">
        {prev ? (
          <button
            type="button"
            onClick={() => onSelect(prev.id)}
            className="btn-secondary"
          >
            ← {prev.label}
          </button>
        ) : (
          <span />
        )}
        <p className="text-xs font-semibold tracking-wide text-negro/45">
          {idx + 1} / {steps.length}
        </p>
        {next ? (
          <button
            type="button"
            onClick={() => onSelect(next.id)}
            className="btn-primary"
          >
            {next.label} →
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

const fieldClass =
  "w-full border border-negro/15 bg-white px-3 py-2.5 outline-none focus:border-azul";
const fieldNarrowClass =
  "w-full max-w-[10rem] border border-negro/15 bg-white px-3 py-2.5 outline-none focus:border-azul";
const labelClass = "flex flex-col gap-4 text-sm leading-snug text-negro/80";

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

  return (
    <div className="pb-8">
      <div className="container-app py-6 md:py-8">
        <p className="eyebrow text-naranja">Flujo práctico</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Tokeniza RENT en vivo
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-negro/65 md:text-base">
          Un paso a la vez. Usa la barra o Anterior / Siguiente. La teoría está
          en Conceptos.
        </p>
        {!contractsConfigured ? (
          <p className="mt-3 border border-naranja/40 bg-naranja/10 px-3 py-2 text-sm">
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
              <WhatHappens>
                <p>
                  <strong>Email:</strong> Turnkey firma; Kernel + Pimlico pagan el
                  gas. La address visible es la smart account (no el owner).
                </p>
                <p>
                  <strong>MetaMask:</strong> firmas como EOA y pagas ETH de
                  Sepolia. Sin patrocinio.
                </p>
              </WhatHappens>
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
                  onClick={() => void auth.connectEmail(email)}
                  className="btn-primary self-start"
                >
                  {auth.connecting ? "Conectando…" : "Continuar con email"}
                </button>
                {!auth.isConnected && auth.turnkeyClientState === "error" ? (
                  <p className="text-sm text-naranja">
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
                  className="btn-primary self-start"
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
              <p className="text-sm leading-relaxed text-naranja">{auth.error}</p>
            ) : null}
            {auth.isConnected ? (
              <p className="text-sm text-verde">
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
            accent="azul"
            actionLabel="Fondeo"
            aside={
              <WhatHappens>
                <p>
                  Llamas <code>COPW.faucet()</code> desde tu smart account.
                </p>
                <p>
                  Con eso puedes comprar RENT (desde 100.000 COP) y aportar renta.
                </p>
                <p>Saldo actual: {formatCopLabel(balances.copw)}</p>
              </WhatHappens>
            }
            footer={txFooter}
          >
            <button
              type="button"
              disabled={!auth.isConnected || tx.busy}
              onClick={async () => {
                await tx.faucet();
                await balances.refresh();
              }}
              className="btn-primary self-start"
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
            accent="naranja"
            actionLabel="Compra"
            aside={
              <WhatHappens>
                <p>
                  En email: un solo lote (approve + buy). En MetaMask: dos firmas.
                  Luego mint de RENT.
                </p>
                <p>
                  Costo: {buyAmount} × {formatCopLabel(PRICE_PER_RENT_COPW)} ={" "}
                  {formatCopLabel(BigInt(buyAmount) * PRICE_PER_RENT_COPW)}
                </p>
                <p>Tu balance RENT: {balances.rent.toString()}</p>
              </WhatHappens>
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
            </label>
            <button
              type="button"
              disabled={!auth.isConnected || tx.busy}
              onClick={async () => {
                await tx.buyRent(BigInt(buyAmount));
                await balances.refresh();
              }}
              className="btn-primary self-start"
            >
              {tx.busy ? "Procesando…" : "Comprar"}
            </button>
          </SectionFrame>
        ) : null}

        {active === "deposito" ? (
          <SectionFrame
            code="04"
            label="Depositar"
            title="Fondea la renta del periodo"
            subtitle="Cualquiera puede aportar COPW al pool. Eso actualiza el acumulado por token."
            accent="rosado"
            actionLabel="Depósito"
            aside={
              <WhatHappens>
                <p>
                  Llamas <code>YieldDistributor.depositYield</code>.
                </p>
                <p>
                  El contrato reparte el aporte sobre el supply de RENT
                  (dividend-per-token).
                </p>
                <p>Tu saldo COPW: {formatCopLabel(balances.copw)}</p>
                {auth.isConnected ? (
                  <p>
                    Con ese saldo puedes depositar hasta{" "}
                    <strong>{maxYieldMillions}</strong> millón
                    {maxYieldMillions === 1 ? "" : "es"} COP.
                  </p>
                ) : null}
              </WhatHappens>
            }
            footer={txFooter}
          >
            <label className={labelClass}>
              Millones de COP (no el número completo del saldo)
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
            </label>
            <p className="text-sm leading-relaxed text-negro/70">
              <strong>{yieldMillions}</strong> millón
              {yieldMillions === 1 ? "" : "es"} ={" "}
              <strong>{formatCopLabel(yieldAmountCopw)}</strong>
              {auth.isConnected && balances.copw < yieldAmountCopw ? (
                <span className="mt-1 block text-naranja">
                  No te alcanza (tienes {formatCopLabel(balances.copw)}).
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={!auth.isConnected || n > maxYieldMillions}
                  onClick={() => setYieldMillions(n)}
                  className={`btn-ghost text-sm ${
                    yieldMillions === n ? "underline decoration-2" : ""
                  }`}
                >
                  {n}M
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!canDeposit}
              onClick={async () => {
                await tx.depositYield(yieldAmountCopw);
                await balances.refresh();
              }}
              className="btn-primary self-start"
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
            accent="verde"
            actionLabel="Cobro"
            aside={
              <WhatHappens>
                <p>
                  Llamas <code>YieldDistributor.claim</code>.
                </p>
                <p>Pago ≈ renta acumulada × (tu RENT / supply).</p>
                <p>Pendiente: {formatCopLabel(balances.pending)}</p>
                <p>Tu RENT: {balances.rent.toString()}</p>
              </WhatHappens>
            }
            footer={txFooter}
          >
            <button
              type="button"
              disabled={!auth.isConnected || tx.busy}
              onClick={async () => {
                await tx.claim();
                await balances.refresh();
              }}
              className="btn-primary self-start"
            >
              {tx.busy ? "Procesando…" : "Claim pendiente"}
            </button>
          </SectionFrame>
        ) : null}

        {active === "transferir" ? (
          <SectionFrame
            code="06"
            label="Transferir"
            title="Mercado secundario P2P"
            subtitle="Cedes RENT a otra address. Sin order book: transferencia ERC-20 directa."
            accent="azul"
            actionLabel="Transferencia"
            aside={
              <WhatHappens>
                <p>
                  Llamas <code>RENT.transfer(destino, cantidad)</code>.
                </p>
                <p>
                  En un RWA regulado esto suele ir con whitelist (p. ej.
                  ERC-3643). Aquí el token es abierto a propósito, para
                  contrastar.
                </p>
                <p>
                  Tip: haz claim antes si hay renta pendiente; el distributor no
                  reasigna yield al transferir.
                </p>
                <p>Tu RENT: {balances.rent.toString()}</p>
              </WhatHappens>
            }
            footer={txFooter}
          >
            <label className={labelClass}>
              Destino (address 0x…)
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x…"
                spellCheck={false}
                className={`${fieldClass} font-mono text-sm`}
              />
            </label>
            {transferTo.trim() && !transferAddressOk ? (
              <p className="text-sm text-naranja">Address inválida.</p>
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
              <p className="text-sm leading-relaxed text-naranja">
                No tienes suficiente RENT (tienes {balances.rent.toString()}).
              </p>
            ) : null}
            <button
              type="button"
              disabled={!canTransfer}
              onClick={async () => {
                const to = getAddress(transferTo.trim()) as Address;
                await tx.transferRent(to, BigInt(transferAmount));
                await balances.refresh();
              }}
              className="btn-primary self-start"
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
