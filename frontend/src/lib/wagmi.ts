import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'viem/chains'
import { http } from 'viem'

export const config = getDefaultConfig({
  appName: 'InheritX',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'e8b562b524d7fa13027c5dd3172ace54',
  chains: [sepolia],
  ssr: false,
  transports: {
    [sepolia.id]: http('https://sepolia.infura.io/v3/bf008ee040c7429eb8d8784e52f28d10'),
  },
})
