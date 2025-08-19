import { useState } from "react";
import {
  FiShield,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiCreditCard,
  FiX,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiZap,
  FiLock,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiCrown,
} from "react-icons/fi";
import { contractService } from "../../services/contract";
import { PLAN_TYPES, PAYMENT_TYPES, POLICY_STATUS, } from "../../constant/index";

// Mock constants for demonstration - replace with your actual imports
// const POLICY_STATUS = {
//   ACTIVE: 0,
//   EXPIRED: 1,
//   CANCELLED: 2,
//   SUSPENDED: 3,
// };

// const PAYMENT_TYPES = {
//   ONE_TIME: 0,
//   MONTHLY: 1,
// };

// const PLAN_TYPES = {
//   BASIC: 0,
//   PREMIUM: 1,
//   PLATINUM: 2,
// };

// Mock Link component - replace with your actual Next.js Link
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

const PolicyCard = ({ policy, onPayPremium, onCancel, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);

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
      [PLAN_TYPES.PLATINUM]: FiCrown,
    };
    return icons[planType] || FiShield;
  };

  const getPlanGradient = (planType) => {
    const gradients = {
      [PLAN_TYPES.BASIC]: "from-blue-500 to-cyan-500",
      [PLAN_TYPES.PREMIUM]: "from-purple-500 to-pink-500",
      [PLAN_TYPES.PLATINUM]: "from-amber-500 to-orange-500",
    };
    return gradients[planType] || "from-blue-500 to-cyan-500";
  };

  const getStatusColor = (status) => {
    const colors = {
      [POLICY_STATUS.ACTIVE]:
        "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-emerald-200/50",
      [POLICY_STATUS.EXPIRED]:
        "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200/50",
      [POLICY_STATUS.CANCELLED]:
        "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200/50",
      [POLICY_STATUS.SUSPENDED]:
        "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-200/50",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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
      [POLICY_STATUS.ACTIVE]: {
        color: "bg-emerald-500",
        animate: "animate-pulse",
      },
      [POLICY_STATUS.EXPIRED]: { color: "bg-red-500", animate: "" },
      [POLICY_STATUS.CANCELLED]: { color: "bg-gray-500", animate: "" },
      [POLICY_STATUS.SUSPENDED]: {
        color: "bg-amber-500",
        animate: "animate-pulse",
      },
    };
    return indicators[status] || { color: "bg-gray-500", animate: "" };
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp || 0) * 1000).toLocaleDateString();
  };

  const isExpiringSoon = () => {
    const expiryDate = new Date(parseInt(policy?.endDate || 0) * 1000);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate - now) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = () => {
    const expiryDate = new Date(parseInt(policy?.endDate || 0) * 1000);
    const now = new Date();
    return now > expiryDate;
  };

  const needsPremiumPayment = () => {
    return (
      policy?.paymentType === PAYMENT_TYPES.MONTHLY &&
      isExpired() &&
      policy?.status === POLICY_STATUS.ACTIVE
    );
  };

  const getCoveragePercentage = () => {
    const used = parseFloat(policy?.claimsUsed || 0);
    const total = parseFloat(policy?.coverageAmount || 1);
    return total > 0 ? (used / total) * 100 : 0;
  };

  // Mock policy data for demonstration
  const mockPolicy = {
    policyId: "12345",
    planType: PLAN_TYPES.PREMIUM,
    status: POLICY_STATUS.ACTIVE,
    endDate: Date.now() / 1000 + 60 * 24 * 60 * 60, // 60 days from now
    premium: "0.05",
    claimsUsed: "0.5",
    coverageAmount: "10",
    deductible: "0.1",
    claimsCount: 2,
    startDate: Date.now() / 1000 - 30 * 24 * 60 * 60, // 30 days ago
    lastPaymentDate: Date.now() / 1000 - 7 * 24 * 60 * 60, // 7 days ago
    totalPaid: "0.15",
    paymentType: PAYMENT_TYPES.MONTHLY,
    remainingCoverage: "9.5",
    isValid: true,
    ...policy,
  };

  const PlanIcon = getPlanIcon(mockPolicy.planType);
  const planGradient = getPlanGradient(mockPolicy.planType);
  const statusIndicator = getStatusIndicator(mockPolicy.status);

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
                className={`w-14 h-14 bg-gradient-to-br ${planGradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <PlanIcon className="h-7 w-7 text-white drop-shadow-sm" />
              </div>

              {/* Status indicator */}
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusIndicator.color} rounded-full border-2 border-white ${statusIndicator.animate}`}
              ></div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {getPlanName(mockPolicy.planType)} Plan
              </h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">
                  Policy #{mockPolicy.policyId}
                </p>
                <div className="flex items-center space-x-1">
                  <FiLock className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    Blockchain Secured
                  </span>
                </div>
              </div>
            </div>
          </div>

          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(
              mockPolicy.status
            )}`}
          >
            {getStatusText(mockPolicy.status)}
          </span>
        </div>

        {/* Warning Messages */}
        {needsPremiumPayment() && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Premium Payment Due
                </h3>
                <p className="text-sm text-red-700">
                  Your monthly premium is overdue. Pay now to maintain coverage.
                </p>
              </div>
            </div>
          </div>
        )}

        {isExpiringSoon() && !needsPremiumPayment() && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiClock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-800 mb-1">
                  Policy Expiring Soon
                </h3>
                <p className="text-sm text-amber-700">
                  Your policy expires on {formatDate(mockPolicy.endDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Coverage Progress */}
        <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2">
              <FiTrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                Coverage Usage
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {parseFloat(mockPolicy.claimsUsed).toFixed(4)} /{" "}
              {parseFloat(mockPolicy.coverageAmount).toFixed(0)} ETH
            </span>
          </div>

          <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                getCoveragePercentage() > 80
                  ? "bg-gradient-to-r from-red-500 to-rose-500"
                  : getCoveragePercentage() > 60
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                  : "bg-gradient-to-r from-emerald-500 to-green-500"
              }`}
              style={{ width: `${Math.min(getCoveragePercentage(), 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="text-xs font-medium text-gray-600">
              {getCoveragePercentage().toFixed(1)}% utilized
            </p>
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">
                Available:{" "}
                {parseFloat(mockPolicy.remainingCoverage || 0).toFixed(2)} ETH
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg border border-blue-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiCalendar className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-800">
                Expires
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {formatDate(mockPolicy.endDate)}
            </p>
          </div>

          <div className="p-3 bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-lg border border-emerald-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiDollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">
                Premium
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {parseFloat(mockPolicy.premium).toFixed(4)} ETH
            </p>
          </div>

          <div className="p-3 bg-gradient-to-r from-purple-50/50 to-violet-50/50 rounded-lg border border-purple-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiFileText className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-800">
                Claims
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {mockPolicy.claimsCount || 0}
            </p>
          </div>

          <div className="p-3 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-lg border border-amber-200/30">
            <div className="flex items-center space-x-2 mb-1">
              <FiShield className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">
                Deductible
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {parseFloat(mockPolicy.deductible).toFixed(2)} ETH
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Start Date
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(mockPolicy.startDate)}
                </p>
              </div>

              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Total Paid
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  {parseFloat(mockPolicy.totalPaid).toFixed(4)} ETH
                </p>
              </div>

              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Remaining Coverage
                </p>
                <p className="text-sm font-bold text-blue-600">
                  {parseFloat(mockPolicy.remainingCoverage || 0).toFixed(4)} ETH
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Last Payment
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(mockPolicy.lastPaymentDate)}
                </p>
              </div>

              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Payment Type
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {mockPolicy.paymentType === PAYMENT_TYPES.ONE_TIME
                    ? "Annual"
                    : "Monthly"}
                </p>
              </div>

              <div className="p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                  Policy Status
                </p>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle
                    className={`h-4 w-4 ${
                      mockPolicy.isValid ? "text-green-600" : "text-red-600"
                    }`}
                  />
                  <p
                    className={`text-sm font-bold ${
                      mockPolicy.isValid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {mockPolicy.isValid ? "Valid & Active" : "Invalid"}
                  </p>
                </div>
              </div>
            </div>
          </div>
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

          {/* Pay Premium Button */}
          {mockPolicy.paymentType === PAYMENT_TYPES.MONTHLY &&
            mockPolicy.status === POLICY_STATUS.ACTIVE && (
              <button
                onClick={onPayPremium}
                className={`group/btn inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl ${
                  needsPremiumPayment()
                    ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 focus:ring-red-500"
                    : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 focus:ring-emerald-500"
                }`}
              >
                <FiCreditCard className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                {needsPremiumPayment() ? "Pay Overdue Premium" : "Pay Premium"}
              </button>
            )}

          {/* Submit Claim Button */}
          {mockPolicy.status === POLICY_STATUS.ACTIVE && (
            <Link
              href={`/claims`}
              className="group/btn inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FiFileText className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
              Submit Claim
            </Link>
          )}

          {/* View Claims Button */}
          {mockPolicy.claimsCount > 0 && (
            <Link
              href={`/claims?policyId=${mockPolicy.policyId}`}
              className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200/50 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <FiExternalLink className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
              View Claims ({mockPolicy.claimsCount})
            </Link>
          )}

          {/* Cancel Policy Button */}
          {mockPolicy.status === POLICY_STATUS.ACTIVE && (
            <button
              onClick={onCancel}
              className="group/btn inline-flex items-center px-4 py-2.5 border border-red-200/50 shadow-sm text-sm font-semibold rounded-xl text-red-700 bg-white/80 backdrop-blur-sm hover:bg-red-50 hover:shadow-lg hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
            >
              <FiX className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
              Cancel Policy
            </button>
          )}
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
              <span>Blockchain secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Border Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default PolicyCard;
