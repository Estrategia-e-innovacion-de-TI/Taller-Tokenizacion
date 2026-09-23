import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getEmbeddedConnectedWallet,
  toViemAccount,
  useCreateWallet,
  useLoginWithEmail,
  usePrivy,
  useWallets,
  type ConnectedWallet,
  type User,
} from "@privy-io/react-auth";
import {
  createWalletClient,
  custom,
  http,
  type Address,
  type LocalAccount,
  type WalletClient,
} from "viem";
import { privyConfigured } from "./privy-config";
import {
  createSponsoredKernelClient,
  type SponsoredSmartAccountClient,
} from "./aa";
import {
  chain,
  createBrowserPublicClient,
  createHttpPublicClient,
  ensureSepolia,
  pimlicoApiKey,
  type AppPublicClient,
} from "./viem";

export type AuthMode = "none" | "email" | "wallet";
export type EmailClientState = "loading" | "ready" | "error";

type Session = {
  mode: AuthMode;
  ownerAddress: Address | null;
  smartAccountAddress: Address | null;
  email?: string;
  walletClient: WalletClient | null;
  /** Kernel + Pimlico; solo login email con API key. */
  smartAccountClient: SponsoredSmartAccountClient | null;
  publicClient: AppPublicClient | null;
};

type AuthContextValue = Session & {
  connecting: boolean;
  error: string | null;
  /** Email awaiting OTP verification, if any. */
  pendingEmailOtp: string | null;
  emailReady: boolean;
  emailClientState: EmailClientState;
  connectEmail: (email: string) => Promise<void>;
  verifyEmailOtp: (otpCode: string) => Promise<void>;
  cancelEmailOtp: () => void;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  /** Progreso del login email (OTP → wallet → Kernel). */
  connectingHint: string | null;
  /** OTP ya válido; falta wallet/Kernel. */
  privyAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const empty: Session = {
  mode: "none",
  ownerAddress: null,
  smartAccountAddress: null,
  walletClient: null,
  smartAccountClient: null,
  publicClient: null,
};

/** Sin espacios; OTP de Privy es numérico de 6 dígitos, aceptamos 6–9. */
function normalizeOtpCode(raw: string): string {
  return raw.replace(/\s+/g, "").trim();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(
            new Error(
              `${label} tardó más de ${Math.round(ms / 1000)} s. Recarga e inténtalo de nuevo.`,
            ),
          );
        }, ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function findPrivyWallet(wallets: ConnectedWallet[]): ConnectedWallet | null {
  return (
    getEmbeddedConnectedWallet(wallets) ??
    wallets.find((w) => w.walletClientType === "privy") ??
    wallets.find((w) => w.connectorType === "embedded") ??
    null
  );
}

function userEmailOf(user: User | null | undefined): string | undefined {
  return user?.email?.address;
}

function formatAuthError(e: unknown, fallback: string): string {
  if (!(e instanceof Error)) return fallback;

  const withExtras = e as Error & { code?: string; cause?: unknown };
  const causeMsg =
    withExtras.cause instanceof Error
      ? withExtras.cause.message
      : typeof withExtras.cause === "string"
        ? withExtras.cause
        : "";
  const raw = [e.message, causeMsg].filter(Boolean).join(" · ");
  const lower = raw.toLowerCase();

  if (
    withExtras.code === "invalid_credentials" ||
    lower.includes("invalid otp") ||
    lower.includes("otp code is invalid") ||
    lower.includes("incorrect code") ||
    lower.includes("invalid email and code") ||
    (lower.includes("422") && lower.includes("passwordless"))
  ) {
    return "Código inválido, vencido o ya usado. Pulsa «Reenviar código» e ingresa el nuevo. Si ya habías verificado, no reuses el anterior: recarga o pulsa Reintentar.";
  }

  if (
    lower.includes("failed to verify otp") ||
    lower.includes("otp verification failed") ||
    lower.includes("too many")
  ) {
    return "No se pudo verificar el OTP. Usa el código más reciente; en Privy revisa Allowed Origins (URL exacta de esta página); o usa MetaMask.";
  }

  if (
    lower.includes("origin") ||
    lower.includes("cors") ||
    lower.includes("forbidden") ||
    lower.includes("allowlist") ||
    lower.includes("not allowed")
  ) {
    return "El origen de esta página no está autorizado en Privy (Allowed Origins). Añade la URL exacta (p. ej. http://localhost:5173 o https://….github.io).";
  }

  return raw || fallback;
}

/**
 * Auth: email OTP (Privy) o billetera caliente (MetaMask).
 * Email usa RPC HTTP de Sepolia; MetaMask usa el RPC de la billetera.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, logout, error: privyInitError } =
    usePrivy();
  const { sendCode, loginWithCode } = useLoginWithEmail();
  const { wallets } = useWallets();
  const { createWallet } = useCreateWallet();

  const [session, setSession] = useState<Session>(empty);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectingHint, setConnectingHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const restoringRef = useRef(false);
  const restoreAttemptedRef = useRef(false);
  const buildingRef = useRef(false);
  const buildingPromiseRef = useRef<Promise<void> | null>(null);

  const readyRef = useRef(ready);
  const walletsRef = useRef(wallets);
  const authenticatedRef = useRef(authenticated);
  const userEmailRef = useRef(userEmailOf(user));
  readyRef.current = ready;
  walletsRef.current = wallets;
  authenticatedRef.current = authenticated;
  userEmailRef.current = userEmailOf(user);

  const emailClientState: EmailClientState = privyInitError
    ? "error"
    : ready
      ? "ready"
      : "loading";

  const waitForEmbeddedWallet = useCallback(
    async (timeoutMs = 25_000): Promise<ConnectedWallet> => {
      const deadline = Date.now() + timeoutMs;
      let createError: string | null = null;
      let createStarted = false;

      while (Date.now() < deadline) {
        const found = findPrivyWallet(walletsRef.current);
        if (found) return found;

        if (!createStarted && authenticatedRef.current) {
          createStarted = true;
          setConnectingHint("Creando wallet Privy…");
          try {
            await withTimeout(createWallet(), 20_000, "Crear wallet Privy");
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            const lower = msg.toLowerCase();
            if (lower.includes("already has") || lower.includes("already exists")) {
              /* wallet ya creada; esperamos a useWallets */
            } else {
              createError = msg;
              console.warn("[auth] createWallet", e);
            }
          }
        }
        await sleep(200);
      }

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      throw new Error(
        createError
          ? `Privy no creó la wallet: ${createError}. Allowed Origins debe incluir exactamente ${origin} (el puerto cuenta: :5173 ≠ :5174).`
          : `No apareció la wallet embebida. En Privy Dashboard → Configuration → Allowed Origins añade ${origin}. Embedded wallets Ethereum deben estar activas.`,
      );
    },
    [createWallet],
  );

  const buildEmailSession = useCallback(
    async (email?: string) => {
      if (buildingPromiseRef.current) return buildingPromiseRef.current;

      const run = (async () => {
        setConnectingHint("Buscando wallet Privy…");
        const embedded = await waitForEmbeddedWallet();
        setConnectingHint("Listo. Armando Kernel…");
        const ownerAccount = (await withTimeout(
          toViemAccount({ wallet: embedded }),
          15_000,
          "toViemAccount",
        )) as LocalAccount;

        const walletClient = createWalletClient({
          account: ownerAccount,
          chain,
          transport: http(
            (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined) ||
              undefined,
          ),
        });
        const publicClient = createHttpPublicClient();

        if (!pimlicoApiKey) {
          throw new Error(
            "Login email requiere VITE_PIMLICO_API_KEY (gas patrocinado). Sin eso la cuenta Privy no tiene ETH para pagar gas.",
          );
        }

        setConnectingHint("Armando Kernel + Pimlico…");
        const { client: smartAccountClient, address: kernelAddress } =
          await withTimeout(
            createSponsoredKernelClient(ownerAccount),
            20_000,
            "Kernel / Pimlico",
          );

        setSession({
          mode: "email",
          ownerAddress: embedded.address as Address,
          smartAccountAddress: kernelAddress,
          email: email || userEmailRef.current,
          walletClient,
          smartAccountClient,
          publicClient,
        });
        setPendingEmail(null);
        setError(null);
        setConnectingHint(null);
      })().finally(() => {
        buildingRef.current = false;
        buildingPromiseRef.current = null;
      });

      buildingRef.current = true;
      buildingPromiseRef.current = run;
      return run;
    },
    [waitForEmbeddedWallet],
  );

  // Si el OTP ya autenticó, arma Kernel.
  useEffect(() => {
    if (
      !privyConfigured ||
      !ready ||
      !authenticated ||
      session.mode !== "none" ||
      restoringRef.current ||
      buildingRef.current ||
      restoreAttemptedRef.current
    ) {
      return;
    }

    restoringRef.current = true;
    restoreAttemptedRef.current = true;
    setConnecting(true);
    setConnectingHint("Sesión Privy lista. Armando cuenta…");
    setError(null);
    void buildEmailSession(userEmailOf(user))
      .catch((e) => {
        console.error("[auth] restore session", e);
        setError(formatAuthError(e, "No se pudo restaurar la sesión de email"));
        setSession(empty);
      })
      .finally(() => {
        restoringRef.current = false;
        setConnecting(false);
        setConnectingHint(null);
      });
  }, [ready, authenticated, session.mode, buildEmailSession, user]);

  const disconnect = useCallback(() => {
    setSession(empty);
    setPendingEmail(null);
    setConnectingHint(null);
    setError(null);
    restoreAttemptedRef.current = false;
    if (authenticated) {
      void logout().catch(() => {
        /* ignore logout errors */
      });
    }
  }, [authenticated, logout]);

  const cancelEmailOtp = useCallback(() => {
    setPendingEmail(null);
    setError(null);
  }, []);

  const connectEmail = useCallback(
    async (email: string) => {
      setConnecting(true);
      setConnectingHint("Enviando código…");
      setError(null);
      try {
        if (!privyConfigured) {
          throw new Error(
            "Privy no está configurado. Define VITE_PRIVY_APP_ID, o usa «Conectar billetera».",
          );
        }

        const origin =
          typeof window !== "undefined" ? window.location.origin : "";

        const deadline = Date.now() + 12_000;
        while (!readyRef.current) {
          if (privyInitError) {
            throw new Error(
              `Privy no pudo inicializar. Origen actual: ${origin}. En Dashboard → Allowed Origins añade exactamente esa URL (local: http://localhost:5173 · Pages: https://estrategia-e-innovacion-de-ti.github.io), guarda, recarga e intenta de nuevo.`,
            );
          }
          if (Date.now() >= deadline) {
            throw new Error(
              `Privy no quedó listo a tiempo. Recarga la página. Si persiste, revisa Allowed Origins para ${origin}.`,
            );
          }
          await sleep(200);
        }

        const trimmed = email.trim().toLowerCase();
        if (!trimmed.includes("@")) {
          throw new Error("Ingresa un correo válido.");
        }

        if (authenticatedRef.current) {
          restoreAttemptedRef.current = true;
          await buildEmailSession(trimmed);
          return;
        }

        await sendCode({ email: trimmed });
        setPendingEmail(trimmed);
        setConnectingHint(null);
      } catch (e) {
        console.error("[auth] sendCode", e);
        setError(formatAuthError(e, "Error de autenticación"));
        setPendingEmail(null);
      } finally {
        setConnecting(false);
        setConnectingHint(null);
      }
    },
    [sendCode, privyInitError, buildEmailSession],
  );

  const verifyEmailOtp = useCallback(
    async (otpCode: string) => {
      if (!pendingEmail) {
        setError("Primero solicita el código al correo.");
        return;
      }
      setConnecting(true);
      setConnectingHint("Verificando código…");
      setError(null);
      const email = pendingEmail;
      try {
        const code = normalizeOtpCode(otpCode);
        if (code.length < 6 || code.length > 9) {
          throw new Error("El código OTP debe tener entre 6 y 9 caracteres.");
        }

        if (!authenticatedRef.current) {
          setConnectingHint("Verificando código…");
          await withTimeout(
            loginWithCode({ code, email } as { code: string }),
            25_000,
            "loginWithCode",
          );
        } else {
          setConnectingHint("Sesión ya activa. Creando wallet…");
        }

        restoreAttemptedRef.current = true;
        await buildEmailSession(email);
      } catch (e) {
        console.error("[auth] loginWithCode / build session", e);
        if (authenticatedRef.current) {
          restoreAttemptedRef.current = false;
          setError(
            formatAuthError(
              e,
              "Código verificado, pero no se armó la Kernel. Recarga (no hace falta otro OTP).",
            ),
          );
        } else {
          setError(formatAuthError(e, "No se pudo verificar el código"));
        }
      } finally {
        setConnecting(false);
        setConnectingHint(null);
      }
    },
    [pendingEmail, loginWithCode, buildEmailSession],
  );

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    setError(null);
    setPendingEmail(null);
    try {
      if (!window.ethereum) {
        throw new Error(
          "No se detectó una billetera (instala MetaMask u otra compatible).",
        );
      }

      if (authenticated) {
        await logout().catch(() => undefined);
      }

      await ensureSepolia();

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const owner = accounts[0] as Address;
      if (!owner) throw new Error("No se obtuvo una cuenta.");

      const walletClient = createWalletClient({
        account: owner,
        chain,
        transport: custom(window.ethereum),
      });
      const publicClient = createBrowserPublicClient();

      setSession({
        mode: "wallet",
        ownerAddress: owner,
        smartAccountAddress: owner,
        walletClient,
        smartAccountClient: null,
        publicClient,
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo conectar la billetera",
      );
      setSession(empty);
    } finally {
      setConnecting(false);
    }
  }, [authenticated, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...session,
      connecting,
      connectingHint,
      error,
      pendingEmailOtp: pendingEmail,
      emailReady: ready,
      emailClientState,
      connectEmail,
      verifyEmailOtp,
      cancelEmailOtp,
      connectWallet,
      disconnect,
      isConnected: Boolean(session.smartAccountAddress),
      privyAuthenticated: authenticated,
    }),
    [
      session,
      connecting,
      connectingHint,
      error,
      pendingEmail,
      ready,
      emailClientState,
      connectEmail,
      verifyEmailOtp,
      cancelEmailOtp,
      connectWallet,
      disconnect,
      authenticated,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
