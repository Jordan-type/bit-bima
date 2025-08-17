"use client"

import React, { useState, useEffect }  from "react";
import { useAccount } from "wagmi";

import { useEthersProvider, useEthersSigner } from "../../hooks/ethers";
import {
  FiShield,
  FiCheck,
  FiZap,
  FiLock,
  FiGlobe,
  FiSmartphone,
  FiClock,
  FiTrendingUp,
  FiStar,
  FiAward,
  FiCrown,
  FiHeart,
  FiCreditCard,
  FiBarChart,
} from "react-icons/fi";
import Layout from "../../components/Layout/Layout";
import PlanCard from "../../components/Plans/PlanCard";
import PurchaseModal from "../../components/Plans/PurchaseModal";


const PlansPage = () => {
    const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  
  return (
    <Layout>
      <div>Plans</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <PlanCard plan={{ planType: "BASIC" }} />
        <PlanCard plan={{ planType: "PREMIUM" }} />
        <PlanCard plan={{ planType: "PLATINUM" }} />
      </div>
    </Layout>
  );
};

export default PlansPage;

