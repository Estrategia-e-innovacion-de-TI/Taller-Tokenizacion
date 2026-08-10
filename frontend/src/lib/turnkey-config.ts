import type { TurnkeyProviderConfig } from "@turnkey/react-wallet-kit";

const ethAccount = {
  curve: "CURVE_SECP256K1" as const,
  pathFormat: "PATH_FORMAT_BIP32" as const,
  path: "m/44'/60'/0'/0/0",
  addressFormat: "ADDRESS_FORMAT_ETHEREUM" as const,
};

/**
 * Config pública de Turnkey (Auth Proxy).
 * organizationId + authProxyConfigId vienen del dashboard Embedded Wallets.
 */
export const turnkeyConfig: TurnkeyProviderConfig = {
  organizationId: import.meta.env.VITE_TURNKEY_ORGANIZATION_ID || "",
  authProxyConfigId: import.meta.env.VITE_TURNKEY_AUTH_PROXY_CONFIG_ID || "",
  auth: {
    createSuborgParams: {
      emailOtpAuth: {
        userName: "Taller Tokenizacion",
        customWallet: {
          walletName: "Taller RENT",
          walletAccounts: [ethAccount],
        },
      },
    },
  },
  ui: {
    // Custom OTP UI; no usamos el modal de Turnkey
    authModal: {
      methods: {
        emailOtpAuthEnabled: true,
        smsOtpAuthEnabled: false,
        passkeyAuthEnabled: false,
        walletAuthEnabled: false,
        googleOauthEnabled: false,
        appleOauthEnabled: false,
        xOauthEnabled: false,
        discordOauthEnabled: false,
        facebookOauthEnabled: false,
      },
    },
  },
};

export const turnkeyConfigured = Boolean(
  turnkeyConfig.organizationId && turnkeyConfig.authProxyConfigId,
);
