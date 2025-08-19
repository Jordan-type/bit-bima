import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  ClaimManager as ABI_CLAIM,
  PolicyManager as ABI_PM,
  RiskPoolTreasury as ABI_POOL,
  CoreProtocol as ABI_CORE,
  MockERC20 as ABI_ERC20,
} from "../contractsABI/abis";
import {
  CONTRACT_ADDRESS,          // default/fallback set
  getContractAddresses,      // picks per-chain
} from "../config/network";
import { PLAN_TYPES, PAYMENT_TYPES, POLICY_STATUS, CLAIM_STATUS } from "@/constant";

/* ------------------------- ethers v5/v6 helpers ------------------------- */
const isV6 = !!ethers.formatEther;
const fmt   = (x) => (isV6 ? ethers.formatEther(x) : ethers.utils.formatEther(x));
const parse = (x) => (isV6 ? ethers.parseEther(String(x)) : ethers.utils.parseEther(String(x)));
const isAddr = (a) => (ethers.utils?.isAddress ? ethers.utils.isAddress(a) : ethers.isAddress(a));

/* --------------------------- address guardrail -------------------------- */
function need(addr, name) {
  if (!addr || !isAddr(addr)) throw new Error(`${name} address missing/invalid`);
  return addr;
}

/* ---------------------------- service class ----------------------------- */
class ContractService {
  constructor() {
    // start with whatever CONTRACT_ADDRESS exported (your default chain)
    this.addresses = CONTRACT_ADDRESS || {};
  }

  /** Update internal addresses using current chainId (e.g. from wagmi's useChainId) */
  setChainId(chainId) {
    this.addresses = getContractAddresses(chainId);
  }

  /** Manually replace addresses (useful for tests) */
  setAddresses(addresses) {
    this.addresses = addresses || {};
  }

  _getAddresses() {
    const a = this.addresses || {};
    // light validation to give nice errors early
    need(a.PolicyManager, "PolicyManager");
    need(a.ClaimManager, "ClaimManager");
    need(a.RiskPoolTreasury, "RiskPoolTreasury");
    need(a.CoreProtocol, "CoreProtocol");
    return a;
  }

  /* Create read or write instances on demand */
  _getInstances(signerOrProvider, withSigner = false) {
    if (withSigner && !ethers.Signer?.isSigner?.(signerOrProvider)) {
      throw new Error("Expected a Signer for write operation");
    }
    const addr = this._getAddresses();
    const pm   = new ethers.Contract(addr.PolicyManager,    ABI_PM,    signerOrProvider);
    const cm   = new ethers.Contract(addr.ClaimManager,     ABI_CLAIM, signerOrProvider);
    const pool = new ethers.Contract(addr.RiskPoolTreasury, ABI_POOL,  signerOrProvider);
    const core = new ethers.Contract(addr.CoreProtocol,     ABI_CORE,  signerOrProvider);
    return { pm, cm, pool, core };
  }

  

