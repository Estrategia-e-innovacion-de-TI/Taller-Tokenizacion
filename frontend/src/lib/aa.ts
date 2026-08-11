import {
  createSmartAccountClient,
  type SmartAccountClient,
} from "permissionless";
import { toKernelSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import {
  entryPoint07Address,
  type SmartAccount,
} from "viem/account-abstraction";
import { http, type Address, type LocalAccount, type Transport } from "viem";
import { chain, createHttpPublicClient, pimlicoApiKey } from "./viem";

/** Cliente tipado con account definido (evita params `never` en sendUserOperation). */
export type SponsoredSmartAccountClient = SmartAccountClient<
  Transport,
  typeof chain,
  SmartAccount
>;

function pimlicoRpcUrl(): string {
  if (!pimlicoApiKey) {
    throw new Error(
      "Falta VITE_PIMLICO_API_KEY para gas patrocinado con email.",
    );
  }
  return `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${pimlicoApiKey}`;
}

/**
 * Kernel (ERC-4337) + paymaster Pimlico, firmado por el owner Turnkey.
 * Solo para login email — MetaMask no usa esta vía.
 */
export async function createSponsoredKernelClient(owner: LocalAccount): Promise<{
  client: SponsoredSmartAccountClient;
  address: Address;
}> {
  const publicClient = createHttpPublicClient();
  const rpc = pimlicoRpcUrl();

  const paymasterClient = createPimlicoClient({
    transport: http(rpc),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  const kernelAccount = await toKernelSmartAccount({
    client: publicClient,
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
    owners: [owner],
    version: "0.3.1",
  });

  const client = createSmartAccountClient({
    account: kernelAccount,
    chain,
    paymaster: paymasterClient,
    bundlerTransport: http(rpc),
    userOperation: {
      estimateFeesPerGas: async () =>
        (await paymasterClient.getUserOperationGasPrice()).fast,
    },
  });

  return { client, address: kernelAccount.address };
}
