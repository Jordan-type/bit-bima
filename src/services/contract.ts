/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ContractFunctionName } from "viem";
import { erc20Abi, formatEther, parseEther, Abi, Address, PublicClient, WalletClient, decodeEventLog, parseAbiItem  } from "viem";
import { CONTRACT_ADDRESSES } from "@/config/network";
import PolicyABI from "@/contractsABI/PolicyManager.json";
import ClaimABI from "@/contractsABI/ClaimManager.json";
import RiskPoolABI from "@/contractsABI/RiskPoolTreasury.json";
import type { Plan } from "@/types/app";

/** --------------------------
 *  Types that mirror your ABIs
 *  -------------------------- */
export type Policy = {
  policyId: bigint;
  policyholder: Address;
  planType: number;
  paymentType: number;
  paymentToken: Address;
  coverageAmount: bigint;
  deductible: bigint;
  premium: bigint;
  startDate: bigint;
  endDate: bigint;
  lastPaymentDate: bigint;
  status: number;
  ipfsMetadata: string;
  totalPaid: bigint;
  claimsUsed: bigint;
};

export type Claim = {
  claimId: bigint;
  policyId: bigint;
  claimant: Address;
  claimAmount: bigint;
  approvedAmount: bigint;
  status: number;          // enum
  submissionDate: bigint;
  processedDate: bigint;
  ipfsDocuments: string;
  description: string;
};

export type ContractStats = {
  totalPolicies: bigint;
  totalClaims: bigint;
  /** RiskPool token balance for the provided token (see getContractStats param) */
  contractBalance: bigint;  // RiskPool balance for PremiumToken (or the token you pass)
};

/** --------------------------
 *  Internal helpers
 *  -------------------------- */

const addrs = (chainId: number) => {
  const a = (CONTRACT_ADDRESSES as any)[chainId];
  if (!a) throw new Error(`No addresses configured for chain ${chainId}`);
  return a as {
    PolicyManager: Address;
    ClaimManager: Address;
    RiskPool: Address;
    /** Optional – if you keep a default premium token in config */
    PremiumToken?: Address;
  };
};

const _asNumber = (x: any) => Number(x ?? 0);

function _requireClients(
  walletClient?: WalletClient | null,
  publicClient?: PublicClient | null
): asserts walletClient is WalletClient & { account: { address: Address } } {
  if (!walletClient?.account) throw new Error("Wallet client not available");
  if (!publicClient?.chain) throw new Error("Chain not available");
}

/** --------------------------
 *  Service implementation
 *  -------------------------- */

let _chainIdOverride: number | null = null;

/** Kept for compatibility with your pages. viem gets chain from the PublicClient, so this is optional. */
function setChainId(id: number) {
  _chainIdOverride = id;
}

function _chainId(pc: PublicClient) {
  return _chainIdOverride ?? pc.chain?.id ?? 0;
}

// Get token metadata (address, symbol, decimals)
async function getTokenMeta(
  pc: PublicClient,
  token?: Address
): Promise<{ address?: Address; symbol: string; decimals: number }> {
  const chainId = pc.chain?.id ?? 0;
  const cfg = (CONTRACT_ADDRESSES as any)[chainId] || {};
  const addr: Address | undefined = token ?? cfg.PremiumToken;
  const cfgSymbol = cfg.TokenSymbol as string | undefined;
  const cfgDecimals = cfg.TokenDecimals as number | undefined;

  // If fully specified in config, use it
  if (addr && cfgSymbol && typeof cfgDecimals === "number") {
    return { address: addr, symbol: cfgSymbol, decimals: cfgDecimals };
  }

  // If token address exists but meta missing, read from chain
  if (pc && addr) {
    const [decimals, symbol] = await pc.multicall({
      allowFailure: false,
      contracts: [
        { address: addr, abi: erc20Abi, functionName: "decimals" },
        { address: addr, abi: erc20Abi, functionName: "symbol" },
      ],
    });
    return { address: addr, symbol, decimals };
  }

  // Fallback when nothing configured (prevents InvalidAddressError)
  return { address: undefined, symbol: cfgSymbol ?? "TOKEN", decimals: cfgDecimals ?? 18 };
}

