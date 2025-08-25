import { formatEther, parseEther } from 'viem';

export const fmt = (x: bigint | number | string) =>
  formatEther(typeof x === 'bigint' ? x : BigInt(x || 0));

export const parse = (x: string | number) => parseEther(String(x ?? '0'));
