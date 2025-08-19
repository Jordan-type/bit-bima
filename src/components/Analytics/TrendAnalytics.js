import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiBarChart,
  FiActivity,
  FiTarget,
  FiZap,
  FiShield,
  FiFileText,
  FiCalendar,
  FiPieChart,
} from "react-icons/fi";

const TrendAnalytics = ({ data, loading, timeRange }) => {
  if (loading) {
    return (
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div
            className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <FiTrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Trend Analysis</h3>
          </div>

          <div className="animate-pulse">
            <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Combine policy and claims trend data
  const combinedTrendData = [];
  const policyTrend = data.policyTrend || [];
  const claimsTrend = data.claimsTrend || [];

  // Create a map of dates for easier merging
  const dateMap = new Map();

  policyTrend.forEach((item) => {
    dateMap.set(item.date, {
      date: item.date,
      policies: item.count,
      claims: 0,
    });
  });

  claimsTrend.forEach((item) => {
    if (dateMap.has(item.date)) {
      dateMap.get(item.date).claims = item.count;
    } else {
      dateMap.set(item.date, {
        date: item.date,
        policies: 0,
        claims: item.count,
      });
    }
  });

  // Convert map to array and sort by date
  const sortedData = Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-xl p-4">
          <p className="font-bold text-gray-900 mb-2">
            {new Date(label).toLocaleDateString()}
          </p>
          {payload.map((pld, index) => (
            <p
              key={index}
              style={{ color: pld.color }}
              className="text-sm font-medium"
            >
              {`${pld.dataKey}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    if (timeRange === "7d") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (timeRange === "30d") {
      return date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
      });
    } else if (timeRange === "90d") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    }
  };

  // Calculate trend statistics
  const calculateTrendStats = (trendData, dataKey) => {
    if (trendData.length < 2) return { trend: "stable", percentage: 0 };

    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, item) => sum + item[dataKey], 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, item) => sum + item[dataKey], 0) /
      secondHalf.length;

    const percentageChange =
      firstHalfAvg > 0
        ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
        : 0;

    let trend = "stable";
    if (percentageChange > 5) trend = "increasing";
    else if (percentageChange < -5) trend = "decreasing";

    return { trend, percentage: Math.abs(percentageChange) };
  };

  const policyTrendStats = calculateTrendStats(sortedData, "policies");
  const claimsTrendStats = calculateTrendStats(sortedData, "claims");

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return FiTrendingUp;
      case "decreasing":
        return FiTrendingDown;
      default:
        return FiMinus;
    }
  };

  const getTrendColorScheme = (trend) => {
    switch (trend) {
      case "increasing":
        return {
          bg: "from-emerald-50 to-green-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: "text-emerald-600",
        };
      case "decreasing":
        return {
          bg: "from-red-50 to-pink-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: "text-red-600",
        };
      default:
        return {
          bg: "from-gray-50 to-gray-100",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: "text-gray-600",
        };
    }
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/5 rounded-full blur-xl"></div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <FiTrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Trend Analysis</h3>
            <p className="text-gray-600">
              Track policy and claims trends over time
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Trend Chart */}
          {sortedData.length > 0 ? (
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <FiBarChart className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Policy & Claims Trends
                </h4>
              </div>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sortedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXAxis}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="policies"
                      stroke="url(#policyGradient)"
                      strokeWidth={3}
                      name="New Policies"
                      dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#6366f1" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="claims"
                      stroke="url(#claimsGradient)"
                      strokeWidth={3}
                      name="New Claims"
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#f59e0b" }}
                    />
                    <defs>
                      <linearGradient
                        id="policyGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                      <linearGradient
                        id="claimsGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-12">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                  <FiBarChart className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  No trend data available for the selected time period
                </p>
              </div>
            </div>
          )}

          {/* Trend Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                key: "policies",
                stats: policyTrendStats,
                name: "Policy Trend",
                icon: FiShield,
              },
              {
                key: "claims",
                stats: claimsTrendStats,
                name: "Claims Trend",
                icon: FiFileText,
              },
            ].map(({ key, stats, name, icon: Icon }) => {
              const colorScheme = getTrendColorScheme(stats.trend);
              const TrendIcon = getTrendIcon(stats.trend);

              return (
                <div
                  key={key}
                  className={`relative bg-gradient-to-br ${colorScheme.bg} border ${colorScheme.border} rounded-2xl p-6 group hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className={`h-6 w-6 ${colorScheme.icon}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {name}
                        </h4>
                        <p
                          className={`text-2xl font-bold mt-1 ${colorScheme.text}`}
                        >
                          {stats.trend.charAt(0).toUpperCase() +
                            stats.trend.slice(1)}
                        </p>
                        <p className="text-sm font-medium text-gray-600 mt-1">
                          {stats.percentage.toFixed(1)}% change
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center ${colorScheme.icon}`}
                    >
                      <TrendIcon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Trend Analysis */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-xl border border-white/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <FiCalendar className="h-5 w-5 text-cyan-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                Trend Insights
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Peak Policy Day",
                  value: sortedData.reduce(
                    (max, item) => (item.policies > max.policies ? item : max),
                    { date: "N/A", policies: 0 }
                  ),
                  color: "indigo",
                  icon: FiShield,
                  type: "policies",
                },
                {
                  title: "Peak Claims Day",
                  value: sortedData.reduce(
                    (max, item) => (item.claims > max.claims ? item : max),
                    { date: "N/A", claims: 0 }
                  ),
                  color: "yellow",
                  icon: FiFileText,
                  type: "claims",
                },
                {
                  title: "Avg Daily Policies",
                  value: {
                    avg:
                      sortedData.length > 0
                        ? (
                            sortedData.reduce(
                              (sum, item) => sum + item.policies,
                              0
                            ) / sortedData.length
                          ).toFixed(1)
                        : "0.0",
                  },
                  color: "blue",
                  icon: FiTarget,
                  type: "average",
                },
                {
                  title: "Avg Daily Claims",
                  value: {
                    avg:
                      sortedData.length > 0
                        ? (
                            sortedData.reduce(
                              (sum, item) => sum + item.claims,
                              0
                            ) / sortedData.length
                          ).toFixed(1)
                        : "0.0",
                  },
                  color: "orange",
                  icon: FiActivity,
                  type: "average",
                },
              ].map((insight, index) => {
                const colorSchemes = {
                  indigo: {
                    bg: "from-indigo-100 to-purple-100",
                    text: "text-indigo-600",
                    border: "border-indigo-200",
                  },
                  yellow: {
                    bg: "from-yellow-100 to-orange-100",
                    text: "text-yellow-600",
                    border: "border-yellow-200",
                  },
                  blue: {
                    bg: "from-blue-100 to-cyan-100",
                    text: "text-blue-600",
                    border: "border-blue-200",
                  },
                  orange: {
                    bg: "from-orange-100 to-red-100",
                    text: "text-orange-600",
                    border: "border-orange-200",
                  },
                };
                const scheme = colorSchemes[insight.color];

                return (
                  <div
                    key={index}
                    className={`relative bg-white/80 backdrop-blur-xl border ${scheme.border} shadow-lg rounded-2xl p-6 group hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${scheme.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <insight.icon className={`h-5 w-5 ${scheme.text}`} />
                      </div>
                      <h5 className="font-bold text-gray-900 text-sm">
                        {insight.title}
                      </h5>
                    </div>

                    <div>
                      <p className={`text-xl font-bold ${scheme.text} mb-1`}>
                        {insight.type === "average"
                          ? insight.value.avg
                          : insight.value.date !== "N/A"
                          ? new Date(insight.value.date).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        {insight.type === "policies"
                          ? `${insight.value.policies} policies`
                          : insight.type === "claims"
                          ? `${insight.value.claims} claims`
                          : "per day"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correlation Analysis */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 backdrop-blur-xl border border-blue-200 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <FiPieChart className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                Correlation Analysis
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Policy-Claims Ratio",
                  value:
                    sortedData.reduce((sum, item) => sum + item.policies, 0) > 0
                      ? (
                          sortedData.reduce(
                            (sum, item) => sum + item.claims,
                            0
                          ) /
                          sortedData.reduce(
                            (sum, item) => sum + item.policies,
                            0
                          )
                        ).toFixed(2)
                      : "0.00",
                  subtitle: "claims per policy",
                  color: "purple",
                  icon: FiTarget,
                },
                {
                  title: "Activity Level",
                  value: (() => {
                    const totalActivity = sortedData.reduce(
                      (sum, item) => sum + item.policies + item.claims,
                      0
                    );
                    const avgDaily =
                      sortedData.length > 0
                        ? totalActivity / sortedData.length
                        : 0;
                    if (avgDaily > 10) return "High";
                    if (avgDaily > 5) return "Medium";
                    if (avgDaily > 0) return "Low";
                    return "None";
                  })(),
                  subtitle: "overall activity",
                  color: "green",
                  icon: FiZap,
                },
                {
                  title: "Trend Stability",
                  value: (() => {
                    const policyStability = policyTrendStats.percentage < 10;
                    const claimsStability = claimsTrendStats.percentage < 10;
                    if (policyStability && claimsStability) return "Stable";
                    if (policyStability || claimsStability) return "Moderate";
                    return "Volatile";
                  })(),
                  subtitle: "trend consistency",
                  color: "blue",
                  icon: FiActivity,
                },
              ].map((analysis, index) => {
                const colorSchemes = {
                  purple: {
                    bg: "from-purple-100 to-pink-100",
                    text: "text-purple-600",
                    border: "border-purple-200",
                  },
                  green: {
                    bg: "from-emerald-100 to-green-100",
                    text: "text-emerald-600",
                    border: "border-emerald-200",
                  },
                  blue: {
                    bg: "from-blue-100 to-cyan-100",
                    text: "text-blue-600",
                    border: "border-blue-200",
                  },
                };
                const scheme = colorSchemes[analysis.color];

                return (
                  <div
                    key={index}
                    className={`relative bg-white/80 backdrop-blur-xl border ${scheme.border} shadow-lg rounded-2xl p-6 group hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${scheme.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <analysis.icon className={`h-5 w-5 ${scheme.text}`} />
                      </div>
                      <h5 className="font-bold text-gray-900">
                        {analysis.title}
                      </h5>
                    </div>

                    <div>
                      <p className={`text-2xl font-bold ${scheme.text} mb-1`}>
                        {analysis.value}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        {analysis.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalytics;
