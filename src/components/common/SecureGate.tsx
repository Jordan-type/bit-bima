"use client";

import React from "react";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { ConnectPrompt, ConnectPromptProps } from "@/components/common/ConnectGate";
import AccessDeniedPrompt from "./AccessDeniedPrompt";

export type Role = "owner" | "doctor" | "admin";

export type SecureGateCtx = {
  address?: `0x${string}`;
  chainId?: number;
  publicClient?: ReturnType<typeof usePublicClient>;
};

export type RoleCheck = (role: Role, ctx: SecureGateCtx) => Promise<boolean>;

type SecureGateProps = {
  children: React.ReactNode;

  /** If you already know the boolean (e.g., from parent state), pass it here */
  allowed?: boolean;

  /** Optional async checker if you want SecureGate to do the role check itself */
  check?: (ctx: SecureGateCtx) => Promise<boolean>;

   /** role-based check */
  require?: Role;
  roleCheck?: RoleCheck;

  /** Address to display in the denied view */
  address?: string;

  /** While the async check runs */
  loadingFallback?: React.ReactNode;

  /** Customize the connect prompt */
  connectPromptProps?: ConnectPromptProps;

  /** Customize the access denied prompt */
  deniedTitle?: string;
  deniedMessage?: string;
};

const SecureGate: React.FC<SecureGateProps> = ({
  children,
  allowed,
  check,
  require,
  roleCheck,    
  address,
  loadingFallback,
  connectPromptProps,
  deniedTitle,
  deniedMessage,
}) => {
  const { isConnected, address: acct } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  const [checking, setChecking] = React.useState(false);
  const [localAllowed, setLocalAllowed] = React.useState<boolean | undefined>(undefined);
  const finalAllowed = allowed ?? localAllowed;

  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!isConnected) {
        setLocalAllowed(undefined);
        return;
      }

      // nothing to check
      if (!check && !require) {
        setLocalAllowed(true);
        return;
      }

      try {
        setChecking(true);
        let ok = false;

        if (require && roleCheck) {
          // role-based mode
          if (require === "admin") {
            // admin = owner OR doctor
            const [isOwner, isDoctor] = await Promise.all([
              roleCheck("owner", { address: acct as any, chainId, publicClient }),
              roleCheck("doctor", { address: acct as any, chainId, publicClient }),
            ]);
            ok = isOwner || isDoctor;
          } else {
            ok = await roleCheck(require, { address: acct as any, chainId, publicClient });
          }
        } else if (check) {
          // generic checker
          ok = await check({ address: acct as any, chainId, publicClient });
        }

        if (mounted) setLocalAllowed(ok);
      } catch {
        if (mounted) setLocalAllowed(false);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [isConnected, acct, chainId, publicClient, check, roleCheck, require]);

  if (!isConnected) {
    return <ConnectPrompt {...connectPromptProps} />;
  }

  if (check && checking && finalAllowed === undefined) {
    return (
      loadingFallback ?? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Checking permissions…</div>
        </div>
      )
    );
  }

  if (finalAllowed === false) {
    return (
      <AccessDeniedPrompt
        title={deniedTitle}
        message={deniedMessage}
        address={address ?? acct}
      />
    );
  }

  return <>{children}</>;
};

export default SecureGate;
