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
  AuthState,
  ClientState,
  OtpType,
  useTurnkey,
  type Wallet,
} from "@turnkey/react-wallet-kit";
import { createAccount } from "@turnkey/viem";
import {
  createWalletClient,
  custom,
  http,
  type Address,
  type WalletClient,
} from "viem";
import { turnkeyConfigured } from "./turnkey-config";
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

type PendingEmailOtp = {
  email: string;
  otpId: string;
  otpEncryptionTargetBundle: string;
};

type AuthContextValue = Session & {
  connecting: boolean;
  error: string | null;
  /** Email awaiting OTP verification, if any. */
  pendingEmailOtp: string | null;
  /** Turnkey ClientState: loading | ready | error */
  turnkeyReady: boolean;
  turnkeyClientState: string | undefined;
  connectEmail: (email: string) => Promise<void>;
  verifyEmailOtp: (otpCode: string) => Promise<void>;
  cancelEmailOtp: () => void;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
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

/** Sin espacios; conserva alfanumérico (Turnkey puede configurar OTP no solo numérico). */
function normalizeOtpCode(raw: string): string {
  return raw.replace(/\s+/g, "").trim();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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
    withExtras.code === "INVALID_OTP_CODE" ||
    lower.includes("invalid otp") ||
    lower.includes("otp code is invalid")
  ) {
    return "Código OTP inválido o vencido. Pulsa «Reenviar código» e usa el más reciente del correo.";
  }

  if (
    lower.includes("failed to verify otp") ||
    lower.includes("otp verification failed") ||
    lower.includes("failed to complete otp")
  ) {
    return "No se pudo verificar el OTP. Usa el código más reciente; en Turnkey Auth Proxy revisa Allowed Origins (URL exacta de esta página); o usa MetaMask.";
  }

  if (
    lower.includes("origin") ||
    lower.includes("cors") ||
    lower.includes("forbidden")
  ) {
    return "El origen de esta página no está autorizado en Turnkey (Allowed Origins). Añade la URL exacta (p. ej. http://localhost:5173 o https://….github.io).";
  }

  if (lower.includes("sesión turnkey no disponible")) {
    return "El OTP se verificó, pero la sesión aún no estaba lista. Espera un momento o recarga; no hace falta otro código si ya entraste.";
  }

  return raw || fallback;
}

function findEthereumAddress(wallets: Wallet[]): {
  address: Address;
  organizationId: string;
} | null {
  for (const wallet of wallets) {
    for (const account of wallet.accounts) {
      if (
        account.addressFormat === "ADDRESS_FORMAT_ETHEREUM" &&
        account.address
      ) {
        return {
          address: account.address as Address,
          organizationId: account.organizationId,
        };
      }
    }
  }
  return null;
}

