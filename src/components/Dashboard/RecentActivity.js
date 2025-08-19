import {
  FiShield,
  FiFileText,
  FiCreditCard,
  FiActivity,
  FiZap,
  FiCheck,
  FiX,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import {
  contractService,
  CLAIM_STATUS,
  PLAN_TYPES,
  PAYMENT_TYPES,
  POLICY_STATUS,
} from "../../services/contract";

// Mock constants for demonstration - replace with your actual imports
// const CLAIM_STATUS = {
//   PENDING: 0,
//   APPROVED: 1,
//   REJECTED: 2,
//   PAID: 3,
// };

// const POLICY_STATUS = {
//   ACTIVE: 0,
//   EXPIRED: 1,
//   CANCELLED: 2,
//   SUSPENDED: 3,
// };

const RecentActivity = ({ policies = [], claims = [], loading = false }) => {
  // Combine and sort activities
  const getActivities = () => {
    const activities = [];

    // Add policy activities
    policies.forEach((policy) => {
      activities.push({
        id: `policy-${policy.policyId}`,
        type: "policy_created",
        icon: FiShield,
        title: "Policy Purchased",
        description: `Policy #${policy.policyId} purchased`,
        timestamp: parseInt(policy.startDate || Date.now() / 1000),
        color: "indigo",
        amount: `${parseFloat(policy.premium || 0).toFixed(4)} ETH`,
      });

      if (
        policy.lastPaymentDate &&
        policy.lastPaymentDate !== policy.startDate
      ) {
        activities.push({
          id: `payment-${policy.policyId}`,
          type: "premium_paid",
          icon: FiCreditCard,
          title: "Premium Paid",
          description: `Monthly premium for Policy #${policy.policyId}`,
          timestamp: parseInt(policy.lastPaymentDate),
          color: "green",
          amount: `${parseFloat(policy.premium || 0).toFixed(4)} ETH`,
        });
      }
    });

    // Add claim activities
    claims.forEach((claim) => {
      activities.push({
        id: `claim-${claim.claimId}`,
        type: "claim_submitted",
        icon: FiFileText,
        title: "Claim Submitted",
        description: claim.description || `Claim #${claim.claimId}`,
        timestamp: parseInt(claim.submissionDate || Date.now() / 1000),
        color: "yellow",
        amount: `${parseFloat(claim.claimAmount || 0).toFixed(4)} ETH`,
        status: claim.status,
      });

      if (claim.processedDate && claim.processedDate !== "0") {
        activities.push({
          id: `claim-processed-${claim.claimId}`,
          type: "claim_processed",
          icon:
            claim.status === CLAIM_STATUS.APPROVED ||
            claim.status === CLAIM_STATUS.PAID
              ? FiCheck
              : FiX,
          title:
            claim.status === CLAIM_STATUS.APPROVED ||
            claim.status === CLAIM_STATUS.PAID
              ? "Claim Approved"
              : "Claim Rejected",
          description: `Claim #${claim.claimId} processed`,
          timestamp: parseInt(claim.processedDate),
          color:
            claim.status === CLAIM_STATUS.APPROVED ||
            claim.status === CLAIM_STATUS.PAID
              ? "green"
              : "red",
          amount:
            claim.status === CLAIM_STATUS.APPROVED ||
            claim.status === CLAIM_STATUS.PAID
              ? `${parseFloat(claim.approvedAmount || 0).toFixed(4)} ETH`
              : null,
        });
      }
    });

    // Sort by timestamp (most recent first)
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  };

  const activities = getActivities();

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getColorClasses = (color) => {
    const colors = {
      indigo:
        "bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-700 border-indigo-200/50",
      green:
        "bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-700 border-emerald-200/50",
      yellow:
        "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-700 border-amber-200/50",
      red: "bg-gradient-to-br from-red-100 to-rose-100 text-red-700 border-red-200/50",
      purple:
        "bg-gradient-to-br from-purple-100 to-violet-100 text-purple-700 border-purple-200/50",
    };
    return colors[color] || colors.indigo;
  };

  const getActivityTypeIcon = (type) => {
    const typeIcons = {
      policy_created: FiShield,
      premium_paid: FiCreditCard,
      claim_submitted: FiFileText,
      claim_processed: FiCheck,
    };
    return typeIcons[type] || FiActivity;
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl border border-white/50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/50 to-gray-50/30"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-gray-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>

      <div className="relative px-6 py-6 sm:p-8">
        {/* Header Section */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
              <FiActivity className="h-5 w-5 text-white" />
            </div>
            {activities.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {Math.min(activities.length, 9)}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-600">
              Your blockchain transaction history
            </p>
          </div>
        </div>

        {loading ? (
          /* Enhanced Loading State */
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4 animate-pulse">
                <div className="relative">
                  <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          /* Enhanced Empty State */
          <div className="text-center py-12">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <FiActivity className="h-12 w-12 text-gray-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <FiZap className="h-4 w-4 text-white" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No Recent Activity
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your blockchain insurance activities will appear here. Start by
              purchasing a policy or submitting a claim.
            </p>

            <button className="group inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
              <span>Explore Insurance Plans</span>
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
        ) : (
          /* Enhanced Activity Timeline */
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {activities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute top-6 left-6 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent"
                        aria-hidden="true"
                      />
                    ) : null}

                    <div className="relative flex space-x-4">
                      {/* Enhanced Activity Icon */}
                      <div className="relative">
                        <div
                          className={`
                          h-12 w-12 rounded-xl flex items-center justify-center shadow-lg border 
                          ${getColorClasses(activity.color)} backdrop-blur-sm
                        `}
                        >
                          <activity.icon
                            className="h-5 w-5 drop-shadow-sm"
                            aria-hidden="true"
                          />
                        </div>

                        {/* Activity type indicator */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center shadow-sm">
                          {activity.type === "policy_created" && (
                            <FiShield className="h-2.5 w-2.5 text-indigo-600" />
                          )}
                          {activity.type === "premium_paid" && (
                            <FiCreditCard className="h-2.5 w-2.5 text-green-600" />
                          )}
                          {activity.type === "claim_submitted" && (
                            <FiClock className="h-2.5 w-2.5 text-amber-600" />
                          )}
                          {activity.type === "claim_processed" && (
                            <FiCheck className="h-2.5 w-2.5 text-emerald-600" />
                          )}
                        </div>
                      </div>

                      {/* Enhanced Activity Content */}
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-base font-bold text-gray-900">
                              {activity.title}
                            </p>
                            <FiTrendingUp className="h-3 w-3 text-blue-500" />
                          </div>

                          <p className="text-sm text-gray-600 truncate max-w-xs lg:max-w-md mb-2">
                            {activity.description}
                          </p>

                          {activity.amount && (
                            <div className="inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200/50">
                              <FiZap className="h-3 w-3 text-emerald-600" />
                              <span className="text-sm font-bold text-emerald-700">
                                {activity.amount}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Timestamp */}
                        <div className="flex flex-col items-end space-y-1">
                          <time
                            className="whitespace-nowrap text-sm font-medium text-gray-500"
                            dateTime={new Date(
                              activity.timestamp * 1000
                            ).toISOString()}
                          >
                            {formatDate(activity.timestamp)}
                          </time>

                          {/* Transaction hash indicator */}
                          <div className="flex items-center space-x-1 text-xs text-gray-400">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span>On-chain</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Enhanced Footer */}
        {activities.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All transactions verified on blockchain</span>
              </div>

              <button className="group inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                <span>View complete history</span>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
