"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import type { Address } from "viem";

import Layout from "@/components/Layout/Layout";
import StatsOverview from "@/components/Analytics/StatsOverview";
import PolicyAnalytics from "@/components/Analytics/PolicyAnalytics";
import ClaimsAnalytics from "@/components/Analytics/ClaimsAnalytics";
import RevenueAnalytics from "@/components/Analytics/RevenueAnalytics";
import TrendAnalytics from "@/components/Analytics/TrendAnalytics";
import ConnectGate from "@/components/common/ConnectGate";

import { contractService } from "@/services/contract";
import { policyFromChain, claimFromChain, statsFromChain } from "@/utils/chainMappers";
import { POLICY_STATUS, PAYMENT_TYPE, PLAN_TYPE, planName } from "@/types/insurance";
import type { Policy as AppPolicy, Claim as AppClaim, ContractStats as AppStats, AnalyticsData, TimeRange } from "@/types/insurance";
import { FiRefreshCw, FiDownload, FiLock, FiShield, FiZap, FiBarChart, FiActivity, FiTrendingUp, } from "react-icons/fi";

const toNum = (v: string | number | undefined | null) =>
  typeof v === "number" ? v : v ? Number(v) : 0;

const toDate = (secs: string | bigint) =>
  new Date(Number(secs) * 1000);

export default function Analytics() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalPolicies: 0,
      activePolicies: 0,
      totalClaims: 0,
      approvedClaims: 0,
      totalPremiumsPaid: 0,
      totalClaimsAmount: 0,
      totalApprovedAmount: 0,
      claimApprovalRate: 0,
      lossRatio: 0,
    },
    policies: {
      planDistribution: {},
      paymentTypeDistribution: {},
      coverageDistribution: [],
      totalCoverage: 0,
      totalUsedCoverage: 0,
    },
    claims: {
      statusDistribution: {},
      monthlyClaimsData: [],
      averageClaimAmount: 0,
      averageProcessingTime: 0,
      totalClaimsValue: 0,
    },
    revenue: {
      monthlyRevenueData: [],
      revenueByPlan: {},
      totalRevenue: 0,
      averageRevenuePerPolicy: 0,
    },
    trends: {
      policyTrend: [],
      claimsTrend: [],
    },
  });

  useEffect(() => {
    if (isConnected && publicClient && address) void loadAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, publicClient, address, timeRange]);

