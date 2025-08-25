// src/config/network.js
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, createStorage, cookieStorage } from "wagmi";
import { celo, celoAlfajores as celoSepolia, holesky, localhost } from "wagmi/chains";

// WalletConnect Cloud Project ID
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "REPLACE_ME";

// Which network name to display in the UI header
export const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK_NAME || "Sepolia";

// Chains used by wagmi/rainbowkit across the app
export const CHAINS = [localhost, celo, celoSepolia, holesky];

// Single source of truth for wagmi config
export const wagmiConfig = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Bit Bima Dapp",
  projectId,
  chains: CHAINS,
  transports: {
    [localhost.id]: http(process.env.NEXT_PUBLIC_RPC_LOCALHOST),
    [celo.id]: http(process.env.NEXT_PUBLIC_RPC_CELO),
    [celoSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_CELOSEPOLIA),
    [holesky.id]: http(process.env.NEXT_PUBLIC_RPC_HOLESKY),
  },
  ssr: true,
  storage: createStorage({ cookie: cookieStorage }),
});

/**
 * Contract addresses per chain.
 * - Localhost is filled with the ones your deploy script printed.
 * - For live nets, read from env (or hardcode if you prefer).
 */
export const CONTRACT_ADDRESSES = {
  [localhost.id]: {
    PolicyManager:     "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    ClaimManager:      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    RiskPoolTreasury:  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    CoreProtocol:      "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    // MockERC20:      "0xA51c1f...91C0", // optional convenience
  },
  [holesky.id]: {
    PolicyManager:     process.env.NEXT_PUBLIC_PM_HOLESKY || "",
    ClaimManager:      process.env.NEXT_PUBLIC_CM_HOLESKY || "",
    RiskPoolTreasury:  process.env.NEXT_PUBLIC_POOL_HOLESKY || "",
    CoreProtocol:      process.env.NEXT_PUBLIC_CORE_HOLESKY || "",
  },
  [celo.id]: {
    PolicyManager:     process.env.NEXT_PUBLIC_PM_CELO || "",
    ClaimManager:      process.env.NEXT_PUBLIC_CM_CELO || "",
    RiskPoolTreasury:  process.env.NEXT_PUBLIC_POOL_CELO || "",
    CoreProtocol:      process.env.NEXT_PUBLIC_CORE_CELO || "",
  },
  [celoSepolia.id]: {
    PolicyManager:     process.env.NEXT_PUBLIC_PM_CELOSEPOLIA || "",
    ClaimManager:      process.env.NEXT_PUBLIC_CM_CELOSEPOLIA || "",
    RiskPoolTreasury:  process.env.NEXT_PUBLIC_POOL_CELOSEPOLIA || "",
    CoreProtocol:      process.env.NEXT_PUBLIC_CORE_CELOSEPOLIA || "",
  },
};

/** Helper: pick addresses for a given chainId (defaults to localhost) */
export const getContractAddresses = (chainId) => CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[localhost.id];

/**
 * Back-compat export for existing imports in your service:
 * this is the *current/default* address set used at module load.
 * You can force which one via NEXT_PUBLIC_DEFAULT_CHAIN_ID (number).
 */
const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || localhost.id);
export const CONTRACT_ADDRESS = getContractAddresses(DEFAULT_CHAIN_ID);
