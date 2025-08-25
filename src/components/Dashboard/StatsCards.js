import {
  FiShield,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiArrowUpRight,
  FiZap,
  FiLock,
  FiActivity,
} from "react-icons/fi";
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

// const CLAIM_STATUS = {
//   PENDING: 0,
//   APPROVED: 1,
//   REJECTED: 2,
//   PAID: 3,
// };

const StatsCards = ({
  userPolicies = [],
  userClaims = [],
  contractStats = {},
  loading = false,
}) => {
  // Calculate user stats
  const activePolicies = userPolicies.filter(
    (p) => p.status === POLICY_STATUS.ACTIVE
  ).length;

  const pendingClaims = userClaims.filter(
    (c) => c.status === CLAIM_STATUS.PENDING
  ).length;

  const totalCoverage = userPolicies.reduce((sum, policy) => {
    if (policy.status === POLICY_STATUS.ACTIVE) {
      return sum + parseFloat(policy.coverageAmount || 0);
    }
    return sum;
  }, 0);

  const totalPaid = userPolicies.reduce(
    (sum, policy) => sum + parseFloat(policy.totalPaid || 0),
    0
  );

  const stats = [
    {
      name: "Active Policies",
      value: loading ? "..." : activePolicies.toString(),
      icon: FiShield,
      change: "+2.1%",
      changeType: "positive",
      color: "indigo",
      gradient: "from-indigo-500 to-blue-600",
      bgGradient: "from-indigo-50 to-blue-50",
      description: "Blockchain-secured coverage",
    },
    {
      name: "Total Coverage",
      value: loading ? "..." : `${totalCoverage.toFixed(2)} ETH`,
      icon: FiDollarSign,
      change: "+5.4%",
      changeType: "positive",
      color: "green",
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-50 to-green-50",
      description: "Protected value on-chain",
    },
    {
      name: "Pending Claims",
      value: loading ? "..." : pendingClaims.toString(),
      icon: FiFileText,
      change: pendingClaims > 0 ? "Action needed" : "All clear",
      changeType: pendingClaims > 0 ? "neutral" : "positive",
      color: "yellow",
      gradient: "from-amber-500 to-yellow-600",
      bgGradient: "from-amber-50 to-yellow-50",
      description: "Smart contract processing",
    },
    {
      name: "Total Paid",
      value: loading ? "..." : `${totalPaid.toFixed(4)} ETH`,
      icon: FiTrendingUp,
      change: "+12.5%",
      changeType: "positive",
      color: "purple",
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      description: "Lifetime contributions",
    },
  ];

  const getChangeIcon = (changeType) => {
    if (changeType === "positive") return FiTrendingUp;
    if (changeType === "negative") return FiArrowUpRight;
    return FiActivity;
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const ChangeIcon = getChangeIcon(stat.changeType);

        return (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background Pattern */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-30`}
            ></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

            {/* Floating particles */}
            <div className="absolute top-4 right-4 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
            <div
              className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-white/20 rounded-full animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>

            <div className="relative p-6">
              {/* Icon Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <stat.icon
                      className="h-6 w-6 text-white drop-shadow-sm"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Blockchain indicator */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <FiLock className="h-2.5 w-2.5 text-white" />
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-600">
                    Live
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-600 tracking-wide uppercase">
                  {stat.name}
                </h3>

                {/* Value with loading state */}
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-20"></div>
                  </div>
                ) : (
                  <div className="flex items-baseline space-x-2">
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">
                      {stat.value}
                    </p>
                    <FiZap className="h-4 w-4 text-blue-500" />
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-gray-500 font-medium">
                  {stat.description}
                </p>
              </div>

              {/* Change Indicator */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <ChangeIcon
                    className={`h-3 w-3 ${
                      stat.changeType === "positive"
                        ? "text-emerald-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      stat.changeType === "positive"
                        ? "text-emerald-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>

                {/* View Details Link */}
                <button className="group/btn flex items-center text-xs font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  <span>Details</span>
                  <FiArrowUpRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                </button>
              </div>

              {/* Bottom Action Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm border-t border-gray-200/50 px-6 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-full group-hover:translate-y-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Verified on-chain</span>
                  </div>

                  <button
                    className={`text-xs font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                  >
                    Manage →
                  </button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-all duration-300 pointer-events-none`}
              ></div>
            </div>

            {/* External Glow on Hover */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-all duration-300 -z-10 transform group-hover:scale-110`}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
