import { useState } from "react";
import {
  FiShield, FiCalendar, FiDollarSign, FiFileText, FiCreditCard, FiX, FiExternalLink,
  FiChevronDown, FiChevronUp, FiAlertTriangle, FiZap, FiLock, FiTrendingUp, FiCheckCircle,
  FiClock, FiAward, FiAnchor,
} from "react-icons/fi";
import Link from "next/link";
import { PLAN_TYPES, PAYMENT_TYPES, POLICY_STATUS } from "@/constant";
import type { Policy } from "@/services/contract";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";

type Props = {
  policy: Policy & {
    remainingCoverage?: bigint;
    claimsCount?: number;
  };
  onPayPremium: () => void;
  onCancel: () => void;
  onRefresh: () => void;
};

const PolicyCard: React.FC<Props> = ({ policy, onPayPremium, onCancel }) => {
  const [expanded, setExpanded] = useState(false);

  const getPlanName = (planType: number) =>
    ({ [PLAN_TYPES.BASIC]: "Basic", [PLAN_TYPES.PREMIUM]: "Premium", [PLAN_TYPES.PLATINUM]: "Platinum" }[planType] ?? "Unknown");

  const getPlanIcon = (planType: number) =>
    ({ [PLAN_TYPES.BASIC]: FiShield, [PLAN_TYPES.PREMIUM]: FiAward, [PLAN_TYPES.PLATINUM]: FiAnchor }[planType] ?? FiShield);

  const getPlanGradient = (planType: number) =>
    ({ [PLAN_TYPES.BASIC]: "from-blue-500 to-cyan-500", [PLAN_TYPES.PREMIUM]: "from-purple-500 to-pink-500", [PLAN_TYPES.PLATINUM]: "from-amber-500 to-orange-500" }[planType] ?? "from-blue-500 to-cyan-500");

  const getStatusColor = (status: number) =>
    ({
      [POLICY_STATUS.ACTIVE]: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-emerald-200/50",
      [POLICY_STATUS.EXPIRED]: "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200/50",
      [POLICY_STATUS.CANCELLED]: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200/50",
      [POLICY_STATUS.SUSPENDED]: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-200/50",
    }[status] ?? "bg-gray-100 text-gray-800 border-gray-200");

  const getStatusText = (status: number) =>
    ({ [POLICY_STATUS.ACTIVE]: "Active", [POLICY_STATUS.EXPIRED]: "Expired", [POLICY_STATUS.CANCELLED]: "Cancelled", [POLICY_STATUS.SUSPENDED]: "Suspended" }[status] ?? "Unknown");

  const getStatusIndicator = (status: number) =>
    ({ [POLICY_STATUS.ACTIVE]: { color: "bg-emerald-500", animate: "animate-pulse" }, [POLICY_STATUS.EXPIRED]: { color: "bg-red-500", animate: "" }, [POLICY_STATUS.CANCELLED]: { color: "bg-gray-500", animate: "" }, [POLICY_STATUS.SUSPENDED]: { color: "bg-amber-500", animate: "animate-pulse" } }[status] ?? { color: "bg-gray-500", animate: "" });

  const formatDate = (ts?: bigint | number | string) => {
    if (!ts) return "N/A";
    const n = typeof ts === "bigint" ? Number(ts) : Number(ts);
    return new Date(n * 1000).toLocaleDateString();
  };

  const isExpired = () => Date.now() > Number(policy.endDate ?? 0) * 1000;
  const isExpiringSoon = () => {
    const daysLeft = Math.ceil((Number(policy.endDate ?? 0) * 1000 - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 && daysLeft > 0;
  };
  const needsPremiumPayment = () =>
    Number(policy.paymentType) === PAYMENT_TYPES.MONTHLY && isExpired() && Number(policy.status) === POLICY_STATUS.ACTIVE;

  const used = Number(policy.claimsUsed ?? 0n);
  const total = Number(policy.coverageAmount ?? 1n);
  const usagePct = total > 0 ? (used / total) * 100 : 0;

  const PlanIcon = getPlanIcon(Number(policy.planType));
  const planGradient = getPlanGradient(Number(policy.planType));
  const statusIndicator = getStatusIndicator(Number(policy.status));

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* ... keep your UI structure ... */}
      <div className="relative p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-14 h-14 bg-gradient-to-br ${planGradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <PlanIcon className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${statusIndicator.color} rounded-full border-2 border-white ${statusIndicator.animate}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{getPlanName(Number(policy.planType))} Plan</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">Policy #{String(policy.policyId)}</p>
                <div className="flex items-center space-x-1"><FiLock className="h-3 w-3 text-green-600" /><span className="text-xs text-green-600 font-medium">Blockchain Secured</span></div>
              </div>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(Number(policy.status))}`}>
            {getStatusText(Number(policy.status))}
          </span>
        </div>

        {needsPremiumPayment() && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0"><FiAlertTriangle className="h-4 w-4 text-white" /></div>
              <div><h3 className="text-sm font-bold text-red-800 mb-1">Premium Payment Due</h3><p className="text-sm text-red-700">Your monthly premium is overdue.</p></div>
            </div>
          </div>
        )}

        {isExpiringSoon() && !needsPremiumPayment() && (
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0"><FiClock className="h-4 w-4 text-white" /></div>
              <div><h3 className="text-sm font-bold text-amber-800 mb-1">Policy Expiring Soon</h3><p className="text-sm text-amber-700">Expires on {formatDate(policy.endDate)}</p></div>
            </div>
          </div>
        )}

        {/* Coverage usage (bigint safe) */}
        <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-2"><FiTrendingUp className="h-4 w-4 text-blue-600" /><span className="text-sm font-semibold text-gray-700">Coverage Usage</span></div>
            <span className="text-sm font-bold text-gray-900">
              {toEthStr(policy.claimsUsed)} / {toEthStr(policy.coverageAmount)} ETH
            </span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePct > 80 ? "bg-gradient-to-r from-red-500 to-rose-500" :
                usagePct > 60 ? "bg-gradient-to-r from-amber-500 to-yellow-500" :
                                "bg-gradient-to-r from-emerald-500 to-green-500"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, usagePct))}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs font-medium text-gray-600">{usagePct.toFixed(1)}% utilized</p>
            <div className="flex items-center space-x-1 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">
                Available: {toEthStr(policy.remainingCoverage ?? (policy.coverageAmount - policy.claimsUsed))} ETH
              </span>
            </div>
          </div>
        </div>

        {/* Info grid (use toEthStr) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-lg border border-blue-200/30">
            <div className="flex items-center space-x-2 mb-1"><FiCalendar className="h-4 w-4 text-blue-600" /><span className="text-xs font-semibold text-blue-800">Expires</span></div>
            <p className="text-sm font-bold text-gray-900">{formatDate(policy.endDate)}</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-emerald-50/50 to-green-50/50 rounded-lg border border-emerald-200/30">
            <div className="flex items-center space-x-2 mb-1"><FiDollarSign className="h-4 w-4 text-emerald-600" /><span className="text-xs font-semibold text-emerald-800">Premium</span></div>
            <p className="text-sm font-bold text-gray-900">{toEthStr(policy.premium)} ETH</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative px-6 py-6">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setExpanded((v) => !v)} className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200/50 shadow-sm text-sm font-semibold rounded-xl">
            {expanded ? <><FiChevronUp className="h-4 w-4 mr-2" />Less Details</> : <><FiChevronDown className="h-4 w-4 mr-2" />More Details</>}
          </button>

          {Number(policy.paymentType) === PAYMENT_TYPES.MONTHLY && Number(policy.status) === POLICY_STATUS.ACTIVE && (
            <button onClick={onPayPremium}
              className={`group/btn inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white ${
                needsPremiumPayment() ? "bg-gradient-to-r from-red-600 to-rose-600" : "bg-gradient-to-r from-emerald-600 to-green-600"
              }`}>
              <FiCreditCard className="h-4 w-4 mr-2" />{needsPremiumPayment() ? "Pay Overdue Premium" : "Pay Premium"}
            </button>
          )}

          {Number(policy.status) === POLICY_STATUS.ACTIVE && (
            <Link href="/claims" className="group/btn inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-600">
              <FiFileText className="h-4 w-4 mr-2" />Submit Claim
            </Link>
          )}

          {(policy as any).claimsCount && (policy as any).claimsCount! > 0 && (
            <Link href={`/claims?policyId=${String(policy.policyId)}`} className="group/btn inline-flex items-center px-4 py-2.5 border border-gray-200/50 text-sm font-semibold rounded-xl">
              <FiExternalLink className="h-4 w-4 mr-2" />View Claims ({(policy as any).claimsCount})
            </Link>
          )}

          {Number(policy.status) === POLICY_STATUS.ACTIVE && (
            <button onClick={onCancel} className="group/btn inline-flex items-center px-4 py-2.5 border border-red-200/50 text-sm font-semibold rounded-xl text-red-700">
              <FiX className="h-4 w-4 mr-2" />Cancel Policy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyCard;
