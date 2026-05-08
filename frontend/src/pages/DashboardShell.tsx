import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Menu, X } from 'lucide-react'
import Topbar from '../components/Layout/Topbar'
import Sidebar from '../components/Layout/Sidebar'
import { useKYC } from '../hooks/useKYC'
import '../styles/dashboard.css'

export default function DashboardShell() {
  const { address } = useAccount()
  const kyc = useKYC(address)
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const segments = location.pathname.replace('/dashboard', '').split('/').filter(Boolean)
  const activePage = segments[0] || 'overview'

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="dashboard-root">
      <div className="topbar-row">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={20} strokeWidth={2.5} style={{ color: 'var(--cyan)' }} /> : <Menu size={18} strokeWidth={2} />}
        </button>
        <Topbar />
      </div>
      <div className="body">
        {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}

        <div className={`sidebar-wrap ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
          <Sidebar active={activePage} onNavigate={() => {}} kycStatus={kyc.status} />
        </div>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
