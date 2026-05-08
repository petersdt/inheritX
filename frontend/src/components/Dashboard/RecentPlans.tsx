import { useAccount } from 'wagmi'
import { Landmark, Target, FileText, Plus, ArrowRight, Clock, Users, Lock } from 'lucide-react'
import { useOwnerPlans, usePlan } from '../../hooks/usePlans'

interface RecentPlansProps {
  hasPlans: boolean
  onCreatePlan: () => void
}

export default function RecentPlans({ hasPlans, onCreatePlan }: RecentPlansProps) {
  const { address } = useAccount()
  const { planIds } = useOwnerPlans(address)

  // Show latest 3 plans
  const recentIds = planIds ? [...planIds].reverse().slice(0, 3) : []

  return (
    <div className="panel plans-panel">
      <div className="panel-header">
        <div className="panel-title">Recent Plans</div>
        <div className="view-all" onClick={onCreatePlan}>
          {hasPlans ? 'View All' : 'Create'} <ArrowRight size={12} strokeWidth={2} />
        </div>
      </div>

      {recentIds.length > 0 ? (
        <div className="plans-list">
          {recentIds.map((id) => (
            <PlanRowLite key={id.toString()} planId={Number(id)} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-visual">
            <div className="empty-ring" />
            <FileText size={28} strokeWidth={1.2} style={{ color: 'var(--t3)' }} />
          </div>
          <div className="empty-title">No inheritance plans yet</div>
          <div className="empty-sub">Create your first plan to secure your digital legacy.</div>
          <button className="btn-empty" onClick={onCreatePlan}>
            <Plus size={14} strokeWidth={2.5} /> Create First Plan
          </button>
        </div>
      )}
    </div>
  )
}

function PlanRowLite({ planId }: { planId: number }) {
  const { plan } = usePlan(planId)
  if (!plan) return null

  const isInheritance = plan.planType === 0
  const statusLabel = plan.cancelled ? 'Cancelled' : plan.triggered ? 'Triggered' : 'Active'
  const statusClass = plan.cancelled ? 'pb-cancel' : plan.triggered ? 'pb-pend' : 'pb-active'

  return (
    <div className="plan-row">
      <div className="pr-icon" style={{
        background: isInheritance ? 'rgba(0,212,232,0.06)' : 'rgba(240,160,32,0.06)',
        color: isInheritance ? 'var(--cyan)' : 'var(--gold)',
      }}>
        {isInheritance ? <Landmark size={16} strokeWidth={1.8} /> : <Target size={16} strokeWidth={1.8} />}
      </div>
      <div className="pr-info">
        <div className="pr-name">{plan.name}</div>
        <div className="pr-details">
          <span className="pr-detail"><Users size={10} strokeWidth={2} /> {plan.beneficiaryCount}</span>
          <span className="pr-detail"><Clock size={10} strokeWidth={2} /> {plan.inactivityDays.toString()}d</span>
          <span className="pr-detail"><Lock size={10} strokeWidth={2} /> Encrypted</span>
        </div>
      </div>
      <div className={`pr-badge ${statusClass}`}>{statusLabel}</div>
    </div>
  )
}
