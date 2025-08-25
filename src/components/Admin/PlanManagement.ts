import { useState } from "react";
import { useEthersSigner } from "../../hooks/ethers";
import { contractService } from "../../services/contract";
import {
  PLAN_TYPES,
} from "../../constant/index";
import { uploadJSONToPinata } from "../../services/pinata";
import {
  FiEdit3,
  FiSave,
  FiX,
  FiUpload,
  FiShield,
  FiDollarSign,
  FiActivity,
  FiTarget,
  FiCheck,
  FiSettings,
} from "react-icons/fi";
import toast from "react-hot-toast";

const PlanManagement = ({ plans, loading, onRefresh }) => {
  const signer = useEthersSigner();
  const [editingPlan, setEditingPlan] = useState(null);
  const [planData, setPlanData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingMetadata, setUploadingMetadata] = useState(false);

  const getPlanName = (planType) => {
    const names = {
      [PLAN_TYPES.BASIC]: "Basic",
      [PLAN_TYPES.PREMIUM]: "Premium",
      [PLAN_TYPES.PLATINUM]: "Platinum",
    };
    return names[planType] || "Unknown";
  };

  const getPlanColors = (planType) => {
    const colors = {
      [PLAN_TYPES.BASIC]: {
        bg: "from-blue-100 to-cyan-100",
        text: "text-blue-600",
        border: "border-blue-200",
        glow: "from-blue-500/10 to-cyan-500/10",
      },
      [PLAN_TYPES.PREMIUM]: {
        bg: "from-purple-100 to-pink-100",
        text: "text-purple-600",
        border: "border-purple-200",
        glow: "from-purple-500/10 to-pink-500/10",
      },
      [PLAN_TYPES.PLATINUM]: {
        bg: "from-yellow-100 to-orange-100",
        text: "text-yellow-600",
        border: "border-yellow-200",
        glow: "from-yellow-500/10 to-orange-500/10",
      },
    };
    return colors[planType] || colors[PLAN_TYPES.BASIC];
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan.planType);
    setPlanData({
      oneTimePrice: plan.oneTimePrice,
      monthlyPrice: plan.monthlyPrice,
      coverageAmount: plan.coverageAmount,
      deductible: plan.deductible,
      ipfsHash: plan.ipfsHash,
    });
  };

  const handleSavePlan = async () => {
    try {
      setSaving(true);

      // Update insurance plan
      const result = await contractService.updateInsurancePlan(
        editingPlan,
        planData.oneTimePrice,
        planData.monthlyPrice,
        planData.coverageAmount,
        planData.deductible,
        signer
      );

      if (result.success) {
        toast.success("Plan updated successfully!");
        setEditingPlan(null);
        setPlanData({});
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMetadata = async (planType) => {
    try {
      setUploadingMetadata(true);

      const metadata = {
        planType: getPlanName(planType),
        description: `${getPlanName(planType)} health insurance plan`,
        features: getDefaultFeatures(planType),
        terms: "Terms and conditions apply",
        lastUpdated: new Date().toISOString(),
      };

      const result = await uploadJSONToPinata(
        metadata,
        `plan-${getPlanName(planType).toLowerCase()}-metadata.json`
      );

      if (result.success) {
        // Update plan metadata in contract
        const updateResult = await contractService.updatePlanMetadata(
          planType,
          result.ipfsHash,
          signer
        );

        if (updateResult.success) {
          toast.success("Metadata updated successfully!");
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error updating metadata:", error);
      toast.error("Failed to update metadata");
    } finally {
      setUploadingMetadata(false);
    }
  };

  const getDefaultFeatures = (planType) => {
    const features = {
      [PLAN_TYPES.BASIC]: [
        "Basic medical coverage",
        "Emergency services",
        "Generic medications",
        "Preventive care",
      ],
      [PLAN_TYPES.PREMIUM]: [
        "Comprehensive medical coverage",
        "Specialist consultations",
        "Brand medications",
        "Dental and vision care",
        "Mental health services",
      ],
      [PLAN_TYPES.PLATINUM]: [
        "Premium medical coverage",
        "All specialist consultations",
        "All medications covered",
        "Comprehensive dental & vision",
        "Mental health & wellness",
        "Alternative medicine",
        "Global coverage",
      ],
    };
    return features[planType] || [];
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setPlanData({});
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/4 mb-8"></div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8 mb-6"
            >
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/3 mb-6"></div>
              <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Insurance Plan Management
          </h2>
          <p className="text-gray-600">
            Update pricing, coverage, and metadata for insurance plans
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {plans.map((plan, index) => {
          const colors = getPlanColors(plan.planType);

          return (
            <div
              key={plan.planType}
              className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.glow} rounded-full blur-2xl`}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br ${colors.glow} rounded-full blur-xl`}
                ></div>
              </div>

              <div className="relative">
                {/* Header */}
                <div className="px-8 py-6 border-b border-white/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center`}
                      >
                        <FiShield className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {getPlanName(plan.planType)} Plan
                        </h3>
                        <p className="text-sm font-medium text-gray-600">
                          Plan Type: {plan.planType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold border ${
                          plan.isActive
                            ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200"
                            : "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200"
                        }`}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>

                      {editingPlan === plan.planType ? (
                        <div className="flex space-x-3">
                          <button
                            onClick={handleSavePlan}
                            disabled={saving}
                            className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                          >
                            <FiSave className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            {saving ? "Saving..." : "Save"}
                            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300"
                          >
                            <FiX className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <FiEdit3 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          Edit Plan
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* One-time Price */}
                    <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                          <FiDollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <label className="text-sm font-bold text-gray-700">
                          Monthly Price (ETH)
                        </label>
                      </div>
                      {editingPlan === plan.planType ? (
                        <input
                          type="number"
                          step="0.0001"
                          value={planData.monthlyPrice}
                          onChange={(e) =>
                            setPlanData({
                              ...planData,
                              monthlyPrice: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="text-xl font-bold text-gray-900">
                          {plan.monthlyPrice}
                        </div>
                      )}
                    </div>

                    {/* Coverage Amount */}
                    <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                          <FiShield className="h-4 w-4 text-emerald-600" />
                        </div>
                        <label className="text-sm font-bold text-gray-700">
                          Coverage Amount (ETH)
                        </label>
                      </div>
                      {editingPlan === plan.planType ? (
                        <input
                          type="number"
                          step="0.01"
                          value={planData.coverageAmount}
                          onChange={(e) =>
                            setPlanData({
                              ...planData,
                              coverageAmount: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="text-xl font-bold text-gray-900">
                          {plan.coverageAmount}
                        </div>
                      )}
                    </div>

                    {/* Deductible */}
                    <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <FiTarget className="h-4 w-4 text-purple-600" />
                        </div>
                        <label className="text-sm font-bold text-gray-700">
                          Deductible (ETH)
                        </label>
                      </div>
                      {editingPlan === plan.planType ? (
                        <input
                          type="number"
                          step="0.001"
                          value={planData.deductible}
                          onChange={(e) =>
                            setPlanData({
                              ...planData,
                              deductible: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="text-xl font-bold text-gray-900">
                          {plan.deductible}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                          <FiActivity className="h-4 w-4 text-orange-600" />
                        </div>
                        <label className="text-sm font-bold text-gray-700">
                          Plan Status
                        </label>
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {plan.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                        <FiCheck className="h-4 w-4 text-cyan-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">
                        Plan Features
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getDefaultFeatures(plan.planType).map(
                        (feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center space-x-3 p-3 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                                <FiCheck className="h-3 w-3 text-white" />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {feature}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* IPFS Metadata */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 backdrop-blur-xl border border-white/50 rounded-2xl p-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-blue-500/5"></div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gray-500/10 rounded-full blur-xl"></div>

                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-blue-100 flex items-center justify-center">
                          <FiSettings className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            IPFS Metadata
                          </h4>
                          <p className="text-sm font-medium text-gray-600 mt-1">
                            {plan.ipfsHash
                              ? `Hash: ${plan.ipfsHash.slice(0, 20)}...`
                              : "No metadata uploaded"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdateMetadata(plan.planType)}
                        disabled={uploadingMetadata}
                        className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                      >
                        <FiUpload className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        {uploadingMetadata ? "Uploading..." : "Update Metadata"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Information Panel */}
      <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

        <div className="relative flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <FiSettings className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900 mb-4">
              Plan Management Information
            </h3>
            <div className="text-sm font-medium text-blue-800 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>
                  Changes to plan pricing will affect new policies only
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Existing policies maintain their original terms</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>
                  Metadata updates will be reflected on the frontend immediately
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>All changes are recorded on the blockchain</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;