async function isOwner(pc: PublicClient, user: Address): Promise<boolean> {
  const a = addrs(_chainId(pc));
  const owner = await pc.readContract({
    address: a.PolicyManager,
    abi: PolicyABI.abi as any,
    functionName: "owner",
    args: [],
  }) as Address;
  return owner.toLowerCase() === user.toLowerCase();
}

async function isAuthorizedDoctor(pc: PublicClient, user: Address): Promise<boolean> {
  const a = addrs(_chainId(pc));
  return await pc.readContract({
    address: a.ClaimManager,
    abi: ClaimABI.abi as any,
    functionName: "authorizedDoctors",
    args: [user],
  }) as boolean;
}

/** Single plan */
async function getInsurancePlan(
  pc: PublicClient | null | undefined,
  index: number
): Promise<Plan> {
  if (!pc) throw new Error("Public client not ready");
  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);

  const r = (await pc.readContract({
    address: a.PolicyManager,
    abi: PolicyABI.abi as any,
    functionName: "insurancePlans",
    args: [BigInt(index)],
  })) as any;

  // PolicyManager.InsurancePlan:
  // oneTimePrice, monthlyPrice, coverageAmount, deductible, ipfsHash, isActive
  return {
    planType: index,
    oneTimePrice: BigInt(r.oneTimePrice ?? r[0]),
    monthlyPrice: BigInt(r.monthlyPrice ?? r[1]),
    coverageAmount: BigInt(r.coverageAmount ?? r[2]),
    deductible: BigInt(r.deductible ?? r[3]),
    ipfsHash: String(r.ipfsHash ?? r[4]),
    isActive: Boolean(r.isActive ?? r[5]),
  };
}

/** Read N plans (default 3: 0,1,2). If you add more plans later, pass a bigger `count`. */
async function getAllInsurancePlans(
  pc: PublicClient | null | undefined,
  count = 3
): Promise<Plan[]> {
  if (!pc) throw new Error("Public client not ready");
  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);

  const indexes = Array.from({ length: count }, (_, i) => BigInt(i));
  const res = await pc.multicall({
    allowFailure: false,
    contracts: indexes.map((i) => ({
      address: a.PolicyManager,
      abi: PolicyABI.abi as any,
      functionName: "insurancePlans",
      args: [i],
    })),
  });

  console.log(
    `Fetched insurance plans (count: ${count}):`,
    res
  )

  return res.map((r: any) => ({
    planType: _asNumber(r.planType ?? r[0]),
    oneTimePrice: BigInt(r.oneTimePrice ?? r[1]),
    monthlyPrice: BigInt(r.monthlyPrice ?? r[2]),
    coverageAmount: BigInt(r.coverageAmount ?? r[3]),
    deductible: BigInt(r.deductible ?? r[4]),
    ipfsHash: String(r.ipfsHash ?? r[5]),
    isActive: Boolean(r.isActive ?? r[6]),
  }));
}

/** Mapping getter (public) */
async function isTokenAccepted(
  token: Address,
  pc: PublicClient | null | undefined
): Promise<boolean> {
  if (!pc) throw new Error("Public client not ready");
  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);
  const ok = (await pc.readContract({
    address: a.PolicyManager,
    abi: PolicyABI.abi as any,
    functionName: "acceptedTokens",
    args: [token],
  })) as boolean;
  return ok;
}

/** One policy */
async function getPolicy(
  policyId: bigint,
  pc: PublicClient | null | undefined
): Promise<Policy> {
  if (!pc) throw new Error("Public client not ready");
  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);

  const r = (await pc.readContract({
    address: a.PolicyManager,
    abi: PolicyABI.abi as any,
    functionName: "policies",
    args: [policyId],
  })) as any;

  console.log(
    `Fetched policy ${policyId}:`,
    r
  )

  return {
    policyId,
    policyholder: (r.policyholder ?? r[0]) as Address,
    planType: _asNumber(r.planType ?? r[1]),
    paymentType: _asNumber(r.paymentType ?? r[2]),
    paymentToken: (r.paymentToken ?? r[3]) as Address,
    coverageAmount: BigInt(r.coverageAmount ?? r[4]),
    deductible: BigInt(r.deductible ?? r[5]),
    premium: BigInt(r.premium ?? r[6]),
    startDate: BigInt(r.startDate ?? r[7]),
    endDate: BigInt(r.endDate ?? r[8]),
    lastPaymentDate: BigInt(r.lastPaymentDate ?? r[9]),
    status: _asNumber(r.status ?? r[10]),
    ipfsMetadata: String(r.ipfsMetadata ?? r[11]),
    totalPaid: BigInt(r.totalPaid ?? r[12]),
    claimsUsed: BigInt(r.claimsUsed ?? r[13]),
  };
}

