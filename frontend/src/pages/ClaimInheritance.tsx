import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useWalletClient, useReadContract } from 'wagmi'
import {
  Gift, Search, Lock, Loader2, CheckCircle2, ShieldCheck,
  Landmark, Target, Users, Clock, Hexagon, AlertTriangle, ArrowRight
} from 'lucide-react'
import { usePlan, useTimeUntilTrigger, useTriggerPlan } from '../hooks/usePlans'
import { CONTRACT_ADDRESS } from '../lib/constants'
import { INHERITX_ABI } from '../lib/contracts'

export default function ClaimInheritance() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [planIdInput, setPlanIdInput] = useState('')
  const [searchedPlanId, setSearchedPlanId] = useState<number | null>(null)
  const [claimStep, setClaimStep] = useState<'search' | 'found' | 'claiming' | 'claimed' | 'already_claimed'>('search')
  const [claimError, setClaimError] = useState('')

  const { plan } = usePlan(searchedPlanId ?? undefined)
  const { data: timeLeft } = useTimeUntilTrigger(searchedPlanId ?? undefined)
  const { triggerPlan, isPending: trigPending, isConfirming: trigConfirming, isSuccess: trigSuccess } = useTriggerPlan()

  const secondsLeft = timeLeft ? Number(timeLeft) : 0
  const daysLeft = Math.ceil(secondsLeft / 86400)
  const minutesLeft = Math.ceil(secondsLeft / 60)
  const canTrigger = plan && !plan.triggered && !plan.cancelled && daysLeft === 0
  const isTriggered = plan?.triggered || trigSuccess
  const planExists = plan && plan.owner !== '0x0000000000000000000000000000000000000000' && plan.beneficiaryCount > 0

  // Check heir status via contract view function: 0=not heir, 1=can claim, 2=already claimed
  const { data: rawHeirStatus } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: INHERITX_ABI,
    functionName: 'getHeirStatus',
    args: searchedPlanId !== null && address ? [BigInt(searchedPlanId), address] : undefined,
    query: { enabled: !!planExists && !!isTriggered && !!address && !!CONTRACT_ADDRESS && searchedPlanId !== null },
  })

  const heirStatus = rawHeirStatus === undefined ? null
    : Number(rawHeirStatus) === 2 ? 'already_claimed'
    : Number(rawHeirStatus) === 1 ? 'is_heir'
    : 'not_heir'

  const handleSearch = () => {
    if (!planIdInput) return
    setSearchedPlanId(Number(planIdInput))
    setClaimStep('found')
    setClaimError('')
  }

  // Claim transaction
  const { writeContract: writeClaim, data: claimHash, isPending: claimPending, error: claimWriteError } = useWriteContract()
  const { isLoading: claimConfirming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash })
  useEffect(() => {
    if (claimSuccess) setClaimStep('claimed')
  }, [claimSuccess])

  useEffect(() => {
    if (claimWriteError) {
      const msg = claimWriteError.message
      if (msg.includes('user rejected')) {
        setClaimError('Transaction rejected.')
      } else if (msg.includes('Already')) {
        setClaimError('This plan has already been claimed.')
      } else {
        setClaimError(msg.slice(0, 120))
      }
      setClaimStep('found')
    }
  }, [claimWriteError])

  const handleClaim = () => {
    if (!plan || !address || !CONTRACT_ADDRESS) return
    setClaimStep('claiming')
    setClaimError('')

    writeClaim({
      address: CONTRACT_ADDRESS,
      abi: INHERITX_ABI,
      functionName: 'claimDirect' as any,
      args: [BigInt(searchedPlanId!)] as any,
      gas: BigInt(5_000_000),
    })
  }

  const isInheritance = plan?.planType === 0

  return (
    <div className="page-container">
      <style>{styles}</style>
      <div className="cl-header">
        <Gift size={20} strokeWidth={1.8} style={{ color: 'var(--cyan)' }} />
        <div>
          <h1 className="pg-title">Claim Inheritance</h1>
          <p className="pg-sub">If you're a designated beneficiary, claim your assets here.</p>
        </div>
      </div>

      {/* Step 1: Search */}
      <div className="cl-card">
        <div className="cl-step">
          <div className="cl-step-header">
            <div className={`cl-step-num ${searchedPlanId !== null ? 'cl-step-done' : ''}`}>
              {searchedPlanId !== null ? <CheckCircle2 size={12} strokeWidth={2.5} /> : '1'}
            </div>
            <span className="cl-step-label">Enter Plan ID</span>
          </div>
          <p className="cl-step-desc">Enter the plan ID shared by the plan owner.</p>
          <div className="cl-input-row">
            <input
              className="cl-input"
              placeholder="Plan ID (e.g. 0)"
              value={planIdInput}
              onChange={e => setPlanIdInput(e.target.value)}
              type="number"
            />
            <button className="cl-search-btn" onClick={handleSearch} disabled={!planIdInput}>
              <Search size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Not found */}
        {searchedPlanId !== null && !planExists && claimStep !== 'search' && (
          <>
            <div className="cl-divider" />
            <div className="cl-not-found">
              <div className="cl-nf-icon">
                <Search size={24} strokeWidth={1.2} />
              </div>
              <h3 className="cl-nf-title">Plan #{searchedPlanId} not found</h3>
              <p className="cl-nf-sub">This plan doesn't exist or hasn't been created yet. Double-check the plan ID with the plan owner and try again.</p>
              <button className="cl-nf-retry" onClick={() => { setSearchedPlanId(null); setClaimStep('search'); setPlanIdInput('') }}>
                Try Another ID
              </button>
            </div>
          </>
        )}

        {/* Step 2: Plan details */}
        {planExists && claimStep !== 'search' && (
          <>
            <div className="cl-divider" />
            <div className="cl-step">
              <div className="cl-step-header">
                <div className="cl-step-num cl-step-done"><CheckCircle2 size={12} strokeWidth={2.5} /></div>
                <span className="cl-step-label">Plan Found</span>
              </div>

              {/* Plan info card */}
              <div className="cl-plan-card">
                <div className="cl-plan-header">
                  <div className="cl-plan-icon" style={{
                    background: isInheritance ? 'rgba(0,212,232,0.08)' : 'rgba(240,160,32,0.08)',
                    color: isInheritance ? 'var(--cyan)' : 'var(--gold)',
                  }}>
                    {isInheritance ? <Landmark size={18} strokeWidth={1.5} /> : <Target size={18} strokeWidth={1.5} />}
                  </div>
                  <div>
                    <div className="cl-plan-name">{plan.name}</div>
                    <div className="cl-plan-type">{isInheritance ? 'Inheritance Plan' : 'Future Goal Plan'} · Plan #{searchedPlanId}</div>
                  </div>
                  <div className={`cl-plan-status ${isTriggered ? 'cl-ps-triggered' : plan.cancelled ? 'cl-ps-cancelled' : 'cl-ps-active'}`}>
                    {plan.cancelled ? 'Cancelled' : isTriggered ? 'Triggered' : plan.claimed ? 'Claimed' : 'Active'}
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <div className="cl-plan-desc">
                    <div className="cl-plan-desc-label">Owner's Message</div>
                    <div className="cl-plan-desc-text">"{plan.description}"</div>
                  </div>
                )}

                {/* Plan stats */}
                <div className="cl-plan-stats">
                  <div className="cl-stat">
                    <Users size={12} strokeWidth={2} />
                    <span>{plan.beneficiaryCount} {plan.beneficiaryCount === 1 ? 'beneficiary' : 'beneficiaries'}</span>
                  </div>
                  <div className="cl-stat">
                    <Clock size={12} strokeWidth={2} />
                    <span>{isInheritance ? (Number(plan.inactivityDays) >= 1440 ? `${Math.round(Number(plan.inactivityDays)/1440)} day window` : Number(plan.inactivityDays) >= 60 ? `${Math.round(Number(plan.inactivityDays)/60)} hour window` : `${plan.inactivityDays.toString()} min window`) : new Date(Number(plan.unlockDate) * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="cl-stat">
                    <Lock size={12} strokeWidth={2} />
                    <span>ETH amount encrypted</span>
                  </div>
                  <div className="cl-stat">
                    <Hexagon size={12} strokeWidth={2} />
                    <span>Addresses encrypted via fhEVM</span>
                  </div>
                </div>

                {/* Owner address */}
                <div className="cl-plan-owner">
                  <span>Plan Owner</span>
                  <code>{plan.owner.slice(0, 8)}...{plan.owner.slice(-6)}</code>
                </div>
              </div>

              {/* Trigger needed */}
              {canTrigger && (
                <div className="cl-trigger-box">
                  <AlertTriangle size={14} strokeWidth={2} style={{ color: 'var(--gold)' }} />
                  <div className="cl-trigger-info">
                    <strong>Plan needs to be triggered first.</strong> The inactivity window has expired but nobody has triggered it yet.
                  </div>
                  <button className="cl-trigger-btn" onClick={() => triggerPlan(searchedPlanId!)} disabled={trigPending || trigConfirming}>
                    {trigPending || trigConfirming ? <><Loader2 size={12} className="spin" /> Triggering...</> : 'Trigger Now'}
                  </button>
                </div>
              )}

              {/* Not yet triggerable */}
              {!plan.triggered && !plan.cancelled && daysLeft > 0 && (
                <div className="cl-wait-box">
                  <Clock size={14} strokeWidth={2} style={{ color: 'var(--t3)' }} />
                  <span>This plan hasn't been triggered yet. {secondsLeft > 86400 ? `${daysLeft} days` : secondsLeft > 3600 ? `${Math.ceil(secondsLeft/3600)} hours` : minutesLeft > 0 ? `${minutesLeft} minutes` : 'Ready'} remaining until it can be triggered.</span>
                </div>
              )}

              {plan.cancelled && (
                <div className="cl-wait-box" style={{ borderColor: 'rgba(224,80,80,0.15)', background: 'rgba(224,80,80,0.04)' }}>
                  <AlertTriangle size={14} strokeWidth={2} style={{ color: 'var(--red)' }} />
                  <span>This plan has been cancelled by the owner. Assets were returned.</span>
                </div>
              )}

              {plan.claimed && (
                <div className="cl-wait-box" style={{ borderColor: 'rgba(0,201,138,0.15)', background: 'rgba(0,201,138,0.04)' }}>
                  <CheckCircle2 size={14} strokeWidth={2} style={{ color: 'var(--green)' }} />
                  <span>This plan has already been claimed.</span>
                </div>
              )}
            </div>

            {/* Step 3: Claim */}
            {isTriggered && !plan.cancelled && (
              <>
                <div className="cl-divider" />

                {!isConnected ? (
                  <div className="cl-step">
                    <div className="cl-step-header">
                      <div className="cl-step-num">3</div>
                      <span className="cl-step-label">Connect to Verify</span>
                    </div>
                    <p className="cl-connect-hint">Connect the wallet that was designated as heir to check eligibility.</p>
                  </div>
                ) : heirStatus === null ? (
                  <div className="cl-step">
                    <div className="cl-checking">
                      <Loader2 size={14} className="spin" style={{ color: 'var(--cyan)' }} />
                      <span>Checking if your wallet is a designated beneficiary...</span>
                    </div>
                  </div>
                ) : heirStatus === 'already_claimed' ? (
                  <div className="cl-already-claimed">
                    <div className="cl-ac-icon"><CheckCircle2 size={22} strokeWidth={1.5} /></div>
                    <h3 className="cl-ac-title">Already Claimed</h3>
                    <p className="cl-ac-sub">
                      All shares from this plan have been claimed. If you're a beneficiary, the ETH was sent to your wallet.
                    </p>
                    <p className="cl-ac-hint">Check your wallet balance to confirm.</p>
                  </div>
                ) : heirStatus === 'not_heir' ? (
                  <div className="cl-not-heir">
                    <div className="cl-nh-icon"><Lock size={22} strokeWidth={1.5} /></div>
                    <h3 className="cl-nh-title">Not a Designated Beneficiary</h3>
                    <p className="cl-nh-sub">
                      The connected wallet <code>{address?.slice(0, 6)}...{address?.slice(-4)}</code> is not among the beneficiaries for this plan.
                    </p>
                    <p className="cl-nh-hint">Make sure you're connected with the wallet that was designated by the plan owner. Try switching wallets.</p>
                  </div>
                ) : claimStep === 'claimed' ? (
                  <div className="cl-step">
                    <div className="cl-claimed-success">
                      <CheckCircle2 size={24} strokeWidth={1.5} style={{ color: 'var(--green)' }} />
                      <div className="cl-claimed-title">Inheritance Claimed!</div>
                      <div className="cl-claimed-sub">ETH has been sent to your wallet. Check your balance.</div>
                      {claimHash && (
                        <a className="cl-claimed-tx" href={`https://sepolia.etherscan.io/tx/${claimHash}`} target="_blank" rel="noopener">
                          View transaction →
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="cl-step">
                    <div className="cl-step-header">
                      <div className="cl-step-num cl-step-done"><CheckCircle2 size={12} strokeWidth={2.5} /></div>
                      <span className="cl-step-label">You're a Designated Beneficiary</span>
                    </div>

                    <div className="cl-verify-box">
                      <div className="cl-verify-row">
                        <ShieldCheck size={13} strokeWidth={2} style={{ color: 'var(--green)' }} />
                        <span>Your wallet has been verified as a designated heir for this plan.</span>
                      </div>
                      <div className="cl-verify-row">
                        <Lock size={13} strokeWidth={2} style={{ color: 'var(--cyan)' }} />
                        <span>Heir addresses are encrypted on-chain — only verified wallets can claim.</span>
                      </div>
                      <div className="cl-verify-row">
                        <Gift size={13} strokeWidth={2} style={{ color: 'var(--cyan)' }} />
                        <span>Your share will be sent directly to your connected wallet.</span>
                      </div>
                    </div>

                    {claimError && <div className="cl-error">{claimError}</div>}

                    {claimStep === 'claiming' ? (
                      <div className="cl-claiming">
                        <Loader2 size={16} className="spin" style={{ color: 'var(--cyan)' }} />
                        <span>{claimPending ? 'Approve in wallet...' : 'Verifying identity & transferring ETH...'}</span>
                      </div>
                    ) : (
                      <button className="cl-claim-btn" onClick={handleClaim}>
                        <Gift size={14} strokeWidth={2} /> Claim My Inheritance
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  )
}

const styles = `
.page-container { max-width: 620px; }
.cl-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 24px; }
.pg-title { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: var(--t1); margin-bottom: 2px; }
.pg-sub { font-size: 13px; color: var(--t3); }

.cl-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; padding: 24px;
}

.cl-step { }
.cl-step-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.cl-step-num {
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(0,212,232,0.06); border: 1px solid rgba(0,212,232,0.15);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: var(--cyan); flex-shrink: 0;
}
.cl-step-done { background: rgba(0,201,138,0.08); border-color: rgba(0,201,138,0.2); color: var(--green); }
.cl-step-label { font-size: 14px; font-weight: 600; color: var(--t1); }
.cl-step-desc { font-size: 12px; color: var(--t3); margin-bottom: 12px; line-height: 1.5; }
.cl-divider { height: 1px; background: rgba(255,255,255,0.04); margin: 20px 0; }

.cl-input-row { display: flex; gap: 8px; }
.cl-input {
  flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px; padding: 10px 14px; color: var(--t1); font-size: 13px;
  font-family: 'JetBrains Mono', monospace; outline: none; transition: border-color 0.15s;
}
.cl-input:focus { border-color: rgba(0,212,232,0.3); }
.cl-input::placeholder { color: rgba(255,255,255,0.2); }
.cl-search-btn {
  width: 40px; height: 40px; border-radius: 8px;
  background: rgba(0,212,232,0.08); border: 1px solid rgba(0,212,232,0.15);
  color: var(--cyan); cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.cl-search-btn:hover { background: rgba(0,212,232,0.12); }
.cl-search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Plan info card */
.cl-plan-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; overflow: hidden; margin-bottom: 14px;
}
.cl-plan-header {
  display: flex; align-items: center; gap: 12px; padding: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.cl-plan-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cl-plan-name { font-size: 15px; font-weight: 600; color: var(--t1); }
.cl-plan-type { font-size: 11px; color: var(--t3); margin-top: 1px; }
.cl-plan-status {
  margin-left: auto; font-size: 10px; font-weight: 600; letter-spacing: 0.04em;
  text-transform: uppercase; padding: 4px 10px; border-radius: 5px; white-space: nowrap;
}
.cl-ps-active { background: rgba(0,201,138,0.08); color: var(--green); border: 1px solid rgba(0,201,138,0.15); }
.cl-ps-triggered { background: rgba(240,160,32,0.08); color: var(--gold); border: 1px solid rgba(240,160,32,0.15); }
.cl-ps-cancelled { background: rgba(224,80,80,0.08); color: var(--red); border: 1px solid rgba(224,80,80,0.15); }

.cl-plan-desc { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.cl-plan-desc-label { font-size: 10px; color: var(--t3); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
.cl-plan-desc-text { font-size: 13px; color: var(--t2); font-style: italic; line-height: 1.5; }

.cl-plan-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 0;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.cl-stat {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 16px; font-size: 12px; color: var(--t2);
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.cl-stat svg { color: var(--cyan); flex-shrink: 0; }

.cl-plan-owner {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; font-size: 12px;
}
.cl-plan-owner span { color: var(--t3); }
.cl-plan-owner code { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--t2); }

/* Trigger box */
.cl-trigger-box {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 10px;
  background: rgba(240,160,32,0.04); border: 1px solid rgba(240,160,32,0.15);
  margin-bottom: 14px;
}
.cl-trigger-info { flex: 1; font-size: 12px; color: var(--t2); line-height: 1.5; }
.cl-trigger-info strong { color: var(--gold); }
.cl-trigger-btn {
  padding: 7px 14px; background: var(--gold); border: none; border-radius: 7px;
  color: #000; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 0.15s; white-space: nowrap;
  display: flex; align-items: center; gap: 5px;
}
.cl-trigger-btn:hover { box-shadow: 0 4px 12px rgba(240,160,32,0.3); }
.cl-trigger-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Wait/info boxes */
.cl-wait-box {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
  font-size: 12px; color: var(--t3); line-height: 1.5;
}

/* Verify box */
.cl-verify-box {
  display: flex; flex-direction: column; gap: 8px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
  border-radius: 10px; padding: 14px; margin-bottom: 14px;
}
.cl-verify-row {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 12px; color: var(--t2); line-height: 1.5;
}

.cl-error {
  padding: 10px 14px; border-radius: 8px;
  background: rgba(240,160,32,0.04); border: 1px solid rgba(240,160,32,0.12);
  font-size: 12px; color: var(--gold); margin-bottom: 14px; line-height: 1.5;
}

.cl-claiming {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--t2); padding: 8px 0;
}

.cl-claim-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 24px; background: var(--green);
  border: none; border-radius: 10px; color: #000;
  font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.cl-claim-btn:hover { box-shadow: 0 6px 24px rgba(0,201,138,0.3); transform: translateY(-1px); }

.cl-connect-hint { font-size: 12px; color: var(--t3); font-style: italic; }

.cl-heirs-info {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px 14px; border-radius: 8px;
  background: rgba(0,212,232,0.03); border: 1px solid rgba(0,212,232,0.1);
  font-size: 12px; color: var(--t2); line-height: 1.5; margin-bottom: 14px;
}
.cl-heirs-info svg { color: var(--cyan); flex-shrink: 0; margin-top: 2px; }

.cl-claimed-success {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 16px 0; gap: 6px;
}
.cl-claimed-title { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; color: var(--t1); }
.cl-claimed-sub { font-size: 13px; color: var(--t2); margin-bottom: 8px; }
.cl-claimed-tx { font-size: 12px; color: var(--cyan); font-family: 'JetBrains Mono', monospace; transition: opacity 0.15s; }
.cl-claimed-tx:hover { opacity: 0.8; }

/* Not found */
.cl-not-found {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 24px 16px;
}
.cl-nf-icon {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  color: var(--t3); margin-bottom: 16px;
}
.cl-nf-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px; font-weight: 600; color: var(--t1); margin-bottom: 6px;
}
.cl-nf-sub {
  font-size: 13px; color: var(--t3); line-height: 1.6; max-width: 320px; margin-bottom: 18px;
}
.cl-nf-retry {
  padding: 8px 18px; border-radius: 8px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: var(--t2); font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif;
}
.cl-nf-retry:hover { border-color: rgba(0,212,232,0.2); color: var(--cyan); }

/* Already claimed */
.cl-already-claimed {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 20px 16px;
}
.cl-ac-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(0,201,138,0.06); border: 1px solid rgba(0,201,138,0.15);
  display: flex; align-items: center; justify-content: center;
  color: var(--green); margin-bottom: 14px;
}
.cl-ac-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px; font-weight: 600; color: var(--t1); margin-bottom: 6px;
}
.cl-ac-sub {
  font-size: 13px; color: var(--t2); max-width: 360px; line-height: 1.6; margin-bottom: 8px;
}
.cl-ac-hint {
  font-size: 12px; color: var(--green); max-width: 340px; line-height: 1.5;
}

/* Not a heir */
.cl-not-heir {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 20px 16px;
}
.cl-nh-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: rgba(224,80,80,0.06); border: 1px solid rgba(224,80,80,0.15);
  display: flex; align-items: center; justify-content: center;
  color: var(--red); margin-bottom: 14px;
}
.cl-nh-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px; font-weight: 600; color: var(--t1); margin-bottom: 6px;
}
.cl-nh-sub {
  font-size: 13px; color: var(--t2); max-width: 360px; line-height: 1.6; margin-bottom: 8px;
}
.cl-nh-hint {
  font-size: 12px; color: var(--t3); max-width: 340px; line-height: 1.5;
}

.cl-checking {
  display: flex; align-items: center; gap: 10px; justify-content: center;
  padding: 20px; font-size: 13px; color: var(--t2);
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media(max-width:640px) {
  .page-container { max-width: 100%; }
  .cl-plan-stats { grid-template-columns: 1fr; }
  .cl-plan-header { flex-wrap: wrap; gap: 10px; }
  .cl-plan-status { margin-left: 0; }
  .cl-trigger-box { flex-direction: column; align-items: flex-start; gap: 10px; }
  .cl-trigger-btn { width: 100%; justify-content: center; }
}
`
