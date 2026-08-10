import { createPublicClient, custom, type Address, type Hex } from "viem";
import { sepolia } from "viem/chains";
import copwArtifact from "./abis/COPW.json";
import rentArtifact from "./abis/RENT.json";
import saleArtifact from "./abis/PropertySale.json";
import distributorArtifact from "./abis/YieldDistributor.json";

/** Ethereum Sepolia (chainId 11155111) — red del taller */
export const chain = sepolia;

export const SEPOLIA_CHAIN_ID_HEX = `0x${sepolia.id.toString(16)}` as const;

export type BrowserPublicClient = ReturnType<typeof createBrowserPublicClient>;

/**
 * Public client vía RPC de la billetera del navegador (MetaMask).
 */
export function createBrowserPublicClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error(
      "Se necesita MetaMask u otra billetera en el navegador para el RPC.",
    );
  }
  return createPublicClient({
    chain,
    transport: custom(window.ethereum),
  });
}

export async function ensureSepolia(): Promise<void> {
  if (!window.ethereum) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
    });
  } catch (e) {
    const err = e as { code?: number };
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CHAIN_ID_HEX,
            chainName: sepolia.name,
            nativeCurrency: sepolia.nativeCurrency,
            rpcUrls: [...sepolia.rpcUrls.default.http],
            blockExplorerUrls: sepolia.blockExplorers
              ? [sepolia.blockExplorers.default.url]
              : [],
          },
        ],
      });
    } else {
      throw e;
    }
  }
}

export const addresses = {
  copw: (import.meta.env.VITE_COPW_ADDRESS || "") as Address,
  rent: (import.meta.env.VITE_RENT_ADDRESS || "") as Address,
  sale: (import.meta.env.VITE_SALE_ADDRESS || "") as Address,
  distributor: (import.meta.env.VITE_DISTRIBUTOR_ADDRESS || "") as Address,
};

export const contractsConfigured =
  Boolean(addresses.copw) &&
  Boolean(addresses.rent) &&
  Boolean(addresses.sale) &&
  Boolean(addresses.distributor);

export const abis = {
  copw: copwArtifact.abi,
  rent: rentArtifact.abi,
  sale: saleArtifact.abi,
  distributor: distributorArtifact.abi,
} as const;

export const pimlicoApiKey = import.meta.env.VITE_PIMLICO_API_KEY as
  | string
  | undefined;

export type TxStatus =
  | "idle"
  | "preparing"
  | "signing"
  | "sponsored"
  | "submitted"
  | "confirmed"
  | "error";

export type TxExplainerState = {
  status: TxStatus;
  title: string;
  detail: string;
  hash?: Hex;
  error?: string;
};
