"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"; // getDefaultConfig, 
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { http } from "wagmi";
// import { mainnet, sepolia, base, polygon, optimism, arbitrum } from "wagmi/chains";
import { wagmiConfig } from "../config/network";

// const config = getDefaultConfig({
//   appName: "BitBima",
//   // get one free at https://cloud.walletconnect.com (reown)
//   projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "REPLACE_ME",
//   chains: [sepolia, mainnet, base, polygon, optimism, arbitrum],
//   transports: {
//     [sepolia.id]: http(), // or http(process.env.NEXT_PUBLIC_RPC_SEPOLIA)
//     [mainnet.id]: http(),
//     [base.id]: http(),
//     [polygon.id]: http(),
//     [optimism.id]: http(),
//     [arbitrum.id]: http(),
//   },
//   ssr: true, // important for App Router/SSR
// });

const queryClient = new QueryClient();

import React, { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
