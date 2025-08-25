"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiAlertTriangle } from "react-icons/fi";

type AccessDeniedPromptProps = {
  title?: string;
  message?: string;
  address?: string;
};

const AccessDeniedPrompt: React.FC<AccessDeniedPromptProps> = ({
  title = "Access Denied",
  message = "You don't have permission to access this page. Only contract owners and authorized doctors can access admin functions.",
  address,
}) => {
  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative text-center max-w-md mx-auto">
        <div className="relative mx-auto mb-8">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
            <FiAlertTriangle className="h-16 w-16 text-red-600" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 opacity-20 blur-xl animate-pulse" />
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>

          {address && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Your address:</div>
              <div className="font-mono text-sm text-gray-900 break-all">{address}</div>
            </div>
          )}

          {/* Lets the user switch account if needed */}
          <div className="flex justify-center">
            <ConnectButton
              label="Switch / Connect Wallet"
              chainStatus="icon"
              showBalance={false}
              accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPrompt;
