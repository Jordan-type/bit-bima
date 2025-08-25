import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FiX, FiCreditCard } from "react-icons/fi";
import toast from "react-hot-toast";
import { usePublicClient, useWalletClient } from "wagmi";
import { contractService } from "@/services/contract";
import { PLAN_TYPES } from "@/constant";
import type { Policy } from "@/services/contract";
import { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr } from "@/utils/web3";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  policy: (Policy & { paymentType?: number | string }) | null;
  onSuccess?: () => void;
};

const PayPremiumModal: React.FC<Props> = ({ isOpen, onClose, policy, onSuccess }) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);

  const getPlanName = (planType: number) =>
    ({ [PLAN_TYPES.BASIC]: "Basic", [PLAN_TYPES.PREMIUM]: "Premium", [PLAN_TYPES.PLATINUM]: "Platinum" }[planType] ?? "Unknown");

  const formatDate = (ts?: bigint | number | string) => {
    if (!ts) return "N/A";
    const n = typeof ts === "bigint" ? Number(ts) : Number(ts);
    return new Date(n * 1000).toLocaleDateString();
    };

  const isOverdue = useMemo(() => {
    if (!policy?.endDate) return false;
    return Date.now() > Number(policy.endDate) * 1000;
  }, [policy?.endDate]);

  const isPaymentDue = isOverdue; // same logic per your contract: only after expiry

  const getDaysOverdue = () => {
    if (!isOverdue || !policy?.endDate) return 0;
    const diff = Date.now() - Number(policy.endDate) * 1000;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handlePayPremium = async () => {
    if (!policy || !walletClient || !publicClient) return;

    try {
      setLoading(true);

      // monthly only
      const pt = typeof policy.paymentType === "string" ? Number(policy.paymentType) : Number(policy.paymentType ?? 0);
      if (pt !== 1) throw new Error("This policy doesn't use monthly payments");

      if (!isPaymentDue) throw new Error("Premium payment is not due yet.");

      const res = await contractService.payMonthlyPremium(
        BigInt(policy.policyId),
        walletClient,
        publicClient
      );

      if (res.success) {
        toast.success(`Premium paid successfully!`);
        onSuccess?.();
        onClose();
      } else {
        throw new Error("Payment failed");
      }
    } catch (err: any) {
      console.error("Pay premium error:", err);
      toast.error(err?.message ?? "Failed to pay premium");
    } finally {
      setLoading(false);
    }
  };

  if (!policy) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* keep your nice UI; below only values are TS-safe */}
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">Pay Monthly Premium</Dialog.Title>
            <button className="rounded-md text-gray-400 hover:text-gray-500" onClick={onClose}><FiX className="h-6 w-6" /></button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <FiCreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{getPlanName(Number(policy.planType))} Plan</h4>
                <p className="text-sm text-gray-500">Policy #{String(policy.policyId)}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly Premium:</span>
                <span className="font-medium text-gray-900">{toEthStr(policy.premium)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Expiry:</span>
                <span className="font-medium text-gray-900">{formatDate(policy.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">New Expiry (est.):</span>
                <span className="font-medium text-green-600">
                  {formatDate((Number(policy.endDate ?? 0) + 30 * 24 * 60 * 60) as number)}
                </span>
              </div>
            </div>
          </div>

          {isOverdue && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <h3 className="text-sm font-medium text-red-800">Premium Overdue</h3>
              <p className="text-sm text-red-700 mt-1">
                Your premium is {getDaysOverdue()} day(s) overdue. Pay now to extend your coverage.
              </p>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Payment Summary</h4>
            <div className="flex justify-between text-sm">
              <span>Total</span>
              <span className="text-indigo-600">{toEthStr(policy.premium)} ETH</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handlePayPremium}
              disabled={loading || !isPaymentDue}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : !isPaymentDue ? "Payment Not Due" : `Pay ${toEthStr(policy.premium)} ETH`}
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};
export default PayPremiumModal;
