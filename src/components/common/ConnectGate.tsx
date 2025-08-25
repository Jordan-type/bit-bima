import React from "react";
import { useAccount, useConnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiShield, FiSettings, FiZap, FiLock, } from "react-icons/fi";
import type { IconType } from "react-icons";

type Feature = { icon?: IconType; text: string };

export type ConnectPromptProps = {
  title?: string;
  description?: string;
  features?: Feature[];
  connectButton?: React.ReactNode;   /** If you use RainbowKit, pass <ConnectButton /> here */
  /** Called when default button is pressed (if no connectButton provided) */
//   onConnect?: () => void;
//   /** Button label when using default button */
//   buttonLabel?: string;
};

export const ConnectPrompt: React.FC<ConnectPromptProps> = ({
  title = "Connect Your Wallet",
  description = "Secure access to your admin dashboard. Connect your Web3 wallet to manage insurance plans, doctors, and contract settings.",
  features = [
    { icon: FiShield, text: "Manage insurance plans & policies" },
    { icon: FiZap, text: "Process claims & authorize doctors" },
    { icon: FiLock, text: "Contract controls & fund management" },
  ],
  connectButton,
}) => {
  const button = connectButton ?? (
    <ConnectButton
      label="Connect Wallet"
      chainStatus="icon"
      showBalance={false}
      accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
    />
  );

  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="relative mx-auto mb-8">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
            <FiShield className="h-16 w-16 text-blue-600" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <FiSettings className="h-4 w-4 text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-xl animate-pulse" />
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {features.map((f, i) => {
              const Icon = f.icon ?? FiZap;
              return (
                <div key={i} className="flex items-center space-x-3 text-sm text-gray-700">
                  <Icon className="h-4 w-4 text-blue-600" />
                  <span>{f.text}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center">{button}</div>
        </div>
      </div>
    </div>
  );
};

type ConnectGateProps = {
  children: React.ReactNode;
  /** Override the default prompt UI entirely */
  fallback?: React.ReactNode;
  /** Props to customize the default prompt */
  promptProps?: ConnectPromptProps;
};

/** Wrap any page/section; shows a wallet-connect prompt until connected */
const ConnectGate: React.FC<ConnectGateProps> = ({ children, fallback, promptProps }) => {
  const { isConnected } = useAccount();
  if (!isConnected) return (fallback ?? <ConnectPrompt {...promptProps} />);
  return <>{children}</>;
};

export default ConnectGate;
