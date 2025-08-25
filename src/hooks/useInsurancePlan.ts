'use client';

import { useReadContract, useChainId } from 'wagmi';
import { PolicyManager as ABI_PM } from '@/contractsABI/abis';
import { getContractAddresses } from '@/config/network';
import { formatEther } from 'viem';

function normalizePlan(planType: number, p: any) {
  // viem returns BigInt for uint256s; handle tuple OR named struct
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

export function useInsurancePlan(planType: number) {
  const chainId = useChainId();
  const addr = getContractAddresses(chainId)?.PolicyManager as `0x${string}`;

  const read = useReadContract({
    address: addr,
    abi: ABI_PM,
    functionName: 'insurancePlans',
    args: [BigInt(planType)],
    query: {
      select: (p) => (p ? normalizePlan(planType, p) : null),
    },
  });

  return read; // { data, isLoading, error, ... }
}
