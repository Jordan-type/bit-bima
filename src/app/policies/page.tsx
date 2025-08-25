"use client"

import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { FiRefreshCw, FiShield, FiLock, FiZap, FiBarChart, FiActivity, FiGlobe, FiCheckCircle } from "react-icons/fi";
import type { Address } from "viem";

import Layout from "@/components/Layout/Layout";
import PolicyCard from "@/components/Policies/PolicyCard";
import PayPremiumModal from "@/components/Policies/PayPremiumModal";
import { contractService } from "@/services/contract";
import { POLICY_STATUS } from "@/constant";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";
import ConnectGate from "@/components/common/ConnectGate";

export default function Policies() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [payPremiumModalOpen, setPayPremiumModalOpen] = useState(false);


  useEffect(() => {
    if (isConnected && publicClient && address) void loadPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, publicClient, address]);

  const loadPolicies = async () => {
    if (!publicClient || !address) return;
    try {
      setLoading(true);

      const userPolicies = await contractService.getUserPolicies(address as Address, publicClient);

      const enriched = await Promise.all(
        userPolicies.map(async (p) => {
          const [remainingCoverage, claims] = await Promise.all([
            contractService.getRemainingCoverage(p.policyId, publicClient),
            contractService.getPolicyClaims(p.policyId, publicClient),
          ]);
          return {
            ...p,
            remainingCoverage,
            claims,
            claimsCount: claims.length,
            isValid: Number(p.status) === POLICY_STATUS.ACTIVE,
          };
        })
      );

      setPolicies(enriched);
    } catch (err) {
      console.error("Error loading policies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPremium = (policy: any) => {
    setSelectedPolicy(policy);
    setPayPremiumModalOpen(true);
  };

  const handleCancelPolicy = async (policyId: bigint) => {
    if (!walletClient || !publicClient) return;
    if (!confirm("Cancel this policy? This cannot be undone.")) return;

    try {
      const res = await contractService.cancelPolicy(policyId, walletClient, publicClient);
      if (res.success) await loadPolicies();
    } catch (err) {
      console.error("Cancel policy error:", err);
    }
  };

  if (!isConnected) {
    return (
      <Layout>
        {/* ... keep your nice connect wallet empty-state UI ... */}
        <div className="relative min-h-[600px] flex items-center justify-center">
          <div className="relative text-center max-w-md mx-auto">
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-2xl border border-white/50">
                <FiShield className="h-16 w-16 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <FiLock className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="bg-white/80 rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-8">Secure access to your blockchain insurance policies.</p>
              {/* Put your wallet connect button here */}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const totalCoverageEth = useMemo(
    () => policies.reduce((sum, p) => sum + parseFloat(toEthStr(p.coverageAmount)), 0),
    [policies]
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="relative">
          <div className="bg-white/60 rounded-2xl p-8 shadow-xl border border-white/50 overflow-hidden">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FiShield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">My Policies</h1>
                  <p className="text-lg text-gray-600">Manage your blockchain-secured insurance coverage</p>
                </div>
              </div>

              <button
                onClick={loadPolicies}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-gray-200/50 rounded-xl bg-white/80"
              >
                <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          /* skeletons ... */
          <div>Loading...</div>
        ) : policies.length === 0 ? (
          /* empty state ... */
          <div className="text-center text-gray-600">No Policies Found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {policies.map((p, i) => (
              <div key={String(p.policyId)} className="transform transition-all duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                <PolicyCard
                  policy={p}
                  onPayPremium={() => handlePayPremium(p)}
                  onCancel={() => handleCancelPolicy(p.policyId)}
                  onRefresh={loadPolicies}
                />
              </div>
            ))}
          </div>
        )}

        {policies.length > 0 && (
          <div className="relative bg-white/60 rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/50 overflow-hidden">
            <div className="relative">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FiBarChart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Portfolio Summary</h3>
                  <p className="text-gray-600">Your overview</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white/80 rounded-2xl p-6 text-center border border-white/50 shadow-lg">
                  <p className="text-3xl font-bold text-indigo-600 mb-2">{policies.length}</p>
                  <p className="text-sm font-semibold text-gray-600">Total Policies</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 text-center border border-white/50 shadow-lg">
                  <p className="text-3xl font-bold text-emerald-600 mb-2">{policies.filter((p) => Number(p.status) === POLICY_STATUS.ACTIVE).length}</p>
                  <p className="text-sm font-semibold text-gray-600">Active Policies</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 text-center border border-white/50 shadow-lg">
                  <p className="text-3xl font-bold text-blue-600 mb-2">{totalCoverageEth.toFixed(2)}</p>
                  <p className="text-sm font-semibold text-gray-600">Total Coverage (ETH)</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 text-center border border-white/50 shadow-lg">
                  <p className="text-3xl font-bold text-purple-600 mb-2">
                    {policies.reduce((sum, p) => sum + Number(p.claimsCount ?? 0), 0)}
                  </p>
                  <p className="text-sm font-semibold text-gray-600">Total Claims</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <PayPremiumModal
        isOpen={payPremiumModalOpen}
        onClose={() => setPayPremiumModalOpen(false)}
        policy={selectedPolicy}
        onSuccess={() => {
          setPayPremiumModalOpen(false);
          loadPolicies();
        }}
      />
    </Layout>
  );
}