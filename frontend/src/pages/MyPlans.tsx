import { useAccount } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Landmark, Target, Clock, Users, Lock,
  CheckCircle2, XCircle, ChevronRight, AlertTriangle, Hexagon,
} from 'lucide-react'
import { useOwnerPlans, usePlan } from '../hooks/usePlans'

export default function MyPlans() {
  const navigate = useNavigate()
  const { address } = useAccount()
  const { planIds } = useOwnerPlans(address)
  const onCreatePlan = () => navigate('/dashboard/create')

  return (
    <div className="page-container-wide">
      <style>{styles}</style>
      <div className="mp-header">
        <div>
          <h1 className="pg-title">My Plans</h1>
          <p className="pg-sub">Manage your inheritance and future goal plans.</p>
        </div>
        <button className="mp-create-btn" onClick={onCreatePlan}>
          <Plus size={14} strokeWidth={2.5} /> New Plan
        </button>
      </div>

      {planIds && planIds.length > 0 ? (
        <div className="mp-list">
          {planIds.map((id) => (
            <PlanRow
              key={id.toString()}
              planId={Number(id)}
              onClick={() => navigate(`/dashboard/plans/${Number(id)}`)}
            />
          ))}
        </div>
      ) : (
        <div className="mp-empty">
          <Hexagon size={32} strokeWidth={1} style={{ color: 'var(--t3)', opacity: 0.4 }} />
          <h3>No plans yet</h3>
          <p>Create your first inheritance plan to get started.</p>
          <button className="mp-create-btn" onClick={onCreatePlan}>
            <Plus size={14} strokeWidth={2.5} /> Create First Plan
          </button>
        </div>
      )}
    </div>
  )
}

function PlanRow({ planId, onClick }: { planId: number; onClick: () => void }) {
  const { plan } = usePlan(planId)
  if (!plan) return null

  const isInheritance = plan.planType === 0
  const statusColor = plan.cancelled ? 'var(--red)' : plan.triggered ? 'var(--gold)' : 'var(--green)'
  const statusLabel = plan.cancelled ? 'Cancelled' : plan.triggered ? 'Triggered' : plan.claimed ? 'Claimed' : 'Active'
  const StatusIcon = plan.cancelled ? XCircle : plan.triggered ? AlertTriangle : CheckCircle2

  return (
    <div className="mp-row" onClick={onClick}>
      <div className="mp-row-icon" style={{
        background: isInheritance ? 'rgba(0,212,232,0.06)' : 'rgba(240,160,32,0.06)',
        color: isInheritance ? 'var(--cyan)' : 'var(--gold)',
      }}>
        {isInheritance ? <Landmark size={18} strokeWidth={1.5} /> : <Target size={18} strokeWidth={1.5} />}
      </div>
      <div className="mp-row-info">
        <div className="mp-row-name">{plan.name}</div>
        <div className="mp-row-meta">
          <span><Users size={10} strokeWidth={2} /> {plan.beneficiaryCount}</span>
          <span><Clock size={10} strokeWidth={2} /> {Number(plan.inactivityDays) >= 1440 ? `${Math.round(Number(plan.inactivityDays)/1440)}d` : Number(plan.inactivityDays) >= 60 ? `${Math.round(Number(plan.inactivityDays)/60)}h` : `${plan.inactivityDays.toString()}m`}</span>
          <span><Lock size={10} strokeWidth={2} /> Encrypted</span>
        </div>
      </div>
      <div className="mp-row-badge" style={{ background: `${statusColor}12`, color: statusColor, borderColor: `${statusColor}25` }}>
        <StatusIcon size={10} strokeWidth={2.5} /> {statusLabel}
      </div>
      <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--t4)' }} />
    </div>
  )
}

const styles = `
.page-container-wide { max-width: 800px; }
.mp-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.pg-title { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: var(--t1); margin-bottom: 2px; }
.pg-sub { font-size: 13px; color: var(--t3); }

.mp-create-btn {
  display: flex; align-items: center; gap: 6px; padding: 9px 16px;
  background: var(--cyan); border: none; border-radius: 8px; color: #000;
  font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.mp-create-btn:hover { background: var(--cyan-hi); box-shadow: 0 4px 16px rgba(0,212,232,0.3); }

.mp-empty {
  text-align: center; padding: 60px 20px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.mp-empty h3 { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 600; color: var(--t2); }
.mp-empty p { font-size: 13px; color: var(--t3); margin-bottom: 12px; }

.mp-list {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 14px; overflow: hidden;
}
.mp-row {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 18px; border-bottom: 1px solid rgba(255,255,255,0.03);
  cursor: pointer; transition: all 0.15s;
}
.mp-row:last-child { border-bottom: none; }
.mp-row:hover { background: rgba(255,255,255,0.025); }
.mp-row-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.mp-row-info { flex: 1; min-width: 0; }
.mp-row-name { font-size: 14px; font-weight: 600; color: var(--t1); margin-bottom: 4px; }
.mp-row-meta { display: flex; gap: 14px; font-size: 11px; color: var(--t3); font-family: 'JetBrains Mono', monospace; }
.mp-row-meta span { display: flex; align-items: center; gap: 3px; }
.mp-row-badge {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
  padding: 3px 9px; border-radius: 5px; white-space: nowrap; border: 1px solid;
}
`
