import { useState } from "react";
import {
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCheck,
  FiX,
  FiEye,
  FiShield,
  FiZap,
  FiLock,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { CLAIM_STATUS } from "../../constant/index";
import type { Claim } from "@/services/contract";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";
import { useChainId } from "wagmi";
import { getFromIPFS } from "../../services/pinata";

type Props = {
  claim: Claim & {
    claimant: `0x${string}`;
    policyId?: bigint | string | number;
    ipfsDocuments?: string;
  };
  onProcess: (c: Claim) => void;
  onRefresh: () => void;
};

type IconLike = React.ComponentType<{ className?: string }>;

const ClaimCard: React.FC<Props> = ({ claim, onProcess }) => {
  const chainId = useChainId();
  const [expanded, setExpanded] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState(false);

  const getStatusColor = (status: number) => {
    const colors: Record<number, string> = {
      [CLAIM_STATUS.PENDING]:
        "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-200/50",
      [CLAIM_STATUS.APPROVED]:
        "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-emerald-200/50",
      [CLAIM_STATUS.REJECTED]:
        "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200/50",
      [CLAIM_STATUS.PAID]:
        "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border-blue-200/50",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (status: number) => {
    const texts: Record<number, string> = {
      [CLAIM_STATUS.PENDING]: "Pending Review",
      [CLAIM_STATUS.APPROVED]: "Approved",
      [CLAIM_STATUS.REJECTED]: "Rejected",
      [CLAIM_STATUS.PAID]: "Paid",
    };
    return texts[status] || "Unknown";
  };

  const getStatusIcon = (status: number) => {
    const icons: Record<number, IconLike> = {
      [CLAIM_STATUS.PENDING]: FiClock,
      [CLAIM_STATUS.APPROVED]: FiCheck,
      [CLAIM_STATUS.REJECTED]: FiX,
      [CLAIM_STATUS.PAID]: FiCheckCircle,
    };
    return icons[status] || FiClock;
  };

  const getStatusIndicator = (status: number) => {
    const indicators: Record<number, { color: string; animate: string }> = {
      [CLAIM_STATUS.PENDING]: {
        color: "bg-amber-500",
        animate: "animate-pulse",
      },
      [CLAIM_STATUS.APPROVED]: {
        color: "bg-emerald-500",
        animate: "animate-pulse",
      },
      [CLAIM_STATUS.REJECTED]: { color: "bg-red-500", animate: "" },
      [CLAIM_STATUS.PAID]: { color: "bg-blue-500", animate: "" },
    };
    return indicators[status] || { color: "bg-gray-500", animate: "" };
  };

  const getStatusGradient = (status: number) => {
    const gradients: Record<number, string> = {
      [CLAIM_STATUS.PENDING]: "from-amber-500 to-yellow-500",
      [CLAIM_STATUS.APPROVED]: "from-emerald-500 to-green-500",
      [CLAIM_STATUS.REJECTED]: "from-red-500 to-rose-500",
      [CLAIM_STATUS.PAID]: "from-blue-500 to-cyan-500",
    };
    return gradients[status] || "from-gray-500 to-gray-600";
  };



  const handleViewDocuments = async () => {
    if (claim?.ipfsDocuments) {
      try {
        setViewingDocuments(true);
        const documents = await getFromIPFS(claim.ipfsDocuments);
        if (documents) {
          window.open(
            `https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`,
            "_blank"
          );
        }
      } catch (error) {
        console.error("Error viewing documents:", error);
      } finally {
        setViewingDocuments(false);
      }
    }
  };

  const StatusIcon = getStatusIcon(claim.status);
  const statusIndicator = getStatusIndicator(claim.status);
  const statusGradient = getStatusGradient(claim.status);

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-cyan-50/30"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>

      {/* Header */}
      <div className="relative p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${statusGradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <StatusIcon className="h-7 w-7 text-white drop-shadow-sm" />
              </div>

              {/* Status indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusIndicator.color} rounded-full border-2 border-white ${statusIndicator.animate}`}
              ></div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Claim #{claim.claimId}
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">
                  Policy #{claim.policyId}
                </p>
                <div className="flex items-center space-x-1">
                  <FiShield className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    Blockchain Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(
              claim.status
            )}`}
          >
            {getStatusText(claim.status)}
          </span>
        </div>

        {/* Enhanced Description */}
        {claim.description && (
          <div className="mb-6">
            <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
              <div className="flex items-start space-x-3">
                <FiFileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">
                    Claim Description
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {claim.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Amount Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-xl border border-blue-200/50 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FiDollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">
                Claimed Amount
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {toEthStr(claim.claimAmount)} ETH
            </p>
          </div>

          {(claim.status === CLAIM_STATUS.APPROVED ||
            claim.status === CLAIM_STATUS.PAID) && (
            <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm rounded-xl border border-emerald-200/50 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <FiCheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  Approved Amount
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-900">
                {toEthStr(claim.approvedAmount)} ETH
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gradient-to-r from-purple-50/50 to-violet-50/50 rounded-lg border border-purple-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiCalendar className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-800">
                Submitted
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {tsToDateStr(claim.submissionDate)}
            </p>
          </div>

          <div className="p-3 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 rounded-lg border border-indigo-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiUser className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-semibold text-indigo-800">
                Claimant
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900 truncate">
              {claim.claimant.slice(0, 6)}...{claim.claimant.slice(-4)}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="relative px-6 py-6 bg-gradient-to-r from-gray-50/50 to-slate-50/50 border-b border-gray-200/50">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FiZap className="h-5 w-5 text-blue-600" />
            <span>Detailed Information</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Submission Date
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {tsToDateStr(claim.submissionDate)}
                </p>
              </div>

              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">  
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Claimant Address
                </p>
                <p className="text-sm font-bold text-gray-900 break-all">
                  {claim.claimant}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Processed Date
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {claim.processedDate && claim.processedDate !== 0n ? tsToDateStr(claim.processedDate) : "Not processed yet"}
                </p>
              </div>

              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  IPFS Documents
                </p>
                <div className="text-sm">
                  {claim.ipfsDocuments ? (
                    <button
                      onClick={handleViewDocuments}
                      disabled={viewingDocuments}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      <FiEye className="h-4 w-4 mr-1" />
                      {viewingDocuments ? "Loading..." : "View Documents"}
                    </button>
                  ) : (
                    <span className="text-gray-500">No documents</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Status-specific information */}
          {claim.status === CLAIM_STATUS.REJECTED && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiXCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-800 mb-1">
                    Claim Rejected
                  </h4>
                  <p className="text-sm text-red-700">
                    This claim has been reviewed and rejected. Contact support
                    if you believe this is an error.
                  </p>
                </div>
              </div>
            </div>
          )}

          {claim.status === CLAIM_STATUS.APPROVED && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-800 mb-1">
                    Claim Approved
                  </h4>
                  <p className="text-sm text-emerald-700">
                    Your claim has been approved for{" "}
                    {toEthStr(claim.approvedAmount)} ETH. Payment will
                    be processed shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {claim.status === CLAIM_STATUS.PAID && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-800 mb-1">
                    Claim Paid
                  </h4>
                  <p className="text-sm text-blue-700">
                    Payment of {toEthStr(claim.approvedAmount)} ETH has
                    been sent to your wallet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Actions */}
      <div className="relative px-6 py-6">
        <div className="flex flex-wrap gap-3">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200/50 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            {expanded ? (
              <>
                <FiChevronUp className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                Less Details
              </>
            ) : (
              <>
                <FiChevronDown className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                More Details
              </>
            )}
          </button>

          {/* View Documents Button */}
          {claim.ipfsDocuments && (
            <button
              onClick={handleViewDocuments}
              disabled={viewingDocuments}
              className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200/50 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
            >
              <FiEye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
              {viewingDocuments ? "Loading..." : "View Documents"}
            </button>
          )}

          {/* Process Claim Button */}
          {claim.status === CLAIM_STATUS.PENDING && (
            <button
              onClick={() => onProcess(claim)}
              className="group/btn inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FiFileText className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
              View Claim
            </button>
          )}

          {/* Explorer Button */}
          <button
            onClick={() =>
              window.open(
                celoscanAddress(claim.claimant, chainId),
                "_blank"
              )
            }
            className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200/50 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <FiExternalLink className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            View on Explorer
          </button>
        </div>

        {/* Blockchain Status Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Smart contract verified</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <FiLock className="h-3 w-3" />
              <span>IPFS secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Border Glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${statusGradient} opacity-0 group-hover:opacity-10 transition-all duration-300 pointer-events-none`}
      ></div>
    </div>
  );
};

export default ClaimCard;
