import { Plus, ShieldCheck, Gift, ChevronRight, Circle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface QuickActionsProps {
  onCreatePlan: () => void
  onNavigate?: (page: string) => void
  planCount: number
  kycStatus: string
}

const actions: { icon: LucideIcon; iconClass: string; name: string; sub: string; action: string }[] = [
  { icon: Plus, iconClass: 'qi-cyan', name: 'Create New Plan', sub: 'Set up inheritance', action: 'create' },
  { icon: ShieldCheck, iconClass: 'qi-purple', name: 'KYC Verification', sub: 'Complete verification', action: 'kyc' },
  { icon: Gift, iconClass: 'qi-green', name: 'Claim Inheritance', sub: 'For beneficiaries', action: 'claim' },
]

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="as-indicator">
      <Circle size={6} fill={color} stroke={color} />
      <span>{label}</span>
    </div>
  )
}

export default function QuickActions({ onCreatePlan, onNavigate, planCount, kycStatus }: QuickActionsProps) {
  const handleClick = (action: string) => {
    if (action === 'create') onCreatePlan()
    else if (onNavigate) onNavigate(action)
  }
  return (
    <div className="panel qa-panel">
      <div className="panel-header">
        <div className="panel-title">Quick Actions</div>
      </div>
      <div className="qa-list">
        {actions.map((a) => (
          <div className="qa-item" key={a.name} onClick={() => handleClick(a.action)}>
            <div className={`qa-icon ${a.iconClass}`}>
              <a.icon size={15} strokeWidth={1.8} />
            </div>
            <div className="qa-info">
              <div className="qa-name">{a.name}</div>
              <div className="qa-sub">{a.sub}</div>
            </div>
            <ChevronRight size={14} strokeWidth={1.5} className="qa-arrow" />
          </div>
        ))}
      </div>

      <div className="as-divider" />

      <div className="acct-status">
        <div className="as-title">System Status</div>
        <div className="as-grid">
          <div className="as-cell">
            <span className="as-key">KYC</span>
            <span className={`as-val ${kycStatus === 'VERIFIED' ? 'av-ok' : 'av-warn'}`}>
              {kycStatus === 'NOT_SUBMITTED' ? 'Required' : kycStatus === 'SUBMITTED' ? 'Pending' : 'Verified'}
            </span>
          </div>
          <div className="as-cell">
            <span className="as-key">Plans</span>
            <span className="as-num">{planCount}</span>
          </div>
          <div className="as-cell">
            <span className="as-key">Network</span>
            <StatusDot color="var(--green)" label="Live" />
          </div>
          <div className="as-cell">
            <span className="as-key">fhEVM</span>
            <StatusDot color="var(--green)" label="Online" />
          </div>
        </div>
      </div>
    </div>
  )
}