/** Fetch all policy IDs for a user then hydrate each policy struct. */
async function getUserPolicies(
  user: Address,
  pc: PublicClient | null | undefined
): Promise<Policy[]> {
  if (!pc) throw new Error("Public client not ready");
  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);

  const ids = (await pc.readContract({
    address: a.PolicyManager,
    abi: PolicyABI.abi as any,
    functionName: "getUserPolicies",
    args: [user],
  })) as bigint[];

  if (!ids.length) return [];

  const structs = await pc.multicall({
    allowFailure: false,
    contracts: ids.map((id) => ({
      address: a.PolicyManager,
      abi: PolicyABI.abi as any,
      functionName: "policies",
      args: [id],
    })),
  });

  console.log("structs", structs)

  return structs.map((r: any, i: number) => ({
    policyId: ids[i],
    policyholder: r.policyholder ?? r[1],
    planType: _asNumber(r.planType ?? r[2]),
    paymentType: _asNumber(r.paymentType ?? r[3]),
    paymentToken: r.paymentToken ?? r[4],
    coverageAmount: BigInt(r.coverageAmount ?? r[5]),
    deductible: BigInt(r.deductible ?? r[6]),
    premium: BigInt(r.premium ?? r[7]),
    startDate: BigInt(r.startDate ?? r[8]),
    endDate: BigInt(r.endDate ?? r[9]),
    lastPaymentDate: BigInt(r.lastPaymentDate ?? r[10]),
    status: _asNumber(r.status ?? r[11]),
    ipfsMetadata: String(r.ipfsMetadata ?? r[12]),
    totalPaid: BigInt(r.totalPaid ?? r[13]),
    claimsUsed: BigInt(r.claimsUsed ?? r[14]),
  }));
}

/** Claims are on ClaimManager */
/** Fetch all claim IDs for a policy then hydrate each claim struct. */
async function getPolicyClaims(
  policyId: bigint,
  pc: PublicClient | null | undefined
): Promise<Claim[]> {
  if (!pc) throw new Error("Public client not ready");
  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);

  const ids = (await pc.readContract({
    address: a.ClaimManager,
    abi: ClaimABI.abi as any,
    functionName: "getPolicyClaims",
    args: [policyId],
  })) as bigint[];

  if (!ids.length) return [];

  const structs = await pc.multicall({
    allowFailure: false,
    contracts: ids.map((id) => ({
      address: a.ClaimManager,
      abi: ClaimABI.abi as any,
      functionName: "claims",
      args: [id],
    })),
  });

  return structs.map((r: any, i: number) => ({
    claimId: ids[i],
    policyId: BigInt(r.policyId ?? r[1]),
    claimant: r.claimant ?? r[2],
    claimAmount: BigInt(r.claimAmount ?? r[3]),
    approvedAmount: BigInt(r.approvedAmount ?? r[4]),
    status: _asNumber(r.status ?? r[5]),
    submissionDate: BigInt(r.submissionDate ?? r[6]),
    processedDate: BigInt(r.processedDate ?? r[7]),
    ipfsDocuments: String(r.ipfsDocuments ?? r[8]),
    description: String(r.description ?? r[9]),
  }));
}

