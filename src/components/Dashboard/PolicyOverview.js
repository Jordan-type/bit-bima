import {
  FiRefreshCw,
  FiShield,
  FiCalendar,
  FiDollarSign,
  FiAward,
  FiStar,
  FiZap,
  FiLock,
  FiTrendingUp,
} from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";
import {
  contractService,
  CLAIM_STATUS,
  PLAN_TYPES,
  PAYMENT_TYPES,
  POLICY_STATUS,
} from "../../services/contract";

// Mock constants for demonstration - replace with your actual imports
// const POLICY_STATUS = {
//   ACTIVE: 0,
//   EXPIRED: 1,
//   CANCELLED: 2,
//   SUSPENDED: 3,
// };

// const PLAN_TYPES = {
//   BASIC: 0,
//   PREMIUM: 1,
//   PLATINUM: 2,
// };

const PolicyOverview = ({ policies = [], loading = false, onRefresh }) => {
  const getPlanName = (planType) => {
    const names = {
      [PLAN_TYPES.BASIC]: "Basic",
      [PLAN_TYPES.PREMIUM]: "Premium",
      [PLAN_TYPES.PLATINUM]: "Platinum",
    };
    return names[planType] || "Unknown";
  };

  const getPlanIcon = (planType) => {
    const icons = {
      [PLAN_TYPES.BASIC]: FiShield,
      [PLAN_TYPES.PREMIUM]: FiAward,
      [PLAN_TYPES.PLATINUM]: TfiCrown,
    };
    return icons[planType] || FiShield;
  };

  const getPlanColor = (planType) => {
    const colors = {
      [PLAN_TYPES.BASIC]: "from-blue-500 to-cyan-500",
      [PLAN_TYPES.PREMIUM]: "from-purple-500 to-pink-500",
      [PLAN_TYPES.PLATINUM]: "from-amber-500 to-orange-500",
    };
    return colors[planType] || "from-gray-500 to-gray-600";
  };

  const getStatusColor = (status) => {
    const colors = {
      [POLICY_STATUS.ACTIVE]:
        "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border border-emerald-200/50",
      [POLICY_STATUS.EXPIRED]:
        "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200/50",
      [POLICY_STATUS.CANCELLED]:
        "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border border-gray-200/50",
      [POLICY_STATUS.SUSPENDED]:
        "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-amber-200/50",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getStatusText = (status) => {
    const texts = {
      [POLICY_STATUS.ACTIVE]: "Active",
      [POLICY_STATUS.EXPIRED]: "Expired",
      [POLICY_STATUS.CANCELLED]: "Cancelled",
      [POLICY_STATUS.SUSPENDED]: "Suspended",
    };
    return texts[status] || "Unknown";
  };

  const getStatusIndicator = (status) => {
    const indicators = {
      [POLICY_STATUS.ACTIVE]: "bg-emerald-500 animate-pulse",
      [POLICY_STATUS.EXPIRED]: "bg-red-500",
      [POLICY_STATUS.CANCELLED]: "bg-gray-500",
      [POLICY_STATUS.SUSPENDED]: "bg-amber-500 animate-pulse",
    };
    return indicators[status] || "bg-gray-500";
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const activePolicies = policies.filter(
    (p) => p.status === POLICY_STATUS.ACTIVE
  );

  return (
    <div className="relative bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-white/50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-white/50 to-blue-50/30"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>

      <div className="relative px-6 py-6 sm:p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <FiShield className="h-5 w-5 text-white" />
              </div>
              {activePolicies.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {activePolicies.length}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Policy Overview
              </h3>
              <p className="text-sm text-gray-600">
                Your insurance coverage at a glance
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="group relative inline-flex items-center px-4 py-2.5 border border-gray-200/50 shadow-sm text-sm leading-4 font-semibold rounded-xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:shadow-purple-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200"
          >
            <FiRefreshCw
              className={`h-4 w-4 mr-2 transition-transform ${
                loading ? "animate-spin" : "group-hover:rotate-180"
              } ${loading ? "text-purple-600" : ""}`}
            />
            <span>Refresh</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-200"></div>
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
                    <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-2"></div>
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
        ) : policies.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiShield className="h-12 w-12 text-purple-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <FiLock className="h-4 w-4 text-white" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No Policies Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Protect yourself with our blockchain-secured insurance policies.
              Choose from Basic, Premium, or Platinum coverage.
            </p>

            <button
              type="button"
              className="group relative inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105"
            >
              <FiShield className="mr-2 h-5 w-5" />
              <span>Browse Insurance Plans</span>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          </div>
        ) : (
          /* Policies List */
          <div className="space-y-4">
            {policies.slice(0, 3).map((policy, index) => {
              const PlanIcon = getPlanIcon(policy.planType);
              const planGradient = getPlanColor(policy.planType);

              return (
                <div
                  key={policy.policyId || index}
                  className="group relative border border-gray-200/50 rounded-xl p-6 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-200/50 overflow-hidden"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>

                  <div className="relative flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 bg-gradient-to-br ${planGradient} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <PlanIcon className="h-6 w-6 text-white" />
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getStatusIndicator(
                            policy.status
                          )}`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-base font-bold text-gray-900">
                            {getPlanName(policy.planType)} Plan #
                            {policy.policyId || "N/A"}
                          </p>
                          {policy.planType === PLAN_TYPES.PREMIUM && (
                            <FiStar className="h-4 w-4 text-purple-500" />
                          )}
                          {policy.planType === PLAN_TYPES.PLATINUM && (
                            <TfiCrown className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center space-x-1">
                          <FiShield className="h-3 w-3" />
                          <span>
                            Coverage:{" "}
                            {parseFloat(policy.coverageAmount || 0).toFixed(2)}{" "}
                            ETH
                          </span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(
                        policy.status
                      )}`}
                    >
                      {getStatusText(policy.status)}
                    </span>
                  </div>

                  <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg border border-blue-100/50">
                      <FiCalendar className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-700">
                        <span className="font-semibold">Expires:</span>{" "}
                        {formatDate(policy.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-lg border border-emerald-100/50">
                      <FiDollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="text-gray-700">
                        <span className="font-semibold">Premium:</span>{" "}
                        {parseFloat(policy.premium || 0).toFixed(4)} ETH
                      </span>
                    </div>
                  </div>

                  {/* Additional policy details for active policies */}
                  {policy.status === POLICY_STATUS.ACTIVE && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FiZap className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-emerald-800">
                            Policy Active & Protected
                          </span>
                        </div>
                        <FiTrendingUp className="h-4 w-4 text-emerald-600" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {policies.length > 3 && (
              <div className="text-center pt-4">
                <button className="group inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200">
                  <span>View all {policies.length} policies</span>
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

export default PolicyOverview;
