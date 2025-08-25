import { useState, useEffect } from "react";
import { useEthersSigner } from "../../hooks/ethers";
import { contractService } from "../../services/contract";
import {
  FiPause,
  FiPlay,
  FiDollarSign,
  FiSettings,
  FiAlertTriangle,
  FiDownload,
  FiShield,
  FiZap,
  FiActivity,
  FiLock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useChainId } from "wagmi";

const ContractControls = ({ contractBalance, loading, onRefresh }) => {
  const signer = useEthersSigner();
  const [isPaused, setIsPaused] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // inside the component
const chainId = useChainId();
useEffect(() => {
  if (chainId) contractService.setChainId(chainId);
}, [chainId]);

  const handlePauseContract = async () => {
    try {
      setPausing(true);

      // Call pause/unpause function based on current state
      const contract = contractService.initContract(signer, true);
      if (!contract) throw new Error("Failed to initialize contract");

      const tx = isPaused
        ? await contract.unpause({ gasLimit: 100000 })
        : await contract.pause({ gasLimit: 100000 });

      toast.loading(
        isPaused ? "Unpausing contract..." : "Pausing contract...",
        { id: "pause" }
      );
      await tx.wait();

      setIsPaused(!isPaused);
      toast.success(
        isPaused
          ? "Contract unpaused successfully!"
          : "Contract paused successfully!",
        { id: "pause" }
      );
      onRefresh();
    } catch (error) {
      console.error("Error pausing/unpausing contract:", error);
      toast.error(error.reason || "Failed to pause/unpause contract", {
        id: "pause",
      });
    } finally {
      setPausing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(contractBalance)) {
      toast.error("Withdrawal amount exceeds contract balance");
      return;
    }

    try {
      setWithdrawing(true);

      const result = await contractService.withdraw(signer);

      if (result.success) {
        toast.success("Funds withdrawn successfully!");
        setWithdrawAmount("");
        onRefresh();
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      toast.error("Failed to withdraw funds");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleWithdrawAll = async () => {
    if (parseFloat(contractBalance) <= 0) {
      toast.error("No funds available to withdraw");
      return;
    }

    if (
      !confirm("Are you sure you want to withdraw all funds from the contract?")
    ) {
      return;
    }

    try {
      setWithdrawing(true);

      const result = await contractService.withdraw(signer);

      if (result.success) {
        toast.success("All funds withdrawn successfully!");
        onRefresh();
      }
    } catch (error) {
      console.error("Error withdrawing all funds:", error);
      toast.error("Failed to withdraw funds");
    } finally {
      setWithdrawing(false);
    }
  };

  const exportContractData = () => {
    const contractData = {
      contractBalance,
      timestamp: new Date().toISOString(),
      exportedBy: "Admin",
      contractStatus: isPaused ? "Paused" : "Active",
    };

    const dataStr = JSON.stringify(contractData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `contract-data-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Contract data exported successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Contract Controls
          </h2>
          <p className="text-gray-600">
            Emergency controls and fund management
          </p>
        </div>
      </div>

      {/* Contract State Control */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 relative">
        {/* Background Elements - simplified */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-50 rounded-full opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              {isPaused ? (
                <FiPlay className="h-5 w-5 text-orange-600" />
              ) : (
                <FiPause className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Contract State Control
            </h3>
          </div>

          <div className="space-y-6">
            {/* Current Status Display */}
            <div
              className={`border-2 rounded-2xl p-6 ${
                isPaused
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4
                    className={`text-lg font-bold mb-2 ${
                      isPaused ? "text-red-900" : "text-green-900"
                    }`}
                  >
                    Contract Status
                  </h4>
                  <p
                    className={`text-3xl font-bold mb-2 ${
                      isPaused ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {isPaused ? "PAUSED" : "ACTIVE"}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      isPaused ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {isPaused
                      ? "All user interactions are disabled"
                      : "Contract is fully operational"}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    isPaused ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  {isPaused ? (
                    <FiLock className="h-8 w-8 text-red-600" />
                  ) : (
                    <FiShield className="h-8 w-8 text-green-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Pause/Unpause Control */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Emergency Control
                  </h4>
                  <p className="text-sm font-medium text-gray-600 mb-4">
                    {isPaused
                      ? "Resume normal contract operations by unpausing"
                      : "Temporarily disable all contract interactions"}
                  </p>
                </div>
                <button
                  onClick={handlePauseContract}
                  disabled={pausing}
                  className={`inline-flex items-center px-6 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed ${
                    isPaused
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                      : "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                  }`}
                >
                  {isPaused ? (
                    <FiPlay className="w-4 h-4 mr-2" />
                  ) : (
                    <FiPause className="w-4 h-4 mr-2" />
                  )}
                  {pausing
                    ? isPaused
                      ? "Unpausing..."
                      : "Pausing..."
                    : isPaused
                    ? "Unpause Contract"
                    : "Pause Contract"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fund Management */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 relative">
        {/* Background Elements - simplified */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-50 rounded-full opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <FiDollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Fund Management</h3>
          </div>

          <div className="space-y-8">
            {/* Current Balance Display */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-full opacity-30"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-green-900 mb-2">
                    Available Balance
                  </h4>
                  <p className="text-4xl font-bold text-green-600 mb-2">
                    {loading
                      ? "..."
                      : `${parseFloat(contractBalance).toFixed(4)} ETH`}
                  </p>
                  <p className="text-sm font-medium text-green-700">
                    $
                    {loading
                      ? "..."
                      : (
                          parseFloat(contractBalance) * 2500
                        ).toLocaleString()}{" "}
                    USD (estimated)
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                  <FiDollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Partial Withdrawal */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FiZap className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">
                  Partial Withdrawal
                </h4>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.0001"
                    max={contractBalance}
                    placeholder="Enter amount in ETH"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300"
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={
                    withdrawing ||
                    !withdrawAmount ||
                    parseFloat(withdrawAmount) <= 0
                  }
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <FiDollarSign className="w-4 h-4 mr-2" />
                  {withdrawing ? "Withdrawing..." : "Withdraw"}
                </button>
              </div>
              <p className="text-sm font-medium text-gray-600 mt-3">
                Maximum available: {parseFloat(contractBalance).toFixed(4)} ETH
              </p>
            </div>

            {/* Full Withdrawal */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full opacity-30"></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <FiAlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <h4 className="text-lg font-bold text-red-900">
                    Emergency Full Withdrawal
                  </h4>
                </div>

                <p className="text-sm font-medium text-red-700 mb-6">
                  Withdraw all funds from the contract. This should only be used
                  in emergency situations.
                </p>

                <button
                  onClick={handleWithdrawAll}
                  disabled={withdrawing || parseFloat(contractBalance) <= 0}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  <FiAlertTriangle className="w-4 h-4 mr-2" />
                  {withdrawing ? "Withdrawing..." : "Withdraw All Funds"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 relative">
        {/* Background Elements - simplified */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-full opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiSettings className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Data Management</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={exportContractData}
              className="inline-flex items-center justify-center px-6 py-4 bg-gray-50 border border-gray-200 shadow-lg text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <FiDownload className="w-5 h-5 mr-3" />
              Export Contract Data
            </button>

            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-4 bg-gray-50 border border-gray-200 shadow-lg text-gray-700 font-semibold rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              <FiSettings
                className={`w-5 h-5 mr-3 ${
                  loading ? "animate-spin" : ""
                } transition-transform`}
              />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full opacity-30"></div>

        <div className="relative z-10 flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <FiShield className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-yellow-900 mb-4">
              Security Guidelines
            </h3>
            <div className="text-sm font-medium text-yellow-800 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>
                  Only use emergency controls when absolutely necessary
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Pausing the contract prevents all user interactions</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>
                  Fund withdrawals are irreversible - double-check amounts
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>
                  Monitor contract activity regularly for suspicious behavior
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Keep backup records of all administrative actions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Admin Actions */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden relative">
        {/* Background Elements - simplified */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-full opacity-20"></div>

        <div className="relative z-10">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <FiActivity className="h-5 w-5 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Recent Admin Actions
              </h3>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              {[
                {
                  action: "Fund Withdrawal",
                  description: "Withdrew 0.5 ETH from contract",
                  timestamp: "2 hours ago",
                  status: "success",
                  icon: FiDollarSign,
                },
                {
                  action: "Doctor Authorization",
                  description: "Authorized Dr. Smith (0x1234...5678)",
                  timestamp: "1 day ago",
                  status: "success",
                  icon: FiShield,
                },
                {
                  action: "Plan Update",
                  description: "Updated Premium plan pricing",
                  timestamp: "3 days ago",
                  status: "success",
                  icon: FiSettings,
                },
                {
                  action: "Contract Pause",
                  description: "Temporarily paused contract for maintenance",
                  timestamp: "1 week ago",
                  status: "warning",
                  icon: FiLock,
                },
              ].map((action, index) => {
                const statusConfig = {
                  success: {
                    bg: "bg-green-500",
                    text: "text-white",
                  },
                  warning: {
                    bg: "bg-yellow-500",
                    text: "text-white",
                  },
                  error: {
                    bg: "bg-red-500",
                    text: "text-white",
                  },
                };

                const config = statusConfig[action.status];

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-white transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shadow-lg`}
                      >
                        <action.icon className={`h-5 w-5 ${config.text}`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {action.action}
                        </p>
                        <p className="text-sm text-gray-600 font-medium">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      {action.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractControls;