const loadAnalyticsData = async () => {
  if (!publicClient || !address) return;
  try {
    setLoading(true);

    // ⬇️ fetch CHAIN types (no casting!)
    const [policiesChain, statsChain] = await Promise.all([
      contractService.getUserPolicies(address as Address, publicClient), // Promise<ChainPolicy[]>
      contractService.getContractStats(publicClient),                    // Promise<ChainStats>
    ]);

    // ⬇️ map to APP types
    const userPolicies: AppPolicy[] = policiesChain.map(policyFromChain);

    const claimsArraysChain = await Promise.all(
      policiesChain.map(p =>
        contractService.getPolicyClaims(p.policyId, publicClient) // Promise<ChainClaim[]>
      )
    );
    const allClaims: AppClaim[] = claimsArraysChain.flat().map(claimFromChain);

    const contractStats: AppStats = statsFromChain(statsChain);

    const processed = processAnalyticsData(
      userPolicies,
      allClaims,
      contractStats,
      timeRange
    );
    setAnalyticsData(processed);
  } catch (err) {
    console.error("Error loading analytics data:", err);
  } finally {
    setLoading(false);
  }
};

  // ---------- analytics helpers ----------
  const getTimeRangeMs = (range: TimeRange): number => {
    switch (range) {
      case "7d": return 7 * 24 * 60 * 60 * 1000;
      case "30d": return 30 * 24 * 60 * 60 * 1000;
      case "90d": return 90 * 24 * 60 * 60 * 1000;
      case "1y": return 365 * 24 * 60 * 60 * 1000;
    }
  };

  const processAnalyticsData = (
    policies: AppPolicy[],
    claims: AppClaim[],
    contractStats: AppStats,
    range: TimeRange
  ): AnalyticsData => {
    const now = new Date();
    const startDate = new Date(now.getTime() - getTimeRangeMs(range));

    const filteredPolicies = policies.filter((p) => toDate(p.startDate) >= startDate);
    const filteredClaims = claims.filter((c) => toDate(c.submissionDate) >= startDate);

    const overview = calculateOverviewStats(policies, claims, contractStats);
    const policyAnalytics = calculatePolicyAnalytics(filteredPolicies);
    const claimsAnalytics = calculateClaimsAnalytics(filteredClaims);
    const revenueAnalytics = calculateRevenueAnalytics(filteredPolicies);
    const trendAnalytics = calculateTrendAnalytics(filteredPolicies, filteredClaims, range);

    return {
      overview,
      policies: policyAnalytics,
      claims: claimsAnalytics,
      revenue: revenueAnalytics,
      trends: trendAnalytics,
    };
  };

  const calculateOverviewStats = (
    policies: AppPolicy[],
    claims: AppClaim[],
    _contractStats: AppStats
  ): AnalyticsData["overview"] => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter((p) => Number(p.status) === POLICY_STATUS.ACTIVE).length;
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(
      (c) => Number(c.status) === 1 || Number(c.status) === 3
    ).length;

    const totalPremiumsPaid = policies.reduce((sum, p) => sum + toNum(p.totalPaid), 0);
    const totalClaimsAmount = claims.reduce((sum, c) => sum + toNum(c.claimAmount), 0);
    const totalApprovedAmount = claims.reduce((sum, c) => {
      const approved = Number(c.status) === 1 || Number(c.status) === 3 ? toNum(c.approvedAmount) : 0;
      return sum + approved;
    }, 0);

    return {
      totalPolicies,
      activePolicies,
      totalClaims,
      approvedClaims,
      totalPremiumsPaid,
      totalClaimsAmount,
      totalApprovedAmount,
      claimApprovalRate: totalClaims ? (approvedClaims / totalClaims) * 100 : 0,
      lossRatio: totalPremiumsPaid ? (totalApprovedAmount / totalPremiumsPaid) * 100 : 0,
    };
  };

  const calculatePolicyAnalytics = (policies: AppPolicy[]): AnalyticsData["policies"] => {
    const planDistribution = policies.reduce<Record<string, number>>((acc, p) => {
      const name = planName(p.planType);
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {});

    const paymentTypeDistribution = policies.reduce<Record<string, number>>((acc, p) => {
      const type = Number(p.paymentType) === PAYMENT_TYPE.ONE_TIME ? "One-time" : "Monthly";
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    }, {});

    const coverageDistribution = policies.map((p) => {
      const coverage = toNum(p.coverageAmount);
      const used = toNum(p.claimsUsed);
      return {
        policyId: p.policyId,
        coverage,
        used,
        remaining: Math.max(coverage - used, 0),
      };
    });

    return {
      planDistribution,
      paymentTypeDistribution,
      coverageDistribution,
      totalCoverage: policies.reduce((s, p) => s + toNum(p.coverageAmount), 0),
      totalUsedCoverage: policies.reduce((s, p) => s + toNum(p.claimsUsed), 0),
    };
  };

  const calculateClaimsAnalytics = (claims: AppClaim[]): AnalyticsData["claims"] => {
    const statusLabels = ["Pending", "Approved", "Rejected", "Paid"] as const;
    const statusDistribution = claims.reduce<Record<string, number>>((acc, c) => {
      const label = statusLabels[Number(c.status)] ?? "Unknown";
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});

    const monthlyClaimsData = generateMonthlyData(claims, "submissionDate");

    const averageClaimAmount =
      claims.length ? claims.reduce((s, c) => s + toNum(c.claimAmount), 0) / claims.length : 0;

    const processed = claims.filter((c) => c.processedDate && String(c.processedDate) !== "0");
    const avgProcessingSecs = processed.reduce((sum, c) => {
      const secs = Number(c.processedDate ?? 0) - Number(c.submissionDate ?? 0);
      return sum + secs;
    }, 0) / (processed.length || 1);

    return {
      statusDistribution,
      monthlyClaimsData,
      averageClaimAmount,
      averageProcessingTime: avgProcessingSecs / (24 * 60 * 60),
      totalClaimsValue: claims.reduce((s, c) => s + toNum(c.claimAmount), 0),
    };
  };

  const calculateRevenueAnalytics = (policies: AppPolicy[]): AnalyticsData["revenue"] => {
    const monthlyRevenueData = generateMonthlyData(policies, "startDate", "totalPaid");

    const revenueByPlan = policies.reduce<Record<string, number>>((acc, p) => {
      const name = planName(p.planType);
      acc[name] = (acc[name] ?? 0) + toNum(p.totalPaid);
      return acc;
    }, {});

    const totalRevenue = policies.reduce((s, p) => s + toNum(p.totalPaid), 0);
    const averageRevenuePerPolicy = policies.length ? totalRevenue / policies.length : 0;

    return { monthlyRevenueData, revenueByPlan, totalRevenue, averageRevenuePerPolicy };
  };

  const calculateTrendAnalytics = (
    policies: AppPolicy[],
    claims: AppClaim[],
    range: TimeRange
  ): AnalyticsData["trends"] => {
    const policyTrend = generateTrendData(policies, "startDate", range);
    const claimsTrend = generateTrendData(claims, "submissionDate", range);
    return { policyTrend, claimsTrend };
  };

  const generateMonthlyData = <
    T extends Record<string, unknown>
  >(
    data: T[],
    dateField: keyof T,
    valueField?: keyof T
  ): Array<{ month: string; count: number; value: number }> => {
    const monthly: Record<string, { count: number; value: number }> = {};

    data.forEach((item) => {
      const d = toDate(item[dateField] as string | bigint);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthly[key]) monthly[key] = { count: 0, value: 0 };
      monthly[key].count += 1;
      if (valueField) monthly[key].value += toNum(item[valueField] as any);
    });

    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }));
  };

  const generateTrendData = <
    T extends Record<string, unknown>
  >(
    data: T[],
    dateField: keyof T,
    range: TimeRange
  ): Array<{ date: string; count: number }> => {
    const periods = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const out: Array<{ date: string; count: number }> = [];

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const iso = date.toISOString().split("T")[0];

      const count = data.filter((item) => {
        const d = toDate(item[dateField] as string | bigint);
        return d.toDateString() === date.toDateString();
      }).length;

      out.push({ date: iso, count });
    }
    return out;
  };

  const exportAnalytics = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const file = `analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.json`;

    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", file);
    link.click();
  };

  // ---------------- UI ----------------
  if (!isConnected) {
    return (
      <Layout>
<div className="relative min-h-[600px] flex items-center justify-center">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "4s" }}
            ></div>
          </div>

          <div className="relative text-center max-w-md mx-auto">
            {/* Enhanced Icon */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
                <FiBarChart className="h-16 w-16 text-blue-600" />
              </div>

              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiActivity className="h-4 w-4 text-white" />
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-xl animate-pulse"></div>
            </div>

            {/* Enhanced Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Secure access to your analytics dashboard. Connect your Web3
                wallet to view comprehensive insights and performance metrics.
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiShield className="h-4 w-4 text-blue-600" />
                  <span>Advanced analytics & insights</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiZap className="h-4 w-4 text-emerald-600" />
                  <span>Real-time performance tracking</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiLock className="h-4 w-4 text-purple-600" />
                  <span>Secure data visualization</span>
                </div>
              </div>

              {/* Connect button */}
              <button className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <FiLock className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Connect Wallet</span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* header & controls */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
            <p className="mt-2 text-gray-600">Comprehensive analytics for your insurance portfolio</p>
          </div>

          <div className="flex items-center space-x-4 relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <button
              onClick={exportAnalytics}
              className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <FiDownload className="-ml-1 mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Export Data
            </button>

            <button
              onClick={loadAnalyticsData}
              disabled={loading}
              className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <FiRefreshCw className={`-ml-1 mr-2 h-4 w-4 ${loading ? "animate-spin" : "group-hover:scale-110"} transition-transform`} />
              Refresh
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>

        {/* top stats */}
        <StatsOverview data={analyticsData.overview} loading={loading} />

        {/* charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <PolicyAnalytics data={analyticsData.policies} loading={loading} />
          <ClaimsAnalytics data={analyticsData.claims} loading={loading} />
        </div>

        <RevenueAnalytics data={analyticsData.revenue} loading={loading} timeRange={timeRange} />
        <TrendAnalytics data={analyticsData.trends} loading={loading} timeRange={timeRange} />
      </div>
    </Layout>
  );
}
