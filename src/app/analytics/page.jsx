"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider } from "../provider/hooks";
import {
  FiRefreshCw,
  FiTrendingUp,
  FiDownload,
  FiLock,
  FiShield,
  FiZap,
  FiActivity,
  FiBarChart,
} from "react-icons/fi";
import Layout from "../../components/Layout/Layout";
import StatsOverview from "../../components/Analytics/StatsOverview";
import PolicyAnalytics from "../../components/Analytics/PolicyAnalytics";
import ClaimsAnalytics from "../../components/Analytics/ClaimsAnalytics";
import RevenueAnalytics from "../../components/Analytics/RevenueAnalytics";
import TrendAnalytics from "../../components/Analytics/TrendAnalytics";

const AnalyticsPage = () => {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics & Insights
            </h1>
            <p className="mt-2 text-gray-600">
              Comprehensive analytics for your insurance portfolio
            </p>
          </div>
        </div>
        <StatsOverview />
        <PolicyAnalytics />
        <ClaimsAnalytics />
        <RevenueAnalytics />
        <TrendAnalytics />
      </div>
    </Layout>
  );
};

export default AnalyticsPage;

