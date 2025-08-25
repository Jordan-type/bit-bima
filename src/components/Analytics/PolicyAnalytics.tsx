// components/Analytics/PolicyAnalytics.tsx
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import type { NameType, ValueType, Payload } from "recharts/types/component/DefaultTooltipContent";
import { FiShield, FiPieChart, FiBarChart, FiCreditCard, FiTrendingUp, FiActivity } from "react-icons/fi";
import type { PolicyAnalyticsData } from "@/types/insurance";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";

type Props = { data: PolicyAnalyticsData; loading: boolean };

type CTProps = {
  active?: boolean;
  payload?: Payload<ValueType, NameType>[]; // recharts' payload item type
  label?: string | number;
};

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const CustomTooltip = ({ active, payload, label }: CTProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-xl p-4">
        <p className="font-bold text-gray-900 mb-2">{String(label)}</p>
        {payload.map((pld, i) => (
          <p key={i} style={{ color: (pld?.color as string) ?? "#111827" }} className="text-sm font-medium">
            {`${String(pld?.name)}: ${Number(pld?.value ?? 0)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PolicyAnalytics({ data, loading }: Props) {
  if (loading) {
    // keep your skeleton loader here (unchanged)
    return (
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
        <div className="relative">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <FiShield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Policy Analytics</h3>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
              <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planData = Object.entries(data.planDistribution || {}).map(([plan, count]) => ({
    name: plan,
    value: count,
  }));

  const paymentData = Object.entries(data.paymentTypeDistribution || {}).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const coverageData = (data.coverageDistribution || []).map((it) => ({
    policy: `Policy ${String(it.policyId)}`,
    total: it.coverage,
    used: it.used,
    remaining: it.remaining,
  }));

  return (
    <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
      <div className="relative">
        {/* header */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
            <FiShield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Policy Analytics</h3>
            <p className="text-gray-600">Comprehensive insights into your policy portfolio</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* plan distribution */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <FiPieChart className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Plan Distribution</h4>
            </div>

            {planData.length ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {planData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
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
                  <p className="text-gray-500 font-medium">No policy data available</p>
                </div>
              </div>
            )}
          </div>

          {/* payment types */}
          <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                <FiCreditCard className="h-5 w-5 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Payment Types</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentData.map((row, idx) => (
                <div
                  key={row.name}
                  className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg rounded-2xl p-6 group hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="relative text-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${COLORS[idx % COLORS.length]}20, ${COLORS[idx % COLORS.length]}10)`,
                        border: `1px solid ${COLORS[idx % COLORS.length]}30`,
                      }}
                    >
                      <FiCreditCard className="h-6 w-6" style={{ color: COLORS[idx % COLORS.length] }} />
                    </div>
                    <div className="text-3xl font-bold mb-2" style={{ color: COLORS[idx % COLORS.length] }}>
                      {row.value}
                    </div>
                    <div className="text-sm font-semibold text-gray-600 capitalize">{row.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* coverage utilization */}
          {coverageData.length > 0 && (
            <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                  <FiBarChart className="h-5 w-5 text-orange-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Coverage Utilization</h4>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coverageData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="policy" tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={{ stroke: "#d1d5db" }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} tickLine={{ stroke: "#d1d5db" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="used" stackId="a" fill="url(#usedGradient)" name="Used" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="remaining" stackId="a" fill="url(#remainingGradient)" name="Remaining" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="usedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                      <linearGradient id="remainingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 group hover:shadow-xl transition-all duration-300">
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiTrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {(data.totalCoverage || 0).toFixed(2)} ETH
                  </div>
                  <div className="text-sm font-medium text-blue-600">Total Coverage</div>
                  <div className="text-xs text-blue-500 mt-1">Available protection amount</div>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 group hover:shadow-xl transition-all duration-300">
              <div className="relative flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiActivity className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-700">
                    {(data.totalUsedCoverage || 0).toFixed(2)} ETH
                  </div>
                  <div className="text-sm font-medium text-red-600">Coverage Used</div>
                  <div className="text-xs text-red-500 mt-1">Amount claimed so far</div>
                </div>
              </div>
            </div>
          </div>

          {/* utilization rate */}
          {data.totalCoverage > 0 && (
            <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8 overflow-hidden">
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                  <FiActivity className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-4xl font-bold text-purple-700 mb-2">
                  {(((data.totalUsedCoverage || 0) / (data.totalCoverage || 1)) * 100).toFixed(2)}%
                </div>
                <div className="text-lg font-semibold text-purple-600">Coverage Utilization Rate</div>
                <p className="text-purple-500 mt-2">Percentage of total coverage that has been claimed</p>

                <div className="mt-6 bg-white/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(((data.totalUsedCoverage || 0) / (data.totalCoverage || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