  /* ------------------------------ READS --------------------------------- */

// inside ContractService class (keep the rest of your file as-is)

/* ---------- normalize a plan tuple/struct ---------- */
_readPlanTuple(planType, p) {
  return {
    planType: Number(p?.planType ?? p?.[0] ?? planType),
    oneTimePrice: fmt(p?.oneTimePrice ?? p?.[1] ?? "0"),
    monthlyPrice: fmt(p?.monthlyPrice ?? p?.[2] ?? "0"),
    coverageAmount: fmt(p?.coverageAmount ?? p?.[3] ?? "0"),
    deductible: fmt(p?.deductible ?? p?.[4] ?? "0"),
    ipfsHash: (p?.ipfsHash ?? p?.[5] ?? "") || "",
    isActive: Boolean(p?.isActive ?? p?.[6] ?? true),
  };
}

/* ---------- flexible plan getter (works with new/old ABIs) ---------- */
async getInsurancePlan(planType, provider) {
  try {
    const { pm } = this._getInstances(provider);

    // Try a wide set of common names
    const baseNames = [
      "getplan",
      "getinsuranceplan",
      "plans",
      "insuranceplans",
      "planconfigs",
      "getplanconfig",
      "planinfo",
      "getplandetails",
      "plandetails",
    ];

    // Build exact signatures from ABI (handles uint8/uint256 overloads)
    const keys = this._findGetterKeys(pm, baseNames);

    // Also try the plain method names (ethers adds these when *not* overloaded)
    const plainNames = [...new Set(baseNames.map(n => n.replace(/^get/, "")))];
    const direct = [...new Set([
      ...keys,
      ...baseNames,
      ...plainNames,
    ])];

    for (const key of direct) {
      if (!pm[key]) continue; // not in ABI
      try {
        const p = await pm[key](planType);
        if (p != null) return this._readPlanTuple(planType, p);
      } catch (e) {
        // try next candidate
      }
    }

    // Nothing worked — surface what the ABI actually has to help you adjust ABIs quickly
    console.log(
      "PolicyManager plan getter not found. ABI has:",
      this._listFunctionSigs(pm)
    );
    throw new Error("No compatible plan getter found on PolicyManager");
  } catch (e) {
    console.log("getInsurancePlan:", e);
    return null;
  }
}


async getAllInsurancePlans(provider) {
  try {
    const { pm } = this._getInstances(provider);

    // Prefer a batch getter if it exists (any 0-arg function with a plural-ish name)
    const batchNames = ["getAllPlans", "listPlans", "getPlans", "plans"]; // last one catches some array-returners
    for (const name of batchNames) {
      const frags = (pm?.interface?.fragments || [])
        .filter(f => f.type === "function" && f.name === name && f.inputs?.length === 0);
      for (const frag of frags) {
        const key = frag.format(); // e.g. "getAllPlans()"
        if (!pm[key]) continue;
        try {
          const list = await pm[key]();
          if (Array.isArray(list) && list.length) {
            return list.map((p, idx) => this._readPlanTuple(idx, p)).filter(Boolean);
          }
        } catch {}
      }
    }

    // Next best: if contract exposes a count, iterate 0..count-1
    const count = await this._getPlanCount(pm);
    if (Number.isFinite(count) && count > 0) {
      const items = [];
      for (let i = 0; i < count; i++) {
        const one = await this.getInsurancePlan(i, provider);
        if (one) items.push(one);
      }
      if (items.length) return items;
    }

    // Fallback: try your known enum values
    const plans = await Promise.all([
      this.getInsurancePlan(PLAN_TYPES.BASIC, provider),
      this.getInsurancePlan(PLAN_TYPES.PREMIUM, provider),
      this.getInsurancePlan(PLAN_TYPES.PLATINUM, provider),
    ]);
    return plans.filter(Boolean);
  } catch (e) {
    console.error("getAllInsurancePlans:", e);
    return [];
  }
}


  async getPolicy(policyId, provider) {
    try {
      const { pm } = this._getInstances(provider);
      const p = await pm.policies(policyId);
      return {
        policyId: String(p.policyId ?? p[0]),
        policyholder: p.policyholder ?? p[1],
        planType: Number(p.planType ?? p[2]),
        paymentType: Number(p.paymentType ?? p[3]),
        paymentToken: p.paymentToken ?? p[4],
        coverageAmount: fmt(p.coverageAmount ?? p[5]),
        deductible: fmt(p.deductible ?? p[6]),
        premium: fmt(p.premium ?? p[7]),
        startDate: String(p.startDate ?? p[8]),
        endDate: String(p.endDate ?? p[9]),
        lastPaymentDate: String(p.lastPaymentDate ?? p[10]),
        status: Number(p.status ?? p[11]),
        ipfsMetadata: p.ipfsMetadata ?? p[12],
        totalPaid: fmt(p.totalPaid ?? p[13]),
        claimsUsed: fmt(p.claimsUsed ?? p[14]),
      };
    } catch (e) {
      console.error("getPolicy:", e);
      return null;
    }
  }

