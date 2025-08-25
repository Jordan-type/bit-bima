import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FiX,
  FiCheck,
  FiFileText,
  FiAlertTriangle,
  FiEye,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiShield,
  FiActivity,
} from "react-icons/fi";
import { usePublicClient, useWalletClient } from "wagmi";
import { contractService } from "@/services/contract";
import { CLAIM_STATUS } from "@/constant";
import { getFromIPFS } from "../../services/pinata";
import toast from "react-hot-toast";
import type { Claim } from "@/services/contract";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  claim: (Claim & { claimant?: `0x${string}`; ipfsDocuments?: string }) | null;
  onSuccess?: () => void;
};

type Decision = "approve" | "reject" | "";

const ProcessClaimModal: React.FC<Props> = ({ isOpen, onClose, claim, onSuccess }) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState<"approve" | "reject" | "">("");
  const [approvedAmount, setApprovedAmount] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [claimMetadata, setClaimMetadata] = useState<any>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  useEffect(() => {
    if (isOpen && claim?.ipfsDocuments) {
      setDecision("");
      setApprovedAmount("");
      setNotes("");
      setClaimMetadata(null);
      void loadClaimMetadata();
    }
  }, [isOpen, claim?.ipfsDocuments]);

  const loadClaimMetadata = async () => {
    if (!claim?.ipfsDocuments) return;

    try {
      setLoadingMetadata(true);
      const metadata = await getFromIPFS(claim.ipfsDocuments);
      setClaimMetadata(metadata);
    } catch (error) {
      console.error("Error loading claim metadata:", error);
      toast.error("Failed to load claim details");
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleProcessClaim = async () => {
    if (!claim || !decision) return;
    if (!publicClient || !walletClient) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setLoading(true);

      const status = decision === "approve" ? CLAIM_STATUS.APPROVED : CLAIM_STATUS.REJECTED;
      const amountEth = decision === "approve" ? approvedAmount || "0" : "0";

      const result = await contractService.processClaim(
        BigInt(claim.claimId as any),
        status,
        amountEth,
        walletClient,
        publicClient
      );

      if (result.success) {
        toast.success(`Claim ${decision === "approve" ? "approved" : "rejected"} successfully!`);
        onSuccess?.();
      } else {
        throw new Error("Failed to process claim");
      }
    } catch (error: any) {
      console.error("Error processing claim:", error);
      toast.error(error?.message || "Failed to process claim");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocuments = () => {
    if (claim?.ipfsDocuments) {
      window.open(
        `https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`,
        "_blank"
      );
    }
  };

  if (!claim) return null;

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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl transition-all">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl"></div>
                </div>

                <div className="relative p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                        <FiFileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-bold text-gray-900"
                        >
                          Process Claim #{claim.claimId}
                        </Dialog.Title>
                        <p className="text-gray-600">
                          Review and make a decision on this claim
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 text-gray-400 hover:text-gray-500 hover:bg-white transition-all duration-300 flex items-center justify-center"
                      onClick={onClose}
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Claim Overview */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <FiShield className="h-5 w-5 text-purple-600" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">
                          Claim Details
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center space-x-3">
                            <FiFileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-600">
                                Claim ID
                              </p>
                              <p className="text-lg font-bold text-blue-900">
                                #{claim.claimId}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center space-x-3">
                            <FiShield className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="text-sm font-medium text-purple-600">
                                Policy ID
                              </p>
                              <p className="text-lg font-bold text-purple-900">
                                #{claim.policyId}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                          <div className="flex items-center space-x-3">
                            <FiDollarSign className="h-5 w-5 text-emerald-600" />
                            <div>
                              <p className="text-sm font-medium text-emerald-600">
                                Claimed Amount
                              </p>
                              <p className="text-lg font-bold text-emerald-900">
                                {toEthStr(claim.claimAmount)} ETH
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <FiUser className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-medium text-gray-600">
                              Claimant
                            </p>
                          </div>
                          <p className="font-mono text-sm bg-gray-100 rounded-lg p-2 break-all">
                            {claim.claimant}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <FiCalendar className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-medium text-gray-600">
                              Submission Date
                            </p>
                          </div>
                          <p className="font-medium text-gray-900">
                            {tsToDateStr(claim.submissionDate)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <FiActivity className="h-4 w-4 text-gray-500" />
                          <p className="text-sm font-medium text-gray-600">
                            Status
                          </p>
                        </div>
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
                          Pending Review
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6">
                      <h5 className="text-lg font-bold text-gray-900 mb-4">
                        Description
                      </h5>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">
                          {claim.description}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    {loadingMetadata ? (
                      <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/4"></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                          </div>
                          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3"></div>
                        </div>
                      </div>
                    ) : (
                      claimMetadata && (
                        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6">
                          <h5 className="text-lg font-bold text-gray-900 mb-6">
                            Medical Information
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {claimMetadata.claimType && (
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-sm font-medium text-blue-600 mb-1">
                                  Claim Type
                                </p>
                                <p className="font-bold text-blue-900 capitalize">
                                  {claimMetadata.claimType.replace("-", " ")}
                                </p>
                              </div>
                            )}
                            {claimMetadata.dateOfService && (
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                                <p className="text-sm font-medium text-purple-600 mb-1">
                                  Date of Service
                                </p>
                                <p className="font-bold text-purple-900">
                                  {claimMetadata.dateOfService}
                                </p>
                              </div>
                            )}
                            {claimMetadata.providerName && (
                              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                                <p className="text-sm font-medium text-emerald-600 mb-1">
                                  Healthcare Provider
                                </p>
                                <p className="font-bold text-emerald-900">
                                  {claimMetadata.providerName}
                                </p>
                              </div>
                            )}
                            {claimMetadata.diagnosis && (
                              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                                <p className="text-sm font-medium text-orange-600 mb-1">
                                  Diagnosis
                                </p>
                                <p className="font-bold text-orange-900">
                                  {claimMetadata.diagnosis}
                                </p>
                              </div>
                            )}
                          </div>

                          {claimMetadata.treatmentDetails && (
                            <div className="mt-6">
                              <p className="text-sm font-medium text-gray-600 mb-2">
                                Treatment Details
                              </p>
                              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                                <p className="text-gray-700 leading-relaxed">
                                  {claimMetadata.treatmentDetails}
                                </p>
                              </div>
                            </div>
                          )}

                          {claimMetadata.documents &&
                            claimMetadata.documents.length > 0 && (
                              <div className="mt-6">
                                <p className="text-sm font-medium text-gray-600 mb-4">
                                  Uploaded Documents (
                                  {claimMetadata.documents.length})
                                </p>
                                <div className="space-y-3">
                                  {claimMetadata.documents.map((doc: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors duration-300"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                          <FiFileText className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">
                                          {doc.name}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() =>
                                          window.open(doc.url, "_blank")
                                        }
                                        className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300"
                                      >
                                        View
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )
                    )}

                    {/* Documents Link */}
                    {claim.ipfsDocuments && (
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                              <FiFileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-bold text-blue-900 text-lg">
                                Supporting Documents
                              </h5>
                              <p className="text-blue-700">
                                View all claim documents and metadata
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleViewDocuments}
                            className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <FiEye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                            View Documents
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Decision Section */}
                    <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6">
                      <h5 className="text-lg font-bold text-gray-900 mb-6">
                        Claim Decision
                      </h5>

                      <div className="space-y-6">
                        {/* Decision Radio Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="relative group cursor-pointer">
                            <input
                              type="radio"
                              name="decision"
                              value="approve"
                              checked={decision === "approve"}
                              onChange={(e) => setDecision(e.target.value as Decision)}
                              className="sr-only"
                            />
                            <div
                              className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
                                decision === "approve"
                                  ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg"
                                  : "border-gray-200 hover:border-gray-300 bg-white/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                      decision === "approve"
                                        ? "bg-gradient-to-br from-emerald-100 to-green-100"
                                        : "bg-gray-100"
                                    }`}
                                  >
                                    <FiCheck
                                      className={`w-6 h-6 ${
                                        decision === "approve"
                                          ? "text-emerald-600"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <h6 className="font-bold text-gray-900 text-lg">
                                      Approve Claim
                                    </h6>
                                    <p className="text-gray-600">
                                      Approve this claim for payment
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </label>

                          <label className="relative group cursor-pointer">
                            <input
                              type="radio"
                              name="decision"
                              value="reject"
                              checked={decision === "reject"}
                              onChange={(e) => setDecision(e.target.value as Decision)}
                              className="sr-only"
                            />
                            <div
                              className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
                                decision === "reject"
                                  ? "border-red-500 bg-gradient-to-br from-red-50 to-pink-50 shadow-lg"
                                  : "border-gray-200 hover:border-gray-300 bg-white/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                      decision === "reject"
                                        ? "bg-gradient-to-br from-red-100 to-pink-100"
                                        : "bg-gray-100"
                                    }`}
                                  >
                                    <FiX
                                      className={`w-6 h-6 ${
                                        decision === "reject"
                                          ? "text-red-600"
                                          : "text-gray-400"
                                      }`}
                                    />
                                  </div>
                                  <div>
                                    <h6 className="font-bold text-gray-900 text-lg">
                                      Reject Claim
                                    </h6>
                                    <p className="text-gray-600">
                                      Reject this claim
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Approved Amount Input */}
                        {decision === "approve" && (
                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                            <label className="block text-sm font-bold text-emerald-800 mb-3">
                              Approved Amount (ETH)
                            </label>
                            <input
                              type="number"
                              step="0.0001"
                              min="0"
                              max={typeof claim.claimAmount === "bigint" ? Number(toEthStr(claim.claimAmount)) : Number(claim.claimAmount)}
                              value={approvedAmount}
                              onChange={(e) =>
                                setApprovedAmount(e.target.value)
                              }
                              placeholder={toEthStr(claim.claimAmount)}
                              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                            />
                            <p className="text-sm text-emerald-700 mt-2">
                              Leave empty to approve full amount (
                              {toEthStr(claim.claimAmount)} ETH)
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-3">
                            Processing Notes (Optional)
                          </label>
                          <textarea
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                            placeholder="Add any notes about this decision..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Warning for Rejection */}
                    {decision === "reject" && (
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                            <FiAlertTriangle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-red-900 mb-2">
                              Claim Rejection
                            </h3>
                            <p className="text-red-800 leading-relaxed">
                              This action will permanently reject the claim. The
                              claimant will be notified and no payment will be
                              processed. This action cannot be undone.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Approval Confirmation */}
                    {decision === "approve" && (
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0">
                            <FiCheck className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-emerald-900 mb-2">
                              Claim Approval
                            </h3>
                            <p className="text-emerald-800 leading-relaxed">
                              This will approve the claim for{" "}
                              <span className="font-bold">
                                {approvedAmount || toEthStr(claim.claimAmount)}{" "}
                                ETH
                              </span>
                              . Payment will be processed automatically and sent
                              to the claimant's wallet.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/50 text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleProcessClaim}
                      disabled={loading || !decision}
                      className={`px-8 py-3 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        decision === "approve"
                          ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg hover:shadow-xl"
                          : decision === "reject"
                          ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-400 text-white"
                      }`}
                    >
                      {loading
                        ? "Processing..."
                        : decision === "approve"
                        ? "Approve Claim"
                        : decision === "reject"
                        ? "Reject Claim"
                        : "Select Decision"}
                    </button>
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

export default ProcessClaimModal;
