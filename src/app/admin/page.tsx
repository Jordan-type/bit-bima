"use client"

import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../../hooks/ethers";
import Layout from "../../components/Layout/Layout";
import AdminStats from "../../components/Admin/AdminStats";
import PlanManagement from "../../components/Admin/PlanManagement";
import DoctorManagement from "../../components/Admin/DoctorManagement";
import ClaimManagement from "../../components/Admin/ClaimManagement";
import ContractControls from "../../components/Admin/ContractControls";
import { contractService } from "../../services/contract";
import {
  FiShield,
  FiSettings,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiAlertTriangle,
  FiLock,
  FiZap,
  FiActivity,
  FiBarChart,
} from "react-icons/fi";


export default function Admin() {
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [adminData, setAdminData] = useState({
    contractStats: {},
    plans: [],
    pendingClaims: [],
    authorizedDoctors: [],
    contractBalance: "0",
    totalPolicies: "0",
    totalClaims: "0",
  });

    // inside the component
  const chainId = useChainId();
  useEffect(() => {
    if (chainId) contractService.setChainId(chainId);
  }, [chainId]);

  useEffect(() => {
    if (isConnected && provider && address) {
      checkOwnerStatus();
      loadAdminData();
    }
  }, [isConnected, provider, address]);

// ⬇️ REPLACE your old checkOwnerStatus with this one
  const checkOwnerStatus = async () => {
    try {
      // read-only instances
      const core = contractService.initContract(provider, false, "core");
      const cm   = contractService.initContract(provider, false, "claim");

      const owner = await core.owner();
      if (owner?.toLowerCase?.() === address.toLowerCase()) {
        setIsOwner(true);
        return;
      }

      // Support either function name
      let isDoc = false;
      if (cm.isAuthorizedDoctor) isDoc = await cm.isAuthorizedDoctor(address);
      else if (cm.authorizedDoctors) isDoc = await cm.authorizedDoctors(address);

      setIsOwner(Boolean(isDoc));
    } catch (e) {
      console.log("Error checking owner status:", e);
      setIsOwner(false);
    }
  };

  useEffect(() => {
    if (isConnected && provider && address) {
      checkOwnerStatus();
      loadAdminData();
    }
  }, [isConnected, provider, address]);



  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Load contract stats
      const contractStats = await contractService.getContractStats(provider);

      // Load insurance plans
      const plans = await contractService.getAllInsurancePlans(provider);

      // Load pending claims (sample data for now)
      const pendingClaims = []; // In real implementation, fetch from contract events

      setAdminData({
        contractStats,
        plans,
        pendingClaims,
        authorizedDoctors: [],
        contractBalance: contractStats.contractBalance,
        totalPolicies: contractStats.totalPolicies,
        totalClaims: contractStats.totalClaims,
      });
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: FiBarChart, color: "blue" },
    { id: "plans", name: "Insurance Plans", icon: FiShield, color: "purple" },
    { id: "doctors", name: "Doctors", icon: FiUsers, color: "emerald" },
    { id: "claims", name: "Claims", icon: FiFileText, color: "orange" },
    {
      id: "controls",
      name: "Contract Controls",
      icon: FiSettings,
      color: "red",
    },
  ];

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
                <FiShield className="h-16 w-16 text-blue-600" />
              </div>

              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiSettings className="h-4 w-4 text-white" />
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
                Secure access to your admin dashboard. Connect your Web3 wallet
                to manage insurance plans, doctors, and contract settings.
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiShield className="h-4 w-4 text-blue-600" />
                  <span>Manage insurance plans & policies</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiZap className="h-4 w-4 text-emerald-600" />
                  <span>Process claims & authorize doctors</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiLock className="h-4 w-4 text-purple-600" />
                  <span>Contract controls & fund management</span>
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

  if (!isOwner) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          <div className="relative text-center max-w-md mx-auto">
            {/* Enhanced Icon */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
                <FiAlertTriangle className="h-16 w-16 text-red-600" />
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 opacity-20 blur-xl animate-pulse"></div>
            </div>

            {/* Enhanced Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Access Denied
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                You don't have permission to access this page. Only contract
                owners and authorized doctors can access admin functions.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  Your address:
                </div>
                <div className="font-mono text-sm text-gray-900 break-all">
                  {address}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Manage insurance plans, doctors, and contract settings
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-xl border border-emerald-200 shadow-sm">
              <FiShield className="w-4 h-4 mr-2" />
              <span className="text-sm font-semibold">Contract Owner</span>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl"></div>
          </div>

          <div className="relative">
            <nav className="flex space-x-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const colorSchemes = {
                  blue: {
                    active:
                      "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
                    inactive: "text-gray-600 hover:text-blue-600",
                  },
                  purple: {
                    active:
                      "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
                    inactive: "text-gray-600 hover:text-purple-600",
                  },
                  emerald: {
                    active:
                      "bg-gradient-to-r from-emerald-500 to-green-500 text-white",
                    inactive: "text-gray-600 hover:text-emerald-600",
                  },
                  orange: {
                    active:
                      "bg-gradient-to-r from-orange-500 to-red-500 text-white",
                    inactive: "text-gray-600 hover:text-orange-600",
                  },
                  red: {
                    active:
                      "bg-gradient-to-r from-red-500 to-pink-500 text-white",
                    inactive: "text-gray-600 hover:text-red-600",
                  },
                };
                const scheme = colorSchemes[tab.color];

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative inline-flex items-center px-6 py-3 font-semibold text-sm rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? `${scheme.active} shadow-lg`
                        : `${scheme.inactive} hover:bg-white/50`
                    }`}
                  >
                    <Icon
                      className={`mr-2 h-5 w-5 group-hover:scale-110 transition-transform ${
                        activeTab === tab.id ? "text-white" : ""
                      }`}
                    />
                    {tab.name}
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === "overview" && (
            <AdminStats
              data={adminData}
              loading={loading}
              onRefresh={loadAdminData}
            />
          )}

          {activeTab === "plans" && (
            <PlanManagement
              plans={adminData.plans}
              loading={loading}
              onRefresh={loadAdminData}
            />
          )}

          {activeTab === "doctors" && (
            <DoctorManagement loading={loading} onRefresh={loadAdminData} />
          )}

          {activeTab === "claims" && (
            <ClaimManagement
              claims={adminData.pendingClaims}
              loading={loading}
              onRefresh={loadAdminData}
            />
          )}

          {activeTab === "controls" && (
            <ContractControls
              contractBalance={adminData.contractBalance}
              loading={loading}
              onRefresh={loadAdminData}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