  async getUserPolicies(user, provider) {
    try {
      const { pm } = this._getInstances(provider);
      const ids = await pm.getUserPolicies(user);
      const arr = Array.from(ids, (x) => (isV6 ? Number(x) : x.toNumber?.() ?? Number(x)));
      const out = await Promise.all(arr.map((id) => this.getPolicy(id, provider)));
      return out.filter(Boolean);
    } catch (e) {
      console.error("getUserPolicies:", e);
      return [];
    }
  }

  async isPolicyValid(policyId, provider) {
    try {
      const { pm } = this._getInstances(provider);
      return await pm.isPolicyValid(policyId);
    } catch {
      return false;
    }
  }

  async getRemainingCoverage(policyId, provider) {
    try {
      const { pm } = this._getInstances(provider);
      const remaining = await pm.getRemainingCoverage(policyId);
      return fmt(remaining);
    } catch (e) {
      console.error("getRemainingCoverage:", e);
      return "0";
    }
  }

  async getContractStats(provider) {
    try {
      const { pm, cm } = this._getInstances(provider);
      const [pols, claims] = await Promise.all([pm.getTotalPolicies(), cm.getTotalClaims()]);
      return {
        totalPolicies: isV6 ? String(pols) : pols.toString(),
        totalClaims: isV6 ? String(claims) : claims.toString(),
      };
    } catch (e) {
      console.error("getContractStats:", e);
      return { totalPolicies: "0", totalClaims: "0" };
    }
  }

  /* ------------------------------ WRITES -------------------------------- */

  async purchasePolicy(planType, paymentType, tokenAddress, ipfsMetadata, signer) {
    try {
      if (!isAddr(tokenAddress)) throw new Error("Invalid token address");
      const { pm } = this._getInstances(signer, true);
      const tx = await pm.purchasePolicy(planType, paymentType, tokenAddress, ipfsMetadata, {
        gasLimit: 600_000,
      });
      toast.loading("Purchasing policy...", { id: "purchase" });
      const receipt = await tx.wait();
      toast.success("Policy purchased!", { id: "purchase" });
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error("purchasePolicy:", error);
      toast.error(error.reason || error.message || "Failed to purchase", { id: "purchase" });
      return { success: false, error: String(error?.reason || error?.message) };
    }
  }

  async payMonthlyPremium(policyId, signer) {
    try {
      const { pm } = this._getInstances(signer, true);
      const tx = await pm.payMonthlyPremium(policyId, { gasLimit: 300_000 });
      toast.loading("Paying monthly premium...", { id: "premium" });
      const receipt = await tx.wait();
      toast.success("Premium paid!", { id: "premium" });
      return { success: true, txHash: tx.hash, receipt };
    } catch (error) {
      console.error("payMonthlyPremium:", error);
      toast.error(error.reason || error.message || "Failed to pay premium", { id: "premium" });
      return { success: false, error: String(error?.reason || error?.message) };
    }
  }

  async cancelPolicy(policyId, signer) {
    try {
      const { pm } = this._getInstances(signer, true);
      const tx = await pm.cancelPolicy(policyId, { gasLimit: 200_000 });
      toast.loading("Cancelling policy...", { id: "cancel" });
      const r = await tx.wait();
      toast.success("Policy cancelled", { id: "cancel" });
      return { success: true, txHash: tx.hash, receipt: r };
    } catch (e) {
      console.error("cancelPolicy:", e);
      toast.error(e.reason || e.message || "Failed to cancel", { id: "cancel" });
      return { success: false, error: String(e?.reason || e?.message) };
    }
  }

  async submitClaim(policyId, claimAmountEth, ipfsDocs, description, signer) {
    try {
      const { cm } = this._getInstances(signer, true);
      const tx = await cm.submitClaim(policyId, parse(claimAmountEth), ipfsDocs, description, {
        gasLimit: 400_000,
      });
      toast.loading("Submitting claim...", { id: "claim" });
      const r = await tx.wait();
      toast.success("Claim submitted!", { id: "claim" });
      return { success: true, txHash: tx.hash, receipt: r };
    } catch (e) {
      console.error("submitClaim:", e);
      toast.error(e.reason || e.message || "Failed to submit claim", { id: "claim" });
      return { success: false, error: String(e?.reason || e?.message) };
    }
  }

