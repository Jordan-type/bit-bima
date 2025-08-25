"use client";

import React from "react";
import AccessDeniedPrompt from "./AccessDeniedPrompt";

type RoleGateProps = {
  allowed?: boolean;
  loading?: boolean;
  address?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  message?: string;
};

const RoleGate: React.FC<RoleGateProps> = ({
  allowed,
  loading,
  address,
  children,
  fallback,
  title,
  message,
}) => {
  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Checking permissions…</div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <>
        {fallback ?? (
          <AccessDeniedPrompt title={title} message={message} address={address} />
        )}
      </>
    );
  }

  return <>{children}</>;
};

export default RoleGate;
