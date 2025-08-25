import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  FiDollarSign,
  FiTrendingUp,
  FiBarChart,
  FiTarget,
  FiActivity,
  FiPieChart,
  FiShield,
  FiZap,
} from "react-icons/fi";

const RevenueAnalytics = ({ data, loading, timeRange }) => {
  if (loading) {
    return (
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div
            className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
              <FiDollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Revenue Analytics
            </h3>
          </div>

          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
            <div className="grid grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"
                ></div>
              ))}
            </div>
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const monthlyData = data.monthlyRevenueData || [];
  const revenueByPlanData = Object.entries(data.revenueByPlan || {}).map(
    ([plan, revenue]) => ({
      plan,
      revenue: parseFloat(revenue),
    })
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-xl p-4">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((pld, index) => (
            <p
              key={index}
              style={{ color: pld.color }}
              className="text-sm font-medium"
            >
              {`${pld.dataKey}: ${parseFloat(pld.value).toFixed(4)} ETH`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem) => {
    if (timeRange === "7d" || timeRange === "30d") {
      return new Date(tickItem).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return tickItem;
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-500/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/5 rounded-full blur-xl"></div>
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
            <FiDollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Revenue Analytics
            </h3>
            <p className="text-gray-600">
              Track and analyze your revenue performance
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Monthly Revenue Trend */}
          {monthlyData.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <FiTrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Revenue Trend
                </h4>
              </div>

              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="50%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatXAxis}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value.toFixed(2)} ETH`}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Revenue by Plan */}
          {revenueByPlanData.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <FiBarChart className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Revenue by Plan Type
                </h4>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByPlanData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="plan"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value.toFixed(2)} ETH`}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="revenue"
                      fill="url(#barGradient)"
                      name="Revenue"
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl p-6 text-white overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium mb-1">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold mb-1">
                    {(data.totalRevenue || 0).toFixed(4)} ETH
                  </p>
                  <p className="text-emerald-200 text-xs">All-time earnings</p>
                </div>
                <div className="w-14 h-14 bg-emerald-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiDollarSign className="h-7 w-7" />
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">
                    Avg Revenue per Policy
                  </p>
                  <p className="text-3xl font-bold mb-1">
                    {(data.averageRevenuePerPolicy || 0).toFixed(4)} ETH
                  </p>
                  <p className="text-blue-200 text-xs">Per policy average</p>
                </div>
                <div className="w-14 h-14 bg-blue-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiTarget className="h-7 w-7" />
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">
                    Growth Rate
                  </p>
                  <p className="text-3xl font-bold mb-1">+23.5%</p>
                  <p className="text-purple-200 text-xs">vs last period</p>
                </div>
                <div className="w-14 h-14 bg-purple-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiTrendingUp className="h-7 w-7" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown by Plan */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <FiPieChart className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                Revenue Breakdown
              </h4>
            </div>

            <div className="space-y-4">
              {Object.entries(data.revenueByPlan || {}).map(
                ([plan, revenue]) => {
                  const percentage =
                    data.totalRevenue > 0
                      ? (parseFloat(revenue) / data.totalRevenue) * 100
                      : 0;
                  const planColors = {
                    Basic: {
                      bg: "from-blue-500 to-blue-600",
                      dot: "bg-blue-500",
                    },
                    Premium: {
                      bg: "from-purple-500 to-purple-600",
                      dot: "bg-purple-500",
                    },
                    Enterprise: {
                      bg: "from-yellow-500 to-yellow-600",
                      dot: "bg-yellow-500",
                    },
                  };
                  const colorScheme = planColors[plan] || {
                    bg: "from-gray-500 to-gray-600",
                    dot: "bg-gray-500",
                  };

                  return (
                    <div
                      key={plan}
                      className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg rounded-2xl p-4 group hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-4 h-4 rounded-full ${colorScheme.dot}`}
                          ></div>
                          <div className="flex items-center space-x-2">
                            <FiShield className="h-4 w-4 text-gray-500" />
                            <span className="font-bold text-gray-900">
                              {plan} Plan
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-lg">
                            {parseFloat(revenue).toFixed(4)} ETH
                          </div>
                          <div className="text-sm font-medium text-gray-600">
                            {percentage.toFixed(1)}% of total
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${colorScheme.bg} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Revenue Insights */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-xl border border-white/50 rounded-2xl p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                <FiZap className="h-5 w-5 text-cyan-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                Revenue Insights
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg rounded-2xl p-6 group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiTarget className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 mb-1">
                      Top Performing Plan
                    </h5>
                    <p className="text-2xl font-bold text-indigo-600">
                      {
                        Object.entries(data.revenueByPlan || {}).reduce(
                          (a, b) =>
                            parseFloat(a[1]) > parseFloat(b[1]) ? a : b,
                          ["None", 0]
                        )[0]
                      }
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {(
                        (Object.entries(data.revenueByPlan || {}).reduce(
                          (a, b) =>
                            parseFloat(a[1]) > parseFloat(b[1]) ? a : b,
                          ["None", 0]
                        )[1] /
                          (data.totalRevenue || 1)) *
                        100
                      ).toFixed(1)}
                      % of total revenue
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg rounded-2xl p-6 group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiActivity className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 mb-1">
                      Revenue Efficiency
                    </h5>
                    <p className="text-2xl font-bold text-emerald-600">
                      {data.totalRevenue && monthlyData.length > 0
                        ? (data.totalRevenue / monthlyData.length).toFixed(4)
                        : "0.0000"}{" "}
                      ETH
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      Average per period
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
