import type { PrivyClientConfig } from "@privy-io/react-auth";
import { chain } from "./viem";

export const privyAppId = (import.meta.env.VITE_PRIVY_APP_ID as
  | string
  | undefined) || "";

/**
 * Config pública de Privy (App ID).
 * En el dashboard: email login + Allowed Origins (local + GitHub Pages).
 */
export const privyConfig: PrivyClientConfig = {
  loginMethods: ["email"],
  defaultChain: chain,
  supportedChains: [chain],
  captchaEnabled: false,
  embeddedWallets: {
    ethereum: {
      // El dashboard no debe “prompt on login”: ese modal se queda en spinner.
      createOnLogin: "off",
    },
    // Evita un segundo modal al firmar UserOps; la wallet se crea en silencio.
    showWalletUIs: false,
  },
};

export const privyConfigured = Boolean(privyAppId);
