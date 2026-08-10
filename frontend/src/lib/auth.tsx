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
import { createSponsoredKernelClient, type SponsoredSmartAccountClient } from "./aa";
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

  const buildTurnkeySession = useCallback(
    async (email?: string) => {
      if (!httpClient || !turnkeySession) {
        throw new Error("Sesión Turnkey no disponible. Reintenta el login.");
      }

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
        client: httpClient,
        organizationId: eth.organizationId || turnkeySession.organizationId,
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
        email: email || user?.userEmail,
        walletClient,
        smartAccountClient,
        publicClient,
      });
      setPendingOtp(null);
    },
    [
      httpClient,
      turnkeySession,
      refreshWallets,
      createWallet,
      user?.userEmail,
    ],
  );

  // Restaurar sesión Turnkey al recargar si ya hay Auth Proxy session.
  useEffect(() => {
    if (
      !turnkeyConfigured ||
      clientState !== ClientState.Ready ||
      authState !== AuthState.Authenticated ||
      session.mode !== "none" ||
      connecting ||
      restoringRef.current ||
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
        setError(
          e instanceof Error
            ? e.message
            : "No se pudo restaurar la sesión de email",
        );
        setSession(empty);
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
        if (clientState !== ClientState.Ready) {
          throw new Error(
            "Turnkey aún está inicializando. Espera un momento e inténtalo de nuevo.",
          );
        }

        const trimmed = email.trim().toLowerCase();
        if (!trimmed.includes("@")) {
          throw new Error("Ingresa un correo válido.");
        }

        const result = await initOtp({
          otpType: OtpType.Email,
          contact: trimmed,
        });

        setPendingOtp({
          email: trimmed,
          otpId: result.otpId,
          otpEncryptionTargetBundle: result.otpEncryptionTargetBundle,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error de autenticación");
        setPendingOtp(null);
      } finally {
        setConnecting(false);
      }
    },
    [clientState, initOtp],
  );

  const verifyEmailOtp = useCallback(
    async (otpCode: string) => {
      if (!pendingOtp) {
        setError("Primero solicita el código al correo.");
        return;
      }
      setConnecting(true);
      setError(null);
      try {
        const code = otpCode.trim();
        if (code.length < 6) {
          throw new Error("Ingresa el código OTP completo.");
        }

        await completeOtp({
          otpId: pendingOtp.otpId,
          otpCode: code,
          otpEncryptionTargetBundle: pendingOtp.otpEncryptionTargetBundle,
          contact: pendingOtp.email,
          otpType: OtpType.Email,
        });

        restoreAttemptedRef.current = true;
        await buildTurnkeySession(pendingOtp.email);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "No se pudo verificar el código",
        );
      } finally {
        setConnecting(false);
      }
    },
    [pendingOtp, completeOtp, buildTurnkeySession],
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
