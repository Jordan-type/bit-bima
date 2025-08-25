import {
  FiShield,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiPercent,
  FiTarget,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
} from "react-icons/fi";

const StatsOverview = ({ data, loading }) => {
  const stats = [
    {
      name: "Total Policies",
      value: loading ? "..." : data.totalPolicies?.toString() || "0",
      subValue: `${data.activePolicies || 0} active`,
      icon: FiShield,
      color: "indigo",
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Total Claims",
      value: loading ? "..." : data.totalClaims?.toString() || "0",
      subValue: `${data.approvedClaims || 0} approved`,
      icon: FiFileText,
      color: "blue",
      change: "+8%",
      changeType: "positive",
    },
    {
      name: "Total Premiums",
      value: loading
        ? "..."
        : `${(data.totalPremiumsPaid || 0).toFixed(4)} ETH`,
      subValue: "Revenue collected",
      icon: FiDollarSign,
      color: "green",
      change: "+23%",
      changeType: "positive",
    },
    {
      name: "Claims Paid",
      value: loading
        ? "..."
        : `${(data.totalApprovedAmount || 0).toFixed(4)} ETH`,
      subValue: "Total payouts",
      icon: FiTrendingUp,
      color: "purple",
      change: "+15%",
      changeType: "positive",
    },
    {
      name: "Approval Rate",
      value: loading ? "..." : `${(data.claimApprovalRate || 0).toFixed(1)}%`,
      subValue: "Claims approved",
      icon: FiPercent,
      color: "emerald",
      change: "+2.1%",
      changeType: "positive",
    },
    {
      name: "Loss Ratio",
      value: loading ? "..." : `${(data.lossRatio || 0).toFixed(1)}%`,
      subValue: "Claims vs premiums",
      icon: FiTarget,
      color:
        data.lossRatio > 80 ? "red" : data.lossRatio > 60 ? "yellow" : "green",
      change:
        data.lossRatio > 80
          ? "High risk"
          : data.lossRatio > 60
          ? "Moderate"
          : "Healthy",
      changeType:
        data.lossRatio > 80
          ? "negative"
          : data.lossRatio > 60
          ? "neutral"
          : "positive",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      indigo: {
        bg: "from-indigo-100 to-purple-100",
        text: "text-indigo-600",
        border: "border-indigo-200",
        glow: "from-indigo-500/10 to-purple-500/10",
      },
      blue: {
        bg: "from-blue-100 to-cyan-100",
        text: "text-blue-600",
        border: "border-blue-200",
        glow: "from-blue-500/10 to-cyan-500/10",
      },
      green: {
        bg: "from-emerald-100 to-green-100",
        text: "text-emerald-600",
        border: "border-emerald-200",
        glow: "from-emerald-500/10 to-green-500/10",
      },
      purple: {
        bg: "from-purple-100 to-pink-100",
        text: "text-purple-600",
        border: "border-purple-200",
        glow: "from-purple-500/10 to-pink-500/10",
      },
      emerald: {
        bg: "from-emerald-100 to-teal-100",
        text: "text-emerald-600",
        border: "border-emerald-200",
        glow: "from-emerald-500/10 to-teal-500/10",
      },
      red: {
        bg: "from-red-100 to-pink-100",
        text: "text-red-600",
        border: "border-red-200",
        glow: "from-red-500/10 to-pink-500/10",
      },
      yellow: {
        bg: "from-yellow-100 to-orange-100",
        text: "text-yellow-600",
        border: "border-yellow-200",
        glow: "from-yellow-500/10 to-orange-500/10",
      },
    };
    return colors[color] || colors.indigo;
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case "positive":
        return FiArrowUp;
      case "negative":
        return FiArrowDown;
      default:
        return FiMinus;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6 overflow-hidden"
          >
            <div className="animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-2"></div>
                  <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-2/3"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat, index) => {
        const colorScheme = getColorClasses(stat.color);
        const ChangeIcon = getChangeIcon(stat.changeType);

        return (
          <div
            key={stat.name}
            className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6 overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorScheme.glow} rounded-full blur-xl opacity-50`}
              ></div>
              <div
                className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br ${colorScheme.glow} rounded-full blur-lg opacity-30`}
                style={{ animationDelay: "1s" }}
              ></div>
            </div>

            <div className="relative">
              {/* Icon and Title */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorScheme.bg} border ${colorScheme.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={`h-6 w-6 ${colorScheme.text}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {stat.name}
                    </p>
                    <p className="text-xs font-medium text-gray-600">
                      {stat.subValue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Value */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
              </div>

              {/* Change Indicator */}
              <div
                className={`inline-flex items-center space-x-2 px-3 py-1 rounded-xl text-sm font-semibold ${
                  stat.changeType === "positive"
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200"
                    : stat.changeType === "negative"
                    ? "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                <ChangeIcon
                  className={`h-3 w-3 ${
                    stat.changeType === "positive"
                      ? "text-emerald-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                />
                <span>{stat.change}</span>
              </div>

              {/* Period Label */}
              <div className="mt-2">
                <span className="text-xs text-gray-500 font-medium">
                  vs last period
                </span>
              </div>

              {/* Progress Bar for Percentage Values */}
              {stat.name.includes("Rate") || stat.name.includes("Ratio") ? (
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colorScheme.bg} rounded-full transition-all duration-1000 ease-out`}
                      style={{
                        width: `${Math.min(
                          parseFloat(stat.value.replace("%", "")) || 0,
                          100
                        )}%`,
                        animationDelay: `${index * 200}ms`,
                      }}
                    ></div>
                  </div>
                </div>
              ) : null}

              {/* Hover Glow Effect */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorScheme.glow} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;
