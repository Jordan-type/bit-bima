// Replace this with your actual contract ABI
export const HEALTH_INSURANCE_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "EnforcedPause",
    type: "error",
  },
  {
    inputs: [],
    name: "ExpectedPause",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum HealthInsuranceDApp.ClaimStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "approvedAmount",
        type: "uint256",
      },
    ],
    name: "ClaimProcessed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "claimant",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "ClaimSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "doctor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "authorized",
        type: "bool",
      },
    ],
    name: "DoctorAuthorized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "enum HealthInsuranceDApp.PlanType",
        name: "planType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "oneTimePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "monthlyPrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "coverageAmount",
        type: "uint256",
      },
    ],
    name: "PlanCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "policyholder",
        type: "address",
      },
    ],
    name: "PolicyCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "policyholder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum HealthInsuranceDApp.PlanType",
        name: "planType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum HealthInsuranceDApp.PaymentType",
        name: "paymentType",
        type: "uint8",
      },
    ],
    name: "PolicyPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "policyholder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "PremiumPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_doctor",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_authorized",
        type: "bool",
      },
    ],
    name: "authorizeDoctorAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "authorizedDoctors",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "cancelPolicy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "claims",
    outputs: [
      {
        internalType: "uint256",
        name: "claimId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "claimant",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "claimAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "approvedAmount",
        type: "uint256",
      },
      {
        internalType: "enum HealthInsuranceDApp.ClaimStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "submissionDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "processedDate",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "ipfsDocuments",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "getPolicyClaims",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "getRemainingCoverage",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalClaims",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalPolicies",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getUserPolicies",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum HealthInsuranceDApp.PlanType",
        name: "",
        type: "uint8",
      },
    ],
    name: "insurancePlans",
    outputs: [
      {
        internalType: "enum HealthInsuranceDApp.PlanType",
        name: "planType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "oneTimePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "monthlyPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "coverageAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deductible",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "isPolicyValid",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "payMonthlyPremium",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "policies",
    outputs: [
      {
        internalType: "uint256",
        name: "policyId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "policyholder",
        type: "address",
      },
      {
        internalType: "enum HealthInsuranceDApp.PlanType",
        name: "planType",
        type: "uint8",
      },
      {
        internalType: "enum HealthInsuranceDApp.PaymentType",
        name: "paymentType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "coverageAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deductible",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "premium",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "lastPaymentDate",
        type: "uint256",
      },
      {
        internalType: "enum HealthInsuranceDApp.PolicyStatus",
        name: "status",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "ipfsMetadata",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "totalPaid",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "claimsUsed",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "policyClaims",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_claimId",
        type: "uint256",
      },
      {
        internalType: "enum HealthInsuranceDApp.ClaimStatus",
        name: "_status",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_approvedAmount",
        type: "uint256",
      },
    ],
    name: "processClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum HealthInsuranceDApp.PlanType",
        name: "_planType",
        type: "uint8",
      },
      {
        internalType: "enum HealthInsuranceDApp.PaymentType",
        name: "_paymentType",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "_ipfsMetadata",
        type: "string",
      },
    ],
    name: "purchasePolicy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_claimAmount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_ipfsDocuments",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
    ],
    name: "submitClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum HealthInsuranceDApp.PlanType",
        name: "_planType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "_oneTimePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_monthlyPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_coverageAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_deductible",
        type: "uint256",
      },
    ],
    name: "updateInsurancePlan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum HealthInsuranceDApp.PlanType",
        name: "_planType",
        type: "uint8",
      },
      {
        internalType: "string",
        name: "_ipfsHash",
        type: "string",
      },
    ],
    name: "updatePlanMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userPolicies",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
