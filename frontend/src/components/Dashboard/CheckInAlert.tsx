import { HeartPulse, Check, Loader2 } from 'lucide-react'
import { useCheckIn, usePlan } from '../../hooks/usePlans'

interface CheckInAlertProps {
  daysLeft: number  // actually minutesLeft now
  planId: number
}

function formatTimeLeft(minutes: number) {
  if (minutes >= 1440) { const d = Math.ceil(minutes / 1440); return { value: d, unit: d === 1 ? 'day' : 'days' } }
  if (minutes >= 60) { const h = Math.ceil(minutes / 60); return { value: h, unit: h === 1 ? 'hour' : 'hours' } }
  return { value: minutes, unit: minutes === 1 ? 'minute' : 'minutes' }
}

export default function CheckInAlert({ daysLeft: minutesLeft, planId }: CheckInAlertProps) {
  const { checkIn, isPending, isConfirming, isSuccess } = useCheckIn()
  const { plan } = usePlan(planId)

  const isLoading = isPending || isConfirming
  const inactivityMinutes = plan ? Number(plan.inactivityDays) : 180 // field is actually minutes
  const pct = inactivityMinutes > 0 ? Math.min(100, Math.round((minutesLeft / inactivityMinutes) * 100)) : 0
  const { value, unit } = formatTimeLeft(minutesLeft)

  return (
    <div className="heartbeat-card">
      <div className="hb-left">
        <div className="hb-header">
          <div className="hb-pulse-dot" />
          <span className="hb-title">Proof of Life</span>
          <span className={`hb-status ${pct > 50 ? 'hb-safe' : minutesLeft > 0 ? 'hb-warn' : 'hb-warn'}`}>
            {pct > 50 ? 'Safe' : minutesLeft > 0 ? 'Action Needed' : 'Overdue'}
          </span>
        </div>
        <div className="hb-ecg-wrap">
          <svg className="hb-ecg" viewBox="0 0 300 60" preserveAspectRatio="none">
            <polyline className="ecg-line" fill="none" stroke="var(--green)" strokeWidth="1.5"
              points="0,30 30,30 40,30 50,10 55,50 60,20 65,35 70,30 100,30 130,30 140,30 150,10 155,50 160,20 165,35 170,30 200,30 230,30 240,30 250,10 255,50 260,20 265,35 270,30 300,30" />
          </svg>
        </div>
        <div className="hb-meta">
          <div className="hb-days">
            <span className="hb-days-num">{value}</span>
            <span className="hb-days-label">{unit} remaining</span>
          </div>
          <div className="hb-progress-wrap">
            <div className="hb-progress-bar"><div className="hb-progress-fill" style={{ width: `${pct}%` }} /></div>
            <span className="hb-progress-pct">{pct}%</span>
          </div>
        </div>
      </div>
      <div className="hb-right">
        <button className={`btn-checkin ${isSuccess ? 'checked' : ''}`} onClick={() => checkIn(planId)} disabled={isLoading}>
          {isLoading ? (
            <><Loader2 size={16} strokeWidth={2} className="spin" /> {isPending ? 'Confirm...' : 'Checking in...'}</>
          ) : isSuccess ? (
            <><Check size={16} strokeWidth={2.5} /> Confirmed</>
          ) : (
            <><HeartPulse size={16} strokeWidth={2} /> I'm Alive</>
          )}
        </button>
        <div className="hb-hint">Sends on-chain transaction</div>
      </div>
    </div>
  )
}
