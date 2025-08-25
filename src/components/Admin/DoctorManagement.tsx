import React, { useEffect, useMemo, useState } from "react";
import {
  FiUserPlus, FiUserX, FiCheck, FiSearch, FiUsers,
  FiShield, FiActivity, FiClock, FiTarget, FiRefreshCw
} from "react-icons/fi";
import toast from "react-hot-toast";
import { Address } from "viem";
import { useChainId, usePublicClient, useWalletClient } from "wagmi";
import { contractService } from "@/services/contract";

const DoctorManagement: React.FC<{ loading?: boolean; onRefresh?: () => void }> = ({ loading, onRefresh }) => {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [newDoctorAddress, setNewDoctorAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [authorizing, setAuthorizing] = useState(false);
  const [authorizedDoctors, setAuthorizedDoctors] = useState<
    Array<{ address: Address; isAuthorized: boolean; blockNumber: bigint; txHash: `0x${string}` }>
  >([]);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);

  useEffect(() => {
    if (chainId) contractService.setChainId(chainId);
  }, [chainId]);

  const fetchAuthorizedDoctors = async () => {
    if (!publicClient) return;
    setFetchingDoctors(true);
    try {
      const list = await contractService.getAuthorizedDoctorsFromEvents(publicClient);
      setAuthorizedDoctors(list.filter((d) => d.isAuthorized));
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch authorized doctors");
    } finally {
      setFetchingDoctors(false);
    }
  };

  useEffect(() => {
    fetchAuthorizedDoctors();
  }, [publicClient]);

  const handleAuthorizeDoctor = async () => {
    if (!walletClient || !publicClient) return toast.error("Wallet not connected");
    if (!/^0x[a-fA-F0-9]{40}$/.test(newDoctorAddress)) return toast.error("Enter a valid address");
    try {
      setAuthorizing(true);
      const res = await contractService.cmAuthorizeDoctor(newDoctorAddress as Address, true, walletClient, publicClient);
      if (res.success) {
        toast.success("Doctor authorized");
        setNewDoctorAddress("");
        await fetchAuthorizedDoctors();
        onRefresh?.();
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Authorization failed");
    } finally {
      setAuthorizing(false);
    }
  };

  const handleRevokeAuthorization = async (addr: Address) => {
    if (!walletClient || !publicClient) return toast.error("Wallet not connected");
    if (!confirm(`Revoke authorization for ${addr}?`)) return;
    try {
      const res = await contractService.cmAuthorizeDoctor(addr, false, walletClient, publicClient);
      if (res.success) {
        toast.success("Authorization revoked");
        await fetchAuthorizedDoctors();
        onRefresh?.();
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to revoke");
    }
  };

  const filtered = useMemo(
    () =>
      authorizedDoctors.filter(
        (d) =>
          d.address.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [authorizedDoctors, searchTerm]
  );

  const fmtAddr = (a: string) => `${a.slice(0,6)}...${a.slice(-4)}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
          <p className="text-gray-600">Authorize and manage medical professionals</p>
        </div>
        <button onClick={fetchAuthorizedDoctors} disabled={fetchingDoctors}
          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-xl">
          <FiRefreshCw className={`w-4 h-4 mr-2 ${fetchingDoctors ? "animate-spin" : ""}`} />
          Refresh Doctors
        </button>
      </div>

      {/* Add New Doctor */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <FiUserPlus className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Authorize New Doctor</h3>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="0x..."
            value={newDoctorAddress}
            onChange={(e) => setNewDoctorAddress(e.target.value)}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl"
          />
          <button onClick={handleAuthorizeDoctor} disabled={authorizing || !newDoctorAddress}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl">
            <FiUserPlus className="w-4 h-4 mr-2" />
            {authorizing ? "Authorizing..." : "Authorize"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
            <FiUsers className="h-5 w-5 text-cyan-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Authorized Doctors ({filtered.length})
          </h3>
        </div>

        {loading || fetchingDoctors ? (
          <div className="p-8">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-600">No authorized doctors</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtered.map((d) => (
              <div key={d.address} className="p-8 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{fmtAddr(d.address)}</div>
                  <div className="text-xs text-gray-500">Block: {d.blockNumber.toString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                    Active
                  </span>
                  <button onClick={() => handleRevokeAuthorization(d.address)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-xl">
                    <FiUserX className="w-4 h-4 mr-2" /> Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
            <FiShield className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="text-sm text-yellow-800 space-y-2">
            <div>Only authorize licensed medical professionals.</div>
            <div>Authorized doctors can approve/reject insurance claims.</div>
            <div>Revoke immediately if misconduct is detected.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorManagement;
