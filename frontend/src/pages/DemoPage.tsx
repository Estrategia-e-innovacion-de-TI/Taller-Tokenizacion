import { useState } from "react";
import { useAuth } from "../lib/auth";
import { useBalances } from "../lib/useBalances";
import { useWorkshopTx } from "../lib/useWorkshopTx";
import {
  FAUCET_AMOUNT_COPW,
  PRICE_PER_RENT_COPW,
  PROPERTY_VALUE_COP,
  formatCopLabel,
} from "../lib/format-cop";
import { contractsConfigured } from "../lib/viem";
import { SectionFrame } from "../components/didactic/SectionFrame";
import { StepRail } from "../components/didactic/StepRail";
import { TxExplainer } from "../components/didactic/TxExplainer";

const steps = [
  { id: "cuenta", label: "01 Cuenta", accent: "amarillo" },
  { id: "faucet", label: "02 Faucet", accent: "azul" },
  { id: "compra", label: "03 Comprar", accent: "naranja" },
  { id: "deposito", label: "04 Depositar", accent: "rosado" },
  { id: "claim", label: "05 Claim", accent: "verde" },
];

function WhatHappens({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-negro/45 uppercase">
        Qué está pasando
      </p>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-negro/70">
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
    <div className="border border-negro/10 bg-blanco p-3">
      <p className="text-xs font-semibold tracking-wider text-negro/45 uppercase">
        {label}
      </p>
      {hint ? <p className="mt-1 text-xs text-negro/55">{hint}</p> : null}
      <p className="mt-2 break-all font-mono text-sm text-negro">{address}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} className="btn-ghost text-xs">
          {copied ? "Copiada" : "Copiar"}
        </button>
        <a
          className="btn-ghost text-xs"
          href={`https://sepolia.etherscan.io/address/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          Ver en Etherscan
        </a>
      </div>
    </div>
  );
}

export function DemoPage() {
  const [active, setActive] = useState("cuenta");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [buyAmount, setBuyAmount] = useState(1);
  const [yieldMillions, setYieldMillions] = useState(1);
  const auth = useAuth();
  const balances = useBalances();
  const tx = useWorkshopTx();

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <div className="container-app py-10">
        <p className="eyebrow text-naranja">
          Flujo práctico
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          Tokeniza RENT en vivo
        </h1>
        <p className="mt-3 max-w-2xl text-negro/65">
          Cuenta → faucet COPW → compra → depositar renta → claim.
          Aquí firmas y ves el TxExplainer. La teoría está en Conceptos.
        </p>
        {!contractsConfigured ? (
          <p className="mt-4 border border-naranja/40 bg-naranja/10 px-3 py-2 text-sm">
            Faltan addresses de contratos en <code>.env</code>. Puedes recorrer la UI;
            las txs on-chain requieren el deploy Foundry.
          </p>
        ) : null}
      </div>

      <StepRail steps={steps} active={active} onSelect={scrollTo} />

      <div id="cuenta">
        <SectionFrame
          code="01"
          label="Cuenta"
          title="Entra con email o billetera"
          subtitle="Email con gas patrocinado, o MetaMask pagando su propio gas."
          accent="amarillo"
          aside={
            <WhatHappens>
              <p>
                <strong>Email:</strong> Turnkey firma; Kernel + Pimlico pagan el gas.
                La address visible es la smart account (no el owner).
              </p>
              <p>
                <strong>MetaMask:</strong> firmas como EOA y pagas ETH de Sepolia. Sin patrocinio.
              </p>
            </WhatHappens>
          }
        >
          {!auth.pendingEmailOtp ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 text-sm">
                Correo
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@banco.com"
                  disabled={auth.isConnected}
                  className="mt-1 w-full border border-negro/15 bg-white px-3 py-2 outline-none focus:border-azul disabled:opacity-60"
                />
              </label>
              <button
                type="button"
                disabled={auth.connecting || !email || auth.isConnected}
                onClick={() => void auth.connectEmail(email)}
                className="btn-primary"
              >
                Continuar con email
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-negro/70">
                Enviamos un código a <strong>{auth.pendingEmailOtp}</strong>.
                Revísalo e ingrésalo abajo.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex-1 text-sm">
                  Código OTP
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="000000"
                    className="mt-1 w-full border border-negro/15 bg-white px-3 py-2 font-mono tracking-widest outline-none focus:border-azul"
                  />
                </label>
                <button
                  type="button"
                  disabled={auth.connecting || otpCode.trim().length < 6}
                  onClick={() => void auth.verifyEmailOtp(otpCode)}
                  className="btn-primary"
                >
                  Verificar código
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
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
            </div>
          )}
          <button
            type="button"
            disabled={auth.connecting || auth.isConnected}
            onClick={() => void auth.connectWallet()}
            className="btn-secondary mt-3"
          >
            Conectar billetera
          </button>
          {auth.error ? (
            <p className="mt-3 text-sm text-naranja">{auth.error}</p>
          ) : null}
          {auth.isConnected && auth.smartAccountAddress ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-verde">
                Conectado
                {auth.mode === "email" && auth.email ? ` · ${auth.email}` : ""}
                {auth.mode === "wallet" ? " · MetaMask" : ""}. Puedes seguir al
                faucet.
              </p>
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
              {auth.mode === "email" &&
              auth.ownerAddress &&
              auth.ownerAddress.toLowerCase() !==
                auth.smartAccountAddress.toLowerCase() ? (
                <PublicAddress
                  label="Owner Turnkey (firma)"
                  address={auth.ownerAddress}
                  hint={`Creada con el correo${auth.email ? ` ${auth.email}` : ""}. Firma las UserOps; no guarda los tokens.`}
                />
              ) : null}
            </div>
          ) : null}
        </SectionFrame>
      </div>

      <div id="faucet">
        <SectionFrame
          code="02"
          label="Faucet"
          title="Fondea tu cuenta con COPW"
          subtitle="5.000.000 COP de demo por claim. No es dinero real."
          accent="azul"
          aside={
            <WhatHappens>
              <p>
                Llamas <code>COPW.faucet()</code> desde tu smart account.
              </p>
              <p>Con eso puedes comprar RENT (desde 100.000 COP) y aportar renta.</p>
              <p>Saldo actual: {formatCopLabel(balances.copw)}</p>
            </WhatHappens>
          }
        >
          <button
            type="button"
            disabled={!auth.isConnected}
            onClick={async () => {
              await tx.faucet();
              await balances.refresh();
            }}
            className="btn-primary"
          >
            Obtener {formatCopLabel(FAUCET_AMOUNT_COPW)}
          </button>
          <TxExplainer state={tx.explainer} />
        </SectionFrame>
      </div>

      <div id="compra">
        <SectionFrame
          code="03"
          label="Comprar"
          title="Participación en RENT"
          subtitle={`Inmueble valuado en ${PROPERTY_VALUE_COP.toLocaleString("es-CO")} COP. Ticket desde 100.000 COP = 1 RENT.`}
          accent="naranja"
          aside={
            <WhatHappens>
              <p>
                <code>approve</code> COPW → <code>PropertySale.buy</code> → mint RENT.
              </p>
              <p>
                Costo: {buyAmount} × {formatCopLabel(PRICE_PER_RENT_COPW)} ={" "}
                {formatCopLabel(BigInt(buyAmount) * PRICE_PER_RENT_COPW)}
              </p>
              <p>Tu balance RENT: {balances.rent.toString()}</p>
            </WhatHappens>
          }
        >
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              Cantidad de RENT
              <input
                type="number"
                min={1}
                max={50}
                value={buyAmount}
                onChange={(e) => setBuyAmount(Math.max(1, Number(e.target.value) || 1))}
                className="mt-1 w-28 border border-negro/15 bg-white px-3 py-2"
              />
            </label>
            <button
              type="button"
              disabled={!auth.isConnected}
              onClick={async () => {
                await tx.buyRent(BigInt(buyAmount));
                await balances.refresh();
              }}
              className="btn-primary"
            >
              Comprar
            </button>
          </div>
          <TxExplainer state={tx.explainer} />
        </SectionFrame>
      </div>

      <div id="deposito">
        <SectionFrame
          code="04"
          label="Depositar"
          title="Fondea la renta del periodo"
          subtitle="Cualquiera puede aportar COPW al pool. Eso actualiza el acumulado por token."
          accent="rosado"
          aside={
            <WhatHappens>
              <p>
                Llamas <code>YieldDistributor.depositYield</code>.
              </p>
              <p>
                El contrato reparte el aporte sobre el supply de RENT (dividend-per-token).
              </p>
              <p>Tu COPW: {formatCopLabel(balances.copw)}</p>
            </WhatHappens>
          }
        >
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              Renta a depositar (millones COP)
              <input
                type="number"
                min={1}
                value={yieldMillions}
                onChange={(e) =>
                  setYieldMillions(Math.max(1, Number(e.target.value) || 1))
                }
                className="mt-1 w-28 border border-negro/15 bg-white px-3 py-2"
              />
            </label>
            <button
              type="button"
              disabled={!auth.isConnected}
              onClick={async () => {
                await tx.depositYield(BigInt(yieldMillions) * 1_000_000n * 100n);
                await balances.refresh();
              }}
              className="btn-primary"
            >
              Depositar renta
            </button>
          </div>
          <TxExplainer state={tx.explainer} />
        </SectionFrame>
      </div>

      <div id="claim">
        <SectionFrame
          code="05"
          label="Claim"
          title="Cobra tu parte proporcional"
          subtitle="Solo retiras lo acumulado a tu favor según tu balance de RENT."
          accent="verde"
          aside={
            <WhatHappens>
              <p>
                Llamas <code>YieldDistributor.claim</code>.
              </p>
              <p>
                Pago ≈ renta acumulada × (tu RENT / supply).
              </p>
              <p>Pendiente: {formatCopLabel(balances.pending)}</p>
              <p>Tu RENT: {balances.rent.toString()}</p>
            </WhatHappens>
          }
        >
          <button
            type="button"
            disabled={!auth.isConnected}
            onClick={async () => {
              await tx.claim();
              await balances.refresh();
            }}
            className="btn-primary"
          >
            Claim pendiente
          </button>
          <TxExplainer state={tx.explainer} />
        </SectionFrame>
      </div>
    </div>
  );
}
