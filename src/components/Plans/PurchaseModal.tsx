import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FiX,
  FiCheck,
  FiShield,
  FiCreditCard,
  FiUser,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
} from "react-icons/fi";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { contractService } from "@/services/contract";
import { PAYMENT_TYPES, PLAN_TYPES } from "@/constant";
import { uploadJSONToPinata } from "@/services/pinata";
import toast from "react-hot-toast";
import type { Plan } from "@/types/app";
import { CONTRACT_ADDRESSES } from "@/config/network";
import { toEthStr, fmt } from "@/utils/web3";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onSuccess?: () => void;
};

const PurchaseModal: React.FC<Props> = ({ isOpen, onClose, plan, onSuccess }) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentType: PAYMENT_TYPES.ONE_TIME,
    personalInfo: {
      fullName: "",
      dateOfBirth: "",
      phoneNumber: "",
      email: "",
      address: "",
      emergencyContact: "",
      medicalHistory: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData((prev) => ({ ...prev, paymentType: PAYMENT_TYPES.ONE_TIME }));
    }
  }, [isOpen]);

  const getPlanName = (planType: number) => {
    const names: Record<number, string> = {
      [PLAN_TYPES.BASIC]: "Basic",
      [PLAN_TYPES.PREMIUM]: "Premium",
      [PLAN_TYPES.PLATINUM]: "Platinum",
    };
    return names[planType] || "Unknown";
  };

  const getPaymentAmount = () => {
    if (!plan) return 0;
    return formData.paymentType === PAYMENT_TYPES.ONE_TIME
      ? Number(plan.oneTimePrice ?? 0)
      : Number(plan.monthlyPrice ?? 0);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handlePurchase = async () => {
    // const token = CONTRACT_ADDRESSES[publicClient!.chain!.id].PremiumToken!; // or pick from a selector
    // const meta = await contractService.getTokenMeta(publicClient!);
    // const tokenAddress = meta.address;

    try {
      if (!plan) return;
      if (!walletClient || !publicClient || !isConnected) {
        toast.error("Wallet not connected");
        return;
      }

    // Get token meta from config/chain
    const meta = await contractService.getTokenMeta(publicClient);
    if (!meta.address) {
      toast.error("Premium token not configured for this chain.");
      return;
    }

    const token = meta.address; // ✅ narrowed to Address
      // Optional safety: ensure token is whitelisted on-chain
      const accepted = await contractService.isTokenAccepted(token, publicClient);
      if (!accepted) {
        toast.error("Selected token is not accepted by PolicyManager.");
        return;
      }

      setLoading(true);

      // Upload metadata to IPFS
      const metadata = {
        planType: plan.planType,
        paymentType: formData.paymentType,
        personalInfo: formData.personalInfo,
        purchaseDate: new Date().toISOString(),
        version: "1.0",
      };

      const ipfsResult = await uploadJSONToPinata(metadata, `policy-metadata-${Date.now()}.json`);
      if (!ipfsResult.success) throw new Error("Failed to upload metadata to IPFS");

      // Ensure service is on the right chain (mirrors Dashboard pattern)
      // If your service auto-reads from publicClient.chain, you can skip this:
      contractService.setChainId(publicClient.chain?.id ?? 0);

      // Execute purchase via wagmi wallet client (service updated for wagmi)
      
      const result = await contractService.purchasePolicy(
        plan.planType,
        formData.paymentType,
        token,
        ipfsResult.ipfsHash,
        walletClient,                   // wagmi WalletClient for signing
        publicClient
      );

      if (result?.success) {
        toast.success("Policy purchased successfully!");
        onSuccess?.();
        onClose();
      } else {
        throw new Error("Failed to purchase policy");
      }
    } catch (err: any) {
      console.error("Error purchasing policy:", err);
      toast.error(err?.message || "Failed to purchase policy");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  // UI below is the same; only logic/hooks changed
  return (
<Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all relative">
                {/* Header */}
                <div className="flex items-center justify-between p-8 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FiShield className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-gray-900"
                      >
                        Purchase {getPlanName(plan.planType)} Plan
                      </Dialog.Title>
                      <p className="text-gray-600">
                        Complete your policy purchase
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 hover:text-gray-500 hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
                    onClick={onClose}
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="px-8 py-6">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                      ></div>
                    </div>
                    {[
                      { num: 1, icon: FiCreditCard, label: "Payment Type" },
                      { num: 2, icon: FiUser, label: "Personal Info" },
                      { num: 3, icon: FiFileText, label: "Review & Pay" },
                    ].map(({ num, icon: Icon, label }) => (
                      <div
                        key={num}
                        className="flex flex-col items-center z-10"
                      >
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-lg transition-all duration-300 ${
                            step >= num
                              ? "bg-blue-500 text-white"
                              : "bg-white border-2 border-gray-200 text-gray-400"
                          }`}
                        >
                          {step > num ? (
                            <FiCheck className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span
                          className={`mt-2 text-sm font-medium ${
                            step >= num ? "text-blue-600" : "text-gray-500"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Content */}
                <div className="px-8 pb-8">
                  {/* Step 1: Payment Type */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Choose Payment Method
                        </h4>
                        <p className="text-gray-600">
                          Select how you'd like to pay for your coverage
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <label className="relative group cursor-pointer">
                          <input
                            type="radio"
                            name="paymentType"
                            value={PAYMENT_TYPES.ONE_TIME}
                            checked={
                              formData.paymentType === PAYMENT_TYPES.ONE_TIME
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                paymentType: parseInt(e.target.value),
                              }))
                            }
                            className="sr-only"
                          />
                          <div
                            className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
                              formData.paymentType === PAYMENT_TYPES.ONE_TIME
                                ? "border-blue-500 bg-blue-50 shadow-lg"
                                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    formData.paymentType ===
                                    PAYMENT_TYPES.ONE_TIME
                                      ? "bg-blue-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <FiCalendar
                                    className={`w-6 h-6 ${
                                      formData.paymentType ===
                                      PAYMENT_TYPES.ONE_TIME
                                        ? "text-blue-600"
                                        : "text-gray-400"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <h5 className="text-lg font-bold text-gray-900">
                                    Annual Payment
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    Pay once for full year coverage
                                  </p>
                                </div>
                              </div>
                              {formData.paymentType ===
                                PAYMENT_TYPES.ONE_TIME && (
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                  <FiCheck className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-blue-600">
                                {toEthStr(plan.oneTimePrice)}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                One-time payment
                              </p>
                            </div>
                          </div>
                        </label>

                        <label className="relative group cursor-pointer">
                          <input
                            type="radio"
                            name="paymentType"
                            value={PAYMENT_TYPES.MONTHLY}
                            checked={
                              formData.paymentType === PAYMENT_TYPES.MONTHLY
                            }
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                paymentType: parseInt(e.target.value),
                              }))
                            }
                            className="sr-only"
                          />
                          <div
                            className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
                              formData.paymentType === PAYMENT_TYPES.MONTHLY
                                ? "border-purple-500 bg-purple-50 shadow-lg"
                                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    formData.paymentType ===
                                    PAYMENT_TYPES.MONTHLY
                                      ? "bg-purple-100"
                                      : "bg-gray-100"
                                  }`}
                                >
                                  <FiCreditCard
                                    className={`w-6 h-6 ${
                                      formData.paymentType ===
                                      PAYMENT_TYPES.MONTHLY
                                        ? "text-purple-600"
                                        : "text-gray-400"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <h5 className="text-lg font-bold text-gray-900">
                                    Monthly Payment
                                  </h5>
                                  <p className="text-sm text-gray-600">
                                    Pay monthly premiums
                                  </p>
                                </div>
                              </div>
                              {formData.paymentType ===
                                PAYMENT_TYPES.MONTHLY && (
                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                  <FiCheck className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-purple-600">
                                {toEthStr(plan.monthlyPrice)}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                Per month
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Personal Information */}
                  {step === 2 && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Personal Information
                        </h4>
                        <p className="text-gray-600">
                          We need this information to process your policy
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="relative">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FiUser className="inline w-4 h-4 mr-2" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.personalInfo.fullName}
                            onChange={(e) =>
                              handleInputChange("fullName", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FiCalendar className="inline w-4 h-4 mr-2" />
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.personalInfo.dateOfBirth}
                            onChange={(e) =>
                              handleInputChange("dateOfBirth", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FiPhone className="inline w-4 h-4 mr-2" />
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.personalInfo.phoneNumber}
                            onChange={(e) =>
                              handleInputChange("phoneNumber", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FiMail className="inline w-4 h-4 mr-2" />
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.personalInfo.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300"
                            placeholder="your@email.com"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            <FiMapPin className="inline w-4 h-4 mr-2" />
                            Address *
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={formData.personalInfo.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300 resize-none"
                            placeholder="Enter your complete address"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Emergency Contact
                          </label>
                          <input
                            type="text"
                            value={formData.personalInfo.emergencyContact}
                            onChange={(e) =>
                              handleInputChange(
                                "emergencyContact",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300"
                            placeholder="Name and phone number"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Medical History (Optional)
                          </label>
                          <textarea
                            rows={4}
                            value={formData.personalInfo.medicalHistory}
                            onChange={(e) =>
                              handleInputChange(
                                "medicalHistory",
                                e.target.value
                              )
                            }
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300 resize-none"
                            placeholder="Any relevant medical history, allergies, or conditions"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review & Payment */}
                  {step === 3 && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Review & Payment
                        </h4>
                        <p className="text-gray-600">
                          Confirm your details and complete the purchase
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <FiShield className="h-5 w-5 text-green-600" />
                          </div>
                          <h5 className="text-xl font-bold text-gray-900">
                            Plan Summary
                          </h5>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-sm">
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Plan:
                              </span>
                              <span className="font-bold text-gray-900">
                                {getPlanName(plan.planType)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Coverage:
                              </span>
                              <span className="font-bold text-gray-900">
                                {toEthStr(plan.coverageAmount)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Deductible:
                              </span>
                              <span className="font-bold text-gray-900">
                                {toEthStr(plan.deductible)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium text-gray-600">
                                Payment:
                              </span>
                              <span className="font-bold text-gray-900">
                                {formData.paymentType === PAYMENT_TYPES.ONE_TIME
                                  ? "Annual"
                                  : "Monthly"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-300 pt-6 mt-6">
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-gray-900">
                              Total:
                            </span>
                            <span className="text-3xl font-bold text-blue-600">
                              {getPaymentAmount().toFixed(4)} ETH
                              {formData.paymentType ===
                                PAYMENT_TYPES.MONTHLY && (
                                <span className="text-lg text-gray-600">
                                  /month
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                              <FiFileText className="h-5 w-5 text-yellow-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-yellow-900 mb-2">
                              Important Information
                            </h3>
                            <p className="text-sm font-medium text-yellow-800 leading-relaxed">
                              By purchasing this policy, you agree to the terms
                              and conditions. Your personal information will be
                              securely stored on IPFS and only accessible by you
                              and authorized medical professionals.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-8 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={step === 1 ? onClose : handleBack}
                      className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                    >
                      {step === 1 ? "Cancel" : "Back"}
                    </button>

                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={
                          step === 2 &&
                          (!formData.personalInfo.fullName ||
                            !formData.personalInfo.dateOfBirth ||
                            !formData.personalInfo.phoneNumber ||
                            !formData.personalInfo.email ||
                            !formData.personalInfo.address)
                        }
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next Step
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePurchase}
                        disabled={loading}
                        className="px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiDollarSign className="inline w-5 h-5 mr-2" />
                        {loading ? "Processing..." : "Purchase Policy"}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PurchaseModal;
