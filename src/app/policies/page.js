"use client"

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../../hooks/ethers";
import Layout from "../../components/Layout/Layout";
import PolicyCard from "../../components/Policies/PolicyCard";
import PayPremiumModal from "../../components/Policies/PayPremiumModal";
import { contractService } from "../../services/contract";
import {
  FiRefreshCw,
  FiShield,
  FiLock,
  FiZap,
  FiTrendingUp,
  FiBarChart,
  FiActivity,
  FiGlobe,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

export default function Policies() {
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [payPremiumModalOpen, setPayPremiumModalOpen] = useState(false);

  useEffect(() => {
    if (isConnected && provider && address) {
      loadPolicies();
    }
  }, [isConnected, provider, address]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const userPolicies = await contractService.getUserPolicies(
        address,
        provider
      );

      // Enrich policies with additional data
      const enrichedPolicies = await Promise.all(
        userPolicies.map(async (policy) => {
          const [isValid, remainingCoverage, claims] = await Promise.all([
            contractService.isPolicyValid(policy.policyId, provider),
            contractService.getRemainingCoverage(policy.policyId, provider),
            contractService.getPolicyClaims(policy.policyId, provider),
          ]);

          return {
            ...policy,
            isValid,
            remainingCoverage,
            claims,
            claimsCount: claims.length,
          };
        })
      );

      setPolicies(enrichedPolicies);
    } catch (error) {
      console.error("Error loading policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPremium = (policy) => {
    setSelectedPolicy(policy);
    setPayPremiumModalOpen(true);
  };

  const handleCancelPolicy = async (policyId) => {
    if (
      !confirm(
        "Are you sure you want to cancel this policy? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await contractService.cancelPolicy(policyId, signer);
      if (result.success) {
        await loadPolicies(); // Refresh policies
      }
    } catch (error) {
      console.error("Error cancelling policy:", error);
    }
  };

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
                <FiShield className="h-16 w-16 text-blue-600" />
              </div>

              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiLock className="h-4 w-4 text-white" />
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
                Secure access to your blockchain insurance policies. Connect
                your Web3 wallet to view coverage, manage claims, and track your
                protection.
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiShield className="h-4 w-4 text-blue-600" />
                  <span>View all your insurance policies</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiZap className="h-4 w-4 text-emerald-600" />
                  <span>Manage premium payments</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiBarChart className="h-4 w-4 text-purple-600" />
                  <span>Track coverage usage</span>
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
        {/* Enhanced Header */}
        <div className="relative">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-cyan-50/30"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FiShield className="h-8 w-8 text-white drop-shadow-sm" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    My Policies
                  </h1>
                  <p className="text-lg text-gray-600">
                    Manage your blockchain-secured insurance coverage
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={loadPolicies}
                  disabled={loading}
                  className="group relative inline-flex items-center px-6 py-3 border border-gray-200/50 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                >
                  <FiRefreshCw
                    className={`mr-2 h-4 w-4 transition-transform ${
                      loading ? "animate-spin" : "group-hover:rotate-180"
                    }`}
                  />
                  <span>Refresh</span>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-200"></div>
                </button>

                {/* Network Status */}
                <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-emerald-800">
                    Blockchain Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="group animate-pulse">
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 overflow-hidden">
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>

                  <div className="relative">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3 mb-2"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                      <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                    </div>

                    <div className="flex space-x-3">
                      <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1"></div>
                      <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : policies.length === 0 ? (
          <div className="relative text-center py-16">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-12 shadow-xl border border-white/50 max-w-2xl mx-auto overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-white/50 to-blue-50/30"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>

              <div className="relative">
                {/* Enhanced empty state icon */}
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <FiShield className="h-12 w-12 text-gray-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <FiZap className="h-4 w-4 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No Policies Found
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  You haven't purchased any blockchain insurance policies yet.
                  Explore our plans to secure your health with cutting-edge
                  technology.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => (window.location.href = "/plans")}
                    className="group relative inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <FiShield className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span>Browse Insurance Plans</span>
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>

                  {/* Features preview */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center p-4 bg-white/50 rounded-xl border border-white/50">
                      <FiLock className="h-6 w-6 text-blue-600 mb-2" />
                      <span className="font-semibold text-gray-800">
                        Secure
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/50 rounded-xl border border-white/50">
                      <FiZap className="h-6 w-6 text-emerald-600 mb-2" />
                      <span className="font-semibold text-gray-800">
                        Instant
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/50 rounded-xl border border-white/50">
                      <FiGlobe className="h-6 w-6 text-purple-600 mb-2" />
                      <span className="font-semibold text-gray-800">
                        Global
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {policies.map((policy, index) => (
              <div
                key={policy.policyId}
                className="transform transition-all duration-500"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <PolicyCard
                  policy={policy}
                  onPayPremium={() => handlePayPremium(policy)}
                  onCancel={() => handleCancelPolicy(policy.policyId)}
                  onRefresh={loadPolicies}
                />
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Stats Summary */}
        {policies.length > 0 && (
          <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/50 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/50 to-gray-50/30"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl"></div>

            <div className="relative">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FiBarChart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Portfolio Summary
                  </h3>
                  <p className="text-gray-600">
                    Your blockchain insurance overview
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                      <FiShield className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-indigo-600 mb-2">
                      {policies.length}
                    </p>
                    <p className="text-sm font-semibold text-gray-600">
                      Total Policies
                    </p>
                  </div>
                </div>

                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                      <FiCheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-emerald-600 mb-2">
                      {policies.filter((p) => p.status === 0).length}
                    </p>
                    <p className="text-sm font-semibold text-gray-600">
                      Active Policies
                    </p>
                  </div>
                </div>

                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                      <FiTrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {policies
                        .reduce(
                          (sum, p) => sum + parseFloat(p.coverageAmount || 0),
                          0
                        )
                        .toFixed(2)}
                    </p>
                    <p className="text-sm font-semibold text-gray-600">
                      Total Coverage (ETH)
                    </p>
                  </div>
                </div>

                <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-violet-50/50 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                      <FiActivity className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-3xl font-bold text-purple-600 mb-2">
                      {policies.reduce(
                        (sum, p) => sum + (p.claimsCount || 0),
                        0
                      )}
                    </p>
                    <p className="text-sm font-semibold text-gray-600">
                      Total Claims
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional insights */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-200/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <FiLock className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      All policies secured by blockchain smart contracts
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">
                      Real-time verification active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pay Premium Modal */}
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
