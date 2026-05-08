import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { FileText, Users, Wallet, Zap, Plus, Sparkles } from 'lucide-react'
import StatCard from '../components/Dashboard/StatCard'
import KYCBanner from '../components/Dashboard/KYCBanner'
import CheckInAlert from '../components/Dashboard/CheckInAlert'
import RecentPlans from '../components/Dashboard/RecentPlans'
import QuickActions from '../components/Dashboard/QuickActions'
import FHEBadge from '../components/shared/FHEBadge'
import { useKYC } from '../hooks/useKYC'
import { useOwnerPlans, usePlan, useTimeUntilTrigger } from '../hooks/usePlans'

function usePlanStats(planIds: bigint[] | undefined) {
  const ids = planIds?.slice(0, 5) || []
  const p0 = usePlan(ids.length > 0 ? Number(ids[0]) : undefined)
  const p1 = usePlan(ids.length > 1 ? Number(ids[1]) : undefined)
  const p2 = usePlan(ids.length > 2 ? Number(ids[2]) : undefined)
  const p3 = usePlan(ids.length > 3 ? Number(ids[3]) : undefined)
  const p4 = usePlan(ids.length > 4 ? Number(ids[4]) : undefined)

  const t0 = useTimeUntilTrigger(ids.length > 0 ? Number(ids[0]) : undefined)
  const t1 = useTimeUntilTrigger(ids.length > 1 ? Number(ids[1]) : undefined)
  const t2 = useTimeUntilTrigger(ids.length > 2 ? Number(ids[2]) : undefined)
  const t3 = useTimeUntilTrigger(ids.length > 3 ? Number(ids[3]) : undefined)
  const t4 = useTimeUntilTrigger(ids.length > 4 ? Number(ids[4]) : undefined)

  const plans = [p0, p1, p2, p3, p4]
  const times = [t0, t1, t2, t3, t4]

  let totalBeneficiaries = 0
  let mostUrgentId: number | undefined = undefined
  let mostUrgentTime = Infinity
  let activePlanCount = 0

  for (let i = 0; i < ids.length && i < 5; i++) {
    const plan = plans[i].plan
    if (!plan) continue
    totalBeneficiaries += plan.beneficiaryCount || 0

    // Only count active inheritance plans for check-in urgency
    if (!plan.triggered && !plan.cancelled && plan.planType === 0) {
      activePlanCount++
      const t = times[i].data ? Number(times[i].data) : Infinity
      if (t < mostUrgentTime) {
        mostUrgentTime = t
        mostUrgentId = Number(ids[i])
      }
    }
  }

  const mostUrgentSecondsLeft = mostUrgentTime === Infinity ? 0 : mostUrgentTime
  const mostUrgentMinutesLeft = Math.ceil(mostUrgentSecondsLeft / 60)

  return { totalBeneficiaries, mostUrgentId, mostUrgentMinutesLeft, activePlanCount }
}

export default function Overview() {
  const navigate = useNavigate()
  const { address } = useAccount()
  const kyc = useKYC(address)
  const { planIds } = useOwnerPlans(address)

  const kycStatus = kyc.status
  const planCount = planIds?.length || 0
  const { totalBeneficiaries, mostUrgentId, mostUrgentMinutesLeft, activePlanCount } = usePlanStats(planIds)
  const hasPlans = planCount > 0

  const goCreate = () => navigate('/dashboard/create')
  const goKYC = () => navigate('/dashboard/kyc')
  const goPage = (page: string) => navigate(`/dashboard/${page}`)

  return (
    <>
      {/* Welcome hero */}
      <div className="welcome-hero">
        <div className="wh-content">
          <div className="wh-greeting">
            <Sparkles size={14} strokeWidth={2} style={{ color: 'var(--cyan)' }} />
            <span>Welcome back</span>
          </div>
          <h1 className="wh-title">Your Legacy Dashboard</h1>
          <p className="wh-sub">Monitor your inheritance plans, manage beneficiaries, and keep your digital assets secure.</p>
        </div>
        <button className="btn-create" onClick={goCreate}>
          <Plus size={15} strokeWidth={2.5} /> Create Plan
        </button>
      </div>

      {/* KYC Banner */}
      {kycStatus !== 'VERIFIED' && <KYCBanner onComplete={goKYC} />}

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard icon={FileText} iconClass="ic-blue" value={String(planCount)} label="Total Plans" trend={planCount > 0 ? '+1' : undefined} />
        <StatCard icon={Users} iconClass="ic-purple" value={String(totalBeneficiaries)} label="Beneficiaries" />
        <StatCard icon={Wallet} iconClass="ic-green" value="Encrypted" label="Assets Locked" />
        <StatCard icon={Zap} iconClass="ic-cyan" value={String(planCount)} label="Active Plans" />
      </div>

      {/* Check-in */}
      {mostUrgentId !== undefined && (
        <>
          <CheckInAlert daysLeft={mostUrgentMinutesLeft} planId={mostUrgentId} />
          {activePlanCount > 1 && (
            <div className="other-plans-note" onClick={() => navigate('/dashboard/plans')}>
              <span>+{activePlanCount - 1} other active {activePlanCount - 1 === 1 ? 'plan' : 'plans'} also need check-ins</span>
              <span className="opn-link">View All →</span>
            </div>
          )}
        </>
      )}

      {/* Bento grid */}
      <div className="bento-grid">
        <RecentPlans hasPlans={hasPlans} onCreatePlan={goCreate} />
        <QuickActions onCreatePlan={goCreate} onNavigate={goPage} planCount={planCount} kycStatus={kycStatus} />
      </div>

      <FHEBadge />
    </>
  )
}
