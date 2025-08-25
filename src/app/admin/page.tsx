// app/admin/page.tsx  (or pages/admin/index.tsx)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import { Address } from "viem";
import toast from "react-hot-toast";
import { FiSettings, FiShield, FiUsers, FiFileText, FiActivity, } from "react-icons/fi";

import { contractService } from "@/services/contract";

// Adjust these imports to wherever you placed the components:
import AdminStats from "@/components/Admin/AdminStats";
import ContractControls from "@/components/Admin/ContractControls";
import PlanManagement from "@/components/Admin/PlanManagement";
import DoctorManagement from "@/components/Admin/DoctorManagement";
import ClaimManagement from "@/components/Admin/ClaimManagement";
import Layout from "@/components/Layout/Layout";
import ConnectGate from "@/components/common/ConnectGate";
import RoleGate from "@/components/common/RoleGate";
import SecureGate, { type Role, type SecureGateCtx } from "@/components/common/SecureGate"; 

type TokenMeta = {
  address?: Address | null;
  symbol: string;
  decimals: number;
};

type TabKey = "overview" | "claims" | "doctors" | "plans" | "controls";

const AdminPage: React.FC = () => {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // token + stats
  const [tokenMeta, setTokenMeta] = useState<TokenMeta>({ address: null, symbol: "TOKEN", decimals: 18 });
  const [contractBalance, setContractBalance] = useState<bigint>(0n);
  const [totalPolicies, setTotalPolicies] = useState<bigint>(0n);
  const [totalClaims, setTotalClaims] = useState<bigint>(0n);
  const [loadingStats, setLoadingStats] = useState(true);

  // plans
  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  // ui
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (chainId) contractService.setChainId(chainId);
  }, [chainId]);

  // 

  const fetchStats = async () => {
    if (!publicClient) return;
    setLoadingStats(true);
    try {
      const meta = await contractService.getTokenMeta(publicClient, undefined);
      setTokenMeta(meta);

      const stats = await contractService.getContractStats(publicClient, { token: meta.address as Address });
      setTotalPolicies(stats.totalPolicies);
      setTotalClaims(stats.totalClaims);
      setContractBalance(stats.contractBalance);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to load stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPlans = async () => {
    if (!publicClient) return;
    setLoadingPlans(true);
    try {
      // If you added more than 3 plans, bump the count:
      const res = await contractService.getAllInsurancePlans(publicClient, 3);
      setPlans(res);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to load plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPlans();
  }, [publicClient]);

  const onRefreshAll = async () => {
    await Promise.all([fetchStats(), fetchPlans()]);
  };

  const loadingAny = loadingStats || loadingPlans;

  const Overview = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Total Policies",
            value: loadingStats ? "..." : totalPolicies.toString(),
            icon: FiShield,
            color: "text-emerald-600",
            bg: "from-emerald-100 to-green-100",
          },
          {
            title: "Total Claims",
            value: loadingStats ? "..." : totalClaims.toString(),
            icon: FiFileText,
            color: "text-blue-600",
            bg: "from-blue-100 to-cyan-100",
          },
          {
            title: "Treasury Balance",
            value: loadingStats
              ? "..."
              : `${Number(contractBalance) / 10 ** tokenMeta.decimals} ${tokenMeta.symbol}`,
            icon: FiActivity,
            color: "text-purple-600",
            bg: "from-purple-100 to-pink-100",
          },
        ].map((c, i) => (
          <div key={i} className="relative bg-white border border-white/50 shadow-xl rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center`}>
                <c.icon className={`h-6 w-6 ${c.color}`} />
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold">{c.title}</div>
                <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
    [loadingStats, totalPolicies, totalClaims, contractBalance, tokenMeta]
  );

  
  return (
    <SecureGate
    require="admin"  // owner OR doctor
    deniedTitle="Access denied"
    deniedMessage="Only the contract owner or an authorized doctor can access the admin dashboard."
    connectPromptProps={{
      title: "Connect to access Admin",
      description: "Sign in with your wallet to manage plans, doctors, claims and contract state.",
    }}
    roleCheck={async (role: Role, { publicClient, address }: SecureGateCtx) => {
      if (!publicClient || !address) return false;
      if (role === "owner")  return contractService.isOwner(publicClient, address);
      if (role === "doctor") return contractService.isAuthorizedDoctor(publicClient, address);
      // role === "admin" is handled inside SecureGate, but safe fallback:
      const [o, d] = await Promise.all([
        contractService.isOwner(publicClient, address),
        contractService.isAuthorizedDoctor(publicClient, address),
      ]);
      return o || d;
    }}
    >
    <Layout>
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage plans, claims, doctors, and contract state</p>
        </div>
        <button
          onClick={onRefreshAll}
          disabled={loadingAny}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow disabled:opacity-60"
        >
          <FiSettings className={`w-5 h-5 mr-2 ${loadingAny ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "overview", label: "Overview" },
          { key: "claims", label: "Claims" },
          { key: "doctors", label: "Doctors" },
          { key: "plans", label: "Plans" },
          { key: "controls", label: "Controls" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as TabKey)}
            className={`px-4 py-2 text-sm font-semibold rounded-xl border ${
              tab === t.key
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === "overview" && (
        <div className="space-y-6">
          {Overview}
          <AdminStats
            loading={loadingStats}
            onRefresh={onRefreshAll}
            data={{
              contractBalance,
              totalPolicies,
              totalClaims,
              plans,                              // ← you already have this state
              tokenSymbol: tokenMeta.symbol,
              tokenDecimals: tokenMeta.decimals,
            }}
          />
        </div>
      )}

      {tab === "claims" && <ClaimManagement />}

      {tab === "doctors" && (
        <DoctorManagement loading={loadingStats} onRefresh={onRefreshAll} />
      )}

      {tab === "plans" && (
        <PlanManagement plans={plans} loading={loadingPlans} onRefresh={fetchPlans} />
      )}

      {tab === "controls" && (
        <ContractControls
          contractBalance={contractBalance}
          tokenSymbol={tokenMeta.symbol}
          tokenDecimals={tokenMeta.decimals}
          loading={loadingStats}
          onRefresh={onRefreshAll}
        />
      )}
    </div>
    </Layout>
    </SecureGate>
  );
};

export default AdminPage;
