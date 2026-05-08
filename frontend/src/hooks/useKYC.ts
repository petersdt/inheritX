import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { INHERITX_ABI } from '../lib/contracts'
import { CONTRACT_ADDRESS } from '../lib/constants'

export type KYCStatusType = 'NOT_SUBMITTED' | 'SUBMITTED' | 'VERIFIED'

const KYC_MAP: Record<number, KYCStatusType> = {
  0: 'NOT_SUBMITTED',
  1: 'SUBMITTED',
  2: 'VERIFIED',
}

export function useKYC(address: `0x${string}` | undefined) {
  const { data: rawStatus, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: INHERITX_ABI,
    functionName: 'kycStatus',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!CONTRACT_ADDRESS },
  })

  const { writeContract, data: txHash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const submitKYC = () => {
    if (!CONTRACT_ADDRESS) return
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: INHERITX_ABI,
      functionName: 'submitKYC',
    })
  }

  const status: KYCStatusType = rawStatus !== undefined ? KYC_MAP[Number(rawStatus)] || 'NOT_SUBMITTED' : 'NOT_SUBMITTED'

  return {
    status,
    submitKYC,
    isPending,
    isConfirming,
    isSuccess,
    refetch,
  }
}