/**
 * Get totals + RiskPool balance for a given ERC20 `token`.
 * If you keep a default token in config (e.g. USDC), pass nothing and we’ll use it.
 */
 async function getContractStats(
  pc: PublicClient | null | undefined,
  opts?: { token?: Address }
): Promise<ContractStats> {
  if (!pc) throw new Error("Public client not ready");

  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);
  const token = opts?.token ?? a.PremiumToken;

  // ✅ args: [] is required for zero-arg functions
  const [totalPolicies, totalClaims] = (await pc.multicall({
    allowFailure: false,
    contracts: [
      {
        address: a.PolicyManager as Address,
        abi: PolicyABI.abi,
        functionName: "getTotalPolicies",
        args: [] as const,
      },
      {
        address: a.ClaimManager as Address,
        abi: ClaimABI.abi,
        functionName: "getTotalClaims",
        args: [] as const,
      },
    ] as const,
  })) as [bigint, bigint];

  let contractBalance = 0n;
  if (token) {
    contractBalance = (await pc.readContract({
      address: token as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [a.RiskPool as Address],
    })) as bigint;
  }

  return { totalPolicies, totalClaims, contractBalance };
}

/** Internal: approve ERC20 if allowance < amount */
async function _approveIfNeeded(params: {
  token: Address;
  owner: Address;
  spender: Address;
  amount: bigint;
  walletClient: WalletClient;
  publicClient: PublicClient;
}) {
  const { token, owner, spender, amount, walletClient, publicClient } = params;
  const allowance = (await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender],
  })) as bigint;

  if (allowance >= amount) return;

  const hash = await walletClient.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, amount],
    chain: publicClient.chain,
    account: owner,
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

