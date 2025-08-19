import { useState, useEffect } from "react";
import { useEthersSigner } from "../../hooks/ethers";
import { contractService } from "../../services/contract";
import {
  FiUserPlus,
  FiUserX,
  FiCheck,
  FiX,
  FiSearch,
  FiUsers,
  FiShield,
  FiActivity,
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiZap,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useChainId } from "wagmi";

const DoctorManagement = ({ loading, onRefresh }) => {
  const signer = useEthersSigner();
  const [newDoctorAddress, setNewDoctorAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [authorizing, setAuthorizing] = useState(false);
  const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);

  // inside the component
const chainId = useChainId();
useEffect(() => {
  if (chainId) contractService.setChainId(chainId);
}, [chainId]);

  // Fetch authorized doctors from contract events
  const fetchAuthorizedDoctors = async () => {
    try {
      setFetchingDoctors(true);

      if (!signer) {
        console.log("No signer available");
        return;
      }

      const contract = contractService.initContract(signer, false);
      if (!contract) {
        console.error("Failed to initialize contract");
        return;
      }

      // Get all DoctorAuthorized events
      const filter = contract.filters.DoctorAuthorized();
      const events = await contract.queryFilter(filter, 0, "latest");

      // Create a map to track the latest authorization status for each doctor
      const doctorStatusMap = new Map();

      events.forEach((event) => {
        const doctorAddress = event.args.doctor;
        const isAuthorized = event.args.authorized;
        const blockNumber = event.blockNumber;

        // Keep only the latest event for each doctor
        if (
          !doctorStatusMap.has(doctorAddress) ||
          doctorStatusMap.get(doctorAddress).blockNumber < blockNumber
        ) {
          doctorStatusMap.set(doctorAddress, {
            address: doctorAddress,
            isAuthorized: isAuthorized,
            blockNumber: blockNumber,
            transactionHash: event.transactionHash,
          });
        }
      });

      // Filter only currently authorized doctors and get their details
      const authorizedDoctorsList = [];

      for (const [address, data] of doctorStatusMap) {
        if (data.isAuthorized) {
          // Check current authorization status from contract
          try {
            const isCurrentlyAuthorized = await contract.authorizedDoctors(
              address
            );

            if (isCurrentlyAuthorized) {
              // Get block details for timestamp
              const block = await signer.provider.getBlock(data.blockNumber);

              authorizedDoctorsList.push({
                address: address,
                isActive: true,
                authorizedDate: new Date(block.timestamp * 1000).toISOString(),
                transactionHash: data.transactionHash,
                blockNumber: data.blockNumber,
                // Default values - in production, you might fetch these from IPFS or other sources
                name: `Doctor ${address.slice(2, 8)}`,
                specialization: "General Medicine",
                claimsProcessed: Math.floor(Math.random() * 50), // Random for demo
              });
            }
          } catch (error) {
            console.error(
              `Error checking authorization for ${address}:`,
              error
            );
          }
        }
      }

      setAuthorizedDoctors(authorizedDoctorsList);
    } catch (error) {
      console.error("Error fetching authorized doctors:", error);
      toast.error("Failed to fetch authorized doctors");
    } finally {
      setFetchingDoctors(false);
    }
  };

  // Fetch doctors on component mount and when signer changes
  useEffect(() => {
    if (signer) {
      fetchAuthorizedDoctors();
    }
  }, [signer]);

  const handleAuthorizeDoctor = async () => {
    if (!newDoctorAddress) {
      toast.error("Please enter a doctor address");
      return;
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(newDoctorAddress)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    try {
      setAuthorizing(true);

      const result = await contractService.authorizeDoctorAddress(
        newDoctorAddress,
        true,
        signer
      );

      if (result.success) {
        toast.success("Doctor authorized successfully!");
        setNewDoctorAddress("");
        // Refresh the doctors list
        await fetchAuthorizedDoctors();
        onRefresh && onRefresh();
      } else {
        toast.error(result.error || "Failed to authorize doctor");
      }
    } catch (error) {
      console.error("Error authorizing doctor:", error);
      toast.error("Failed to authorize doctor");
    } finally {
      setAuthorizing(false);
    }
  };

  const handleRevokeAuthorization = async (doctorAddress) => {
    if (
      !confirm(
        `Are you sure you want to revoke authorization for ${doctorAddress}?`
      )
    ) {
      return;
    }

    try {
      const result = await contractService.authorizeDoctorAddress(
        doctorAddress,
        false,
        signer
      );

      if (result.success) {
        toast.success("Doctor authorization revoked!");
        // Refresh the doctors list
        await fetchAuthorizedDoctors();
        onRefresh && onRefresh();
      } else {
        toast.error(result.error || "Failed to revoke authorization");
      }
    } catch (error) {
      console.error("Error revoking authorization:", error);
      toast.error("Failed to revoke authorization");
    }
  };

  const handleReauthorizeDoctor = async (doctorAddress) => {
    try {
      const result = await contractService.authorizeDoctorAddress(
        doctorAddress,
        true,
        signer
      );

      if (result.success) {
        toast.success("Doctor reauthorized successfully!");
        // Refresh the doctors list
        await fetchAuthorizedDoctors();
        onRefresh && onRefresh();
      } else {
        toast.error(result.error || "Failed to reauthorize doctor");
      }
    } catch (error) {
      console.error("Error reauthorizing doctor:", error);
      toast.error("Failed to reauthorize doctor");
    }
  };

  const filteredDoctors = authorizedDoctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Doctor Management
          </h2>
          <p className="text-gray-600">
            Authorize and manage medical professionals
          </p>
        </div>
        <button
          onClick={fetchAuthorizedDoctors}
          disabled={fetchingDoctors}
          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 transition-all duration-300 disabled:opacity-50"
        >
          <FiRefreshCw
            className={`w-4 h-4 mr-2 ${fetchingDoctors ? "animate-spin" : ""}`}
          />
          Refresh Doctors
        </button>
      </div>

      {/* Add New Doctor */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 relative">
        {/* Background Elements - simplified */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-full opacity-30"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FiUserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Authorize New Doctor
            </h3>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter doctor's wallet address (0x...)"
                value={newDoctorAddress}
                onChange={(e) => setNewDoctorAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300"
              />
            </div>
            <button
              onClick={handleAuthorizeDoctor}
              disabled={authorizing || !newDoctorAddress}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              <FiUserPlus className="w-4 h-4 mr-2" />
              {authorizing ? "Authorizing..." : "Authorize Doctor"}
            </button>
          </div>
          <p className="text-sm font-medium text-gray-600 mt-4">
            Enter the wallet address of the medical professional you want to
            authorize for claim processing.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search doctors by name, address, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all duration-300"
          />
        </div>
      </div>

      {/* Authorized Doctors List */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden relative">
        {/* Background Elements - simplified */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-full opacity-20"></div>

        <div className="relative z-10">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <FiUsers className="h-5 w-5 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Authorized Doctors ({filteredDoctors.length})
                </h3>
              </div>
              {fetchingDoctors && (
                <div className="flex items-center text-sm text-gray-600">
                  <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading doctors...
                </div>
              )}
            </div>
          </div>

          {loading || fetchingDoctors ? (
            <div className="p-8">
              <div className="animate-pulse space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-6 border border-gray-200 rounded-2xl"
                  >
                    <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <FiUserPlus className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm
                  ? "No doctors match your search"
                  : "No authorized doctors"}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "Start by authorizing your first medical professional."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDoctors.map((doctor, index) => (
                <div
                  key={doctor.address}
                  className="p-8 hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {doctor.name}
                        </h4>
                        <p className="text-sm font-semibold text-indigo-600 mb-1">
                          {doctor.specialization}
                        </p>
                        <p className="text-sm text-gray-500 font-mono">
                          {formatAddress(doctor.address)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Full Address: {doctor.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Status and Stats */}
                      <div className="text-right">
                        <div className="flex items-center justify-end space-x-2 mb-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold border ${
                              doctor.isActive
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {doctor.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-600 mb-1">
                          {doctor.claimsProcessed} claims processed
                        </div>
                        <div className="text-xs font-medium text-gray-500">
                          Authorized:{" "}
                          {new Date(doctor.authorizedDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs font-medium text-gray-400">
                          Block: {doctor.blockNumber}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        {doctor.isActive ? (
                          <button
                            onClick={() =>
                              handleRevokeAuthorization(doctor.address)
                            }
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            <FiUserX className="w-4 h-4 mr-2" />
                            Revoke
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleReauthorizeDoctor(doctor.address)
                            }
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            <FiCheck className="w-4 h-4 mr-2" />
                            Reauthorize
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        title: "Claims Processed",
                        value: doctor.claimsProcessed,
                        icon: FiActivity,
                        bg: "bg-blue-50",
                        text: "text-blue-600",
                        border: "border-blue-200",
                      },
                      {
                        title: "Avg Processing Time",
                        value: "2.3 days",
                        icon: FiClock,
                        bg: "bg-green-50",
                        text: "text-green-600",
                        border: "border-green-200",
                      },
                      {
                        title: "Approval Rate",
                        value: "94.5%",
                        icon: FiTarget,
                        bg: "bg-purple-50",
                        text: "text-purple-600",
                        border: "border-purple-200",
                      },
                    ].map((metric, metricIdx) => (
                      <div
                        key={metricIdx}
                        className={`${metric.bg} border ${metric.border} rounded-2xl p-4 hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            <metric.icon className={`h-5 w-5 ${metric.text}`} />
                          </div>
                          <div>
                            <div
                              className={`text-sm font-bold ${metric.text} opacity-80`}
                            >
                              {metric.title}
                            </div>
                            <div className={`text-xl font-bold ${metric.text}`}>
                              {metric.value}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Transaction Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Transaction Hash:</span>{" "}
                      <span className="font-mono">
                        {formatAddress(doctor.transactionHash)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Information Panel */}
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
              Doctor Authorization Guidelines
            </h3>
            <div className="text-sm font-medium text-yellow-800 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Only authorize licensed medical professionals</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>
                  Authorized doctors can approve/reject insurance claims
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Verify doctor credentials before authorization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Monitor claim processing performance regularly</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Revoke authorization if misconduct is detected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorManagement;
