import { useState, useEffect } from "react";
import { useEthersSigner } from "../../hooks/ethers";
import {
  contractService
} from "../../services/contract";
import {
  CLAIM_STATUS,
} from "../../constant/index";
import { ethers } from "ethers";
import {
  FiFileText,
  FiCheck,
  FiX,
  FiEye,
  FiClock,
  FiDollarSign,
  FiFilter,
  FiRefreshCw,
  FiActivity,
  FiShield,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useChainId } from "wagmi";
//
const ClaimManagement = () => {
  const signer = useEthersSigner();
  const [processingClaim, setProcessingClaim] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [approvedAmount, setApprovedAmount] = useState("");

  // Real claims data from contract
  const [allClaims, setAllClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // inside the component
const chainId = useChainId();
useEffect(() => {
  if (chainId) contractService.setChainId(chainId);
}, [chainId]);

  // Fetch claims on component mount and when signer changes
  useEffect(() => {
    if (signer) {
      fetchClaims();
    }
  }, [signer]);

  const fetchClaims = async () => {
    if (!signer) return;

    setLoading(true);
    try {
      // Use the event-based method for better performance
      const result = await contractService.fetchClaimsWithEvents(signer);
      if (result.success) {
        setAllClaims(result.claims);
      } else {
        toast.error("Failed to fetch claims");
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
      toast.error("Error loading claims data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClaims();
    setRefreshing(false);
    toast.success("Claims data refreshed!");
  };

  const getStatusColor = (status) => {
    const colors = {
      [CLAIM_STATUS.PENDING]:
        "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200",
      [CLAIM_STATUS.APPROVED]:
        "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200",
      [CLAIM_STATUS.REJECTED]:
        "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200",
      [CLAIM_STATUS.PAID]:
        "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200",
    };
    return (
      colors[status] ||
      "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200"
    );
  };

  const getStatusText = (status) => {
    const texts = {
      [CLAIM_STATUS.PENDING]: "Pending Review",
      [CLAIM_STATUS.APPROVED]: "Approved",
      [CLAIM_STATUS.REJECTED]: "Rejected",
      [CLAIM_STATUS.PAID]: "Paid",
    };
    return texts[status] || "Unknown";
  };

  const handleProcessClaim = async (claimId, newStatus, amount = "0") => {
    try {
      setProcessingClaim(claimId);

      // Validate inputs
      if (!claimId) {
        toast.error("Invalid claim ID");
        return;
      }

      // Prepare the approved amount
      let approvedAmount = "0";
      if (newStatus === CLAIM_STATUS.APPROVED) {
        if (!amount || parseFloat(amount) <= 0) {
          toast.error("Please enter a valid approved amount");
          return;
        }
        approvedAmount = amount.toString();
      }

      console.log("Calling processClaim with:", {
        claimId,
        newStatus,
        approvedAmount,
      });

      const result = await contractService.processClaim(
        claimId,
        newStatus,
        approvedAmount,
        signer
      );

      if (result.success) {
        toast.success(
          `Claim ${
            newStatus === CLAIM_STATUS.APPROVED ? "approved" : "rejected"
          } successfully!`
        );
        // Refresh claims data
        await fetchClaims();
      } else {
        console.error("Process claim failed:", result.error);
      }
    } catch (error) {
      console.error("Error processing claim:", error);
      toast.error("Failed to process claim");
    } finally {
      setProcessingClaim(null);
      setSelectedClaim(null);
      setApprovedAmount("");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Filter claims based on selected filter
  const filteredClaims = allClaims.filter((claim) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "pending")
      return claim.status === CLAIM_STATUS.PENDING;
    if (statusFilter === "processed")
      return claim.status !== CLAIM_STATUS.PENDING;
    return true;
  });

  const getClaimTypeIcon = (type) => {
    switch (type) {
      case "emergency":
        return "🚨";
      case "surgery":
        return "🏥";
      case "pharmacy":
        return "💊";
      case "dental":
        return "🦷";
      case "vision":
        return "👁️";
      default:
        return "📋";
    }
  };

  // Calculate statistics
  const pendingClaims = allClaims.filter(
    (c) => c.status === CLAIM_STATUS.PENDING
  );
  const approvedToday = allClaims.filter(
    (c) =>
      c.status === CLAIM_STATUS.APPROVED &&
      new Date(c.processedDate).toDateString() === new Date().toDateString()
  );
  const totalValue = allClaims.reduce(
    (sum, c) => sum + parseFloat(c.claimAmount || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Claim Management</h2>
          <p className="text-gray-600">Review and process insurance claims</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          <FiRefreshCw
            className={`w-4 h-4 mr-2 ${
              refreshing ? "animate-spin" : "group-hover:scale-110"
            } transition-transform`}
          />
          Refresh
        </button>
      </div>

      {/* Claims Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            icon: FiClock,
            title: "Pending Claims",
            value: pendingClaims.length,
            color: "yellow",
            bg: "from-yellow-100 to-orange-100",
            text: "text-yellow-600",
            glow: "from-yellow-500/10 to-orange-500/10",
          },
          {
            icon: FiCheck,
            title: "Approved Today",
            value: approvedToday.length,
            color: "green",
            bg: "from-emerald-100 to-green-100",
            text: "text-emerald-600",
            glow: "from-emerald-500/10 to-green-500/10",
          },
          {
            icon: FiDollarSign,
            title: "Total Value",
            value: `${totalValue.toFixed(4)} ETH`,
            color: "blue",
            bg: "from-blue-100 to-cyan-100",
            text: "text-blue-600",
            glow: "from-blue-500/10 to-cyan-500/10",
          },
          {
            icon: FiFileText,
            title: "Total Claims",
            value: allClaims.length,
            color: "purple",
            bg: "from-purple-100 to-pink-100",
            text: "text-purple-600",
            glow: "from-purple-500/10 to-pink-500/10",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.glow} rounded-full blur-xl opacity-50`}
              ></div>
            </div>

            <div className="relative flex items-center">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className={`h-6 w-6 ${stat.text}`} />
              </div>
              <div className="ml-4">
                <div className="text-sm font-bold text-gray-600">
                  {stat.title}
                </div>
                <div className={`text-2xl font-bold ${stat.text}`}>
                  {stat.value}
                </div>
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-40 pl-3 pr-10 py-2 text-base bg-white/50 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-300"
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

      {/* Claims List */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative">
          <div className="px-8 py-6 border-b border-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <FiActivity className="h-5 w-5 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {statusFilter === "pending"
                  ? "Pending"
                  : statusFilter === "processed"
                  ? "Processed"
                  : "All"}{" "}
                Claims
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-2xl p-6"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4"></div>
                        <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                      </div>
                      <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                <FiFileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No claims found
              </h3>
              <p className="text-gray-600">
                {statusFilter === "pending"
                  ? "No pending claims to review."
                  : "No claims match your filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/50">
              {filteredClaims.map((claim, index) => (
                <div
                  key={claim.claimId}
                  className="p-8 hover:bg-white/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg">
                        {getClaimTypeIcon(claim.claimType)}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          Claim #{claim.claimId}
                        </h4>
                        <p className="text-gray-700 font-medium mb-1">
                          {claim.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Policy #{claim.policyId} • {claim.providerName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {claim.claimAmount} ETH
                      </div>
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(
                          claim.status
                        )}`}
                      >
                        {getStatusText(claim.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-6">
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <span className="text-gray-500 font-medium block mb-1">
                        Claimant:
                      </span>
                      <div className="font-mono font-bold text-gray-900">
                        {formatAddress(claim.claimant)}
                      </div>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <span className="text-gray-500 font-medium block mb-1">
                        Submitted:
                      </span>
                      <div className="font-bold text-gray-900">
                        {formatDate(claim.submissionDate)}
                      </div>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/50">
                      <span className="text-gray-500 font-medium block mb-1">
                        Documents:
                      </span>
                      <div className="font-bold text-gray-900">
                        {claim.ipfsDocuments ? (
                          <button
                            onClick={() =>
                              window.open(
                                `https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`,
                                "_blank"
                              )
                            }
                            className="text-blue-600 hover:text-blue-500 font-semibold"
                          >
                            View IPFS
                          </button>
                        ) : (
                          "No documents"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for Pending Claims */}
                  {claim.status === CLAIM_STATUS.PENDING && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setApprovedAmount(claim.claimAmount);
                        }}
                        disabled={processingClaim === claim.claimId}
                        className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                      >
                        <FiCheck className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Approve
                        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>

                      <button
                        onClick={() =>
                          handleProcessClaim(
                            claim.claimId,
                            CLAIM_STATUS.REJECTED
                          )
                        }
                        disabled={processingClaim === claim.claimId}
                        className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                      >
                        <FiX className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Reject
                        <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>

                      {claim.ipfsDocuments && (
                        <button
                          onClick={() =>
                            window.open(
                              `https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`,
                              "_blank"
                            )
                          }
                          className="group inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300"
                        >
                          <FiEye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          Review Documents
                        </button>
                      )}
                    </div>
                  )}

                  {processingClaim === claim.claimId && (
                    <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-xl border border-blue-200">
                      <FiZap className="h-4 w-4 animate-pulse" />
                      <span className="text-sm font-semibold">
                        Processing claim...
                      </span>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl p-8 w-full max-w-md">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl"></div>
            </div>

            <div className="relative">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <FiCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Approve Claim #{selectedClaim.claimId}
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
                  max={selectedClaim.claimAmount}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all duration-300"
                />
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  Maximum: {selectedClaim.claimAmount} ETH
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() =>
                    handleProcessClaim(
                      selectedClaim.claimId,
                      CLAIM_STATUS.APPROVED,
                      approvedAmount
                    )
                  }
                  disabled={!approvedAmount || parseFloat(approvedAmount) <= 0}
                  className="flex-1 group inline-flex justify-center items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  Approve for {approvedAmount} ETH
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={() => {
                    setSelectedClaim(null);
                    setApprovedAmount("");
                  }}
                  className="flex-1 inline-flex justify-center items-center px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimManagement;
