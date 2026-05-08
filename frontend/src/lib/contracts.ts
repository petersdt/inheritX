import { CONTRACT_ADDRESS } from './constants'

export const INHERITX_ABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  { inputs: [], name: 'AlreadyClaimed', type: 'error' },
  { inputs: [], name: 'InvalidBeneficiaryCount', type: 'error' },
  { inputs: [], name: 'InvalidInactivityDays', type: 'error' },
  { inputs: [], name: 'InvalidKMSSignatures', type: 'error' },
  { inputs: [], name: 'KYCRequired', type: 'error' },
  { inputs: [], name: 'NoETHSent', type: 'error' },
  { inputs: [], name: 'NotPlanOwner', type: 'error' },
  { inputs: [], name: 'OwnerStillActive', type: 'error' },
  { inputs: [], name: 'PlanAlreadyClaimed', type: 'error' },
  { inputs: [], name: 'PlanAlreadyTriggered', type: 'error' },
  { inputs: [], name: 'PlanCancelled_', type: 'error' },
  { inputs: [], name: 'PlanNotTriggered', type: 'error' },
  { inputs: [], name: 'TransferFailed', type: 'error' },
  { inputs: [], name: 'UnlockDateNotReached', type: 'error' },
  // Events
  {
    anonymous: false, name: 'CheckIn', type: 'event',
    inputs: [
      { indexed: true, name: 'planId', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
  {
    anonymous: false, name: 'InheritanceClaimed', type: 'event',
    inputs: [
      { indexed: true, name: 'planId', type: 'uint256' },
      { indexed: false, name: 'beneficiaryIndex', type: 'uint8' },
      { indexed: false, name: 'claimer', type: 'address' },
    ],
  },
  {
    anonymous: false, name: 'KYCSubmitted', type: 'event',
    inputs: [{ indexed: true, name: 'wallet', type: 'address' }],
  },
  {
    anonymous: false, name: 'KYCVerified', type: 'event',
    inputs: [{ indexed: true, name: 'wallet', type: 'address' }],
  },
  {
    anonymous: false, name: 'PlanCancelled', type: 'event',
    inputs: [{ indexed: true, name: 'planId', type: 'uint256' }],
  },
  {
    anonymous: false, name: 'PlanCreated', type: 'event',
    inputs: [
      { indexed: true, name: 'planId', type: 'uint256' },
      { indexed: true, name: 'owner', type: 'address' },
      { indexed: false, name: 'planType', type: 'uint8' },
      { indexed: false, name: 'name', type: 'string' },
    ],
  },
  {
    anonymous: false, name: 'PlanTriggered', type: 'event',
    inputs: [
      { indexed: true, name: 'planId', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
  },
  // Read functions
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'getOwnerPlans',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ name: 'planId', type: 'uint256' }],
    name: 'getPlan',
    outputs: [
      { name: 'owner_', type: 'address' },
      { name: 'planType_', type: 'uint8' },
      { name: 'name_', type: 'string' },
      { name: 'description_', type: 'string' },
      { name: 'lastCheckin_', type: 'uint256' },
      { name: 'inactivityDays_', type: 'uint256' },
      { name: 'unlockDate_', type: 'uint256' },
      { name: 'beneficiaryCount_', type: 'uint8' },
      { name: 'triggered_', type: 'bool' },
      { name: 'claimed_', type: 'bool' },
      { name: 'cancelled_', type: 'bool' },
    ],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'kycStatus',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [], name: 'planCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [
      { name: 'planId', type: 'uint256' },
      { name: 'wallet', type: 'address' },
    ],
    name: 'getHeirStatus',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ name: 'planId', type: 'uint256' }],
    name: 'getEthLockedHandle',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ name: 'planId', type: 'uint256' }],
    name: 'getPlanBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ name: 'planId', type: 'uint256' }],
    name: 'timeUntilTrigger',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view', type: 'function',
  },
  // Write functions
  {
    inputs: [], name: 'submitKYC',
    outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ name: 'wallet', type: 'address' }],
    name: 'verifyKYC',
    outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ name: 'planId', type: 'uint256' }],
    name: 'checkIn',
    outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ name: 'planId', type: 'uint256' }],
    name: 'trigger',
    outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [
      { name: 'planId', type: 'uint256' },
    ],
    name: 'claimDirect',
    outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ name: 'planId', type: 'uint256' }],
    name: 'cancelPlan',
    outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [
      { name: 'planType', type: 'uint8' },
      { name: 'planName', type: 'string' },
      { name: 'planDescription', type: 'string' },
      { name: 'encHeirAddrs', type: 'bytes32[]' },
      { name: 'encShares', type: 'bytes32[]' },
      { name: 'inputProofsAddrs', type: 'bytes[]' },
      { name: 'inputProofsShares', type: 'bytes[]' },
      { name: 'heirAddressHashes', type: 'bytes32[]' },
      { name: 'inactivityDays', type: 'uint256' },
      { name: 'unlockDate', type: 'uint256' },
    ],
    name: 'createPlan',
    outputs: [{ name: 'planId', type: 'uint256' }],
    stateMutability: 'payable', type: 'function',
  },
  {
    inputs: [
      { name: 'planType', type: 'uint8' },
      { name: 'planName', type: 'string' },
      { name: 'planDescription', type: 'string' },
      { name: 'heirAddrs', type: 'address[]' },
      { name: 'shareBps', type: 'uint32[]' },
      { name: 'inactivityDays', type: 'uint256' },
      { name: 'unlockDate', type: 'uint256' },
    ],
    name: 'createPlanDirect',
    outputs: [{ name: 'planId', type: 'uint256' }],
    stateMutability: 'payable', type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
] as const

export const inheritXConfig = {
  address: CONTRACT_ADDRESS,
  abi: INHERITX_ABI,
} as const
