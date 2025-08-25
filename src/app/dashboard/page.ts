"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  FiWifi,
  FiShield,
  FiZap,
  FiLock,
  FiRefreshCw,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";

import { useEthersProvider, useEthersSigner } from "../../hooks/ethers";
import Layout from "../../components/Layout/Layout";
import StatsCards from "../../components/Dashboard/StatsCards";
import RecentActivity from "../../components/Dashboard/RecentActivity";
import QuickActions from "../../components/Dashboard/QuickActions";
import PolicyOverview from "../../components/Dashboard/PolicyOverview";
import ClaimsOverview from "../../components/Dashboard/ClaimsOverview";

export default function Dashboard() {
    const { account } = useAccount();
    const provider = useEthersProvider();
    const signer = useEthersSigner();

    return (
        <Layout>
            <div className="space-y-8">
                <StatsCards />
                <RecentActivity />
                <QuickActions />
                <PolicyOverview />
                <ClaimsOverview />
            </div>
        </Layout>
    );
}
