"use client";

import { useState, useEffect, useCallback } from "react";
import type { Address } from "viem";
import { useAccount, useChainId, usePublicClient, useWalletClient  } from "wagmi";
import { FiWifi,FiShield, FiZap, FiLock, FiRefreshCw, FiTrendingUp, FiActivity,} from "react-icons/fi";

import Layout from "@/components/Layout/Layout";
import StatsCards from "@/components/Dashboard/StatsCards";
import RecentActivity from "@/components/Dashboard/RecentActivity";
import QuickActions from "@/components/Dashboard/QuickActions";
import PolicyOverview from "@/components/Dashboard/PolicyOverview";
import ClaimsOverview from "@/components/Dashboard/ClaimsOverview";
import ConnectGate from "@/components/common/ConnectGate";

import { contractService } from "@/services/contract";
import type { Claim, Policy, ContractStats } from "@/types/app";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient(); // kept if you’ll add writes later


  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    userPolicies: Policy[];
    userClaims: Claim[];
    contractStats: ContractStats;
    insurancePlans: any[]; // replace any[] with Plan[]
  }>({
    userPolicies: [],
    userClaims: [],
    contractStats: { totalPolicies: 0n, totalClaims: 0n, contractBalance: 0n },
    insurancePlans: [],
  });

const loadDashboardData = useCallback(async () => {
    try {
      if (!publicClient || !address) return;
      setLoading(true);

      // optional: keep compatibility with your service’ setChainId
      contractService.setChainId(chainId);

      // 1) User policies
      const userPolicies = await contractService.getUserPolicies(
        address as Address,
        publicClient
      );

      // 2) Claims (flatten all policy claims)
      let userClaims: any[] = [];
      for (const p of userPolicies) {
        const claims = await contractService.getPolicyClaims(p.policyId, publicClient);
        userClaims = userClaims.concat(claims);
      }

      // 3) Contract stats (totals + risk pool balance)
      const stats = await contractService.getContractStats(publicClient);

      // 4) Insurance plans (defaults to first 3 plan indexes)
      const insurancePlans = await contractService.getAllInsurancePlans(publicClient);

      setDashboardData({
        userPolicies,
        userClaims,
        contractStats: {
          totalPolicies: stats.totalPolicies,
          totalClaims: stats.totalClaims,
          // if this is an ERC20 with 18 decimals this is fine; otherwise use .toString()
          contractBalance: stats.contractBalance,
        },
        insurancePlans,
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient, chainId]);

  useEffect(() => {
    if (isConnected) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [isConnected, loadDashboardData]);

  // if (!isConnected) {
  //   return (
  //     <Layout>
  //       <div className="flex min-h-[400px] items-center justify-center">
  //         <div className="text-center">
  //           <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
  //             <svg
  //               className="h-12 w-12 text-gray-400"
  //               fill="none"
  //               viewBox="0 0 24 24"
  //               stroke="currentColor"
  //             >
  //               <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 strokeWidth={2}
  //                 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
  //               />
  //             </svg>
  //           </div>
  //           <h3 className="text-lg font-medium text-gray-900 mb-2">
  //             Connect Your Wallet
  //           </h3>
  //           <p className="text-gray-500 mb-6">
  //             Please connect your wallet to access the HealthInsurance DApp
  //           </p>
  //         </div>
  //       </div>
  //     </Layout>
  //   );
  // }
  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "4s" }}
            ></div>
          </div>

          <div className="relative text-center max-w-md mx-auto">
            {/* Enhanced Wallet Icon */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
                <FiLock className="h-16 w-16 text-blue-600" />
              </div>

              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiWifi className="h-4 w-4 text-white" />
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-xl animate-pulse"></div>
            </div>

            {/* Enhanced Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Secure access to your blockchain health insurance dashboard.
                Connect your Web3 wallet to view policies, submit claims, and
                manage your coverage.
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiShield className="h-4 w-4 text-blue-600" />
                  <span>Blockchain-secured insurance policies</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiZap className="h-4 w-4 text-emerald-600" />
                  <span>Instant claim processing</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiLock className="h-4 w-4 text-purple-600" />
                  <span>Transparent and immutable records</span>
                </div>
              </div>

              {/* Connect button */}
              <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <FiLock className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Connect Wallet</span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's an overview of your health insurance
            activities.
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCards
          userPolicies={dashboardData.userPolicies}
          userClaims={dashboardData.userClaims}
          contractStats={dashboardData.contractStats}
          loading={loading}
        />

        {/* Quick Actions */}
        <QuickActions />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Policy Overview */}
          <PolicyOverview
            policies={dashboardData.userPolicies}
            loading={loading}
            onRefresh={loadDashboardData}
          />

          {/* Claims Overview */}
          <ClaimsOverview
            claims={dashboardData.userClaims}
            loading={loading}
            onRefresh={loadDashboardData}
          />
        </div>

        {/* Recent Activity */}
        <RecentActivity
          policies={dashboardData.userPolicies}
          claims={dashboardData.userClaims}
          loading={loading}
        />
      </div>
    </Layout>
  );
}
