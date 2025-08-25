import type { Policy as ChainPolicy, Claim as ChainClaim, ContractStats as ChainStats, } from "@/services/contract";
import type { Policy as AppPolicy, Claim as AppClaim, ContractStats as AppStats, } from "@/types/insurance";

export const policyFromChain = (p: ChainPolicy): AppPolicy => ({
  policyId: p.policyId,
  policyholder: p.policyholder,
  planType: p.planType,
  paymentType: p.paymentType,
  paymentToken: p.paymentToken,
  coverageAmount: p.coverageAmount.toString(),
  deductible: p.deductible.toString(),
  premium: p.premium.toString(),
  startDate: p.startDate,        // you use bigint|string in analytics -> OK
  endDate: p.endDate,
  lastPaymentDate: p.lastPaymentDate,
  status: p.status,
  ipfsMetadata: p.ipfsMetadata,
  totalPaid: p.totalPaid.toString(),
  claimsUsed: p.claimsUsed.toString(),
});

export const claimFromChain = (c: ChainClaim): AppClaim => ({
  claimId: c.claimId,
  policyId: c.policyId,
  claimant: c.claimant,
  claimAmount: c.claimAmount.toString(),
  approvedAmount: c.approvedAmount.toString(),
  status: c.status,
  submissionDate: c.submissionDate,
  processedDate: c.processedDate,
  ipfsDocuments: c.ipfsDocuments,
  description: c.description,
});

export const statsFromChain = (s: ChainStats): AppStats => ({
  totalPolicies: Number(s.totalPolicies),
  totalClaims: Number(s.totalClaims),
  contractBalance: s.contractBalance.toString(),
});
