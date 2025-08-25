import React, { useState } from "react";
import { Address, parseEther } from "viem";
import { usePublicClient, useWalletClient, useChainId } from "wagmi";
import { contractService } from "@/services/contract";
import { PLAN_TYPES } from "@/constant";
import { uploadJSONToPinata } from "@/services/pinata";
import { FiEdit3, FiSave, FiX, FiUpload, FiShield, FiDollarSign, FiActivity, FiTarget, FiCheck, FiSettings } from "react-icons/fi";
import toast from "react-hot-toast";

type Plan = {
  planType: number;
  oneTimePrice: bigint;
  monthlyPrice: bigint;
  coverageAmount: bigint;
  deductible: bigint;
  ipfsHash: string;
  isActive: boolean;
};
const getPlanName = (t: number) =>
  t === PLAN_TYPES.BASIC ? "Basic" :
  t === PLAN_TYPES.PREMIUM ? "Premium" :
  t === PLAN_TYPES.PLATINUM ? "Platinum" : "Unknown";

const PlanManagement: React.FC<{plans: Plan[]; loading: boolean; onRefresh: () => void;}> = ({ plans, loading, onRefresh }) => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  const [planData, setPlanData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [uploadingMetadata, setUploadingMetadata] = useState(false);

  if (chainId) contractService.setChainId(chainId);

  const handleEditPlan = (p: Plan) => {
    setEditingPlan(p.planType);
    setPlanData({
      // Present in ETH for user editing
      oneTimePrice: Number(p.oneTimePrice) ? "" + Number(p.oneTimePrice) / 1e18 : "0",
      monthlyPrice: Number(p.monthlyPrice) ? "" + Number(p.monthlyPrice) / 1e18 : "0",
      coverageAmount: Number(p.coverageAmount) ? "" + Number(p.coverageAmount) / 1e18 : "0",
      deductible: Number(p.deductible) ? "" + Number(p.deductible) / 1e18 : "0",
      ipfsHash: p.ipfsHash,
    });
  };

  const handleSavePlan = async () => {
    if (!walletClient || !publicClient || editingPlan == null) return toast.error("Wallet not connected");

    try {
      setSaving(true);

      const res = await contractService.pmUpdateInsurancePlan(
        editingPlan,
        parseEther(String(planData.oneTimePrice || "0")),
        parseEther(String(planData.monthlyPrice || "0")),
        parseEther(String(planData.coverageAmount || "0")),
        parseEther(String(planData.deductible || "0")),
        walletClient,
        publicClient
      );

      if (res.success) {
        toast.success("Plan updated");
        setEditingPlan(null);
        setPlanData({});
        onRefresh();
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMetadata = async (planType: number) => {
    if (!walletClient || !publicClient) return toast.error("Wallet not connected");

    try {
      setUploadingMetadata(true);
      const metadata = {
        planType: getPlanName(planType),
        description: `${getPlanName(planType)} health insurance plan`,
        features: [], // fill if you want
        terms: "Terms and conditions apply",
        lastUpdated: new Date().toISOString(),
      };
      const pin = await uploadJSONToPinata(metadata, `plan-${getPlanName(planType).toLowerCase()}-metadata.json`);
      if (!pin.success || !pin.ipfsHash) throw new Error("Pinata upload failed");

      const res = await contractService.pmUpdatePlanMetadata(
        planType,
        pin.ipfsHash,
        walletClient,
        publicClient
      );

      if (res.success) {
        toast.success("Metadata updated");
        onRefresh();
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Metadata update failed");
    } finally {
      setUploadingMetadata(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Insurance Plan Management</h2>
        <p className="text-gray-600">Update pricing, coverage, and metadata</p>
      </div>

      {loading ? (
        <div className="p-8">Loading...</div>
      ) : (
        plans.map((plan) => (
          <div key={plan.planType} className="bg-white/80 border border-white/50 shadow-xl rounded-2xl">
            <div className="px-8 py-6 border-b border-white/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <FiShield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-xl font-bold">{getPlanName(plan.planType)} Plan</div>
                  <div className="text-sm text-gray-600">Plan Type: {plan.planType}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-xl text-sm font-semibold border ${plan.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
                {editingPlan === plan.planType ? (
                  <>
                    <button onClick={handleSavePlan} disabled={saving}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl">
                      <FiSave className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={() => { setEditingPlan(null); setPlanData({}); }}
                      className="inline-flex items-center px-4 py-2 bg-white border border-white/50 rounded-xl">
                      <FiX className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleEditPlan(plan)}
                    className="inline-flex items-center px-4 py-2 bg-white border border-white/50 rounded-xl">
                    <FiEdit3 className="w-4 h-4 mr-2" />
                    Edit Plan
                  </button>
                )}
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { key: "monthlyPrice", label: "Monthly Price (ETH)" },
                { key: "coverageAmount", label: "Coverage Amount (ETH)" },
                { key: "deductible", label: "Deductible (ETH)" },
              ].map((f) => (
                <div key={f.key} className="bg-white/60 border border-white/50 rounded-2xl p-4">
                  <label className="text-sm font-bold text-gray-700">{f.label}</label>
                  {editingPlan === plan.planType ? (
                    <input
                      type="number"
                      step="0.0001"
                      value={planData[f.key] ?? ""}
                      onChange={(e) => setPlanData((d: any) => ({ ...d, [f.key]: e.target.value }))}
                      className="w-full mt-2 px-3 py-2 bg-white/80 border border-white/50 rounded-xl"
                    />
                  ) : (
                    <div className="text-xl font-bold text-gray-900">
                      {/* display on-chain bigint roughly in ETH (assumes 18 decimals) */}
                      {Number(plan[f.key as keyof Plan]) / 1e18}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* IPFS Metadata */}
            <div className="p-8 border-t border-white/50 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">IPFS Metadata</div>
                <div className="text-sm text-gray-600">
                  {plan.ipfsHash ? `Hash: ${plan.ipfsHash}` : "No metadata uploaded"}
                </div>
              </div>
              <button onClick={() => handleUpdateMetadata(plan.planType)} disabled={uploadingMetadata}
                className="inline-flex items-center px-4 py-2 bg-white border border-white/50 rounded-xl">
                <FiUpload className="w-4 h-4 mr-2" />
                {uploadingMetadata ? "Uploading..." : "Update Metadata"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PlanManagement;