/** Purchase a policy; returns tx hash. `paymentType` and `token` must match contract’s expectations. */
/** Purchase (ERC20) — matches PolicyManager::purchasePolicy(planType,paymentType,token,ipfs) */
async function purchasePolicy(
  planType: number,
  paymentType: number,
  token: Address,
  ipfsMetadata: string,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<{ success: boolean; txHash: `0x${string}` }> {
  if (!walletClient?.account || !publicClient?.chain)
    throw new Error("Wallet or chain not available");

  const chainId = publicClient.chain.id;
  const a = addrs(chainId);
  const owner = walletClient.account.address as Address;

  // figure out cost (one-time vs monthly)
  const plan = await getInsurancePlan(publicClient, planType);
  const required =
    paymentType === 0 /* ONE_TIME */ ? plan.oneTimePrice : plan.monthlyPrice;

  // ensure token approved for PolicyManager
  await _approveIfNeeded({
    token,
    owner,
    spender: a.PolicyManager,
    amount: required,
    walletClient,
    publicClient,
  });

  // call purchasePolicy
  const hash = await walletClient.writeContract({
    address: a.PolicyManager,
    abi: PolicyABI.abi as any,
    functionName: "purchasePolicy",
    args: [planType, paymentType, token, ipfsMetadata],
    chain: publicClient.chain,
    account: owner,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { success: receipt.status === "success", txHash: hash };
}

/** Pay monthly premium (will use stored paymentToken) */
async function payMonthlyPremium(
  policyId: bigint,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<{ success: boolean; txHash: `0x${string}` }> {
  if (!walletClient?.account || !publicClient?.chain)
    throw new Error("Wallet or chain not available");

  const chainId = publicClient.chain.id;
  const a = addrs(chainId);
  const owner = walletClient.account.address as Address;

  // read policy + plan to compute required approval
  const policy = await getPolicy(policyId, publicClient);
  const plan = await getInsurancePlan(publicClient, policy.planType);
  const required = plan.monthlyPrice;

  await _approveIfNeeded({
    token: policy.paymentToken,
    owner,
    spender: a.PolicyManager,
    amount: required,
    walletClient,
    publicClient,
  });

  const hash = await walletClient.writeContract({
    address: a.PolicyManager,
    abi: PolicyABI.abi as any,
    functionName: "payMonthlyPremium",
    args: [policyId],
    chain: publicClient.chain,
    account: owner,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { success: receipt.status === "success", txHash: hash };
}

/** Cancel a policy (msg.sender must be policyholder) */
async function cancelPolicy(
  policyId: bigint,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<{ success: boolean; txHash: `0x${string}` }> {
  if (!walletClient?.account || !publicClient?.chain)
    throw new Error("Wallet or chain not available");

  const hash = await walletClient.writeContract({
    address: addrs(publicClient.chain.id).PolicyManager,
    abi: PolicyABI.abi as any,
    functionName: "cancelPolicy",
    args: [policyId],
    chain: publicClient.chain,
    account: walletClient.account.address as Address,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { success: receipt.status === "success", txHash: hash };
}

/** Compute remaining coverage from on-chain policy struct */
async function getRemainingCoverage(
  policyId: bigint,
  pc: PublicClient | null | undefined
): Promise<bigint> {
  const p = await getPolicy(policyId, pc);
  const remaining = p.coverageAmount - p.claimsUsed;
  return remaining < 0n ? 0n : remaining;
}

/** submit a claim via ClaimManager::submitClaim(policyId, amountWei, ipfs, description) */
async function submitClaim(
  policyId: bigint,
  amountEth: string | number,
  ipfsHash: string,
  description: string,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<{ success: boolean; txHash: `0x${string}` }> {
  if (!walletClient?.account || !publicClient?.chain)
    throw new Error("Wallet or chain not available");

  const a = addrs(publicClient.chain.id);
  const account = walletClient.account.address;

  const hash = await walletClient.writeContract({
    address: a.ClaimManager,
    abi: ClaimABI.abi as any,
    functionName: "submitClaim",
    args: [policyId, parseEther(String(amountEth)), ipfsHash, description],
    chain: publicClient.chain,
    account,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { success: receipt.status === "success", txHash: hash };
}

/** process a claim via ClaimManager::processClaim(claimId, status, approvedAmountWei) */
async function processClaim(
  claimId: bigint,
  status: number,
  approvedAmountEth: string | number,
  walletClient: WalletClient,
  publicClient: PublicClient
): Promise<{ success: boolean; txHash: `0x${string}` }> {
  if (!walletClient?.account || !publicClient?.chain)
    throw new Error("Wallet or chain not available");

  const a = addrs(publicClient.chain.id);
  const account = walletClient.account.address;

  const hash = await walletClient.writeContract({
    address: a.ClaimManager,
    abi: ClaimABI.abi as any,
    functionName: "processClaim",
    args: [claimId, status, parseEther(String(approvedAmountEth ?? 0))],
    chain: publicClient.chain,
    account,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { success: receipt.status === "success", txHash: hash };
}

/** Native CELO balance of the RiskPool */
async function getRiskPoolNativeBalance(
  pc: PublicClient | null | undefined
): Promise<bigint> {
  if (!pc) throw new Error("Public client not ready");
  const a = addrs(_chainIdOverride ?? pc.chain?.id ?? 0);
  return pc.getBalance({ address: a.RiskPool });
}

/** ERC20 balance of the RiskPool for a given token */
async function getRiskPoolTokenBalance(
  pc: PublicClient | null | undefined,
  token: Address
): Promise<bigint> {
  if (!pc) throw new Error("Public client not ready");
  const a = addrs(_chainIdOverride ?? pc.chain?.id ?? 0);
  return pc.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [a.RiskPool],
  }) as Promise<bigint>;
}

async function _write<
  TAbi extends Abi,
  TName extends ContractFunctionName<TAbi, "nonpayable" | "payable">
>(params: {
  address: Address;
  abi: TAbi;
  functionName: TName;
  args: any[];
  walletClient: WalletClient;
  publicClient: PublicClient;
}): Promise<{ success: boolean; txHash: `0x${string}` }> {
  const { address, abi, functionName, args, walletClient, publicClient } = params;
  const hash = await walletClient.writeContract({
    address,
    abi,
    functionName,
    args: args as any,            // ✅ avoid generic args inference explosion
    chain: publicClient.chain,
    account: walletClient.account // ✅ pass the Account, not just .address
  } as any);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { success: receipt.status === "success", txHash: hash };
}


/** NEW: list ALL claims (admin) using ClaimManager::_claimIdCounter via getTotalClaims() and multicall */
async function getAllClaims(pc: PublicClient): Promise<Claim[]> {
  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);

  // read how many claims exist
  const total = (await pc.readContract({
    address: a.ClaimManager,
    abi: ClaimABI.abi as Abi,
    functionName: "getTotalClaims",
    args: [],
  })) as bigint;

  if (total === 0n) return [];

  // chunked multicalls so we don’t blow past size limits
  const ids = Array.from({ length: Number(total) }, (_, i) => BigInt(i + 1));
  const CHUNK = 250;
  const out: Claim[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const structs = await pc.multicall({
      allowFailure: false,
      contracts: slice.map((id) => ({
        address: a.ClaimManager,
        abi: ClaimABI.abi as Abi,
        functionName: "claims",
        args: [id],
      })),
    });
    for (let j = 0; j < slice.length; j++) {
      const r: any = structs[j];
      out.push({
        claimId: slice[j],
        policyId: BigInt(r.policyId ?? r[1]),
        claimant: (r.claimant ?? r[2]) as Address,
        claimAmount: BigInt(r.claimAmount ?? r[3]),
        approvedAmount: BigInt(r.approvedAmount ?? r[4]),
        status: Number(r.status ?? r[5]),
        submissionDate: BigInt(r.submissionDate ?? r[6]),
        processedDate: BigInt(r.processedDate ?? r[7]),
        ipfsDocuments: String(r.ipfsDocuments ?? r[8]),
        description: String(r.description ?? r[9]),
      });
    }
  }
  return out;
}

/** NEW: scan DoctorAuthorized events and reduce to latest status per doctor */
async function getAuthorizedDoctorsFromEvents(pc: PublicClient): Promise<
  Array<{ address: Address; isAuthorized: boolean; blockNumber: bigint; txHash: `0x${string}` }>
> {
  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);

  const eventItem = parseAbiItem(
    "event DoctorAuthorized(address indexed doctor, bool authorized)"
  );

  const logs = await pc.getLogs({
    address: a.ClaimManager,
    event: eventItem,
    fromBlock: 0n,
    toBlock: "latest",
  });

  // reduce by doctor => last log
  const map = new Map<Address, (typeof logs)[number]>();
  for (const log of logs) {
    const { args } = log;
    const doctor = args.doctor as Address;
    const prev = map.get(doctor);
    if (!prev || (log.blockNumber ?? 0n) > (prev.blockNumber ?? 0n)) {
      map.set(doctor, log);
    }
  }

  return [...map.entries()].map(([addr, log]) => {
    const decoded = decodeEventLog({
      abi: [eventItem],
      data: log.data,
      topics: log.topics,
    });
    return {
      address: addr,
      isAuthorized: Boolean((decoded.args as any).authorized),
      blockNumber: log.blockNumber!,
      txHash: log.transactionHash!,
    };
  });
}

/* --- ADMIN: Pausable views --- */
async function getPaused(
  pc: PublicClient
): Promise<{ policyManager: boolean; claimManager: boolean }> {
  const chainId = _chainIdOverride ?? pc.chain?.id ?? 0;
  const a = addrs(chainId);

  const [pmPaused, cmPaused] = await pc.multicall({
    allowFailure: false,
    contracts: [
      { address: a.PolicyManager, abi: PolicyABI.abi as Abi, functionName: "paused", args: [] },
      { address: a.ClaimManager, abi: ClaimABI.abi as Abi, functionName: "paused", args: [] },
    ],
  });
  return { policyManager: Boolean(pmPaused), claimManager: Boolean(cmPaused) };
}

/* --- ADMIN: PolicyManager writes --- */
async function pmPause(walletClient: WalletClient, publicClient: PublicClient) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({ address: a.PolicyManager, abi: PolicyABI.abi as Abi, functionName: "pause", args: [], walletClient, publicClient });
}

async function pmUnpause(walletClient: WalletClient, publicClient: PublicClient) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({ address: a.PolicyManager, abi: PolicyABI.abi as Abi, functionName: "unpause", args: [], walletClient, publicClient });
}

async function pmWhitelistToken(
  token: Address,
  enabled: boolean,
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({
    address: a.PolicyManager,
    abi: PolicyABI.abi as Abi,
    functionName: "whitelistToken",
    args: [token, enabled],
    walletClient,
    publicClient,
  });
}

async function pmUpdateInsurancePlan(
  planType: number,
  oneTimePrice: bigint,
  monthlyPrice: bigint,
  coverageAmount: bigint,
  deductible: bigint,
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({
    address: a.PolicyManager,
    abi: PolicyABI.abi as Abi,
    functionName: "updateInsurancePlan",
    args: [planType, oneTimePrice, monthlyPrice, coverageAmount, deductible],
    walletClient,
    publicClient,
  });
}

async function pmUpdatePlanMetadata(
  planType: number,
  ipfsHash: string,
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({
    address: a.PolicyManager,
    abi: PolicyABI.abi as Abi,
    functionName: "updatePlanMetadata",
    args: [planType, ipfsHash],
    walletClient,
    publicClient,
  });
}

async function pmSetRiskPool(
  riskPool: Address,
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({
    address: a.PolicyManager,
    abi: PolicyABI.abi as Abi,
    functionName: "setRiskPool",
    args: [riskPool],
    walletClient,
    publicClient,
  });
}

async function pmSetClaimManager(
  claimManager: Address,
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({
    address: a.PolicyManager,
    abi: PolicyABI.abi as Abi,
    functionName: "setClaimManager",
    args: [claimManager],
    walletClient,
    publicClient,
  });
}

/* --- ADMIN: ClaimManager writes --- */
async function cmPause(walletClient: WalletClient, publicClient: PublicClient) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({ address: a.ClaimManager, abi: ClaimABI.abi as Abi, functionName: "pause", args: [], walletClient, publicClient });
}

async function cmUnpause(walletClient: WalletClient, publicClient: PublicClient) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({ address: a.ClaimManager, abi: ClaimABI.abi as Abi, functionName: "unpause", args: [], walletClient, publicClient });
}

async function cmAuthorizeDoctor(
  doctor: Address,
  ok: boolean,
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({
    address: a.ClaimManager,
    abi: ClaimABI.abi as Abi,
    functionName: "authorizeDoctor",
    args: [doctor, ok],
    walletClient,
    publicClient,
  });
}

async function cmSetManagers(
  policyManager: Address,
  riskPool: Address,
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({
    address: a.ClaimManager,
    abi: ClaimABI.abi as Abi,
    functionName: "setManagers",
    args: [policyManager, riskPool],
    walletClient,
    publicClient,
  });
}

/* --- OPTIONAL: RiskPool admin (wire after you confirm ABI) ---
   If your RiskPoolTreasury has e.g. `withdrawToken(address token,address to,uint256 amount)`,
   add a wrapper like this and replace `functionName` & args to match your ABI exactly. */

async function riskPoolWithdrawToken(
  token: Address,
  to: Address,
  amount: bigint,
  walletClient: WalletClient,
  publicClient: PublicClient
) {
  _requireClients(walletClient, publicClient);
  const a = addrs(publicClient.chain!.id);
  return _write({
    address: a.RiskPool,
    abi: RiskPoolABI.abi as Abi,
    functionName: "withdrawToken", // <-- rename to your actual function
    args: [token, to, amount],
    walletClient,
    publicClient,
  });
}

/** Convenience: format a wei bigint nicely (assumes 18 decimals). */
function formatWei(x: bigint) {
  try {
    return formatEther(x);
  } catch {
    return x.toString();
  }
}

/** Exported singleton */
export const contractService = {
  isOwner,
  isAuthorizedDoctor,
  setChainId,
  // reads
  getTokenMeta,
  getInsurancePlan,
  getAllInsurancePlans,
  isTokenAccepted,
  getPolicy,
  getUserPolicies,
  getPolicyClaims,
  getContractStats,
  getRemainingCoverage,
  getRiskPoolNativeBalance,
  getRiskPoolTokenBalance,
  getAllClaims,
  getAuthorizedDoctorsFromEvents,
  getPaused,
  // writes (user)
  purchasePolicy,
  payMonthlyPremium,
  cancelPolicy,
  submitClaim,
  processClaim,
  // writes (admin)
  pmPause, 
  pmUnpause,
  pmWhitelistToken,
  pmUpdateInsurancePlan,
  pmUpdatePlanMetadata,
  pmSetRiskPool,
  pmSetClaimManager,
  cmPause, 
  cmUnpause,
  cmAuthorizeDoctor,
  cmSetManagers,
  riskPoolWithdrawToken,  // uncomment when ABI confirmed
  // utils
  formatWei,
};
