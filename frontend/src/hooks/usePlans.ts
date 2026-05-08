import { useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { INHERITX_ABI } from '../lib/contracts'
import { CONTRACT_ADDRESS } from '../lib/constants'

export interface PlanData {
  id: number
  owner: string
  planType: number
  name: string
  description: string
  lastCheckin: bigint
  inactivityDays: bigint
  unlockDate: bigint
  beneficiaryCount: number
  triggered: boolean
  claimed: boolean
  cancelled: boolean
}

export function usePlanCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: INHERITX_ABI,
    functionName: 'planCount',
    query: { enabled: !!CONTRACT_ADDRESS },
  })
}

export function useOwnerPlans(address: `0x${string}` | undefined) {
  const { data: planIds, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: INHERITX_ABI,
    functionName: 'getOwnerPlans',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESS },
  })

  return { planIds: planIds as bigint[] | undefined, refetch }
}

export function usePlan(planId: number | undefined) {
  const { data, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: INHERITX_ABI,
    functionName: 'getPlan',
    args: planId !== undefined ? [BigInt(planId)] : undefined,
    query: { enabled: planId !== undefined && !!CONTRACT_ADDRESS },
  })

  const plan: PlanData | undefined = data ? {
    id: planId!,
    owner: (data as any)[0],
    planType: Number((data as any)[1]),
    name: (data as any)[2] || `Plan #${planId}`,
    description: (data as any)[3] || '',
    lastCheckin: (data as any)[4],
    inactivityDays: (data as any)[5],
    unlockDate: (data as any)[6],
    beneficiaryCount: Number((data as any)[7]),
    triggered: (data as any)[8],
    claimed: (data as any)[9],
    cancelled: (data as any)[10],
  } : undefined

  return { plan, refetch }
}

export function useCheckIn() {
  const { writeContract, data: txHash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const checkIn = (planId: number) => {
    if (!CONTRACT_ADDRESS) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: INHERITX_ABI,
      functionName: 'checkIn',
      args: [BigInt(planId)],
    })
  }

  return { checkIn, isPending, isConfirming, isSuccess }
}

export function useTriggerPlan() {
  const { writeContract, data: txHash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const triggerPlan = (planId: number) => {
    if (!CONTRACT_ADDRESS) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: INHERITX_ABI,
      functionName: 'trigger',
      args: [BigInt(planId)],
    })
  }

  return { triggerPlan, isPending, isConfirming, isSuccess }
}

export function useCancelPlan() {
  const { writeContract, data: txHash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const cancelPlan = (planId: number) => {
    if (!CONTRACT_ADDRESS) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: INHERITX_ABI,
      functionName: 'cancelPlan',
      args: [BigInt(planId)],
    })
  }

  return { cancelPlan, isPending, isConfirming, isSuccess }
}

export function usePlanBalance(planId: number | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: INHERITX_ABI,
    functionName: 'getPlanBalance',
    args: planId !== undefined ? [BigInt(planId)] : undefined,
    query: { enabled: planId !== undefined && !!CONTRACT_ADDRESS },
  })
}

export function useTimeUntilTrigger(planId: number | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: INHERITX_ABI,
    functionName: 'timeUntilTrigger',
    args: planId !== undefined ? [BigInt(planId)] : undefined,
    query: { enabled: planId !== undefined && !!CONTRACT_ADDRESS },
  })
}