  async processClaim(claimId, status, approvedAmountEth, signer) {
    try {
      const { cm } = this._getInstances(signer, true);
      const amt = status === CLAIM_STATUS.APPROVED ? parse(approvedAmountEth) : parse("0");
      const tx = await cm.processClaim(claimId, status, amt, { gasLimit: 600_000 });
      toast.loading("Processing claim...", { id: "process" });
      const r = await tx.wait();
      toast.success("Claim processed!", { id: "process" });
      return { success: true, txHash: tx.hash, receipt: r };
    } catch (e) {
      console.error("processClaim:", e);
      toast.error(e.reason || e.message || "Failed to process claim", { id: "process" });
      return { success: false, error: String(e?.reason || e?.message) };
    }
  }

  async authorizeDoctorAddress(doctorAddress, authorized, signer) {
    try {
      if (!isAddr(doctorAddress)) throw new Error("Invalid address");
      const { cm } = this._getInstances(signer, true);
      const tx = await cm.authorizeDoctor(doctorAddress, authorized, { gasLimit: 120_000 });
      toast.loading(authorized ? "Authorizing doctor..." : "Revoking doctor...", { id: "doctor-auth" });
      const r = await tx.wait();
      toast.success(authorized ? "Doctor authorized!" : "Doctor revoked!", { id: "doctor-auth" });
      return { success: true, txHash: tx.hash, receipt: r };
    } catch (e) {
      console.error("authorizeDoctorAddress:", e);
      toast.error(e.reason || e.message || "Failed to update doctor", { id: "doctor-auth" });
      return { success: false, error: String(e?.reason || e?.message) };
    }
  }

  async withdrawFromPool(tokenAddress, amountEth, to, signer) {
    try {
      const { pool } = this._getInstances(signer, true);
      const tx = await pool.withdraw(need(tokenAddress, "token"), parse(amountEth), need(to, "to"));
      toast.loading("Withdrawing from pool...", { id: "withdraw" });
      const r = await tx.wait();
      toast.success("Withdrawn!", { id: "withdraw" });
      return { success: true, txHash: tx.hash, receipt: r };
    } catch (e) {
      console.error("withdrawFromPool:", e);
      toast.error(e.reason || e.message || "Withdraw failed", { id: "withdraw" });
      return { success: false, error: String(e?.reason || e?.message) };
    }
  }

  /* --------------------------- ERC20 utilities --------------------------- */

  token(tokenAddr, signerOrProvider) {
    return new ethers.Contract(need(tokenAddr, "token"), ABI_ERC20, signerOrProvider);
  }
  async tokenAllowance(tokenAddr, owner, spender, provider) {
    const erc = this.token(tokenAddr, provider);
    const v = await erc.allowance(owner, spender);
    return fmt(v);
  }
  async tokenApprove(tokenAddr, spender, amountEth, signer) {
    try {
      const erc = this.token(tokenAddr, signer);
      const tx = await erc.approve(need(spender, "spender"), parse(amountEth));
      toast.loading("Approving token...", { id: "approve" });
      const r = await tx.wait();
      toast.success("Approved!", { id: "approve" });
      return { success: true, txHash: tx.hash, receipt: r };
    } catch (e) {
      console.error("tokenApprove:", e);
      toast.error(e.reason || e.message || "Approve failed", { id: "approve" });
      return { success: false, error: String(e?.reason || e?.message) };
    }
  }
  async tokenBalance(tokenAddr, account, provider) {
    const erc = this.token(tokenAddr, provider);
    const v = await erc.balanceOf(account);
    return fmt(v);
  }

  /* ----------------------------- Claims list ----------------------------- */

  async getClaim(claimId, provider) {
    try {
      const { cm } = this._getInstances(provider);
      const c = await cm.claims(claimId);
      return {
        claimId: String(c.claimId ?? c[0]),
        policyId: String(c.policyId ?? c[1]),
        claimant: c.claimant ?? c[2],
        claimAmount: fmt(c.claimAmount ?? c[3]),
        approvedAmount: fmt(c.approvedAmount ?? c[4]),
        status: Number(c.status ?? c[5]),
        submissionDate: String(c.submissionDate ?? c[6]),
        processedDate: String(c.processedDate ?? c[7]),
        ipfsDocuments: c.ipfsDocuments ?? c[8],
        description: c.description ?? c[9],
      };
    } catch (e) {
      console.error("getClaim:", e);
      return null;
    }
  }

