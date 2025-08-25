import {
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiShield,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiZap,
  FiSettings,
  FiEye,
} from "react-icons/fi";

const AdminStats = ({ data, loading, onRefresh }) => {
  const stats = [
    {
      name: "Contract Balance",
      value: loading
        ? "..."
        : `${parseFloat(data.contractBalance || 0).toFixed(4)} ETH`,
      description: "Total ETH in contract",
      icon: FiDollarSign,
      color: "green",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      name: "Total Policies",
      value: loading ? "..." : data.totalPolicies || "0",
      description: "All time policies created",
      icon: FiShield,
      color: "blue",
      change: "+8.2%",
      changeType: "positive",
    },
    {
      name: "Total Claims",
      value: loading ? "..." : data.totalClaims || "0",
      description: "All time claims submitted",
      icon: FiFileText,
      color: "purple",
      change: "+15.3%",
      changeType: "positive",
    },
    {
      name: "Active Plans",
      value: loading
        ? "..."
        : data.plans?.filter((p) => p.isActive).length.toString() || "0",
      description: "Currently available plans",
      icon: FiActivity,
      color: "indigo",
      change: "3 plans",
      changeType: "neutral",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: {
        bg: "from-emerald-100 to-green-100",
        text: "text-emerald-600",
        border: "border-emerald-200",
        glow: "from-emerald-500/10 to-green-500/10",
      },
      blue: {
        bg: "from-blue-100 to-cyan-100",
        text: "text-blue-600",
        border: "border-blue-200",
        glow: "from-blue-500/10 to-cyan-500/10",
      },
      purple: {
        bg: "from-purple-100 to-pink-100",
        text: "text-purple-600",
        border: "border-purple-200",
        glow: "from-purple-500/10 to-pink-500/10",
      },
      indigo: {
        bg: "from-indigo-100 to-purple-100",
        text: "text-indigo-600",
        border: "border-indigo-200",
        glow: "from-indigo-500/10 to-purple-500/10",
      },
      yellow: {
        bg: "from-yellow-100 to-orange-100",
        text: "text-yellow-600",
        border: "border-yellow-200",
        glow: "from-yellow-500/10 to-orange-500/10",
      },
      red: {
        bg: "from-red-100 to-pink-100",
        text: "text-red-600",
        border: "border-red-200",
        glow: "from-red-500/10 to-pink-500/10",
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
      <div className="space-y-8">
        {/* Header Loading */}
        <div className="flex items-center justify-between">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-64 mb-2"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48"></div>
          </div>
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-32"></div>
        </div>

        {/* Stats Grid Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Contract Overview
          </h2>
          <p className="text-gray-600">Real-time statistics and metrics</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          <FiRefreshCw
            className={`-ml-1 mr-2 h-4 w-4 ${
              loading ? "animate-spin" : "group-hover:scale-110"
            } transition-transform`}
          />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        {stat.description}
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
                    {stat.changeType === "neutral" ? "" : "from last month"}
                  </span>
                </div>

                {/* Hover Glow Effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorScheme.glow} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Admin Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contract Health */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl"></div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <FiZap className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Contract Health
              </h3>
            </div>

            <div className="space-y-4">
              {[
                { label: "Contract Status", value: "Active", type: "success" },
                { label: "Paused Status", value: "Running", type: "success" },
                { label: "Last Activity", value: "2 hours ago", type: "info" },
                { label: "Gas Usage", value: "Optimized", type: "success" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {item.label}
                  </span>
                  {item.type === "success" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200">
                      {item.value}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <FiSettings className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: FiUsers,
                  label: "Add Doctor",
                  color: "from-indigo-600 to-purple-600",
                },
                {
                  icon: FiFileText,
                  label: "Update Plans",
                  color: "from-emerald-600 to-green-600",
                },
                {
                  icon: FiDollarSign,
                  label: "Withdraw Funds",
                  color: "from-purple-600 to-pink-600",
                },
                {
                  icon: FiEye,
                  label: "View Activity",
                  color: "from-yellow-600 to-orange-600",
                },
              ].map((action, index) => (
                <button
                  key={index}
                  className={`group relative inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r ${action.color} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <action.icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
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
                Recent Contract Activity
              </h3>
            </div>
          </div>

          <div className="p-8">
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {[
                  {
                    type: "Policy Created",
                    description: "New Premium policy purchased",
                    time: "2 hours ago",
                    icon: FiShield,
                    iconBg: "from-emerald-500 to-green-500",
                  },
                  {
                    type: "Claim Processed",
                    description: "Claim #1234 approved for 0.5 ETH",
                    time: "4 hours ago",
                    icon: FiFileText,
                    iconBg: "from-blue-500 to-cyan-500",
                  },
                  {
                    type: "Doctor Authorized",
                    description: "Dr. Smith authorized for claim processing",
                    time: "1 day ago",
                    icon: FiUsers,
                    iconBg: "from-purple-500 to-pink-500",
                  },
                  {
                    type: "Plan Updated",
                    description: "Basic plan pricing updated",
                    time: "2 days ago",
                    icon: FiTrendingUp,
                    iconBg: "from-indigo-500 to-purple-500",
                  },
                ].map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <div className="relative pb-8">
                      {itemIdx !== 3 ? (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-300 to-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-4">
                        <div>
                          <span
                            className={`bg-gradient-to-br ${item.iconBg} h-10 w-10 rounded-xl flex items-center justify-center ring-4 ring-white shadow-lg`}
                          >
                            <item.icon
                              className="h-5 w-5 text-white"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm font-bold text-gray-900 mb-1">
                              {item.type}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm">
                            <time className="text-gray-500 font-medium">
                              {item.time}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
