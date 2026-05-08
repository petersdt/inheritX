import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { formatEther } from 'viem'
import {
  Landmark, Target, Lock, ArrowLeft, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Hexagon, Loader2, HeartPulse
} from 'lucide-react'
import { useAccount, useReadContract, useWalletClient } from 'wagmi'
import { usePlan, useCheckIn, useTimeUntilTrigger, useTriggerPlan } from '../hooks/usePlans'
import { CONTRACT_ADDRESS } from '../lib/constants'
import { INHERITX_ABI } from '../lib/contracts'
import { decryptValue } from '../lib/fhe'

export default function PlanDetail() {
  const { planId: rawId } = useParams()
  const navigate = useNavigate()
  const { address } = useAccount()
  const planId = Number(rawId)

  const { plan } = usePlan(planId)
  const { data: timeLeft } = useTimeUntilTrigger(planId)
  const { checkIn, isPending, isConfirming, isSuccess } = useCheckIn()
  const { triggerPlan, isPending: trigPending, isConfirming: trigConfirming, isSuccess: trigSuccess } = useTriggerPlan()
  const { data: walletClient } = useWalletClient()

  const [showBalance, setShowBalance] = useState(false)
  const [ethBalance, setEthBalance] = useState<string | null>(null)
  const [decryptLoading, setDecryptLoading] = useState(false)
  const [decryptError, setDecryptError] = useState('')

  // Get the FHE handle for the encrypted ETH amount
  const { data: ethHandle } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: INHERITX_ABI,
    functionName: 'getEthLockedHandle',
    args: [BigInt(planId)],
    query: { enabled: !!CONTRACT_ADDRESS },
  })

  const handleReveal = async () => {
    if (showBalance) {
      setShowBalance(false)
      setEthBalance(null) // Clear cached value — force fresh decrypt next time
      setDecryptError('')
      return
    }

    if (!CONTRACT_ADDRESS || !address) {
      setDecryptError('Connect wallet first')
      return
    }

    setShowBalance(true)
    setDecryptLoading(true)
    setDecryptError('')

    try {
      const handleHex = ethHandle as string
      if (!handleHex || handleHex === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        throw new Error('No encrypted handle found')
      }

      if (!walletClient) throw new Error('Wallet not connected')

      // fhEVM decrypt: wallet signature → KMS threshold decryption
      // Pass walletClient directly — decryptValue uses walletClient.signTypedData()
      const decrypted = await decryptValue(
        handleHex,
        CONTRACT_ADDRESS,
        address,
        walletClient,
      )

      if (decrypted !== null) {
        setEthBalance(formatEther(decrypted))
      } else {
        setDecryptError('Decryption returned empty — you may not have permission')
      }
    } catch (err: any) {
      console.error('Decrypt failed:', err)
      if (err.message?.includes('User rejected') || err.message?.includes('user rejected')) {
        setDecryptError('Signature rejected')
        setShowBalance(false)
      } else {
        setDecryptError(err.message?.slice(0, 80) || 'Decryption failed')
      }
    } finally {
      setDecryptLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="page-container-wide">
        <style>{styles}</style>
        <div className="pd-loading">
          <Hexagon size={20} strokeWidth={1.5} className="spin" style={{ color: 'var(--cyan)' }} />
          Loading plan...
        </div>
      </div>
    )
  }

  const isInheritance = plan.planType === 0
  const secondsLeft = timeLeft ? Number(timeLeft) : 0
  const minutesLeft = Math.ceil(secondsLeft / 60)
  const hoursLeft = Math.ceil(secondsLeft / 3600)
  const daysLeft = Math.ceil(secondsLeft / 86400)
  const inactivityDays = Number(plan.inactivityDays) // actually minutes now
  const totalSeconds = inactivityDays * 60
  const pct = totalSeconds > 0 ? Math.min(100, Math.round((secondsLeft / totalSeconds) * 100)) : 0
  const lastCheckinDate = new Date(Number(plan.lastCheckin) * 1000)
  const triggerDate = new Date((Number(plan.lastCheckin) + inactivityDays * 60) * 1000)
  const isCheckingIn = isPending || isConfirming
  const urgency = pct > 50 ? 'safe' : pct > 20 ? 'warning' : 'danger'
  const urgencyColor = urgency === 'safe' ? 'var(--green)' : urgency === 'warning' ? 'var(--gold)' : 'var(--red)'

  return (
    <div className="page-container-wide">
      <style>{styles}</style>
      <button className="pd-back" onClick={() => navigate('/dashboard/plans')}>
        <ArrowLeft size={14} strokeWidth={2} /> Back to Plans
      </button>

      <div className="pd-header">
        <div className="pd-icon" style={{
          background: isInheritance ? 'rgba(0,212,232,0.08)' : 'rgba(240,160,32,0.08)',
          color: isInheritance ? 'var(--cyan)' : 'var(--gold)',
        }}>
          {isInheritance ? <Landmark size={24} strokeWidth={1.5} /> : <Target size={24} strokeWidth={1.5} />}
        </div>
        <div>
          <h1 className="pd-title">{plan.name}</h1>
          <p className="pd-subtitle">{isInheritance ? 'Inheritance Plan' : 'Future Goal Plan'} · Plan #{planId}</p>
        </div>
        <div className={`pd-status ${plan.triggered ? 'pd-triggered' : plan.cancelled ? 'pd-cancelled' : 'pd-active'}`}>
          {plan.cancelled ? 'Cancelled' : plan.triggered ? 'Triggered' : plan.claimed ? 'Claimed' : 'Active'}
        </div>
      </div>

      {/* Proof of Life — full progress card */}
      {!plan.triggered && !plan.cancelled && isInheritance && (
        <div className="pd-life-card">
          <div className="pd-life-header">
            <div className="pd-life-left">
              <div className="pd-life-dot" style={{ background: urgencyColor, boxShadow: `0 0 8px ${urgencyColor}` }} />
              <span className="pd-life-title">Proof of Life</span>
              <span className={`pd-life-badge pd-life-${urgency}`}>
                {urgency === 'safe' ? 'Safe' : urgency === 'warning' ? 'Check in soon' : daysLeft > 0 ? 'Urgent' : 'Overdue'}
              </span>
            </div>
            <button className="pd-life-btn" onClick={() => checkIn(planId)} disabled={isCheckingIn}>
              {isCheckingIn ? (
                <><Loader2 size={13} strokeWidth={2} className="spin" /> Confirming...</>
              ) : isSuccess ? (
                <><CheckCircle2 size={13} strokeWidth={2} /> Timer Reset</>
              ) : (
                <><HeartPulse size={13} strokeWidth={2} /> I'm Alive</>
              )}
            </button>
          </div>

          {/* ECG line */}
          <div className="pd-life-ecg-wrap">
            <svg className="pd-life-ecg" viewBox="0 0 400 50" preserveAspectRatio="none">
              <polyline className="pd-ecg-line" fill="none" strokeWidth="1.5"
                style={{ stroke: urgencyColor }}
                points="0,25 40,25 55,25 65,8 72,42 78,15 83,30 88,25 130,25 170,25 185,25 195,8 202,42 208,15 213,30 218,25 260,25 300,25 315,25 325,8 332,42 338,15 343,30 348,25 400,25" />
            </svg>
            <div className="pd-ecg-scan" style={{ background: `linear-gradient(90deg, transparent, ${urgencyColor}, transparent)` }} />
          </div>

          {/* Big countdown */}
          <div className="pd-life-countdown">
            <div className="pd-life-big" style={{ color: urgencyColor }}>
              {secondsLeft > 86400 ? daysLeft : secondsLeft > 3600 ? hoursLeft : minutesLeft > 0 ? minutesLeft : '0'}
            </div>
            <div className="pd-life-unit">
              {secondsLeft > 86400 ? `${daysLeft === 1 ? 'day' : 'days'} remaining`
                : secondsLeft > 3600 ? `${hoursLeft === 1 ? 'hour' : 'hours'} remaining`
                : minutesLeft > 0 ? `${minutesLeft === 1 ? 'minute' : 'minutes'} remaining`
                : 'Ready to trigger'}
            </div>
          </div>

          {/* Progress bar */}
          <div className="pd-life-bar-wrap">
            <div className="pd-life-bar">
              <div className="pd-life-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${urgencyColor}, ${urgency === 'safe' ? 'var(--cyan)' : urgencyColor})` }} />
            </div>
            <div className="pd-life-bar-labels">
              <span>Last check-in</span>
              <span>{pct}%</span>
              <span>Trigger</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="pd-life-timeline">
            <div className="pd-life-tl-item">
              <div className="pd-life-tl-dot pd-tl-done" />
              <div className="pd-life-tl-info">
                <span className="pd-life-tl-label">Last Check-in</span>
                <span className="pd-life-tl-val">{lastCheckinDate.toLocaleDateString()} · {lastCheckinDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
              </div>
            </div>
            <div className="pd-life-tl-line" />
            <div className="pd-life-tl-item">
              <div className={`pd-life-tl-dot ${daysLeft === 0 ? 'pd-tl-danger' : 'pd-tl-pending'}`} />
              <div className="pd-life-tl-info">
                <span className="pd-life-tl-label">Trigger Date</span>
                <span className="pd-life-tl-val">{triggerDate.toLocaleDateString()} · {triggerDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trigger card — shows when timer expired but not yet triggered */}
      {!plan.triggered && !plan.cancelled && daysLeft === 0 && (
        <div className="pd-trigger-card">
          <div className="pd-trigger-icon"><AlertTriangle size={20} strokeWidth={1.8} /></div>
          <div className="pd-trigger-info">
            <div className="pd-trigger-title">Inactivity Window Expired</div>
            <div className="pd-trigger-sub">This plan can now be triggered. Once triggered, heirs can claim their share.</div>
          </div>
          <button className="pd-trigger-btn" onClick={() => triggerPlan(planId)} disabled={trigPending || trigConfirming}>
            {trigPending ? <><Loader2 size={13} className="spin" /> Confirm...</> :
             trigConfirming ? <><Loader2 size={13} className="spin" /> Triggering...</> :
             trigSuccess ? <><CheckCircle2 size={13} /> Triggered</> :
             <><AlertTriangle size={13} /> Trigger Plan</>}
          </button>
        </div>
      )}

      {/* Triggered banner */}
      {plan.triggered && !plan.claimed && (
        <div className="pd-triggered-banner">
          <div className="pd-triggered-icon"><AlertTriangle size={18} strokeWidth={1.8} /></div>
          <div>
            <div className="pd-triggered-title">Plan Triggered</div>
            <div className="pd-triggered-sub">Heirs can now claim their share. Encrypted data is being decrypted by the KMS network.</div>
          </div>
        </div>
      )}

      {/* Claimed banner */}
      {plan.claimed && (
        <div className="pd-claimed-banner">
          <div className="pd-claimed-icon"><CheckCircle2 size={18} strokeWidth={1.8} /></div>
          <div>
            <div className="pd-claimed-title">Inheritance Claimed</div>
            <div className="pd-claimed-sub">Assets have been transferred to the designated heirs.</div>
          </div>
        </div>
      )}

      {/* Description */}
      {plan.description && (
        <div className="pd-desc">
          <div className="pd-desc-label">Owner's Message</div>
          <div className="pd-desc-text">{plan.description}</div>
        </div>
      )}

      {/* Info grid */}
      <div className="pd-grid">
        <div className="pd-card">
          <div className="pd-card-label">ETH Locked</div>
          {showBalance && ethBalance ? (
            <div className="pd-card-value">{ethBalance} ETH</div>
          ) : showBalance && decryptLoading ? (
            <div className="pd-card-value pd-encrypted"><Loader2 size={14} strokeWidth={2} className="spin" /> Decrypting...</div>
          ) : showBalance && decryptError ? (
            <div className="pd-card-value pd-encrypted"><Lock size={14} strokeWidth={2} /> {decryptError}</div>
          ) : (
            <div className="pd-card-value pd-encrypted"><Lock size={14} strokeWidth={2} /> ••••••</div>
          )}
          <button className="pd-reveal-btn" onClick={handleReveal} disabled={decryptLoading}>
            {decryptLoading ? (
              <><Loader2 size={11} strokeWidth={2} className="spin" /> Verifying...</>
            ) : showBalance ? (
              <><EyeOff size={11} strokeWidth={2} /> Hide</>
            ) : (
              <><Eye size={11} strokeWidth={2} /> Decrypt & Reveal</>
            )}
          </button>
        </div>
        <div className="pd-card">
          <div className="pd-card-label">Beneficiaries</div>
          <div className="pd-card-value">{plan.beneficiaryCount}</div>
        </div>
        <div className="pd-card">
          <div className="pd-card-label">{isInheritance ? 'Inactivity Window' : 'Unlock Date'}</div>
          <div className="pd-card-value">
            {isInheritance ? `${plan.inactivityDays.toString()} days` : new Date(Number(plan.unlockDate) * 1000).toLocaleDateString()}
          </div>
        </div>
        <div className="pd-card">
          <div className="pd-card-label">Last Check-in</div>
          <div className="pd-card-value">{lastCheckinDate.toLocaleDateString()}</div>
          <div className="pd-card-time">{lastCheckinDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
        </div>
      </div>

      {/* Details table */}
      <div className="pd-details">
        <div className="pd-details-title">Plan Details</div>
        <div className="pd-row"><span>Plan ID</span><code>{planId}</code></div>
        <div className="pd-row"><span>Owner</span><code>{plan.owner.slice(0, 6)}...{plan.owner.slice(-4)}</code></div>
        <div className="pd-row"><span>Type</span><span>{isInheritance ? 'Inheritance (Dead-Man\'s Switch)' : 'Future Goal (Time-Lock)'}</span></div>
        <div className="pd-row"><span>Triggered</span><span style={{ color: plan.triggered ? 'var(--gold)' : 'var(--green)' }}>{plan.triggered ? 'Yes' : 'No'}</span></div>
        <div className="pd-row"><span>Claimed</span><span>{plan.claimed ? 'Yes' : 'No'}</span></div>
        <div className="pd-row"><span>Encryption</span><span style={{ color: 'var(--cyan)' }}>eaddress + euint32 via fhEVM</span></div>
      </div>

      <div className="pd-etherscan">
        <a href={`https://sepolia.etherscan.io/address/${plan.owner}`} target="_blank" rel="noopener">
          View on Etherscan →
        </a>
      </div>
    </div>
  )
}

const styles = `
.page-container-wide { max-width: 800px; }
.pd-loading { display: flex; align-items: center; gap: 10px; justify-content: center; padding: 40px; color: var(--t3); font-size: 13px; }
.pd-back {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; color: var(--t3); font-size: 13px;
  cursor: pointer; margin-bottom: 20px; padding: 0; font-family: 'Inter', sans-serif;
  transition: color 0.15s;
}
.pd-back:hover { color: var(--cyan); }

.pd-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
.pd-icon {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pd-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: var(--t1); }
.pd-subtitle { font-size: 12px; color: var(--t3); margin-top: 2px; }
.pd-status {
  margin-left: auto; font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
  text-transform: uppercase; padding: 5px 12px; border-radius: 6px;
}
.pd-active { background: rgba(0,201,138,0.08); color: var(--green); border: 1px solid rgba(0,201,138,0.15); }
.pd-triggered { background: rgba(240,160,32,0.08); color: var(--gold); border: 1px solid rgba(240,160,32,0.15); }
.pd-cancelled { background: rgba(224,80,80,0.08); color: var(--red); border: 1px solid rgba(224,80,80,0.15); }

/* Proof of Life card */
.pd-life-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; padding: 20px 24px; margin-bottom: 16px;
  position: relative; overflow: hidden;
}
.pd-life-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--green), transparent);
  opacity: 0.3;
}

.pd-life-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.pd-life-left { display: flex; align-items: center; gap: 10px; }
.pd-life-dot { width: 8px; height: 8px; border-radius: 50%; animation: pd-pulse 2s ease-in-out infinite; flex-shrink: 0; }
@keyframes pd-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.pd-life-title { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: var(--t1); }
.pd-life-badge {
  font-size: 10px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
  padding: 3px 10px; border-radius: 5px;
}
.pd-life-safe { background: rgba(0,201,138,0.08); color: var(--green); border: 1px solid rgba(0,201,138,0.15); }
.pd-life-warning { background: rgba(240,160,32,0.08); color: var(--gold); border: 1px solid rgba(240,160,32,0.15); }
.pd-life-danger { background: rgba(224,80,80,0.08); color: var(--red); border: 1px solid rgba(224,80,80,0.15); }

.pd-life-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; background: var(--green); border: none; border-radius: 8px;
  color: #000; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.pd-life-btn:hover { box-shadow: 0 4px 16px rgba(0,201,138,0.3); transform: translateY(-1px); }
.pd-life-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

/* ECG + scanner */
.pd-life-ecg-wrap {
  position: relative; height: 40px; margin-bottom: 16px;
  overflow: hidden; border-radius: 8px;
  background: rgba(0,0,0,0.15);
}
.pd-life-ecg { width: 100%; height: 100%; opacity: 0.4; }
.pd-ecg-line {
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: pd-ecg-draw 3s linear infinite;
}
@keyframes pd-ecg-draw { to { stroke-dashoffset: 0; } }
.pd-ecg-scan {
  position: absolute; top: 0; bottom: 0;
  width: 60px; opacity: 0.3;
  animation: pd-scan-move 3s linear infinite;
}
@keyframes pd-scan-move { from { left: -60px; } to { left: 100%; } }

/* Countdown */
.pd-life-countdown { text-align: center; margin-bottom: 20px; }
.pd-life-big {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 56px; font-weight: 700; line-height: 1;
  letter-spacing: -0.03em; margin-bottom: 4px;
}
.pd-life-unit { font-size: 13px; color: var(--t3); }

/* Progress bar */
.pd-life-bar-wrap { margin-bottom: 20px; }
.pd-life-bar {
  height: 6px; border-radius: 3px;
  background: rgba(255,255,255,0.06); overflow: hidden; margin-bottom: 6px;
}
.pd-life-fill {
  height: 100%; border-radius: 3px;
  transition: width 0.5s ease;
  position: relative;
}
.pd-life-fill::after {
  content: ''; position: absolute; right: 0; top: -2px;
  width: 10px; height: 10px; border-radius: 50%;
  background: inherit; box-shadow: 0 0 8px rgba(0,201,138,0.4);
}
.pd-life-bar-labels {
  display: flex; justify-content: space-between;
  font-size: 10px; color: var(--t3);
  font-family: 'JetBrains Mono', monospace;
}

/* Timeline */
.pd-life-timeline {
  display: flex; align-items: center; gap: 0;
  padding: 14px 0 0;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.pd-life-tl-item { display: flex; align-items: center; gap: 8px; flex: 1; }
.pd-life-tl-item:last-child { justify-content: flex-end; text-align: right; }
.pd-life-tl-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid;
}
.pd-tl-done { background: var(--green); border-color: var(--green); }
.pd-tl-pending { background: transparent; border-color: var(--t3); }
.pd-tl-danger { background: var(--red); border-color: var(--red); }
.pd-life-tl-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); margin: 0 4px; }
.pd-life-tl-label { font-size: 11px; color: var(--t3); display: block; }
.pd-life-tl-val { font-size: 11px; color: var(--t2); font-family: 'JetBrains Mono', monospace; display: block; margin-top: 1px; }

.pd-desc {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; padding: 16px 18px; margin-bottom: 16px;
}
.pd-desc-label { font-size: 11px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
.pd-desc-text { font-size: 14px; color: var(--t2); line-height: 1.6; font-style: italic; }

.pd-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
.pd-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; padding: 16px;
}
.pd-card-label { font-size: 11px; color: var(--t3); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
.pd-card-value { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: var(--t1); }
.pd-card-time { font-size: 12px; color: var(--t3); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }

.pd-encrypted { display: flex; align-items: center; gap: 6px; color: var(--t3); font-size: 14px; letter-spacing: 0.05em; }
.pd-encrypted svg { color: var(--cyan); }
.pd-reveal-btn {
  display: flex; align-items: center; gap: 4px;
  margin-top: 8px; padding: 4px 10px; border-radius: 5px;
  background: rgba(0,212,232,0.06); border: 1px solid rgba(0,212,232,0.12);
  color: var(--cyan); font-size: 10px; font-weight: 600;
  cursor: pointer; transition: all 0.15s;
  font-family: 'Inter', sans-serif; letter-spacing: 0.02em;
}
.pd-reveal-btn:hover { background: rgba(0,212,232,0.1); border-color: rgba(0,212,232,0.2); }

.pd-details {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; overflow: hidden; margin-bottom: 12px;
}
.pd-details-title {
  padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.04);
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; color: var(--t1);
}
.pd-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 18px; border-bottom: 1px solid rgba(255,255,255,0.03);
  font-size: 13px;
}
.pd-row:last-child { border-bottom: none; }
.pd-row span:first-child { color: var(--t3); }
.pd-row span:last-child { color: var(--t1); font-weight: 500; }
.pd-row code { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--t2); }

.pd-etherscan { text-align: right; }
.pd-etherscan a {
  font-size: 12px; color: var(--cyan); font-family: 'JetBrains Mono', monospace;
  transition: opacity 0.15s;
}
.pd-etherscan a:hover { opacity: 0.8; }

/* Trigger card */
.pd-trigger-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 20px; margin-bottom: 16px; border-radius: 12px;
  background: rgba(224,80,80,0.04); border: 1px solid rgba(224,80,80,0.15);
}
.pd-trigger-icon { color: var(--red); flex-shrink: 0; }
.pd-trigger-info { flex: 1; }
.pd-trigger-title { font-size: 14px; font-weight: 600; color: var(--t1); margin-bottom: 2px; }
.pd-trigger-sub { font-size: 12px; color: var(--t3); }
.pd-trigger-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; background: var(--red); border: none; border-radius: 8px;
  color: #fff; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.pd-trigger-btn:hover { box-shadow: 0 4px 16px rgba(224,80,80,0.3); }
.pd-trigger-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Triggered banner */
.pd-triggered-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 16px 20px; margin-bottom: 16px; border-radius: 12px;
  background: rgba(240,160,32,0.04); border: 1px solid rgba(240,160,32,0.15);
}
.pd-triggered-icon { color: var(--gold); flex-shrink: 0; margin-top: 1px; }
.pd-triggered-title { font-size: 14px; font-weight: 600; color: var(--t1); margin-bottom: 2px; }
.pd-triggered-sub { font-size: 12px; color: var(--t3); line-height: 1.5; }

/* Claimed banner */
.pd-claimed-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 16px 20px; margin-bottom: 16px; border-radius: 12px;
  background: rgba(0,201,138,0.04); border: 1px solid rgba(0,201,138,0.15);
}
.pd-claimed-icon { color: var(--green); flex-shrink: 0; margin-top: 1px; }
.pd-claimed-title { font-size: 14px; font-weight: 600; color: var(--t1); margin-bottom: 2px; }
.pd-claimed-sub { font-size: 12px; color: var(--t3); line-height: 1.5; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media(max-width:800px) { .pd-grid { grid-template-columns: repeat(2, 1fr); } }
@media(max-width:640px) {
  .page-container-wide { max-width: 100%; }
  .pd-grid { grid-template-columns: 1fr; }
  .pd-header { flex-wrap: wrap; gap: 10px; }
  .pd-status { margin-left: 0; }
  .pd-life-big { font-size: 40px; }
  .pd-life-header { flex-wrap: wrap; gap: 10px; }
  .pd-life-btn { width: 100%; justify-content: center; }
  .pd-trigger-card { flex-direction: column; gap: 12px; align-items: flex-start; }
  .pd-trigger-btn { width: 100%; justify-content: center; }
}
`
