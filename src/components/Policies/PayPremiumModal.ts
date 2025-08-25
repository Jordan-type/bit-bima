import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FiX, FiCreditCard, FiCalendar, FiDollarSign } from "react-icons/fi";
import { useEthersSigner } from "../../hooks/ethers";
import { contractService,  } from "../../services/contract";
import { PLAN_TYPES } from "../../constant/index"
import toast from "react-hot-toast";

const PayPremiumModal = ({ isOpen, onClose, policy, onSuccess }) => {
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(false);

  const getPlanName = (planType) => {
    const names = {
      [PLAN_TYPES.BASIC]: "Basic",
      [PLAN_TYPES.PREMIUM]: "Premium",
      [PLAN_TYPES.PLATINUM]: "Platinum",
    };
    return names[planType] || "Unknown";
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const isOverdue = () => {
    if (!policy) return false;
    const expiryDate = new Date(parseInt(policy.endDate) * 1000);
    const now = new Date();
    return now > expiryDate;
  };

  const isPaymentDue = () => {
    if (!policy) return false;
    const currentTime = Date.now();
    const policyEndTime = parseInt(policy.endDate) * 1000;
    return currentTime > policyEndTime;
  };

  const getDaysOverdue = () => {
    if (!policy || !isOverdue()) return 0;
    const expiryDate = new Date(parseInt(policy.endDate) * 1000);
    const now = new Date();
    return Math.ceil((now - expiryDate) / (1000 * 60 * 60 * 24));
  };

  const handlePayPremium = async () => {
    if (!policy || !signer) return;

    try {
      setLoading(true);

      // Check if the current user is the policyholder
      const signerAddress = await signer.getAddress();
      if (policy.policyholder.toLowerCase() !== signerAddress.toLowerCase()) {
        throw new Error("You are not the owner of this policy");
      }

      // Check if policy is monthly payment type
      if (policy.paymentType !== "1" && policy.paymentType !== 1) {
        throw new Error("This policy doesn't use monthly payments");
      }

      // Check if payment is actually due
      if (!isPaymentDue()) {
        throw new Error(
          "Premium payment is not due yet. Policy is still active."
        );
      }

      console.log("Payment validation passed:", {
        policyholder: policy.policyholder,
        signerAddress,
        paymentType: policy.paymentType,
        endDate: new Date(parseInt(policy.endDate) * 1000).toISOString(),
        currentTime: new Date().toISOString(),
        isOverdue: isPaymentDue(),
      });

      // Call the contract service (no premium amount parameter needed)
      const result = await contractService.payMonthlyPremium(
        policy.policyId,
        signer
      );

      if (result.success) {
        toast.success(
          `Premium paid successfully! Amount: ${result.paidAmount} ETH`
        );
        onSuccess && onSuccess();
        onClose(); // Close the modal after successful payment
      } else {
        throw new Error(result.error || "Failed to pay premium");
      }
    } catch (error) {
      console.error("Error paying premium:", error);
      toast.error(error.message || "Failed to pay premium");
    } finally {
      setLoading(false);
    }
  };

  if (!policy) return null;

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Pay Monthly Premium
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                {/* Policy Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                      <FiCreditCard className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {getPlanName(policy.planType)} Plan
                      </h4>
                      <p className="text-sm text-gray-500">
                        Policy #{policy.policyId}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Monthly Premium:</span>
                      <span className="font-medium text-gray-900">
                        {parseFloat(policy.premium).toFixed(4)} ETH
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Expiry:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(policy.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">New Expiry:</span>
                      <span className="font-medium text-green-600">
                        {new Date(
                          parseInt(policy.endDate) * 1000 +
                            30 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Not Due Warning */}
                {!isPaymentDue() && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Payment Not Required
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Your policy is still active until{" "}
                            {formatDate(policy.endDate)}. Premium payment is
                            only due after the policy expires.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overdue Warning */}
                {isOverdue() && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Premium Overdue
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            Your premium is {getDaysOverdue()} day(s) overdue.
                            Pay now to extend your coverage and avoid policy
                            suspension.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Payment Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Premium</span>
                      <span>{parseFloat(policy.premium).toFixed(4)} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Network Fee</span>
                      <span className="text-gray-500">~0.001 ETH</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-indigo-600">
                        {parseFloat(policy.premium).toFixed(4)} ETH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Important Information
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            Payment extends coverage for 30 days from current
                            expiry date
                          </li>
                          <li>Payment is only allowed after policy expires</li>
                          <li>
                            Claims can be submitted immediately after payment
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePayPremium}
                    disabled={loading || !isPaymentDue()}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Processing..."
                      : !isPaymentDue()
                      ? "Payment Not Due"
                      : `Pay ${parseFloat(policy.premium).toFixed(4)} ETH`}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PayPremiumModal;
