'use client';

import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { PolicyManager as ABI_PM } from '@/contractsABI/abis';
import { getContractAddresses } from '@/config/network';

export function usePurchasePolicy() {
  const chainId = useChainId();
  const addr = getContractAddresses(chainId)?.PolicyManager as `0x${string}`;

  const { writeContract, data: hash, error: writeError, isPending } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash });

  function purchasePolicy(planType: number, paymentType: number, token: `0x${string}`, ipfs: string) {
    writeContract({
      address: addr,
      abi: ABI_PM,
      functionName: 'purchasePolicy',
      args: [BigInt(planType), BigInt(paymentType), token, ipfs],
    });
  }

  return { purchasePolicy, txHash: hash, isPending, isMining, isSuccess, writeError };
}
