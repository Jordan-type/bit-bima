import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "../provider/providers";

const inter = Inter({ subsets: ["latin"] });


export const metadata = {
  title: "BitBima - Watch your health, guard your wealth.",
  description: "Instant claims, lower costs, and transparent on-chain health insurance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

