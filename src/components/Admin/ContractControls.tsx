import React, { useEffect, useState } from "react";
import {
  FiPause, FiPlay, FiDollarSign, FiSettings, FiAlertTriangle,
  FiShield, FiActivity, FiLock, FiDownload
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useChainId, usePublicClient, useWalletClient } from "wagmi";
import { formatUnits, parseEther } from "viem";
import { contractService } from "@/services/contract";

type Props = {
  contractBalance: bigint;   // token units
  tokenSymbol: string;
  tokenDecimals: number;
  loading: boolean;
  onRefresh: () => void;
};

const ContractControls: React.FC<Props> = ({
  contractBalance,
  tokenSymbol,
  tokenDecimals,
  loading,
  onRefresh,
}) => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [paused, setPaused] = useState<{ pm: boolean; cm: boolean }>({ pm: false, cm: false });
  const [pausing, setPausing] = useState<"pm" | "cm" | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  useEffect(() => { if (chainId) contractService.setChainId(chainId); }, [chainId]);

  useEffect(() => {
    (async () => {
      if (!publicClient) return;
      try {
        const s = await contractService.getPaused(publicClient);
        setPaused({ pm: s.policyManager, cm: s.claimManager });
      } catch (e) { console.error(e); }
    })();
  }, [publicClient]);

  const toggle = async (which: "pm" | "cm") => {
    if (!walletClient || !publicClient) return toast.error("Wallet not connected");
    try {
      setPausing(which);
      const res =
        which === "pm"
          ? (paused.pm
              ? await contractService.pmUnpause(walletClient, publicClient)
              : await contractService.pmPause(walletClient, publicClient))
          : (paused.cm
              ? await contractService.cmUnpause(walletClient, publicClient)
              : await contractService.cmPause(walletClient, publicClient));
      if (res.success) {
        setPaused((s) => ({ ...s, [which]: !s[which] }));
        toast.success(`${which === "pm" ? "PolicyManager" : "ClaimManager"} ${paused[which] ? "unpaused" : "paused"}`);
        onRefresh();
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to toggle");
    } finally {
      setPausing(null);
    }
  };

  // NOTE: RiskPool withdrawal depends on your RiskPool ABI; wire if present.
  const displayBalance = loading ? "..." : `${formatUnits(contractBalance, tokenDecimals)} ${tokenSymbol}`;

  const exportContractData = () => {
    const data = {
      contractBalance: displayBalance,
      timestamp: new Date().toISOString(),
      contractStatus: { policyManager: paused.pm ? "Paused" : "Active", claimManager: paused.cm ? "Paused" : "Active" },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contract-data-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Contract Controls</h2>
        <p className="text-gray-600">Emergency controls and fund management</p>
      </div>

      {/* Pauses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: "pm", title: "PolicyManager", isPaused: paused.pm },
          { key: "cm", title: "ClaimManager", isPaused: paused.cm },
        ].map((x) => (
          <div key={x.key} className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                {x.isPaused ? <FiPlay className="h-5 w-5 text-orange-600" /> : <FiPause className="h-5 w-5 text-orange-600" />}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{x.title} State</h3>
            </div>
            <div className={`border-2 rounded-2xl p-6 ${x.isPaused ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-lg font-bold mb-2 ${x.isPaused ? "text-red-900" : "text-green-900"}`}>Status</div>
                  <div className={`text-3xl font-bold mb-2 ${x.isPaused ? "text-red-600" : "text-green-600"}`}>
                    {x.isPaused ? "PAUSED" : "ACTIVE"}
                  </div>
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${x.isPaused ? "bg-red-100" : "bg-green-100"}`}>
                  {x.isPaused ? <FiLock className="h-8 w-8 text-red-600" /> : <FiShield className="h-8 w-8 text-green-600" />}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => toggle(x.key as "pm" | "cm")}
                disabled={pausing === x.key}
                className={`inline-flex items-center px-6 py-3 rounded-xl text-white ${x.isPaused ? "bg-emerald-600" : "bg-red-600"}`}
              >
                {x.isPaused ? <FiPlay className="w-4 h-4 mr-2" /> : <FiPause className="w-4 h-4 mr-2" />}
                {pausing === x.key ? (x.isPaused ? "Unpausing..." : "Pausing...") : x.isPaused ? "Unpause" : "Pause"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fund Management (display only unless RiskPool withdraw wired) */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <FiDollarSign className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Fund Management</h3>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-6">
          <div className="text-lg font-bold text-green-900 mb-2">Available Balance</div>
          <div className="text-3xl font-bold text-green-600">{displayBalance}</div>
        </div>

        {/* (Optional) wire to RiskPool withdrawal once you confirm ABI */}
        {/* <div className="grid md:grid-cols-2 gap-4">
          ...
        </div> */}
      </div>

      {/* Data */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <FiSettings className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Data Management</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <button onClick={exportContractData}
            className="inline-flex items-center justify-center px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl">
            <FiDownload className="w-5 h-5 mr-3" />
            Export Contract Data
          </button>
          <button onClick={onRefresh} disabled={loading}
            className="inline-flex items-center justify-center px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl">
            <FiSettings className={`w-5 h-5 mr-3 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractControls;
