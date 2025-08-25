import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiX,
  FiUpload,
  FiCheck,
  FiFileText,
  FiAlertTriangle,
  FiShield,
  FiLock,
  FiZap,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import { usePublicClient, useWalletClient } from "wagmi";
import { contractService } from "../../services/contract";
import { PLAN_TYPES } from "../../constant";
import { uploadToPinata, uploadJSONToPinata } from "../../services/pinata";
import toast from "react-hot-toast";
import { formatEther } from "viem";
import type { Policy as ChainPolicy } from "@/services/contract";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";

type UploadedDoc = {
  name: string;
  ipfsHash: string;
  url: string;
  size: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  policies: ChainPolicy[];
  onSuccess?: () => void;
};

type FormData = {
  policyId: string; // select stores string
  claimAmount: string;
  description: string;
  claimType: string;
  dateOfService: string;
  providerName: string;
  providerAddress: string;
  diagnosis: string;
  treatmentDetails: string;
};

const toEtherNumber = (v: bigint | string | number | undefined): number => {
  if (typeof v === "bigint") return Number(formatEther(v));
  if (typeof v === "string" || typeof v === "number") return Number(v);
  return 0;
};



const SubmitClaimModal: React.FC<Props> = ({ isOpen, onClose, policies, onSuccess }) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    policyId: "",
    claimAmount: "",
    description: "",
    claimType: "",
    dateOfService: "",
    providerName: "",
    providerAddress: "",
    diagnosis: "",
    treatmentDetails: "",
  });
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [remainingCoverage, setRemainingCoverage] = useState<bigint | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        policyId: "",
        claimAmount: "",
        description: "",
        claimType: "",
        dateOfService: "",
        providerName: "",
        providerAddress: "",
        diagnosis: "",
        treatmentDetails: "",
      });
      setDocuments([]);
    }
  }, [isOpen]);

    // fetch remaining coverage for the selected policy
  useEffect(() => {
    const run = async () => {
      if (!publicClient || !formData.policyId) return;
      try {
        const rc = await contractService.getRemainingCoverage(BigInt(formData.policyId), publicClient);
        setRemainingCoverage(rc);
      } catch {
        setRemainingCoverage(null);
      }
    };
    void run();
  }, [formData.policyId, publicClient]);

  const getPlanName = (planType: number) => {
    const names: Record<number, string> = {
      [PLAN_TYPES.BASIC]: "Basic",
      [PLAN_TYPES.PREMIUM]: "Premium",
      [PLAN_TYPES.PLATINUM]: "Platinum",
    };
    return names[planType] || "Unknown";
  };

  const selectedPolicy = policies.find((p) => String(p.policyId) === formData.policyId);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    setUploadingDocuments(true);
    const uploadedFiles: UploadedDoc[] = [];

    try {
      for (const file of files) {
        const result = await uploadToPinata(file, {
          name: `claim-document-${Date.now()}-${file.name}`,
          keyvalues: {
            type: "claim-document",
            fileName: file.name,
          },
        });

        if (result.success) {
          uploadedFiles.push({
            name: file.name,
            ipfsHash: result.ipfsHash,
            url: result.url,
            size: file.size,
          });
        }
      }

      setDocuments((prev) => [...prev, ...uploadedFiles]);
      toast.success(
        `${uploadedFiles.length} document(s) uploaded successfully`
      );
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents");
    } finally {
      setUploadingDocuments(false);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitClaim = async () => {
    if (!walletClient || !publicClient) {
      toast.error("Wallet not connected");
      return;
    }
    try {
      setLoading(true);

      // Create comprehensive claim metadata
      const claimMetadata = {
        policyId: formData.policyId,
        claimAmount: formData.claimAmount,
        description: formData.description,
        claimType: formData.claimType,
        dateOfService: formData.dateOfService,
        providerName: formData.providerName,
        providerAddress: formData.providerAddress,
        diagnosis: formData.diagnosis,
        treatmentDetails: formData.treatmentDetails,
        documents: documents,
        submissionDate: new Date().toISOString(),
        version: "1.0",
      };

      // Upload metadata to IPFS
      const metadataResult = await uploadJSONToPinata(
        claimMetadata,
        `claim-metadata-${Date.now()}.json`
      );

      if (!metadataResult.success) {
        throw new Error("Failed to upload claim metadata to IPFS");
      }

      // Submit claim to smart contract
      const result = await contractService.submitClaim(
        BigInt(formData.policyId),
        formData.claimAmount,
        metadataResult.ipfsHash,
        formData.description,
        walletClient,
        publicClient
      );

      if (result.success) {
        toast.success("Claim submitted successfully!");
        onSuccess && onSuccess();
      } else {
        throw new Error("Failed to submit claim");
      }
    } catch (error: any) {
      console.error("Error submitting claim:", error);
      toast.error(error?.message || "Failed to submit claim");
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = () =>
    Boolean(formData.policyId && formData.claimAmount && formData.description && formData.claimType);

  const isStep2Valid = () => Boolean(formData.dateOfService && formData.providerName);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"] as const;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: FiFileText },
    { number: 2, title: "Medical Details", icon: FiUser },
    { number: 3, title: "Documents & Review", icon: FiCheckCircle },
  ] as const;

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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
              <Dialog.Panel className="relative w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl p-8 text-left align-middle shadow-2xl border border-white/50 transition-all">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/50 to-cyan-50/30 rounded-3xl"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl"></div>

                {/* Enhanced Header */}
                <div className="relative flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FiFileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-gray-900"
                      >
                        Submit Insurance Claim
                      </Dialog.Title>
                      <p className="text-gray-600">
                        Secure blockchain claim submission
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors"
                    onClick={onClose}
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="relative mb-10">
                  <div className="flex items-center justify-between relative z-10">
                    {steps.map((stepItem, index) => {
                      const StepIcon = stepItem.icon;
                      const isActive = step >= stepItem.number;
                      const isCompleted = step > stepItem.number;

                      return (
                        <div
                          key={stepItem.number}
                          className="flex flex-col items-center relative z-10"
                        >
                          <div
                            className={`
                            w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 border-2
                            ${
                              isActive
                                ? "bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-500 text-white shadow-lg"
                                : "bg-white border-gray-200 text-gray-400"
                            }
                          `}
                          >
                            {isCompleted ? (
                              <FiCheck className="w-5 h-5" />
                            ) : (
                              <StepIcon className="w-5 h-5" />
                            )}
                          </div>

                          <div className="mt-3 text-center">
                            <p
                              className={`text-sm font-semibold ${
                                isActive ? "text-blue-600" : "text-gray-500"
                              }`}
                            >
                              Step {stepItem.number}
                            </p>
                            <p
                              className={`text-xs ${
                                isActive ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {stepItem.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Progress Line */}
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="relative min-h-[500px]">
                  {/* Step 1: Basic Information */}
                  {step === 1 && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">
                          Basic Claim Information
                        </h4>
                        <p className="text-gray-600">
                          Start your blockchain-secured insurance claim
                        </p>
                      </div>

                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <FiShield className="h-4 w-4" />
                              <span>Select Policy *</span>
                            </label>
                            <select
                              value={formData.policyId}
                              onChange={(e) =>
                                handleInputChange("policyId", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm font-medium"
                              required
                            >
                              <option value="">Choose a policy</option>
                              {policies.map((policy) => (
                                <option
                                  key={String(policy.policyId)}
                                  value={String(policy.policyId)}
                                >
                                  {getPlanName(policy.planType)} Plan #
                                  {policy.policyId} - Coverage:{" "}
                                  {toEtherNumber(policy.coverageAmount).toFixed(2)}{" "}
                                  ETH
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <FiDollarSign className="h-4 w-4" />
                              <span>Claim Amount (ETH) *</span>
                            </label>
                            <input
                              type="number"
                              step="0.0001"
                              min="0"
                              required
                              value={formData.claimAmount}
                              onChange={(e) =>
                                handleInputChange("claimAmount", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm font-medium"
                              placeholder="0.0000"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <FiActivity className="h-4 w-4" />
                              <span>Claim Type *</span>
                            </label>
                            <select
                              value={formData.claimType}
                              onChange={(e) =>
                                handleInputChange("claimType", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm font-medium"
                              required
                            >
                              <option value="">Select type</option>
                              <option value="medical">Medical Treatment</option>
                              <option value="emergency">Emergency Care</option>
                              <option value="surgery">Surgery</option>
                              <option value="dental">Dental Care</option>
                              <option value="vision">Vision Care</option>
                              <option value="mental-health">
                                Mental Health
                              </option>
                              <option value="pharmacy">Pharmacy</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <FiFileText className="h-4 w-4" />
                              <span>Description *</span>
                            </label>
                            <textarea
                              rows={4}
                              required
                              value={formData.description}
                              onChange={(e) =>
                                handleInputChange("description", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm font-medium"
                              placeholder="Briefly describe the reason for this claim..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Policy Warning */}
                      {selectedPolicy && (
                        <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 border border-blue-200/50 rounded-2xl p-6 shadow-lg">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FiShield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-blue-800 mb-3">
                                Policy Information
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-white/60 rounded-xl border border-white/50">
                                  <p className="text-blue-600 font-semibold mb-1">
                                    Deductible
                                  </p>
                                  <p className="text-blue-900 font-bold">
                                    {toEtherNumber(
                                      selectedPolicy.deductible
                                    ).toFixed(4)}{" "}
                                    ETH
                                  </p>
                                </div>
                                <div className="p-3 bg-white/60 rounded-xl border border-white/50">
                                  <p className="text-blue-600 font-semibold mb-1">
                                    Remaining Coverage
                                  </p>
                                  <p className="text-blue-900 font-bold">
                                    {remainingCoverage !== null ? Number(formatEther(remainingCoverage)).toFixed(4) : "—"}
                                    ETH
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Medical Details */}
                  {step === 2 && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">
                          Medical Details
                        </h4>
                        <p className="text-gray-600">
                          Provide comprehensive medical information
                        </p>
                      </div>

                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <FiCalendar className="h-4 w-4" />
                              <span>Date of Service *</span>
                            </label>
                            <input
                              type="date"
                              required
                              value={formData.dateOfService}
                              onChange={(e) =>
                                handleInputChange(
                                  "dateOfService",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center space-x-2">
                              <FiUser className="h-4 w-4" />
                              <span>Healthcare Provider Name *</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.providerName}
                              onChange={(e) =>
                                handleInputChange(
                                  "providerName",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm font-medium"
                              placeholder="Dr. John Smith / ABC Hospital"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                              Provider Address
                            </label>
                            <textarea
                              rows={3}
                              value={formData.providerAddress}
                              onChange={(e) =>
                                handleInputChange(
                                  "providerAddress",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm font-medium"
                              placeholder="Hospital/clinic address"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                              Diagnosis
                            </label>
                            <textarea
                              rows={3}
                              value={formData.diagnosis}
                              onChange={(e) =>
                                handleInputChange("diagnosis", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm font-medium"
                              placeholder="Medical diagnosis or condition"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                              Treatment Details
                            </label>
                            <textarea
                              rows={4}
                              value={formData.treatmentDetails}
                              onChange={(e) =>
                                handleInputChange(
                                  "treatmentDetails",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-sm font-medium"
                              placeholder="Description of treatment received"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Documents & Review */}
                  {step === 3 && (
                    <div className="space-y-8">
                      <div className="text-center">
                        <h4 className="text-2xl font-bold text-gray-900 mb-2">
                          Documents & Review
                        </h4>
                        <p className="text-gray-600">
                          Upload documents and review your claim
                        </p>
                      </div>

                      {/* Enhanced File Upload */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                        <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center space-x-2">
                          <FiUpload className="h-4 w-4" />
                          <span>Upload Supporting Documents</span>
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors group">
                          <div className="space-y-2 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                              <FiUpload className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-xl font-bold text-blue-600 hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-3 py-1 transition-colors"
                              >
                                <span>Upload files</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  multiple
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  className="sr-only"
                                  onChange={handleFileUpload}
                                  disabled={uploadingDocuments}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                              PDF, PNG, JPG, DOC up to 10MB each
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Uploaded Documents */}
                      {documents.length > 0 && (
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                          <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <FiFileText className="h-5 w-5 text-blue-600" />
                            <span>Uploaded Documents ({documents.length})</span>
                          </h5>
                          <div className="grid grid-cols-1 gap-3">
                            {documents.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                    <FiFileText className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {doc.name}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">
                                      {formatFileSize(doc.size)} • Uploaded to
                                      IPFS
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeDocument(index)}
                                  className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <FiX className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enhanced Claim Summary */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                        <h5 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
                          <FiCheckCircle className="h-5 w-5 text-green-600" />
                          <span>Claim Summary</span>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 rounded-xl border border-blue-200/50">
                            <p className="text-sm font-semibold text-blue-600 mb-1">
                              Policy
                            </p>
                            <p className="font-bold text-gray-900">
                              #{formData.policyId}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-green-50/80 rounded-xl border border-emerald-200/50">
                            <p className="text-sm font-semibold text-emerald-600 mb-1">
                              Claim Amount
                            </p>
                            <p className="font-bold text-gray-900">
                              {formData.claimAmount} ETH
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-purple-50/80 to-violet-50/80 rounded-xl border border-purple-200/50">
                            <p className="text-sm font-semibold text-purple-600 mb-1">
                              Type
                            </p>
                            <p className="font-bold text-gray-900 capitalize">
                              {formData.claimType}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 rounded-xl border border-amber-200/50">
                            <p className="text-sm font-semibold text-amber-600 mb-1">
                              Provider
                            </p>
                            <p className="font-bold text-gray-900">
                              {formData.providerName}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-rose-50/80 to-pink-50/80 rounded-xl border border-rose-200/50">
                            <p className="text-sm font-semibold text-rose-600 mb-1">
                              Service Date
                            </p>
                            <p className="font-bold text-gray-900">
                              {formData.dateOfService}
                            </p>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-slate-50/80 to-gray-50/80 rounded-xl border border-slate-200/50">
                            <p className="text-sm font-semibold text-slate-600 mb-1">
                              Documents
                            </p>
                            <p className="font-bold text-gray-900">
                              {documents.length} files
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Important Notice */}
                      <div className="bg-gradient-to-r from-amber-50/80 to-yellow-50/80 border border-amber-200/50 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FiAlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-amber-800 mb-2">
                              Important Notice
                            </h3>
                            <p className="text-sm text-amber-700 leading-relaxed">
                              By submitting this claim, you confirm that all
                              information provided is accurate and truthful.
                              False claims may result in policy cancellation and
                              legal action. All data will be securely stored on
                              IPFS and processed via smart contracts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Navigation Buttons */}
                <div className="relative flex justify-between items-center pt-8 mt-8 border-t border-gray-200/50">
                  <button
                    type="button"
                    onClick={step === 1 ? onClose : handleBack}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    {step === 1 ? "Cancel" : "Back"}
                  </button>

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !isStep1Valid()) ||
                        (step === 2 && !isStep2Valid())
                      }
                      className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitClaim}
                      disabled={loading || uploadingDocuments}
                      className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 border border-transparent rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : uploadingDocuments ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FiLock className="h-4 w-4" />
                          <span>Submit Claim</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Blockchain Status Footer */}
                  <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>IPFS secured</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiLock className="h-3 w-3" />
                        <span>Smart contract processing</span>
                      </div>
                    </div>
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

export default SubmitClaimModal;
