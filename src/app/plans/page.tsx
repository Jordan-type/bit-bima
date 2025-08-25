"use client"

import { useEffect, useState, useCallback } from "react";
import type { Address } from "viem";
import { useAccount, useChainId, usePublicClient, useWalletClient  } from "wagmi";
import { FiShield, FiCheck, FiZap, FiLock, FiGlobe, FiSmartphone, FiClock, FiTrendingUp, FiStar, FiAward, FiHeart, FiCreditCard, FiBarChart, } from "react-icons/fi";
import Layout from "@/components/Layout/Layout";
import PlanCard from "@/components/Plans/PlanCard";
import PurchaseModal from "@/components/Plans/PurchaseModal";
import { PLAN_TYPES } from "@/constant/index";
import { contractService } from "@/services/contract";
import type { Plan } from "@/types/app";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";
import ConnectGate from "@/components/common/ConnectGate";


export default function InsurancePlans() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient(); // available for writes if/when needed

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [netErr, setNetErr] = useState<string | null>(null);

 const loadPlans = useCallback(async () => {
    try {
      setNetErr(null);
      if (!publicClient) return;

      // point the service to correct addresses for this chain
      contractService.setChainId(chainId);

      setLoading(true);
      const list = await contractService.getAllInsurancePlans(publicClient);
      setPlans(list);
    } catch (e: any) {
      console.error("loadPlans:", e);
      setNetErr(e?.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, [publicClient, chainId]);

  useEffect(() => {
    if (isConnected && publicClient) {
      loadPlans();
    } else {
      setLoading(false);
    }
  }, [isConnected, publicClient, loadPlans]);

  const handlePurchase = (plan: Plan) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    setSelectedPlan(plan);
    setPurchaseModalOpen(true);
  };

  const planFeatures = {
    [PLAN_TYPES.BASIC]: [
      "Basic medical coverage",
      "Emergency services",
      "Generic medications",
      "Preventive care",
      "24/7 helpline support",
    ],
    [PLAN_TYPES.PREMIUM]: [
      "Comprehensive medical coverage",
      "Specialist consultations",
      "Brand medications",
      "Dental and vision care",
      "Mental health services",
      "Telemedicine access",
      "Priority customer support",
    ],
    [PLAN_TYPES.PLATINUM]: [
      "Premium medical coverage",
      "All specialist consultations",
      "All medications covered",
      "Comprehensive dental & vision",
      "Mental health & wellness",
      "Alternative medicine",
      "Concierge medical services",
      "Global coverage",
      "Dedicated account manager",
    ],
  };

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
            {/* Enhanced Wallet Icon */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
                <FiShield className="h-16 w-16 text-blue-600" />
              </div>

              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiLock className="h-4 w-4 text-white" />
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
                Secure access to your blockchain insurance policies. Connect
                your Web3 wallet to view coverage, manage claims, and track your
                protection.
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiShield className="h-4 w-4 text-blue-600" />
                  <span>View all your insurance policies</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiZap className="h-4 w-4 text-emerald-600" />
                  <span>Manage premium payments</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiBarChart className="h-4 w-4 text-purple-600" />
                  <span>Track coverage usage</span>
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
      <div className="space-y-16">
        {/* Enhanced Header */}
        <div className="relative text-center">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-12 lg:p-16 shadow-2xl border border-white/50 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-cyan-50/30"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl"></div>

            {/* Floating particles */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
            <div
              className="absolute top-1/2 right-1/4 w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-pulse"
              style={{ animationDelay: "4s" }}
            ></div>

            <div className="relative">
              {/* Enhanced Icon with glow effect */}
              <div className="relative inline-block mb-8">
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/20">
                  <FiShield className="h-12 w-12 text-white drop-shadow-lg" />
                </div>

                {/* Floating indicators */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse flex items-center justify-center">
                  <FiCheck className="h-3 w-3 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <FiLock className="h-2.5 w-2.5 text-white" />
                </div>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                Choose Your
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Health Insurance Plan
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
                Protect yourself and your family with our comprehensive,
                <span className="font-semibold text-blue-600">
                  {" "}
                  blockchain-powered
                </span>{" "}
                health insurance plans. Pay with cryptocurrency and enjoy
                transparent, instant claims processing.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-gray-600">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-full border border-green-200/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Blockchain Secured</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-full border border-blue-200/50">
                  <FiZap className="h-3 w-3 text-blue-600" />
                  <span>Instant Claims</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-full border border-purple-200/50">
                  <FiGlobe className="h-3 w-3 text-purple-600" />
                  <span>Global Coverage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Plans Grid */}
        <div className="relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Select Your Protection Level
            </h2>
            <p className="text-lg text-gray-600">
              All plans include blockchain security and smart contract
              automation
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="group animate-pulse">
                  <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 overflow-hidden">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>

                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mx-auto mb-6"></div>
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2 mx-auto mb-4"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mx-auto mb-6"></div>
                      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mx-auto mb-8"></div>
                      <div className="space-y-3 mb-8">
                        {[...Array(5)].map((_, j) => (
                          <div
                            key={j}
                            className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"
                          ></div>
                        ))}
                      </div>
                      <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={plan.planType}
                  className="transform transition-all duration-500"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <PlanCard
                    plan={plan}
                    features={planFeatures[plan.planType] || []}
                    popular={index === 1} // Make Premium plan popular
                    onPurchase={() => handlePurchase(plan)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Features Section */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-12 lg:p-16 shadow-2xl border border-white/50 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/30 via-white/50 to-gray-50/30"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl"></div>

          <div className="relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FiStar className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Why Choose Our Insurance?
                </h2>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the future of health insurance with blockchain
                technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Instant Claims",
                  description:
                    "Submit and process claims instantly using smart contracts",
                  icon: FiZap,
                  gradient: "from-yellow-500 to-orange-500",
                  bgGradient: "from-yellow-50 to-orange-50",
                },
                {
                  title: "Transparent Pricing",
                  description:
                    "No hidden fees. All costs are transparent on the blockchain",
                  icon: FiTrendingUp,
                  gradient: "from-emerald-500 to-green-500",
                  bgGradient: "from-emerald-50 to-green-50",
                },
                {
                  title: "Global Coverage",
                  description: "Your insurance works anywhere in the world",
                  icon: FiGlobe,
                  gradient: "from-blue-500 to-cyan-500",
                  bgGradient: "from-blue-50 to-cyan-50",
                },
                {
                  title: "Secure Payments",
                  description:
                    "Pay premiums with cryptocurrency for enhanced security",
                  icon: FiLock,
                  gradient: "from-purple-500 to-violet-500",
                  bgGradient: "from-purple-50 to-violet-50",
                },
                {
                  title: "No Paperwork",
                  description:
                    "Everything is digital and stored securely on IPFS",
                  icon: FiSmartphone,
                  gradient: "from-pink-500 to-rose-500",
                  bgGradient: "from-pink-50 to-rose-50",
                },
                {
                  title: "24/7 Access",
                  description: "Manage your policy anytime, anywhere",
                  icon: FiClock,
                  gradient: "from-indigo-500 to-blue-500",
                  bgGradient: "from-indigo-50 to-blue-50",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-50 group-hover:opacity-70 transition-opacity`}
                  ></div>

                  <div className="relative text-center">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-8 w-8 text-white drop-shadow-sm" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover glow effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-12 lg:p-16 shadow-2xl border border-white/50 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-cyan-50/30"></div>

          <div className="relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FiHeart className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900">
                  Frequently Asked Questions
                </h2>
              </div>
              <p className="text-lg text-gray-600">
                Everything you need to know about blockchain insurance
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                {
                  question: "How do I pay for my insurance?",
                  answer:
                    "You can pay using ETH or other supported cryptocurrencies. Choose between one-time annual payment or monthly installments.",
                  icon: FiCreditCard,
                  gradient: "from-green-500 to-emerald-500",
                },
                {
                  question: "How are claims processed?",
                  answer:
                    "Claims are processed automatically using smart contracts. Once approved by our medical team, payments are instant.",
                  icon: FiZap,
                  gradient: "from-yellow-500 to-orange-500",
                },
                {
                  question: "Is my data secure?",
                  answer:
                    "Yes, all your medical data is encrypted and stored on IPFS. Only you and authorized medical professionals can access it.",
                  icon: FiLock,
                  gradient: "from-purple-500 to-violet-500",
                },
                {
                  question: "Can I upgrade my plan?",
                  answer:
                    "Yes, you can upgrade your plan at any time. The price difference will be calculated and charged accordingly.",
                  icon: FiTrendingUp,
                  gradient: "from-blue-500 to-cyan-500",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Background gradient on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${faq.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                  ></div>

                  <div className="relative">
                    <div className="flex items-start space-x-4 mb-4">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${faq.gradient} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}
                      >
                        <faq.icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed pl-14">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Call-to-Action */}
        <div className="text-center bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl p-12 text-white shadow-2xl overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.1),_transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(255,255,255,0.1),_transparent_50%)]"></div>

          <div className="relative">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Protected?</h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust our
              blockchain-powered health insurance
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <FiShield className="h-4 w-4" />
                <span>100% Blockchain Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiZap className="h-4 w-4" />
                <span>Instant Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiGlobe className="h-4 w-4" />
                <span>Global Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        plan={selectedPlan}
        onSuccess={() => {
          setPurchaseModalOpen(false);
          // Optionally redirect to policies page
        }}
      />
    </Layout>
  );
}
