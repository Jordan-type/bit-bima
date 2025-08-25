import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FiTrendingUp,
  FiPieChart,
  FiBarChart,
  FiActivity,
  FiDollarSign,
  FiClock,
  FiTarget,
  FiX,
} from "react-icons/fi";

const ClaimsAnalytics = ({ data, loading }) => {
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
              <FiBarChart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Claims Analytics
            </h3>
          </div>

          <div className="animate-pulse space-y-6">
            <div className="h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
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

  const statusData = Object.entries(data.statusDistribution || {}).map(
    ([status, count]) => ({
      name: status,
      value: count,
    })
  );

  const monthlyData = data.monthlyClaimsData || [];

  const COLORS = {
    Pending: "#f59e0b",
    Approved: "#10b981",
    Rejected: "#ef4444",
    Paid: "#06b6d4",
  };

  const getColorForStatus = (status) => COLORS[status] || "#6b7280";

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
              {`${pld.dataKey}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
            <FiBarChart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Claims Analytics
            </h3>
            <p className="text-gray-600">
              Comprehensive insights into your claims data
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Claims Status Distribution */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <FiPieChart className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                Claims Status Distribution
              </h4>
            </div>

            {statusData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getColorForStatus(entry.name)}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                    <FiPieChart className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No claims data available
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Claims Trend */}
          {monthlyData.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <FiTrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">
                  Monthly Claims Trend
                </h4>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="month"
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
                      dataKey="count"
                      stroke="url(#colorGradient)"
                      strokeWidth={3}
                      name="Claims Count"
                      dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#6366f1" }}
                    />
                    <defs>
                      <linearGradient
                        id="colorGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Claims Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiDollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {(data.averageClaimAmount || 0).toFixed(4)} ETH
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    Average Claim Amount
                  </div>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-2xl"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiClock className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-700">
                    {(data.averageProcessingTime || 0).toFixed(1)} days
                  </div>
                  <div className="text-sm font-medium text-emerald-600">
                    Avg Processing Time
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Claims Value - Featured Card */}
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl"></div>

            <div className="relative text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                <FiTarget className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-700 mb-2">
                {(data.totalClaimsValue || 0).toFixed(4)} ETH
              </div>
              <div className="text-lg font-semibold text-purple-600">
                Total Claims Value
              </div>
              <p className="text-purple-500 mt-2">
                Cumulative value of all processed claims
              </p>
            </div>
          </div>

          {/* Status Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.statusDistribution || {}).map(
              ([status, count]) => {
                const statusIcons = {
                  Pending: FiClock,
                  Approved: FiTarget,
                  Rejected: FiX,
                  Paid: FiActivity,
                };
                const StatusIcon = statusIcons[status] || FiActivity;

                return (
                  <div
                    key={status}
                    className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg rounded-2xl p-4 group hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div
                      className="absolute inset-0 rounded-2xl opacity-10"
                      style={{ backgroundColor: getColorForStatus(status) }}
                    ></div>
                    <div className="relative text-center">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${getColorForStatus(
                            status
                          )}20, ${getColorForStatus(status)}10)`,
                          border: `1px solid ${getColorForStatus(status)}30`,
                        }}
                      >
                        <StatusIcon
                          className="h-5 w-5"
                          style={{ color: getColorForStatus(status) }}
                        />
                      </div>
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{ color: getColorForStatus(status) }}
                      >
                        {count}
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {status}
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimsAnalytics;
