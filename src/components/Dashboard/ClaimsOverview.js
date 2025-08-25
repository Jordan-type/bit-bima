import {
  FiRefreshCw,
  FiFileText,
  FiClock,
  FiCheck,
  FiX,
  FiShield,
  FiZap,
  FiTrendingUp,
} from "react-icons/fi";
import {
  contractService,
  CLAIM_STATUS,
  PLAN_TYPES,
  PAYMENT_TYPES,
  POLICY_STATUS,
} from "../../services/contract";

// Mock CLAIM_STATUS for demonstration - replace with your actual import
// const CLAIM_STATUS = {
//   PENDING: 0,
//   APPROVED: 1,
//   REJECTED: 2,
//   PAID: 3,
// };

const ClaimsOverview = ({ claims = [], loading = false, onRefresh }) => {
  const getStatusColor = (status) => {
    const colors = {
      [CLAIM_STATUS.PENDING]:
        "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-amber-200/50",
      [CLAIM_STATUS.APPROVED]:
        "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border border-emerald-200/50",
      [CLAIM_STATUS.REJECTED]:
        "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200/50",
      [CLAIM_STATUS.PAID]:
        "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 border border-blue-200/50",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getStatusText = (status) => {
    const texts = {
      [CLAIM_STATUS.PENDING]: "Pending",
      [CLAIM_STATUS.APPROVED]: "Approved",
      [CLAIM_STATUS.REJECTED]: "Rejected",
      [CLAIM_STATUS.PAID]: "Paid",
    };
    return texts[status] || "Unknown";
  };

  const getStatusIcon = (status) => {
    const icons = {
      [CLAIM_STATUS.PENDING]: FiClock,
      [CLAIM_STATUS.APPROVED]: FiCheck,
      [CLAIM_STATUS.REJECTED]: FiX,
      [CLAIM_STATUS.PAID]: FiShield,
    };
    return icons[status] || FiClock;
  };

  const getStatusIconColor = (status) => {
    const colors = {
      [CLAIM_STATUS.PENDING]: "text-amber-600",
      [CLAIM_STATUS.APPROVED]: "text-emerald-600",
      [CLAIM_STATUS.REJECTED]: "text-red-600",
      [CLAIM_STATUS.PAID]: "text-blue-600",
    };
    return colors[status] || "text-gray-600";
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const pendingClaims = claims.filter((c) => c.status === CLAIM_STATUS.PENDING);

  return (
    <div className="relative bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-white/50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-cyan-50/30"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>

      <div className="relative px-6 py-6 sm:p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <FiFileText className="h-5 w-5 text-white" />
              </div>
              {pendingClaims.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {pendingClaims.length}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recent Claims</h3>
              <p className="text-sm text-gray-600">
                Track your insurance claim status
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="group relative inline-flex items-center px-4 py-2.5 border border-gray-200/50 shadow-sm text-sm leading-4 font-semibold rounded-xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
          >
            <FiRefreshCw
              className={`h-4 w-4 mr-2 transition-transform ${
                loading ? "animate-spin" : "group-hover:rotate-180"
              } ${loading ? "text-blue-600" : ""}`}
            />
            <span>Refresh</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-200"></div>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="relative border border-gray-200/50 rounded-xl p-6 bg-white/50 backdrop-blur-sm overflow-hidden"
              >
                <div className="animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-10 w-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4 mb-2"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : claims.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiFileText className="h-12 w-12 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <FiZap className="h-4 w-4 text-white" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No Claims Submitted
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Ready to submit your first insurance claim? Our blockchain-powered
              system ensures secure and transparent processing.
            </p>

            <button
              type="button"
              className="group relative inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              <FiFileText className="mr-2 h-5 w-5" />
              <span>Submit Your First Claim</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </div>
        ) : (
          /* Claims List */
          <div className="space-y-4">
            {claims.slice(0, 3).map((claim, index) => {
              const StatusIcon = getStatusIcon(claim.status);
              const statusIconColor = getStatusIconColor(claim.status);

              return (
                <div
                  key={claim.claimId || index}
                  className="group relative border border-gray-200/50 rounded-xl p-6 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:border-blue-200/50 overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-300"></div>

                  <div className="relative flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200/50 shadow-sm">
                          <StatusIcon
                            className={`h-6 w-6 ${statusIconColor}`}
                          />
                        </div>
                        {claim.status === CLAIM_STATUS.PENDING && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-base font-bold text-gray-900">
                            Claim #{claim.claimId || "N/A"}
                          </p>
                          <FiTrendingUp className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                          {claim.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(
                        claim.status
                      )}`}
                    >
                      {getStatusText(claim.status)}
                    </span>
                  </div>

                  <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg border border-blue-100/50">
                      <FiZap className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-700">
                        <span className="font-semibold">Amount:</span>{" "}
                        {parseFloat(claim.claimAmount || 0).toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg border border-purple-100/50">
                      <FiClock className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-700">
                        <span className="font-semibold">Submitted:</span>{" "}
                        {formatDate(claim.submissionDate)}
                      </span>
                    </div>
                  </div>

                  {(claim.status === CLAIM_STATUS.APPROVED ||
                    claim.status === CLAIM_STATUS.PAID) && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200/50">
                      <div className="flex items-center space-x-2">
                        <FiCheck className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-800">
                          Approved Amount:{" "}
                          {parseFloat(claim.approvedAmount || 0).toFixed(4)} ETH
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {claims.length > 3 && (
              <div className="text-center pt-4">
                <button className="group inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                  <span>View all {claims.length} claims</span>
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsOverview;
