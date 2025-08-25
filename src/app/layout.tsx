import "./globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { RainbowKitProvider, darkTheme, lightTheme  } from '@rainbow-me/rainbowkit';
import Providers from "@/provider/providers";

const inter = Inter({ subsets: ["latin"] });


export const metadata = {
  title: "BitBima - Watch your health, guard your wealth.",
  description: "Instant claims, lower costs, and transparent on-chain health insurance.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