  async getPolicyClaims(policyId, provider) {
    try {
      const { cm } = this._getInstances(provider);
      const ids = await cm.getPolicyClaims(policyId);
      const arr = Array.from(ids, (x) => (isV6 ? Number(x) : x.toNumber?.() ?? Number(x)));
      const list = await Promise.all(arr.map((id) => this.getClaim(id, provider)));
      return list.filter(Boolean);
    } catch (e) {
      console.error("getPolicyClaims:", e);
      return [];
    }
  }

  async fetchAllClaims(provider) {
    try {
      const { cm, pm } = this._getInstances(provider);
      const total = await cm.getTotalClaims();
      const n = isV6 ? Number(total) : total.toNumber?.() ?? Number(total);
      const out = [];
      for (let i = 1; i <= n; i++) {
        try {
          const c = await this.getClaim(i, provider);
          if (!c) continue;
          const p = await pm.policies(c.policyId);
          out.push({
            ...c,
            policyholder: p.policyholder ?? p[1],
            planType: Number(p.planType ?? p[2]),
            providerName: this.getPlanTypeName(Number(p.planType ?? p[2])),
            claimType: this.deriveClaimType(c.description || ""),
            submissionDate: Number(c.submissionDate) * 1000,
            processedDate: Number(c.processedDate) * 1000,
          });
        } catch (e) {
          console.warn(`claim ${i} read failed`, e);
        }
      }
      return { success: true, claims: out };
    } catch (e) {
      console.error("fetchAllClaims:", e);
      return { success: false, claims: [], error: String(e?.message || e) };
    }
  }

  async fetchClaimsWithEvents(provider, fromBlock = 0) {
    try {
      const { cm, pm } = this._getInstances(provider);
      const evSub = cm.filters.ClaimSubmitted();
      const evPro = cm.filters.ClaimProcessed();
      const [sub, pro] = await Promise.all([cm.queryFilter(evSub, fromBlock), cm.queryFilter(evPro, fromBlock)]);
      const ids = [...new Set([...sub, ...pro].map((e) => String(e.args.claimId)))];
      const claims = [];
      for (const id of ids) {
        const c = await this.getClaim(id, provider);
        if (!c) continue;
        const p = await pm.policies(c.policyId);
        claims.push({
          ...c,
          policyholder: p.policyholder ?? p[1],
          planType: Number(p.planType ?? p[2]),
          providerName: this.getPlanTypeName(Number(p.planType ?? p[2])),
          claimType: this.deriveClaimType(c.description || ""),
          submissionDate: Number(c.submissionDate) * 1000,
          processedDate: Number(c.processedDate) * 1000,
        });
      }
      return { success: true, claims };
    } catch (e) {
      console.error("fetchClaimsWithEvents:", e);
      return { success: false, claims: [], error: String(e?.message || e) };
    }
  }

  /* ------------------------------ helpers -------------------------------- */

  getPlanTypeName(planType) {
    return { 0: "Basic Plan", 1: "Premium Plan", 2: "Platinum Plan" }[planType] || "Unknown Plan";
  }
  deriveClaimType(description = "") {
    const d = description.toLowerCase();
    if (d.includes("emergency") || d.includes("urgent")) return "emergency";
    if (d.includes("surgery") || d.includes("operation")) return "surgery";
    if (d.includes("pharmacy") || d.includes("medicine") || d.includes("drug")) return "pharmacy";
    if (d.includes("dental") || d.includes("tooth")) return "dental";
    if (d.includes("vision") || d.includes("eye") || d.includes("glasses")) return "vision";
    return "general";
  }

