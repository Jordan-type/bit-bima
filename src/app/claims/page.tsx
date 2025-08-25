"use client"

import React, { useState, useEffect, useMemo }  from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import {
  FiRefreshCw,
  FiFileText,
  FiPlus,
  FiFilter,
  FiLock,
  FiShield,
  FiZap,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";
import { useEthersProvider, useEthersSigner } from "../../hooks/ethers";
import ClaimCard from "../../components/Claims/ClaimCard";
import SubmitClaimModal from "../../components/Claims/SubmitClaimModal";
import ProcessClaimModal from "../../components/Claims/ProcessClaimModal";
import Layout from "../../components/Layout/Layout";
import { contractService } from "@/services/contract"; 
import { CLAIM_STATUS } from "@/constant";

const ClaimsPage = () => {
  const searchParams = useSearchParams();
  const initialPolicyId = searchParams.get("policyId") || "";

  const { address, isConnected } = useAccount();
  const chainId = useAccount().chain?.id || 1; // Default to mainnet if no chainId
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(initialPolicyId);
  const [statusFilter, setStatusFilter] = useState("");
  const [submitClaimModalOpen, setSubmitClaimModalOpen] = useState(false);
  const [processClaimModalOpen, setProcessClaimModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);


  // keep contract addresses aligned with the connected chain
  useEffect(() => {
    if (chainId) contractService.setChainId(chainId);
  }, [chainId]);

  // initial + refresh load
  useEffect(() => {
    if (isConnected && provider && address) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, provider, address]);

    // prefer query param policyId on first render (if it exists after policies load)
  useEffect(() => {
    if (initialPolicyId && policies?.length) {
      setSelectedPolicy(initialPolicyId);
    }
  }, [initialPolicyId, policies]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1) fetch user's policies
      const userPolicies = await contractService.getUserPolicies(address, provider);

      // Augment policies with remaining coverage (optional)
      const enriched = await Promise.all(
        userPolicies.map(async (p) => {
          try {
            const remaining = await contractService.getRemainingCoverage(p.policyId, provider);
            return { ...p, remainingCoverage: remaining };
          } catch {
            return p;
          }
        })
      );
      setPolicies(enriched);

      // 2) fetch claims for each policy
      let allClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(policy.policyId, provider);
        allClaims = allClaims.concat(policyClaims || []);
      }

      // newest first by submissionDate (contract returns seconds)
      allClaims.sort(
        (a, b) => parseInt(b.submissionDate || "0", 10) - parseInt(a.submissionDate || "0", 10)
      );

      setClaims(allClaims);
    } catch (err) {
      console.error("Error loading claims data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = useMemo(() => {
    let out = [...claims];

    if (selectedPolicy) {
      out = out.filter((c) => String(c.policyId) === String(selectedPolicy));
    }
    if (statusFilter !== "") {
      out = out.filter((c) => String(c.status) === String(statusFilter));
    }

    return out;
  }, [claims, selectedPolicy, statusFilter]);

  const handleProcessClaim = (claim) => {
    setSelectedClaim(claim);
    setProcessClaimModalOpen(true);
  };

  const stats = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter((c) => c.status === CLAIM_STATUS.PENDING).length;
    const approved = claims.filter(
      (c) => c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID
    ).length;
    const rejected = claims.filter((c) => c.status === CLAIM_STATUS.REJECTED).length;
    const totalAmount = claims.reduce((sum, c) => sum + parseFloat(c.claimAmount || "0"), 0);
    const approvedAmount = claims.reduce((sum, c) => {
      if (c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID) {
        return sum + parseFloat(c.approvedAmount || "0");
      }
      return sum;
    }, 0);

    return { total, pending, approved, rejected, totalAmount, approvedAmount };
  }, [claims]);

  /* ----------------------- UI ----------------------- */

  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          {/* pretty connect state (matches your old style) */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
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
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
                <FiFileText className="h-16 w-16 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiActivity className="h-4 w-4 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-xl animate-pulse" />
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Secure access to your insurance claims dashboard. Connect your Web3 wallet to
                view and submit insurance claims.
              </p>

              <button
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                // If you're using RainbowKit, swap this button for <ConnectButton />
              >
                <FiLock className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Connect Wallet</span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Insurance Claims</h1>
            <p className="mt-2 text-gray-600">Submit and track your insurance claims</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300"
            >
              <FiRefreshCw
                className={`-ml-1 mr-2 h-4 w-4 ${loading ? "animate-spin" : ""} group-hover:scale-110 transition-transform`}
              />
              Refresh
            </button>
            <button
              onClick={() => setSubmitClaimModalOpen(true)}
              className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="-ml-1 mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Submit Claim
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<FiFileText className="h-6 w-6 text-blue-600" />} title="Total Claims" value={stats.total} />
          <StatCard pulse title="Pending" value={stats.pending} gradient="from-yellow-500/5 to-orange-500/5" />
          <StatCard title="Approved" value={stats.approved} gradient="from-emerald-500/5 to-green-500/5" />
          <StatCard
            icon={<FiTrendingUp className="h-6 w-6 text-blue-600" />}
            title="Approved Amount"
            value={`${stats.approvedAmount.toFixed(4)} ETH`}
          />
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl">
          <div className="px-6 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <FiFilter className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <label htmlFor="policy-filter" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Policy
                  </label>
                  <select
                    id="policy-filter"
                    value={selectedPolicy}
                    onChange={(e) => setSelectedPolicy(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base bg-white/50 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-300"
                  >
                    <option value="">All Policies</option>
                    {policies.map((p) => (
                      <option key={p.policyId} value={p.policyId}>
                        Policy #{p.policyId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base bg-white/50 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-300"
                  >
                    <option value="">All Statuses</option>
                    <option value={CLAIM_STATUS.PENDING}>Pending</option>
                    <option value={CLAIM_STATUS.APPROVED}>Approved</option>
                    <option value={CLAIM_STATUS.REJECTED}>Rejected</option>
                    <option value={CLAIM_STATUS.PAID}>Paid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claims list */}
        {loading ? (
          <SkeletonList />
        ) : filteredClaims.length === 0 ? (
          <EmptyState hasAny={claims.length > 0} onAdd={() => setSubmitClaimModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClaims.map((claim) => (
              <ClaimCard
                key={claim.claimId}
                claim={claim}
                onProcess={() => handleProcessClaim(claim)}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SubmitClaimModal
        isOpen={submitClaimModalOpen}
        onClose={() => setSubmitClaimModalOpen(false)}
        policies={policies.filter((p) => p.status === 0)} // Only active policies
        onSuccess={() => {
          setSubmitClaimModalOpen(false);
          loadData();
        }}
      />

      <ProcessClaimModal
        isOpen={processClaimModalOpen}
        onClose={() => setProcessClaimModalOpen(false)}
        claim={selectedClaim}
        onSuccess={() => {
          setProcessClaimModalOpen(false);
          loadData();
        }}
      />
    </Layout>
  );
}

/* ---------------- small UI helpers ---------------- */

function StatCard({ icon, title, value, gradient = "from-blue-500/5 to-cyan-500/5", pulse = false }) {
  return (
    <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="relative p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {icon || <div className={`w-6 h-6 rounded-full ${pulse ? "bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse" : ""}`} />}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-2xl font-bold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/2 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg" />
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4" />
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2" />
            </div>
            <div className="mt-6 flex space-x-3">
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1" />
              <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasAny, onAdd }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
          <FiFileText className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {hasAny ? "No claims match your filters" : "No claims submitted"}
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          {hasAny
            ? "Try adjusting your filters to see more claims."
            : "You haven't submitted any insurance claims yet. Submit your first claim to get started."}
        </p>
        {!hasAny && (
          <button
            onClick={onAdd}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <FiFileText className="-ml-1 mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Submit Your First Claim
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ClaimsPage;
