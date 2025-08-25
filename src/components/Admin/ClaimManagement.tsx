import React, { useEffect, useMemo, useState } from "react";
import { FiFileText, FiCheck, FiX, FiEye, FiClock, FiDollarSign, 
  FiFilter, FiRefreshCw, FiActivity, FiShield, FiTrendingUp, FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useChainId, usePublicClient, useWalletClient } from "wagmi";
import { contractService } from "../../services/contract";
import { CLAIM_STATUS } from "../../constant/index";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";

type UiClaim = {
  claimId: bigint;
  policyId: bigint;
  claimant: string;
  claimAmount: bigint;
  approvedAmount: bigint;
  status: number;
  submissionDate: bigint;
  processedDate: bigint;
  ipfsDocuments: string;
  description: string;
};

const ClaimManagement: React.FC = () => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [processingClaim, setProcessingClaim] = useState<bigint | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<UiClaim | null>(null);
  const [statusFilter, setStatusFilter] = useState<"pending" | "processed" | "all">("pending");
  const [approvedAmount, setApprovedAmount] = useState<string>("");

  const [allClaims, setAllClaims] = useState<UiClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // inside the component
  useEffect(() => {
    if (chainId) contractService.setChainId(chainId);
}, [chainId]);

  useEffect(() => {
    (async () => {
      if (!publicClient) return;
      setLoading(true);
      try {
        const claims = await contractService.getAllClaims(publicClient);
        setAllClaims(claims as UiClaim[]);
      } catch (e) {
        console.error(e);
        toast.error("Error loading claims data");
      } finally {
        setLoading(false);
      }
    })();
  }, [publicClient]);

  const handleRefresh = async () => {
    if (!publicClient) return;
    setRefreshing(true);
    try {
      const claims = await contractService.getAllClaims(publicClient);
      setAllClaims(claims as UiClaim[]);
      toast.success("Claims data refreshed!");
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  const filteredClaims = useMemo(() => {
    if (statusFilter === "all") return allClaims;
    if (statusFilter === "pending")
      return allClaims.filter((c) => c.status === CLAIM_STATUS.PENDING);
    return allClaims.filter((c) => c.status !== CLAIM_STATUS.PENDING);
  }, [allClaims, statusFilter]);

  const pendingClaims = allClaims.filter((c) => c.status === CLAIM_STATUS.PENDING);
  const approvedToday = allClaims.filter(
    (c) =>
      c.status === CLAIM_STATUS.APPROVED &&
      new Date(Number(c.processedDate) * 1000).toDateString() === new Date().toDateString()
  );
  const totalValue = allClaims.reduce((sum, c) => sum + Number(toEthStr(c.claimAmount)), 0);

  const fmtAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
  const fmtTs = (s: bigint) =>
    s ? new Date(Number(s) * 1000).toLocaleString() : "N/A";
  const getStatusText = (s: number) =>
    s === CLAIM_STATUS.PENDING ? "Pending Review" :
    s === CLAIM_STATUS.APPROVED ? "Approved" :
    s === CLAIM_STATUS.REJECTED ? "Rejected" :
    s === CLAIM_STATUS.PAID ? "Paid" : "Unknown";

  const handleProcessClaim = async (claimId: bigint, newStatus: number, amount?: string) => {
    if (!walletClient || !publicClient) return toast.error("Wallet not connected");
    try {
      setProcessingClaim(claimId);
      let amt = "0";
      if (newStatus === CLAIM_STATUS.APPROVED) {
        if (!amount || Number(amount) <= 0) {
          toast.error("Enter an approved amount");
          return;
        }
        amt = amount;
      }

      const res = await contractService.processClaim(
        claimId,
        newStatus,
        amt,
        walletClient,
        publicClient
      );
      if (res.success) {
        toast.success(newStatus === CLAIM_STATUS.APPROVED ? "Claim approved" : "Claim rejected");
        await handleRefresh();
      } else {
        toast.error("Transaction failed");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to process claim");
    } finally {
      setProcessingClaim(null);
      setSelectedClaim(null);
      setApprovedAmount("");
    }
  };

  return (
        <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Claim Management</h2>
          <p className="text-gray-600">Review and process insurance claims</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-xl transition-all duration-300 disabled:opacity-50">
          <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : "group-hover:scale-110"}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: FiClock, title: "Pending Claims", value: pendingClaims.length, text: "text-yellow-600", bg: "from-yellow-100 to-orange-100", glow: "from-yellow-500/10 to-orange-500/10" },
          { icon: FiCheck, title: "Approved Today", value: approvedToday.length, text: "text-emerald-600", bg: "from-emerald-100 to-green-100", glow: "from-emerald-500/10 to-green-500/10" },
          { icon: FiDollarSign, title: "Total Value", value: `${totalValue.toFixed(4)} ETH`, text: "text-blue-600", bg: "from-blue-100 to-cyan-100", glow: "from-blue-500/10 to-cyan-500/10" },
          { icon: FiFileText, title: "Total Claims", value: allClaims.length, text: "text-purple-600", bg: "from-purple-100 to-pink-100", glow: "from-purple-500/10 to-pink-500/10" },
        ].map((s, i) => (
          <div key={i} className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6 overflow-hidden group">
            <div className="relative flex items-center">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-6 w-6 ${s.text}`} />
              </div>
              <div className="ml-4">
                <div className="text-sm font-bold text-gray-600">{s.title}</div>
                <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <FiFilter className="h-5 w-5 text-purple-600" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-40 pl-3 pr-10 py-2 bg-white/50 border border-white/50 rounded-xl"
          >
            <option value="pending">Pending Claims</option>
            <option value="processed">Processed Claims</option>
            <option value="all">All Claims</option>
          </select>
          <span className="text-sm font-medium text-gray-600">
            Showing {filteredClaims.length} claims
          </span>
        </div>
      </div>

      {/* List */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden">
        <div className="relative">
          <div className="px-8 py-6 border-b border-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <FiActivity className="h-5 w-5 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {statusFilter === "pending" ? "Pending" : statusFilter === "processed" ? "Processed" : "All"} Claims
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="p-8">Loading...</div>
          ) : filteredClaims.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                <FiFileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No claims found</h3>
              <p className="text-gray-600">
                {statusFilter === "pending" ? "No pending claims to review." : "No claims match your filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/50">
              {filteredClaims.map((claim) => (
                <div key={claim.claimId.toString()} className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">Claim #{claim.claimId.toString()}</h4>
                      <p className="text-gray-700 font-medium mb-1">{claim.description || "Claim"}</p>
                      <p className="text-sm text-gray-500">Policy #{claim.policyId.toString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {Number(toEthStr(claim.claimAmount)).toFixed(4)} ETH
                      </div>
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border">
                        {getStatusText(claim.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
                    <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                      <span className="text-gray-500 font-medium block mb-1">Claimant:</span>
                      <div className="font-mono font-bold text-gray-900">{fmtAddr(claim.claimant)}</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                      <span className="text-gray-500 font-medium block mb-1">Submitted:</span>
                      <div className="font-bold text-gray-900">{fmtTs(claim.submissionDate)}</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-4 border border-white/50">
                      <span className="text-gray-500 font-medium block mb-1">Documents:</span>
                      <div className="font-bold text-gray-900">
                        {claim.ipfsDocuments ? (
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-500 font-semibold"
                          >
                            View IPFS
                          </a>
                        ) : (
                          "No documents"
                        )}
                      </div>
                    </div>
                  </div>

                  {claim.status === CLAIM_STATUS.PENDING && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setApprovedAmount(
                            Math.min(
                              Number(toEthStr(claim.claimAmount)),
                              999999
                            ).toString()
                          );
                        }}
                        disabled={processingClaim === claim.claimId}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl"
                      >
                        <FiCheck className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleProcessClaim(claim.claimId, CLAIM_STATUS.REJECTED)}
                        disabled={processingClaim === claim.claimId}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl"
                      >
                        <FiX className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                      {claim.ipfsDocuments && (
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`}
                          target="_blank"
                          className="inline-flex items-center px-6 py-3 bg-white/80 border border-white/50 rounded-xl"
                        >
                          <FiEye className="w-4 h-4 mr-2" />
                          Review Documents
                        </a>
                      )}
                    </div>
                  )}

                  {processingClaim === claim.claimId && (
                    <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-xl border border-blue-200">
                      <FiZap className="h-4 w-4 animate-pulse" />
                      <span className="text-sm font-semibold">Processing claim...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 grid place-items-center p-4">
          <div className="bg-white/95 border border-white/50 shadow-2xl rounded-2xl p-8 w-full max-w-md relative">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <FiCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Approve Claim #{selectedClaim.claimId.toString()}
                </h3>
                <p className="text-gray-600">Set the approved amount</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Approved Amount (ETH)
              </label>
              <input
                type="number"
                step="0.0001"
                max={Number(toEthStr(selectedClaim.claimAmount))}
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-white/50 rounded-xl"
              />
              <p className="text-sm text-gray-500 mt-2 font-medium">
                Maximum: {Number(toEthStr(selectedClaim.claimAmount)).toFixed(4)} ETH
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleProcessClaim(selectedClaim.claimId, CLAIM_STATUS.APPROVED, approvedAmount)}
                disabled={!approvedAmount || Number(approvedAmount) <= 0}
                className="flex-1 inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl"
              >
                Approve for {approvedAmount || "0"} ETH
              </button>
              <button
                onClick={() => { setSelectedClaim(null); setApprovedAmount(""); }}
                className="flex-1 inline-flex justify-center items-center px-6 py-3 bg-white/80 border border-white/50 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimManagement;
