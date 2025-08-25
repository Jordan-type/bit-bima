// types/insurance.ts
import type { Address } from "viem";

export enum POLICY_STATUS {
  ACTIVE = 0,
  EXPIRED = 1,
  CANCELLED = 2,
  SUSPENDED = 3,
}

export enum PAYMENT_TYPE {
  ONE_TIME = 0,
  MONTHLY = 1,
}

export enum PLAN_TYPE {
  BASIC = 0,
  PREMIUM = 1,
  PLATINUM = 2,
}

export enum CLAIM_STATUS {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  PAID = 3,
}

export type Policy = {
  policyId: bigint;
  policyholder: Address;
  planType: PLAN_TYPE | number;
  status: POLICY_STATUS | number;
  startDate: string | bigint;  // seconds
  endDate: string | bigint;    // seconds
  premium: string;             // ETH string
  coverageAmount: string;      // ETH string
  claimsUsed: string;          // ETH string
  deductible: string;          // ETH string
  paymentType: PAYMENT_TYPE | number;
  totalPaid: string;           // ETH string

  // NEW (optional)
  paymentToken?: Address;
  lastPaymentDate?: string | bigint;

  // hydrated/extras
  remainingCoverage?: string;  // ETH string
  claimsCount?: number;
  claims?: Claim[];
  isValid?: boolean;

  // ipfs
  ipfsMetadata?: string;
};

export type Claim = {
  claimId: bigint;
  policyId: bigint;
  submissionDate: string | bigint; // seconds
  processedDate?: string | bigint | null; // seconds (or "0")
  status: CLAIM_STATUS | number;
  claimAmount: string;     // ETH string
  approvedAmount?: string; // ETH string

  claimant?: Address;
  ipfsDocuments?: string;
  description?: string;
};

export type ContractStats = Record<string, unknown>; // widen as needed

// ---- Analytics shapes ----
export type OverviewStats = {
  totalPolicies: number;
  activePolicies: number;
  totalClaims: number;
  approvedClaims: number;
  totalPremiumsPaid: number;   // ETH as number
  totalClaimsAmount: number;   // ETH as number
  totalApprovedAmount: number; // ETH as number
  claimApprovalRate: number;   // %
  lossRatio: number;           // %
};

export type PolicyAnalyticsData = {
  planDistribution: Record<string, number>;
  paymentTypeDistribution: Record<string, number>;
  coverageDistribution: Array<{
    policyId: bigint;
    coverage: number;
    used: number;
    remaining: number;
  }>;
  totalCoverage: number;
  totalUsedCoverage: number;
};

export type ClaimsAnalyticsData = {
  statusDistribution: Record<string, number>;
  monthlyClaimsData: Array<{ month: string; count: number; value?: number }>;
  averageClaimAmount: number;
  averageProcessingTime: number; // days
  totalClaimsValue: number;
};

export type RevenueAnalyticsData = {
  monthlyRevenueData: Array<{ month: string; count: number; value: number }>;
  revenueByPlan: Record<string, number | string>;
  totalRevenue: number;
  averageRevenuePerPolicy: number;
};

export type TrendPoint = { date: string; count: number };
export type TrendAnalyticsData = {
  policyTrend: TrendPoint[];
  claimsTrend: TrendPoint[];
};

export type AnalyticsData = {
  overview: OverviewStats;
  policies: PolicyAnalyticsData;
  claims: ClaimsAnalyticsData;
  revenue: RevenueAnalyticsData;
  trends: TrendAnalyticsData;
};

export type TimeRange = "7d" | "30d" | "90d" | "1y";

// Helpers
export const planName = (t: PLAN_TYPE | number) => ["Basic", "Premium", "Platinum"][Number(t)] ?? "Unknown";
