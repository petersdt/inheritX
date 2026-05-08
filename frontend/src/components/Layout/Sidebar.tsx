import {
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Activity,
  Lock,
  Settings,
  Gift,
  LogOut,
  CircleDot,
  PlusCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useAccountModal } from '@rainbow-me/rainbowkit'
import { useEffect, useRef } from 'react'
import { LogoMark } from '../shared/Logo'

interface NavItem { icon: LucideIcon; label: string; id: string; route: string }

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', id: 'overview', route: '/dashboard' },
  { icon: PlusCircle, label: 'Create Plan', id: 'create', route: '/dashboard/create' },
  { icon: FileText, label: 'My Plans', id: 'plans', route: '/dashboard/plans' },
  { icon: Activity, label: 'Activity', id: 'activity', route: '/dashboard/activity' },
]

const managementNav: NavItem[] = [
  { icon: ShieldCheck, label: 'KYC Verification', id: 'kyc', route: '/dashboard/kyc' },
  { icon: Lock, label: 'Security', id: 'security', route: '/dashboard/security' },
  { icon: Settings, label: 'Settings', id: 'settings', route: '/dashboard' },
]

interface SidebarProps {
  active: string
  onNavigate: (id: string) => void
  kycStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'VERIFIED'
}

export default function Sidebar({ active, onNavigate, kycStatus }: SidebarProps) {
  const navigate = useNavigate()

  const { isConnected } = useAccount()
  const { openAccountModal } = useAccountModal()
  const wasConnected = useRef(isConnected)

  // Redirect to home only when user actively disconnects (was connected → now isn't)
  useEffect(() => {
    if (wasConnected.current && !isConnected) {
      navigate('/')
    }
    wasConnected.current = isConnected
  }, [isConnected])

  const handleNav = (route: string) => {
    navigate(route)
  }

  const handleDisconnect = () => {
    openAccountModal?.()
  }

  return (
    <aside className="sidebar">
      <div className="sb-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <LogoMark size={24} />
        <div className="sb-brand-info">
          <span className="sb-brand-name">InheritX</span>
          <span className="sb-brand-ver">v1.0 · Testnet</span>
        </div>
      </div>

      <div className="sb-nav-scroll">
        <NavGroup label="Navigate" items={mainNav} active={active} onNavigate={handleNav} />

        <div className="sb-section">
          <div className="sb-label">Beneficiary</div>
          <div
            className={`sb-item sb-item-claim${active === 'claim' ? ' active' : ''}`}
            onClick={() => handleNav('/dashboard/claim')}
          >
            <div className="sb-item-inner">
              <Gift size={15} strokeWidth={1.8} />
              <span>Claim Inheritance</span>
            </div>
            <div className="sb-item-arrow">→</div>
          </div>
        </div>

        <NavGroup label="Management" items={managementNav} active={active} onNavigate={handleNav} />
      </div>

      <div className="sb-footer">
        <div className="sb-status-card">
          <div className="sb-status-row">
            <CircleDot size={10} strokeWidth={2.5} style={{ color: 'var(--green)' }} />
            <span className="sb-status-label">fhEVM Network</span>
            <span className="sb-status-val sb-status-live">Live</span>
          </div>
          <div className="sb-status-row">
            <ShieldCheck size={10} strokeWidth={2.5} style={{ color: kycStatus === 'VERIFIED' ? 'var(--green)' : 'var(--gold)' }} />
            <span className="sb-status-label">KYC Status</span>
            <span className={`sb-status-val ${kycStatus === 'VERIFIED' ? 'sb-status-live' : 'sb-status-warn'}`}>
              {kycStatus === 'NOT_SUBMITTED' ? 'Required' : kycStatus === 'SUBMITTED' ? 'Pending' : 'Verified'}
            </span>
          </div>
        </div>

        <div className="sb-item sb-disconnect" onClick={handleDisconnect}>
          <div className="sb-item-inner">
            <LogOut size={14} strokeWidth={1.8} />
            <span>Disconnect</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavGroup({ label, items, active, onNavigate }: { label: string; items: NavItem[]; active: string; onNavigate: (route: string) => void }) {
  return (
    <div className="sb-section">
      <div className="sb-label">{label}</div>
      <div className="sb-group">
        {items.map((item) => (
          <div
            key={item.id}
            className={`sb-item${active === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.route)}
          >
            <div className="sb-item-inner">
              <item.icon size={15} strokeWidth={1.8} />
              <span>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
