// src/config/network.ts
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, createStorage, cookieStorage } from "wagmi";
import { celo, celoAlfajores as celoSepolia, holesky } from "wagmi/chains";
import type { Address } from "@/types/web3";

export const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK_NAME || "Sepolia";

export const wagmiConfig = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Bit Bima Dapp",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "REPLACE_ME",
  chains: [celo, celoSepolia, holesky],
  transports: {
    [celo.id]: http(process.env.NEXT_PUBLIC_RPC_CELO),
    [celoSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_CELOSEPOLIA),
    [holesky.id]: http(process.env.NEXT_PUBLIC_RPC_HOLESKY),
  },
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});

type ContractSet = {
  PolicyManager: Address;
  ClaimManager: Address;
  RiskPoolTreasury: Address;
  CoreProtocol: Address;
  PremiumToken?: Address;   // Optional, if not used in all networks // ERC20 used for premiums
  TokenSymbol?: string;     // e.g., "cUSD"
  TokenDecimals?: number;   // e.g., 18
};

export const CONTRACT_ADDRESSES: Record<number, ContractSet> = {
  [holesky.id]: {
    PolicyManager:     (process.env.NEXT_PUBLIC_PM_HOLESKY || "") as Address,
    ClaimManager:      (process.env.NEXT_PUBLIC_CM_HOLESKY || "") as Address,
    RiskPoolTreasury:  (process.env.NEXT_PUBLIC_POOL_HOLESKY || "") as Address,
    CoreProtocol:      (process.env.NEXT_PUBLIC_CORE_HOLESKY || "") as Address,
    PremiumToken:      (process.env.NEXT_PUBLIC_TOKEN_HOLESKY || "") as Address,
  },
  [celo.id]: {
    PolicyManager:     (process.env.NEXT_PUBLIC_PM_CELO || "") as Address,
    ClaimManager:      (process.env.NEXT_PUBLIC_CM_CELO || "") as Address,
    RiskPoolTreasury:  (process.env.NEXT_PUBLIC_POOL_CELO || "") as Address,
    CoreProtocol:      (process.env.NEXT_PUBLIC_CORE_CELO || "") as Address,
    PremiumToken:      (process.env.NEXT_PUBLIC_TOKEN_CELO || "") as Address, // cUSD on mainnet
    TokenSymbol:   "cUSD",
    TokenDecimals: 18,
  },
  [celoSepolia.id]: {
    PolicyManager:     (process.env.NEXT_PUBLIC_PM_CELOSEPOLIA || "") as Address,
    ClaimManager:      (process.env.NEXT_PUBLIC_CM_CELOSEPOLIA || "") as Address,
    RiskPoolTreasury:  (process.env.NEXT_PUBLIC_POOL_CELOSEPOLIA || "") as Address,
    CoreProtocol:      (process.env.NEXT_PUBLIC_CORE_CELOSEPOLIA || "") as Address,
    PremiumToken:      (process.env.NEXT_PUBLIC_TOKEN_CELOSEPOLIA || "") as Address, // cUSD on Alfajores
    TokenSymbol:   "cUSD",
    TokenDecimals: 18,
  },
};

export const getContractAddresses = (chainId?: number) => chainId !== undefined ? CONTRACT_ADDRESSES[chainId] : undefined;

const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || 42220); // Default to Celo mainnet
export const CONTRACT_ADDRESS = getContractAddresses(DEFAULT_CHAIN_ID);
