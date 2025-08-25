import { CLAIM_STATUS, PLAN_TYPES, POLICY_STATUS } from "@/constant";

type ValueOf<T> = T[keyof T];

export type ClaimStatus = ValueOf<typeof CLAIM_STATUS>;
export type PlanType = ValueOf<typeof PLAN_TYPES>;
export type PolicyStatus = ValueOf<typeof POLICY_STATUS>;

export type Claim = {
  claimId?: number | string | bigint;
  description?: string;
  status: ClaimStatus;
  submissionDate?: number | string | bigint;
  processedDate?: number | string | bigint;
  claimAmount?: number | string | bigint;
  approvedAmount?: number | string | bigint;
};

export type Policy = {
  policyId?: number | string | bigint;
  planType: PlanType;
  coverageAmount?: number | string | bigint;
  premium?: number | string | bigint;
  startDate: number | string | bigint;
  endDate: number | string | bigint;
  lastPaymentDate?: number | string | bigint;
  status: PolicyStatus;
  totalPaid?: string | number | bigint;
};

export type ContractStats = {
  totalPolicies: bigint;
  totalClaims: bigint;
  contractBalance: bigint;
};

export type InsurancePlan = {
  planId: number | string | bigint;
  name: string;
  description: string;
  coverageAmount: bigint; // wei
  deductible: bigint;     // wei
  premium: bigint;        // wei
  duration: number;       // in days
  planType: PlanType;
  ipfsHash?: string;      // optional metadata hash
};

// export type Plan = {
//   planType: number; // PLAN_TYPES
//   oneTimePrice: string | number | bigint;
//   monthlyPrice: string | number | bigint;
//   coverageAmount: string | number | bigint;
//   deductible: string | number | bigint;
// };

export type Plan = {
  planType: number;           // enum value (0,1,2…)
  oneTimePrice: bigint;       // wei
  monthlyPrice: bigint;       // wei
  coverageAmount: bigint;     // wei
  deductible: bigint;         // wei
  ipfsHash: string;
  isActive: boolean;
};