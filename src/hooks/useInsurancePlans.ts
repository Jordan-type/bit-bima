'use client';

import { useReadContracts, useChainId } from 'wagmi';
import { PolicyManager as ABI_PM } from '@/contractsABI/abis';
import { getContractAddresses } from '@/config/network';
import { formatEther, Abi } from 'viem';

const PLAN_TYPES = { BASIC: 0, PREMIUM: 1, PLATINUM: 2 } as const;
const PLAN_IDS = [PLAN_TYPES.BASIC, PLAN_TYPES.PREMIUM, PLAN_TYPES.PLATINUM];

function normalize(planType: number, p: any) {
  const pt  = Number(p?.planType ?? p?.[0] ?? planType);
  const otp = BigInt(p?.oneTimePrice   ?? p?.[1] ?? 0n);
  const mp  = BigInt(p?.monthlyPrice   ?? p?.[2] ?? 0n);
  const cov = BigInt(p?.coverageAmount ?? p?.[3] ?? 0n);
  const ded = BigInt(p?.deductible     ?? p?.[4] ?? 0n);
  const ipf = (p?.ipfsHash ?? p?.[5] ?? '') as string;
  const act = Boolean(p?.isActive ?? p?.[6] ?? true);

  return {
    planType: pt,
    oneTimePrice: formatEther(otp),
    monthlyPrice: formatEther(mp),
    coverageAmount: formatEther(cov),
    deductible: formatEther(ded),
    ipfsHash: ipf,
    isActive: act,
  };
}

export function useInsurancePlans() {
  const chainId = useChainId();
  const addr = getContractAddresses(chainId)?.PolicyManager as `0x${string}`;

  const { data, ...rest } = useReadContracts({
    contracts: PLAN_IDS.map((id) => ({
      address: addr,
      abi: ABI_PM as Abi,
      functionName: 'insurancePlans',
      args: [BigInt(id)],
    })),
    allowFailure: false,
    query: {
      select: (results) =>
        results.map((res, i) => normalize(PLAN_IDS[i], res)),
    },
  });

  return { data, ...rest };
}
