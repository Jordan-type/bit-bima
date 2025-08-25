import {
  FiCheck,
  FiStar,
  FiShield,
  FiZap,
  FiCrown,
  FiLock,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";
import {
  contractService,

} from "../../services/contract";

import { PLAN_TYPES, CLAIM_STATUS,PAYMENT_TYPES, POLICY_STATUS, } from "../../constant";

// Mock PLAN_TYPES for demonstration - replace with your actual import
// const PLAN_TYPES = {
//   BASIC: 0,
//   PREMIUM: 1,
//   PLATINUM: 2,
// };

const PlanCard = ({ plan, features = [], popular = false, onPurchase }) => {
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

  const getPlanColor = (planType) => {
    const colors = {
      [PLAN_TYPES.BASIC]: "indigo",
      [PLAN_TYPES.PREMIUM]: "purple",
      [PLAN_TYPES.PLATINUM]: "gold",
    };
    return colors[planType] || "indigo";
  };

  const getColorClasses = (color, popular) => {
    if (popular) {
      return {
        border:
          "border-purple-400/50 ring-2 ring-purple-500/30 shadow-purple-500/20",
        gradient: "from-purple-500 to-violet-600",
        bgGradient: "from-purple-50 to-violet-50",
        button:
          "from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
        badge: "from-purple-500 to-violet-600",
        accent: "text-purple-600",
        iconBg: "from-purple-500 to-violet-600",
      };
    }

    const colors = {
      indigo: {
        border:
          "border-gray-200/50 hover:border-indigo-300/50 hover:shadow-indigo-500/10",
        gradient: "from-indigo-500 to-blue-600",
        bgGradient: "from-indigo-50 to-blue-50",
        button:
          "from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
        badge: "from-indigo-500 to-blue-600",
        accent: "text-indigo-600",
        iconBg: "from-indigo-500 to-blue-600",
      },
      purple: {
        border:
          "border-gray-200/50 hover:border-purple-300/50 hover:shadow-purple-500/10",
        gradient: "from-purple-500 to-pink-600",
        bgGradient: "from-purple-50 to-pink-50",
        button:
          "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
        badge: "from-purple-500 to-pink-600",
        accent: "text-purple-600",
        iconBg: "from-purple-500 to-pink-600",
      },
      gold: {
        border:
          "border-gray-200/50 hover:border-amber-300/50 hover:shadow-amber-500/10",
        gradient: "from-amber-500 to-orange-500",
        bgGradient: "from-amber-50 to-orange-50",
        button:
          "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
        badge: "from-amber-500 to-orange-500",
        accent: "text-amber-600",
        iconBg: "from-amber-500 to-orange-500",
      },
    };
    return colors[color] || colors.indigo;
  };

  const planName = getPlanName(plan?.planType || PLAN_TYPES.BASIC);
  const planColor = getPlanColor(plan?.planType || PLAN_TYPES.BASIC);
  const colorClasses = getColorClasses(planColor, popular);
  const PlanIcon = getPlanIcon(plan?.planType || PLAN_TYPES.BASIC);

  const getPlanDescription = (name) => {
    const descriptions = {
      Basic:
        "Essential blockchain-secured coverage for your basic healthcare needs",
      Premium: "Comprehensive smart contract protection with enhanced benefits",
      Platinum:
        "Ultimate decentralized coverage with premium blockchain features",
    };
    return descriptions[name] || "Blockchain-secured health insurance coverage";
  };

  // Mock plan data for demonstration
  const mockPlan = {
    oneTimePrice: plan?.oneTimePrice || "0.5",
    monthlyPrice: plan?.monthlyPrice || "0.045",
    coverageAmount: plan?.coverageAmount || "10",
    deductible: plan?.deductible || "0.1",
    ...plan,
  };

  const mockFeatures =
    features.length > 0
      ? features
      : [
          "24/7 Emergency Coverage",
          "Preventive Care Included",
          "Prescription Drug Coverage",
          "Specialist Consultations",
          planName === "Premium" || planName === "Platinum"
            ? "Mental Health Coverage"
            : "Basic Mental Health",
          planName === "Platinum" ? "Global Coverage" : "Regional Coverage",
        ];

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`}
      ></div>

      <div
        className={`
        relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl ${colorClasses.border} border 
        p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] overflow-hidden
      `}
      >
        {/* Background Pattern */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colorClasses.bgGradient} opacity-30`}
        ></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

        {/* Floating particles */}
        <div className="absolute top-6 right-6 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-8 right-8 w-1.5 h-1.5 bg-white/30 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Popular Badge */}
        {popular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div
              className={`
              inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white 
              bg-gradient-to-r ${colorClasses.badge} shadow-lg border-2 border-white
            `}
            >
              <FiStar className="w-4 h-4 mr-1 animate-pulse" />
              Most Popular
            </div>
          </div>
        )}

        <div className="relative text-center">
          {/* Plan Icon and Title */}
          <div className="flex flex-col items-center mb-6">
            <div
              className={`
              w-16 h-16 bg-gradient-to-br ${colorClasses.iconBg} rounded-2xl 
              flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300
            `}
            >
              <PlanIcon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {planName}
              {planName === "Platinum" && (
                <span className="ml-2 text-amber-500">✨</span>
              )}
            </h3>

            <p className="text-gray-600 leading-relaxed max-w-sm">
              {getPlanDescription(planName)}
            </p>
          </div>

          {/* Pricing Section */}
          <div className="mb-8 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="text-4xl font-bold text-gray-900">
                {parseFloat(mockPlan.oneTimePrice).toFixed(2)}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-lg font-semibold text-gray-600">ETH</span>
                <span className="text-xs text-gray-500">per year</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
              <FiZap className="h-3 w-3" />
              <span>or</span>
              <span className="font-semibold">
                {parseFloat(mockPlan.monthlyPrice).toFixed(3)} ETH
              </span>
              <span>/month</span>
            </div>
          </div>

          {/* Coverage Details */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <FiShield className="h-4 w-4 text-emerald-600" />
                <p className="font-semibold text-gray-900 text-sm">Coverage</p>
              </div>
              <p className={`font-bold text-lg ${colorClasses.accent}`}>
                {parseFloat(mockPlan.coverageAmount).toFixed(0)} ETH
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200/50">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <FiTrendingUp className="h-4 w-4 text-blue-600" />
                <p className="font-semibold text-gray-900 text-sm">
                  Deductible
                </p>
              </div>
              <p className="text-gray-600 font-bold text-lg">
                {parseFloat(mockPlan.deductible).toFixed(2)} ETH
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="mb-8 text-left">
            <h4 className="font-semibold text-gray-900 mb-4 text-center flex items-center justify-center space-x-2">
              <FiLock className="h-4 w-4" />
              <span>Blockchain-Secured Benefits</span>
            </h4>

            <ul className="space-y-3">
              {mockFeatures.map((feature, index) => (
                <li key={index} className="flex items-start group/item">
                  <div
                    className={`
                    w-5 h-5 bg-gradient-to-br ${colorClasses.gradient} rounded-full 
                    flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 
                    group-hover/item:scale-110 transition-transform duration-200
                  `}
                  >
                    <FiCheck className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 group-hover/item:text-gray-900 transition-colors">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <button
            onClick={onPurchase}
            className={`
              group/btn relative w-full py-4 px-6 rounded-xl font-bold text-white text-lg
              bg-gradient-to-r ${colorClasses.button} 
              shadow-lg hover:shadow-xl transition-all duration-300 
              transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-purple-500/50
              overflow-hidden
            `}
          >
            {/* Button background animation */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

            <div className="relative flex items-center justify-center space-x-2">
              <FiLock className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
              <span>Secure {planName} Plan</span>
              <FiZap className="h-4 w-4 group-hover/btn:animate-pulse" />
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 group-hover/btn:animate-pulse transition-opacity duration-300"></div>
          </button>

          {/* Bottom Info */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Smart Contract Verified</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiShield className="h-3 w-3" />
              <span>Blockchain Secured</span>
            </div>
          </div>
        </div>

        {/* Hover Border Glow */}
        <div
          className={`
          absolute inset-0 rounded-2xl bg-gradient-to-r ${colorClasses.gradient} 
          opacity-0 group-hover:opacity-20 transition-all duration-300 pointer-events-none
        `}
        ></div>
      </div>
    </div>
  );
};

export default PlanCard;