    /** Back-compat: return a specific contract instance.
   *  target: "claim" (default) | "pm" | "policy" | "pool" | "core"
   *  withSigner: true => expects a Signer (for writes)
   */
  initContract(signerOrProvider, withSigner = false, target = "claim") {
    const { pm, cm, pool, core } = this._getInstances(signerOrProvider, withSigner);
    switch ((target || "claim").toLowerCase()) {
      case "pm":
      case "policy": return pm;
      case "pool":   return pool;
      case "core":   return core;
      default:       return cm;   // ClaimManager
    }
  }

  // Optional sugar (used below)
  getClaimManager(rw) { return this.initContract(rw, !!ethers.Signer?.isSigner?.(rw), "claim"); }
  getPolicyManager(rw) { return this.initContract(rw, !!ethers.Signer?.isSigner?.(rw), "pm"); }
  getCoreProtocol (rw) { return this.initContract(rw, !!ethers.Signer?.isSigner?.(rw), "core"); }

  /** Writers used by PlanManagement */
  async updateInsurancePlan(planType, oneTime, monthly, coverage, deductible, signer) {
    const pm = this.getPolicyManager(signer);
    // Try to support several common function names/signatures
    const toWei = (x) => (ethers.utils ? ethers.utils.parseEther(String(x)) : ethers.parseEther(String(x)));
    try {
      if (pm.updateInsurancePlan) {
        return await (await pm.updateInsurancePlan(
          planType, toWei(oneTime || "0"), toWei(monthly), toWei(coverage), toWei(deductible)
        )).wait(), { success: true };
      }
      if (pm.setInsurancePlan) {
        return await (await pm.setInsurancePlan(
          planType, toWei(oneTime || "0"), toWei(monthly), toWei(coverage), toWei(deductible)
        )).wait(), { success: true };
      }
      throw new Error("PolicyManager: update plan function not found");
    } catch (e) {
      console.error("updateInsurancePlan:", e);
      return { success: false, error: String(e?.reason || e?.message || e) };
    }
  }

  async updatePlanMetadata(planType, ipfsHash, signer) {
    const pm = this.getPolicyManager(signer);
    try {
      if (pm.setPlanMetadata) {
        return await (await pm.setPlanMetadata(planType, ipfsHash)).wait(), { success: true };
      }
      if (pm.updatePlanMetadata) {
        return await (await pm.updatePlanMetadata(planType, ipfsHash)).wait(), { success: true };
      }
      throw new Error("PolicyManager: metadata function not found");
    } catch (e) {
      console.error("updatePlanMetadata:", e);
      return { success: false, error: String(e?.reason || e?.message || e) };
    }
  }

  /* ——— list all function signatures on the PolicyManager ABI (handy for debugging) ——— */
_listFunctionSigs(contract) {
  try {
    return (contract?.interface?.fragments || [])
      .filter(f => f.type === "function")
      .map(f => f.format());
  } catch { return []; }
}

/* ——— find callable signatures by base names, preserving your preference order ——— */
_findGetterKeys(pm, baseNames = []) {
  const frags = (pm?.interface?.fragments || [])
    .filter(f => f.type === "function" && f.inputs?.length === 1)
    .filter(f => baseNames.includes((f.name || "").toLowerCase()));

  // Sort to respect the provided preference (first name wins)
  const order = name => baseNames.indexOf((name || "").toLowerCase());
  frags.sort((a, b) => order(a.name) - order(b.name));

  // Turn fragments into exact call keys, e.g. "getPlan(uint8)"
  return frags.map(f => `${f.name}(${f.inputs.map(i => i.type).join(",")})`);
}

/* ——— best-effort count of plans if contract exposes it ——— */
async _getPlanCount(pm) {
  const candidates = ["getPlanCount", "planCount", "totalPlans"];
  for (const name of candidates) {
    // try exact name and all overload signatures with 0 inputs
    const zeroArgFrags = (pm?.interface?.fragments || [])
      .filter(f => f.type === "function" && f.name === name && f.inputs?.length === 0);
    for (const frag of zeroArgFrags) {
      const key = frag.format(); // e.g. "getPlanCount()"
      try {
        const n = await pm[key]();
        const num = Number(n?.toString?.() ?? n);
        if (Number.isFinite(num) && num >= 0) return num;
      } catch {}
    }
  }
  return null;
}

}

export const contractService = new ContractService();
