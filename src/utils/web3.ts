import type { Address } from "viem";
import { formatEther, formatUnits } from "viem";

const toEthStr = (x?: bigint | string | number | null): string => {
  if (x === null || x === undefined) return "0";
  try {
    if (typeof x === "bigint") return formatEther(x);
    if (typeof x === "string" && /^\d+$/.test(x)) return formatEther(BigInt(x));
    return String(x);
  } catch {
    return String(x);
  }
};

const tsToDateStr = (ts?: bigint | number | string): string => {
  if (!ts || ts === "0") return "N/A";
  const n = typeof ts === "bigint" ? Number(ts) : Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "N/A";
  return new Date(n * 1000).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const celoscanBase = (chainId?: number) =>
  chainId === 44787 ? "https://alfajores.celoscan.io" : "https://celoscan.io";

const celoscanAddress = (addr: Address, chainId?: number) => `${celoscanBase(chainId)}/address/${addr}`;

const fmt = (amount?: bigint, decimals = 18, dp = 2) => {
  const v = amount ?? 0n;
  const s = formatUnits(v, decimals);
  const n = Number.parseFloat(s);
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: dp,
  });
}

// Generic replacement for toEthStr
const toTokenStr = (
  x?: bigint | string | number | null,
  decimals = 18
): string => {
  if (x === null || x === undefined) return "0";
  try {
    const bi =
      typeof x === "bigint" ? x :
      typeof x === "string" && /^\d+$/.test(x) ? BigInt(x) :
      BigInt(String(x)); // last-resort parse
    return formatUnits(bi, decimals);
  } catch {
    return String(x);
  }
}


export { toEthStr, tsToDateStr, celoscanBase, celoscanAddress, fmt, toTokenStr };
