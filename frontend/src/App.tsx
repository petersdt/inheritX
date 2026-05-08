import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { config } from './lib/wagmi'
import Landing from './pages/Landing'
import Docs from './pages/Docs'
import DashboardShell from './pages/DashboardShell'
import Overview from './pages/Overview'
import MyPlans from './pages/MyPlans'
import PlanDetail from './pages/PlanDetail'
import CreatePlan from './pages/CreatePlan'
import KYCVerification from './pages/KYCVerification'
import ActivityPage from './pages/ActivityPage'
import SecurityPage from './pages/SecurityPage'
import ClaimInheritance from './pages/ClaimInheritance'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00d4e8',
            accentColorForeground: '#000',
            borderRadius: 'medium',
            overlayBlur: 'small',
          })}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/dashboard" element={<DashboardShell />}>
                <Route index element={<Overview />} />
                <Route path="plans" element={<MyPlans />} />
              <Route path="plans/:planId" element={<PlanDetail />} />
                <Route path="create" element={<CreatePlan />} />
                <Route path="kyc" element={<KYCVerification />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="security" element={<SecurityPage />} />
                <Route path="claim" element={<ClaimInheritance />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