/**
 * Auth dual: email OTP (Turnkey Auth Proxy) o billetera caliente (MetaMask).
 * Email usa RPC HTTP de Sepolia; MetaMask usa el RPC de la billetera.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    initOtp,
    completeOtp,
    logout,
    httpClient,
    session: turnkeySession,
    refreshWallets,
    createWallet,
    clientState,
    authState,
    user,
  } = useTurnkey();

  const [session, setSession] = useState<Session>(empty);
  const [pendingOtp, setPendingOtp] = useState<PendingEmailOtp | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const restoringRef = useRef(false);
  const restoreAttemptedRef = useRef(false);
  const buildingRef = useRef(false);

  const clientStateRef = useRef(clientState);
  const httpClientRef = useRef(httpClient);
  const turnkeySessionRef = useRef(turnkeySession);
  const authStateRef = useRef(authState);
  const userEmailRef = useRef(user?.userEmail);
  clientStateRef.current = clientState;
  httpClientRef.current = httpClient;
  turnkeySessionRef.current = turnkeySession;
  authStateRef.current = authState;
  userEmailRef.current = user?.userEmail;

  /** Espera a que el kit deje sesión + httpClient tras completeOtp (evita carrera). */
  const waitForTurnkeySession = useCallback(async (timeoutMs = 15_000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (httpClientRef.current && turnkeySessionRef.current) {
        return {
          httpClient: httpClientRef.current,
          turnkeySession: turnkeySessionRef.current,
        };
      }
      await sleep(100);
    }
    throw new Error("Sesión Turnkey no disponible. Reintenta el login.");
  }, []);

  const buildTurnkeySession = useCallback(
    async (email?: string) => {
      if (buildingRef.current) return;
      buildingRef.current = true;
      try {
        const { httpClient: client, turnkeySession: tkSession } =
          await waitForTurnkeySession();

        let wallets = await refreshWallets();
        let eth = findEthereumAddress(wallets);

        if (!eth) {
          await createWallet({
            walletName: "Taller RENT",
            accounts: ["ADDRESS_FORMAT_ETHEREUM"],
          });
          wallets = await refreshWallets();
          eth = findEthereumAddress(wallets);
        }

        if (!eth) {
          throw new Error(
            "No se encontró una cuenta Ethereum en Turnkey. Revisa el Auth Proxy.",
          );
        }

        const turnkeyAccount = await createAccount({
          client,
          organizationId: eth.organizationId || tkSession.organizationId,
          signWith: eth.address,
          ethereumAddress: eth.address,
        });

        const walletClient = createWalletClient({
          account: turnkeyAccount,
          chain,
          transport: http(
            (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined) ||
              undefined,
          ),
        });
        const publicClient = createHttpPublicClient();

        if (!pimlicoApiKey) {
          throw new Error(
            "Login email requiere VITE_PIMLICO_API_KEY (gas patrocinado). Sin eso la cuenta Turnkey no tiene ETH para pagar gas.",
          );
        }

        const { client: smartAccountClient, address: kernelAddress } =
          await createSponsoredKernelClient(turnkeyAccount);

        setSession({
          mode: "email",
          ownerAddress: eth.address,
          smartAccountAddress: kernelAddress,
          email: email || userEmailRef.current,
          walletClient,
          smartAccountClient,
          publicClient,
        });
        setPendingOtp(null);
        setError(null);
      } finally {
        buildingRef.current = false;
      }
    },
    [waitForTurnkeySession, refreshWallets, createWallet],
  );

  // Restaurar sesión Turnkey al recargar (o si el OTP ya autenticó y falta Kernel).
  useEffect(() => {
    if (
      !turnkeyConfigured ||
      clientState !== ClientState.Ready ||
      authState !== AuthState.Authenticated ||
      session.mode !== "none" ||
      connecting ||
      restoringRef.current ||
      buildingRef.current ||
      restoreAttemptedRef.current ||
      pendingOtp
    ) {
      return;
    }

    restoringRef.current = true;
    restoreAttemptedRef.current = true;
    setConnecting(true);
    setError(null);
    void buildTurnkeySession(user?.userEmail)
      .catch((e) => {
        console.error("[auth] restore session", e);
        setError(formatAuthError(e, "No se pudo restaurar la sesión de email"));
        setSession(empty);
        // Permitir otro intento si la sesión aún no estaba lista.
        restoreAttemptedRef.current = false;
      })
      .finally(() => {
        restoringRef.current = false;
        setConnecting(false);
      });
  }, [
    clientState,
    authState,
    session.mode,
    connecting,
    pendingOtp,
    buildTurnkeySession,
    user?.userEmail,
  ]);

  const disconnect = useCallback(() => {
    setSession(empty);
    setPendingOtp(null);
    setError(null);
    restoreAttemptedRef.current = false;
    if (authState === AuthState.Authenticated) {
      void logout().catch(() => {
        /* ignore logout errors */
      });
    }
  }, [authState, logout]);

  const cancelEmailOtp = useCallback(() => {
    setPendingOtp(null);
    setError(null);
  }, []);

  const connectEmail = useCallback(
    async (email: string) => {
      setConnecting(true);
      setError(null);
      try {
        if (!turnkeyConfigured) {
          throw new Error(
            "Turnkey no está configurado. Define VITE_TURNKEY_ORGANIZATION_ID y VITE_TURNKEY_AUTH_PROXY_CONFIG_ID, o usa «Conectar billetera».",
          );
        }

        const origin =
          typeof window !== "undefined" ? window.location.origin : "";

        const deadline = Date.now() + 12_000;
        while (clientStateRef.current !== ClientState.Ready) {
          if (clientStateRef.current === ClientState.Error) {
            throw new Error(
              `Turnkey no pudo inicializar. Origen actual: ${origin}. En Auth Proxy → Allowed Origins añade exactamente esa URL (local: http://localhost:5173 · Pages: https://estrategia-e-innovacion-de-ti.github.io), guarda, recarga e intenta de nuevo.`,
            );
          }
          if (Date.now() >= deadline) {
            throw new Error(
              `Turnkey no quedó listo a tiempo (estado: ${clientStateRef.current ?? "desconocido"}). Recarga la página. Si persiste, revisa Allowed Origins para ${origin}.`,
            );
          }
          await sleep(200);
        }

        const trimmed = email.trim().toLowerCase();
        if (!trimmed.includes("@")) {
          throw new Error("Ingresa un correo válido.");
        }

        const result = await initOtp({
          otpType: OtpType.Email,
          contact: trimmed,
        });

        if (!result?.otpId || !result?.otpEncryptionTargetBundle) {
          throw new Error(
            "Turnkey no devolvió un OTP válido. Revisa Allowed Origins y Auth Proxy.",
          );
        }

        setPendingOtp({
          email: trimmed,
          otpId: result.otpId,
          otpEncryptionTargetBundle: result.otpEncryptionTargetBundle,
        });
      } catch (e) {
        console.error("[auth] initOtp", e);
        setError(formatAuthError(e, "Error de autenticación"));
        setPendingOtp(null);
      } finally {
        setConnecting(false);
      }
    },
    [initOtp],
  );

  const verifyEmailOtp = useCallback(
    async (otpCode: string) => {
      if (!pendingOtp) {
        setError("Primero solicita el código al correo.");
        return;
      }
      if (!pendingOtp.otpEncryptionTargetBundle) {
        setError(
          "Sesión OTP incompleta. Pulsa «Reenviar código» e inténtalo de nuevo.",
        );
        return;
      }
      setConnecting(true);
      setError(null);
      const email = pendingOtp.email;
      try {
        const code = normalizeOtpCode(otpCode);
        if (code.length < 6 || code.length > 9) {
          throw new Error(
            "El código OTP debe tener entre 6 y 9 caracteres (según Turnkey).",
          );
        }

        await completeOtp({
          otpId: pendingOtp.otpId,
          otpCode: code,
          otpEncryptionTargetBundle: pendingOtp.otpEncryptionTargetBundle,
          contact: email,
          otpType: OtpType.Email,
        });

        // OTP ya consumido: limpiar UI y esperar a que el kit publique la sesión.
        setPendingOtp(null);
        restoreAttemptedRef.current = true;

        await waitForTurnkeySession();
        await buildTurnkeySession(email);
      } catch (e) {
        console.error("[auth] completeOtp / build session", e);
        // Si el OTP ya validó y solo falló el armado, dejar que el effect restaure.
        if (
          authStateRef.current === AuthState.Authenticated ||
          turnkeySessionRef.current
        ) {
          restoreAttemptedRef.current = false;
          setPendingOtp(null);
          setError(
            "Código verificado. Preparando tu cuenta… Si no conecta en unos segundos, recarga la página (no hace falta otro OTP).",
          );
        } else {
          setError(formatAuthError(e, "No se pudo verificar el código"));
        }
      } finally {
        setConnecting(false);
      }
    },
    [pendingOtp, completeOtp, waitForTurnkeySession, buildTurnkeySession],
  );

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    setError(null);
    setPendingOtp(null);
    try {
      if (!window.ethereum) {
        throw new Error(
          "No se detectó una billetera (instala MetaMask u otra compatible).",
        );
      }

      if (authState === AuthState.Authenticated) {
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
  }, [authState, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...session,
      connecting,
      error,
      pendingEmailOtp: pendingOtp?.email ?? null,
      turnkeyReady: clientState === ClientState.Ready,
      turnkeyClientState: clientState,
      connectEmail,
      verifyEmailOtp,
      cancelEmailOtp,
      connectWallet,
      disconnect,
      isConnected: Boolean(session.smartAccountAddress),
    }),
    [
      session,
      connecting,
      error,
      pendingOtp,
      clientState,
      connectEmail,
      verifyEmailOtp,
      cancelEmailOtp,
      connectWallet,
      disconnect,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
