import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createWalletClient,
  custom,
  type Address,
  type WalletClient,
} from "viem";
import {
  chain,
  createBrowserPublicClient,
  ensureSepolia,
  type BrowserPublicClient,
} from "./viem";

export type AuthMode = "none" | "email" | "wallet";

type Session = {
  mode: AuthMode;
  ownerAddress: Address | null;
  smartAccountAddress: Address | null;
  email?: string;
  walletClient: WalletClient | null;
  publicClient: BrowserPublicClient | null;
};

type AuthContextValue = Session & {
  connecting: boolean;
  error: string | null;
  connectEmail: (email: string) => Promise<void>;
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
  publicClient: null,
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    };
  }
}

/**
 * Auth dual: email (Turnkey) o billetera caliente.
 * Lecturas on-chain usan el RPC de la billetera del navegador (window.ethereum).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(empty);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disconnect = useCallback(() => {
    setSession(empty);
    setError(null);
  }, []);

  const connectEmail = useCallback(async (_email: string) => {
    setConnecting(true);
    setError(null);
    try {
      const orgId = import.meta.env.VITE_TURNKEY_ORGANIZATION_ID;
      const proxyId = import.meta.env.VITE_TURNKEY_AUTH_PROXY_CONFIG_ID;
      if (!orgId || !proxyId) {
        throw new Error(
          "Turnkey no está configurado. Define VITE_TURNKEY_ORGANIZATION_ID y VITE_TURNKEY_AUTH_PROXY_CONFIG_ID, o usa «Conectar billetera».",
        );
      }
      throw new Error(
        "Turnkey Auth Proxy pendiente de cablear. Usa «Conectar billetera» (RPC vía MetaMask).",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de autenticación");
      setSession(empty);
    } finally {
      setConnecting(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      if (!window.ethereum) {
        throw new Error(
          "No se detectó una billetera (instala MetaMask u otra compatible).",
        );
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
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...session,
      connecting,
      error,
      connectEmail,
      connectWallet,
      disconnect,
      isConnected: Boolean(session.smartAccountAddress),
    }),
    [session, connecting, error, connectEmail, connectWallet, disconnect],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
