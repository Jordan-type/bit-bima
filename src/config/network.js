// src/config/network.js
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, createStorage, cookieStorage } from "wagmi";
import { celo, celoSepolia, holesky, localhost } from "wagmi/chains";

// WalletConnect Cloud Project ID
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "REPLACE_ME";

// Which network name to display in the UI header
export const NETWORK_NAME = process.env.NEXT_PUBLIC_NETWORK_NAME || "Sepolia";

// Chain list used by wagmi/rainbowkit across the app
export const CHAINS = [localhost, celo, celoSepolia, holesky];

// Single source of truth for wagmi config
export const wagmiConfig = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "BitBima Dapp",
  projectId,
  chains: CHAINS,
  transports: {
    [localhost.id]: http(process.env.NEXT_PUBLIC_RPC_LOCALHOST),
    [celo.id]: http(process.env.NEXT_PUBLIC_RPC_CELO),
    [celoSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_CELOSEPOLIA),
    [holesky.id]: http(process.env.NEXT_PUBLIC_RPC_HOLESKY),
  },
  ssr: true,
  // 👇 forces Wagmi to use cookies instead of localStorage/indexedDB on the server
  storage: createStorage({ cookie: cookieStorage }),
});

// Contract address (pick the right one for your active chain if needed)
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || "";
