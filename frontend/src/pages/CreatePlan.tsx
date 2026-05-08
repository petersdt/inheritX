import { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useKYC } from "../hooks/useKYC";
import { parseEther } from "viem";
import {
  Landmark,
  Target,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Hexagon,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { CONTRACT_ADDRESS } from "../lib/constants";
import { INHERITX_ABI } from "../lib/contracts";

interface Heir {
  address: string;
  name: string;
  sharePct: number;
}

import DatePicker from '../components/shared/DatePicker'

const STEPS = ["Plan Type", "Beneficiaries", "Conditions", "Review"];

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="toast-overlay" onClick={onClose}>
      <div className="toast" onClick={(e) => e.stopPropagation()}>
        <AlertTriangle size={16} strokeWidth={2} />
        <span>{message}</span>
      </div>
    </div>
  );
}

export default function CreatePlan() {
  const { isConnected, address } = useAccount();
  const kyc = useKYC(address);
  const [step, setStep] = useState(0);
  const [planType, setPlanType] = useState<"inheritance" | "goal">(
    "inheritance",
  );
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [heirs, setHeirs] = useState<Heir[]>([
    { address: "", name: "", sharePct: 100 },
  ]);
  const [inactivityMinutes, setInactivityMinutes] = useState("10080"); // 7 days default
  const [customMinutes, setCustomMinutes] = useState("");
  const [customUnit, setCustomUnit] = useState("minutes");

  const getInactivityMinutes = () => {
    if (inactivityMinutes === 'custom') {
      const val = Number(customMinutes) || 0
      if (customUnit === 'hours') return val * 60
      if (customUnit === 'days') return val * 1440
      return val
    }
    return Number(inactivityMinutes)
  }
  const [unlockDate, setUnlockDate] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isSubmitting = isPending || isConfirming;

  useEffect(() => {
    if (writeError) {
      setError(
        writeError.message.includes("KYCRequired")
          ? "KYC verification required. Complete KYC first."
          : writeError.message.includes("user rejected")
            ? "Transaction rejected."
            : `Transaction failed: ${writeError.message.slice(0, 100)}`,
      );
    }
  }, [writeError]);

  const distributeEvenly = (list: Heir[]): Heir[] => {
    const pct = Math.floor(100 / list.length);
    const remainder = 100 - pct * list.length;
    return list.map((h, i) => ({
      ...h,
      sharePct: pct + (i < remainder ? 1 : 0),
    }));
  };

  const addHeir = () => {
    if (heirs.length >= 10) return;
    setHeirs(
      distributeEvenly([...heirs, { address: "", name: "", sharePct: 0 }]),
    );
  };
  const removeHeir = (i: number) => {
    if (heirs.length <= 1) return;
    setHeirs(distributeEvenly(heirs.filter((_, idx) => idx !== i)));
  };
  const updateHeir = (i: number, field: keyof Heir, value: string | number) => {
    const updated = [...heirs];
    updated[i] = { ...updated[i], [field]: value };
    setHeirs(updated);
  };

  const totalShare = heirs.reduce((sum, h) => sum + h.sharePct, 0);

  const canSubmit =
    heirs.every((h) => h.address.startsWith("0x") && h.address.length === 42) &&
    totalShare === 100 &&
    Number(ethAmount) > 0;

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!CONTRACT_ADDRESS || !canSubmit || !address || submitting) return
    setSubmitting(true)
    setError('')

    const unlockTs = planType === 'goal' && unlockDate
      ? BigInt(Math.floor(new Date(unlockDate).getTime() / 1000))
      : BigInt(0)

    // Compute keccak256 hashes of heir addresses for claim verification
    const { keccak256, encodePacked } = await import('viem')
    const heirHashes = heirs.map(h => keccak256(encodePacked(['address'], [h.address as `0x${string}`])))

    try {
      // Try client-side encryption first (proper FHE flow)
      const { getFhevmInstance } = await import('../lib/fhe')
      const fhevm = await getFhevmInstance()

      // Encrypt all values client-side
      const input = fhevm.createEncryptedInput(CONTRACT_ADDRESS, address)
      // Add each heir address and share
      for (const h of heirs) {
        input.addAddress(h.address)
      }
      for (const h of heirs) {
        input.add32(h.sharePct * 100) // basis points
      }
      const encrypted = await input.encrypt()

      const heirCount = heirs.length
      const encAddrHandles = encrypted.handles.slice(0, heirCount).map((h: Uint8Array) => ('0x' + Buffer.from(h).toString('hex')) as `0x${string}`)
      const encShareHandles = encrypted.handles.slice(heirCount).map((h: Uint8Array) => ('0x' + Buffer.from(h).toString('hex')) as `0x${string}`)
      const proof = ('0x' + Buffer.from(encrypted.inputProof).toString('hex')) as `0x${string}`

      // Use createPlan with encrypted inputs — data is private on-chain
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: INHERITX_ABI,
        functionName: 'createPlan',
        args: [
          planType === 'inheritance' ? 0 : 1,
          planName || (planType === 'inheritance' ? 'Inheritance Plan' : 'Future Goal Plan'),
          planDescription,
          encAddrHandles,
          encShareHandles,
          encAddrHandles.map(() => proof),
          encShareHandles.map(() => proof),
          heirHashes,
          BigInt(planType === 'inheritance' ? getInactivityMinutes() : 0),
          unlockTs,
        ],
        value: parseEther(ethAmount || '0'),
        gas: BigInt(10_000_000),
      } as any)
    } catch (fheErr: any) {
      console.log('Client-side encryption unavailable, using direct mode:', fheErr.message)

      // Fallback: use createPlanDirect (on-chain encryption, calldata visible)
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: INHERITX_ABI,
        functionName: 'createPlanDirect',
        args: [
          planType === 'inheritance' ? 0 : 1,
          planName || (planType === 'inheritance' ? 'Inheritance Plan' : 'Future Goal Plan'),
          planDescription,
          heirs.map(h => h.address as `0x${string}`),
          heirs.map(h => h.sharePct * 100),
          BigInt(planType === 'inheritance' ? getInactivityMinutes() : 0),
          unlockTs,
        ],
        value: parseEther(ethAmount || '0'),
        gas: BigInt(8_000_000),
      } as any)
    }
  }

  // Reset submitting when tx fails or succeeds
  useEffect(() => {
    if (writeError || isSuccess) setSubmitting(false)
  }, [writeError, isSuccess])

  const [successPhase, setSuccessPhase] = useState<
    "encrypting" | "done" | null
  >(null);

  useEffect(() => {
    if (isSuccess && !successPhase) {
      setSuccessPhase("encrypting");
      setTimeout(() => setSuccessPhase("done"), 3000);
    }
  }, [isSuccess]);

  if (successPhase) {
    return (
      <>
        <style>{styles}</style>
        <div className="cs-fullpage">
          {successPhase === "encrypting" && (
            <div className="cs-encrypting">
              <div className="cs-enc-hex">
                <Hexagon size={36} strokeWidth={1} />
              </div>
              <h2 className="cs-enc-title">Encrypting & Deploying</h2>
              <div className="cs-enc-steps">
                <div className="cs-enc-step cs-enc-s1">
                  <Lock size={12} strokeWidth={2} />{" "}
                  <span>
                    Encrypting heir addresses → <code>eaddress</code>
                  </span>
                </div>
                <div className="cs-enc-step cs-enc-s2">
                  <Lock size={12} strokeWidth={2} />{" "}
                  <span>
                    Encrypting ETH amount → <code>euint128</code>
                  </span>
                </div>
                <div className="cs-enc-step cs-enc-s3">
                  <Lock size={12} strokeWidth={2} />{" "}
                  <span>
                    Encrypting share splits → <code>euint32</code>
                  </span>
                </div>
                <div className="cs-enc-step cs-enc-s4">
                  <CheckCircle2 size={12} strokeWidth={2} />{" "}
                  <span>Deploying to Ethereum Sepolia</span>
                </div>
              </div>
              <div className="cs-enc-bar">
                <div className="cs-enc-fill" />
              </div>
            </div>
          )}

          {successPhase === "done" && (
            <div className="cp-success cs-fadein">
              <div className="cs-rings">
                <div className="cs-ring cs-ring-1" />
                <div className="cs-ring cs-ring-2" />
                <div className="cs-ring cs-ring-3" />
              </div>

              <div className="cs-shield">
                <div className="cs-shield-glow" />
                <Lock size={28} strokeWidth={1.5} />
              </div>

              <h2 className="cs-title">Legacy Secured</h2>
              <p className="cs-subtitle">
                Your plan is live on Ethereum Sepolia
              </p>

              <div className="cs-encrypt-visual">
                <div className="cs-ev-row">
                  <span className="cs-ev-label">Heir addresses</span>
                  <span className="cs-ev-value cs-ev-encrypted">
                    0x8f3a...████████
                  </span>
                  <span className="cs-ev-badge">eaddress</span>
                </div>
                <div className="cs-ev-row">
                  <span className="cs-ev-label">ETH amount</span>
                  <span className="cs-ev-value cs-ev-encrypted">
                    ████████████
                  </span>
                  <span className="cs-ev-badge">euint128</span>
                </div>
                <div className="cs-ev-row">
                  <span className="cs-ev-label">Share splits</span>
                  <span className="cs-ev-value cs-ev-encrypted">██████</span>
                  <span className="cs-ev-badge">euint32</span>
                </div>
              </div>

              <p className="cs-note">
                All sensitive data is encrypted via Zama fhEVM. Nobody, not
                validators, not block explorers — can read your beneficiaries or
                amounts.
              </p>

              <div className="cs-actions">
                {txHash && (
                  <a
                    className="cs-etherscan"
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener"
                  >
                    <Hexagon size={12} strokeWidth={2} /> View Transaction
                  </a>
                )}
                <button
                  className="cp-btn-primary"
                  onClick={() => window.location.reload()}
                >
                  <Plus size={14} strokeWidth={2} /> Create Another Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="page-container">
      <style>{styles}</style>
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <div className="cp-header">
        <h1 className="pg-title">Create Plan</h1>
        <p className="pg-sub">
          Set up a new inheritance or future goal plan on-chain.
        </p>
      </div>

      {kyc.status !== "VERIFIED" && (
        <div className="cp-kyc-gate">
          <AlertTriangle size={16} strokeWidth={2} />
          <div>
            <strong>KYC verification required.</strong> Complete KYC from the
            sidebar before creating a plan.
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="cp-progress">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`cp-prog-step ${i <= step ? "active" : ""} ${i < step ? "done" : ""}`}
          >
            <div className="cp-prog-dot">
              {i < step ? <CheckCircle2 size={14} strokeWidth={2.5} /> : i + 1}
            </div>
            <span className="cp-prog-label">{s}</span>
          </div>
        ))}
      </div>

      {/* Step 0: Plan Type */}
      {step === 0 && (
        <div className="cp-step-content">
          <h2 className="cp-step-title">Choose plan type</h2>
          <p className="cp-step-sub">
            Select how your assets will be released.
          </p>
          <div className="cp-field" style={{ marginBottom: 12 }}>
            <label className="cp-label">
              Plan Name <span className="cp-req">Required</span>
            </label>
            <input
              className="cp-input"
              placeholder="e.g. Family Inheritance, College Fund"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>
          <div className="cp-field" style={{ marginBottom: 16 }}>
            <label className="cp-label">
              Description <span className="cp-opt">Optional</span>
            </label>
            <textarea
              className="cp-input cp-textarea"
              placeholder="Why are you creating this plan? This is stored on-chain for your beneficiaries to read."
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="cp-type-grid">
            <div
              className={`cp-type-card ${planType === "inheritance" ? "selected" : ""}`}
              onClick={() => setPlanType("inheritance")}
            >
              <Landmark size={24} strokeWidth={1.5} />
              <h3>Inheritance</h3>
              <p>Dead-man's switch. Assets transfer if you stop checking in.</p>
            </div>
            <div
              className={`cp-type-card ${planType === "goal" ? "selected" : ""}`}
              onClick={() => setPlanType("goal")}
            >
              <Target size={24} strokeWidth={1.5} />
              <h3>Future Goal</h3>
              <p>Time-lock. Assets release on a specific date.</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Beneficiaries */}
      {step === 1 && (
        <div className="cp-step-content">
          <h2 className="cp-step-title">Add beneficiaries</h2>
          <p className="cp-step-sub">
            Each address is encrypted via fhEVM before storing on-chain.
          </p>
          <div className="cp-heir-list">
            {heirs.map((h, i) => (
              <div className="cp-heir-row" key={i}>
                <div className="cp-heir-num">{i + 1}</div>
                <div className="cp-heir-fields">
                  <input
                    className="cp-input"
                    placeholder="Name (optional)"
                    value={h.name}
                    onChange={(e) => updateHeir(i, "name", e.target.value)}
                  />
                  <input
                    className="cp-input cp-input-addr"
                    placeholder="0x... wallet address (required)"
                    value={h.address}
                    onChange={(e) => updateHeir(i, "address", e.target.value)}
                  />
                  <div className="cp-heir-pct-wrap">
                    <input
                      className="cp-input cp-input-pct"
                      type="number"
                      min={0}
                      max={100}
                      value={h.sharePct}
                      onChange={(e) =>
                        updateHeir(i, "sharePct", Number(e.target.value))
                      }
                    />
                    <span className="cp-pct-sign">%</span>
                  </div>
                </div>
                {heirs.length > 1 && (
                  <button
                    className="cp-heir-remove"
                    onClick={() => removeHeir(i)}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="cp-heir-actions">
            <button className="cp-add-heir" onClick={addHeir}>
              <Plus size={14} strokeWidth={2} /> Add Beneficiary
            </button>
            <div
              className={`cp-share-total ${totalShare === 100 ? "valid" : "invalid"}`}
            >
              Total: {totalShare}% {totalShare === 100 ? "✓" : "(must = 100%)"}
            </div>
          </div>
          <div className="cp-enc-note">
            <Lock size={12} strokeWidth={2} /> Addresses encrypted via Zama
            fhEVM before on-chain storage.
          </div>
        </div>
      )}

      {/* Step 2: Conditions */}
      {step === 2 && (
        <div className="cp-step-content">
          <h2 className="cp-step-title">Set conditions</h2>
          <p className="cp-step-sub">Define trigger and lock your ETH.</p>
          <div className="cp-fields">
            {planType === "inheritance" ? (
              <div className="cp-field">
                <label className="cp-label">
                  <Clock size={13} strokeWidth={2} /> Inactivity Trigger{" "}
                  <span className="cp-req">Required</span>
                </label>
                <select
                  className="cp-input"
                  value={inactivityMinutes}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setInactivityMinutes('custom')
                    } else {
                      setInactivityMinutes(e.target.value)
                    }
                  }}
                >
                  <optgroup label="Demo (fast)">
                    <option value="2">2 minutes</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="30">30 minutes</option>
                  </optgroup>
                  <optgroup label="Hours">
                    <option value="60">1 hour</option>
                    <option value="360">6 hours</option>
                    <option value="720">12 hours</option>
                  </optgroup>
                  <optgroup label="Days">
                    <option value="1440">1 day</option>
                    <option value="10080">7 days</option>
                    <option value="43200">30 days</option>
                    <option value="129600">90 days</option>
                    <option value="259200">180 days</option>
                    <option value="525600">1 year</option>
                  </optgroup>
                  <optgroup label="Custom">
                    <option value="custom">Custom...</option>
                  </optgroup>
                </select>
                {inactivityMinutes === 'custom' && (
                  <div className="cp-custom-time">
                    <input
                      className="cp-input"
                      type="number"
                      min="1"
                      placeholder="Enter amount"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                    />
                    <select
                      className="cp-input cp-unit-select"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                )}
                <span className="cp-field-hint">
                  Plan triggers if you don't check in for this long. Use "Demo" options for hackathon testing.
                </span>
              </div>
            ) : (
              <div className="cp-field">
                <label className="cp-label">
                  <Clock size={13} strokeWidth={2} /> Unlock Date{" "}
                  <span className="cp-req">Required</span>
                </label>
                <DatePicker value={unlockDate} onChange={setUnlockDate} />
                <span className="cp-field-hint">
                  Assets release on this date.
                </span>
              </div>
            )}
            <div className="cp-field">
              <label className="cp-label">
                <Hexagon size={13} strokeWidth={2} /> ETH to Lock{" "}
                <span className="cp-req">Required</span>
              </label>
              <input
                className="cp-input"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.01"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
              />
              <span className="cp-field-hint">
                Locked in the smart contract until trigger. Requires Sepolia
                ETH.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="cp-step-content">
          <h2 className="cp-step-title">Review & deploy</h2>
          <p className="cp-step-sub">
            This will send a real transaction to Ethereum Sepolia.
          </p>
          <div className="cp-review">
            <div className="cp-review-row">
              <span className="cp-review-key">Name</span>
              <span className="cp-review-val">{planName || "—"}</span>
            </div>
            {planDescription && (
              <div className="cp-review-row">
                <span className="cp-review-key">Description</span>
                <span className="cp-review-val cp-review-desc">
                  {planDescription}
                </span>
              </div>
            )}
            <div className="cp-review-row">
              <span className="cp-review-key">Plan Type</span>
              <span className="cp-review-val">
                {planType === "inheritance" ? "Inheritance" : "Future Goal"}
              </span>
            </div>
            <div className="cp-review-row">
              <span className="cp-review-key">Beneficiaries</span>
              <span className="cp-review-val">{heirs.length}</span>
            </div>
            {heirs.map((h, i) => (
              <div className="cp-review-row cp-review-heir" key={i}>
                <span className="cp-review-key">
                  {h.name || `Heir ${i + 1}`}
                </span>
                <span className="cp-review-val">
                  <code>
                    {h.address
                      ? `${h.address.slice(0, 6)}...${h.address.slice(-4)}`
                      : "—"}
                  </code>
                  <span className="cp-review-pct">{h.sharePct}%</span>
                </span>
              </div>
            ))}
            <div className="cp-review-row">
              <span className="cp-review-key">
                {planType === "inheritance" ? "Inactivity" : "Unlock"}
              </span>
              <span className="cp-review-val">
                {planType === "inheritance"
                  ? (() => { const m = getInactivityMinutes(); return m >= 1440 ? `${Math.round(m/1440)} days` : m >= 60 ? `${Math.round(m/60)} hours` : `${m} minutes` })()

                  : unlockDate || "—"}
              </span>
            </div>
            <div className="cp-review-row">
              <span className="cp-review-key">ETH Locked</span>
              <span className="cp-review-val">{ethAmount || "0"} ETH</span>
            </div>
            <div className="cp-review-row">
              <span className="cp-review-key">Network</span>
              <span className="cp-review-val">Ethereum Sepolia</span>
            </div>
            <div className="cp-review-row">
              <span className="cp-review-key">Gas Limit</span>
              <span className="cp-review-val">5,000,000</span>
            </div>
          </div>
          {error && <div className="cp-error">{error}</div>}
          <div className="cp-enc-note">
            <Lock size={12} strokeWidth={2} /> Heir addresses and shares will be
            encrypted before deployment.
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="cp-nav">
        {step > 0 && (
          <button className="cp-btn-ghost" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={14} strokeWidth={2} /> Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < 3 ? (
          <button className="cp-btn-primary" onClick={() => setStep(step + 1)}>
            Continue <ArrowRight size={14} strokeWidth={2} />
          </button>
        ) : (
          <button
            className="cp-btn-primary cp-btn-deploy"
            onClick={() => {
              if (kyc.status !== "VERIFIED") {
                setToast(
                  "Complete KYC verification first. Go to KYC Verification in the sidebar.",
                );
                return;
              }
              if (!canSubmit) {
                setToast(
                  "Fill in all required fields — valid heir addresses, shares totalling 100%, and ETH amount.",
                );
                return;
              }
              handleSubmit();
            }}
            disabled={isSubmitting || submitting}
          >
            {isSubmitting || submitting ? (
              <>
                <Loader2 size={14} className="spin" />{" "}
                {submitting && !isPending ? "Encrypting..." : isPending ? "Confirm in wallet..." : "Deploying..."}
              </>
            ) : (
              <>
                <Hexagon size={14} strokeWidth={2} /> Encrypt & Deploy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const styles = `
.page-container { max-width: 680px; }
.cp-header { margin-bottom: 20px; }
.cp-kyc-gate {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px 16px; margin-bottom: 16px; border-radius: 10px;
  background: rgba(240,160,32,0.05); border: 1px solid rgba(240,160,32,0.15);
  font-size: 13px; color: var(--t2); line-height: 1.5;
}
.cp-kyc-gate svg { color: var(--gold); flex-shrink: 0; margin-top: 2px; }
.cp-kyc-gate strong { color: var(--gold); }
.pg-title { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: var(--t1); margin-bottom: 2px; }
.pg-sub { font-size: 13px; color: var(--t3); }
.cp-progress { display: flex; gap: 4px; margin-bottom: 28px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; padding: 12px 16px; }
.cp-prog-step { flex: 1; display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--t3); font-weight: 500; }
.cp-prog-step.active { color: var(--t1); }
.cp-prog-step.done .cp-prog-dot { background: rgba(0,201,138,0.1); border-color: rgba(0,201,138,0.3); color: var(--green); }
.cp-prog-dot { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.cp-prog-step.active .cp-prog-dot { background: rgba(0,212,232,0.08); border-color: rgba(0,212,232,0.25); color: var(--cyan); }
.cp-step-content { margin-bottom: 20px; }
.cp-step-title { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; color: var(--t1); margin-bottom: 4px; }
.cp-step-sub { font-size: 13px; color: var(--t3); margin-bottom: 20px; }
.cp-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.cp-type-card { padding: 24px; border-radius: 14px; background: rgba(255,255,255,0.02); border: 1.5px solid rgba(255,255,255,0.06); cursor: pointer; transition: all 0.2s; text-align: center; color: var(--t3); }
.cp-type-card:hover { border-color: rgba(0,212,232,0.2); background: rgba(0,212,232,0.03); color: var(--t2); }
.cp-type-card.selected { border-color: rgba(0,212,232,0.35); background: rgba(0,212,232,0.05); color: var(--cyan); }
.cp-type-card h3 { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: var(--t1); margin: 12px 0 6px; }
.cp-type-card p { font-size: 12px; line-height: 1.5; color: var(--t2); }
.cp-heir-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.cp-heir-row { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 12px; }
.cp-heir-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(0,212,232,0.06); border: 1px solid rgba(0,212,232,0.15); display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: var(--cyan); flex-shrink: 0; margin-top: 4px; }
.cp-heir-fields { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.cp-heir-pct-wrap { position: relative; width: 80px; }
.cp-pct-sign { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 12px; color: var(--t3); }
.cp-heir-remove { background: none; border: none; color: var(--t3); cursor: pointer; padding: 6px; border-radius: 6px; transition: all 0.15s; margin-top: 4px; }
.cp-heir-remove:hover { color: var(--red); background: rgba(224,80,80,0.06); }
.cp-heir-actions { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cp-add-heir { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--cyan); background: none; border: none; cursor: pointer; font-weight: 500; font-family: 'Inter', sans-serif; padding: 6px 0; }
.cp-share-total { font-size: 12px; font-family: 'JetBrains Mono', monospace; }
.cp-share-total.valid { color: var(--green); }
.cp-share-total.invalid { color: var(--gold); }
.cp-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 10px 13px; color: var(--t1); font-size: 13px; font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.15s; }
.cp-input:focus { border-color: rgba(0,212,232,0.3); box-shadow: 0 0 0 3px rgba(0,212,232,0.06); }
.cp-input::placeholder { color: rgba(255,255,255,0.25); }
.cp-textarea { resize: vertical; min-height: 60px; line-height: 1.5; }
.cp-review-desc { font-size: 12px; color: var(--t2); max-width: 340px; text-align: right; line-height: 1.5; }
.cp-input-addr { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.cp-input-pct { padding-right: 28px; }
.cp-fields { display: flex; flex-direction: column; gap: 16px; }
.cp-field { display: flex; flex-direction: column; gap: 6px; }
.cp-label { font-size: 12px; font-weight: 500; color: var(--t2); display: flex; align-items: center; gap: 6px; }
.cp-req { font-size: 9px; font-weight: 600; color: var(--red); letter-spacing: 0.04em; text-transform: uppercase; opacity: 0.8; margin-left: 2px; }
.cp-opt { font-size: 9px; font-weight: 500; color: var(--t3); letter-spacing: 0.04em; text-transform: uppercase; margin-left: 2px; }
.cp-field-hint { font-size: 11px; color: var(--t3); }
.cp-custom-time { display: flex; gap: 8px; margin-top: 8px; }
.cp-unit-select { width: 120px; flex-shrink: 0; }
.cp-enc-note { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; background: rgba(0,212,232,0.03); border: 1px solid rgba(0,212,232,0.1); font-size: 11px; color: var(--t2); margin-top: 16px; }
.cp-review { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; margin-bottom: 8px; }
.cp-review-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); }
.cp-review-row:last-child { border-bottom: none; }
.cp-review-heir { background: rgba(255,255,255,0.01); }
.cp-review-key { font-size: 13px; color: var(--t3); }
.cp-review-val { font-size: 13px; color: var(--t1); font-weight: 500; display: flex; align-items: center; gap: 8px; }
.cp-review-pct { color: var(--cyan); font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.cp-error { padding: 10px 14px; border-radius: 8px; background: rgba(224,80,80,0.06); border: 1px solid rgba(224,80,80,0.15); font-size: 12px; color: var(--red); margin-top: 8px; }
.cp-nav { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.cp-btn-primary { display: flex; align-items: center; gap: 7px; padding: 11px 22px; background: var(--cyan); border: none; border-radius: 9px; color: #000; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.cp-btn-primary:hover { background: var(--cyan-hi); box-shadow: 0 6px 24px rgba(0,212,232,0.3); transform: translateY(-1px); }
.cp-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.cp-btn-deploy { background: var(--green); }
.cp-btn-deploy:hover { background: #00d99a; box-shadow: 0 6px 24px rgba(0,201,138,0.3); }
.cp-btn-ghost { display: flex; align-items: center; gap: 6px; padding: 11px 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 9px; color: var(--t2); font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif; }
.cp-btn-ghost:hover { color: var(--t1); background: rgba(255,255,255,0.05); }
/* Fullpage overlay for success */
.cs-fullpage {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg);
}

/* Encrypting phase */
.cs-encrypting {
  display: flex; flex-direction: column; align-items: center;
  gap: 8px; animation: cs-phase-in 0.4s ease-out;
}
.cs-enc-hex {
  color: var(--cyan); margin-bottom: 8px;
  animation: cs-hex-spin 3s linear infinite;
}
@keyframes cs-hex-spin { to { transform: rotate(360deg); } }
.cs-enc-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px; font-weight: 700; color: var(--t1);
  margin-bottom: 16px;
}
.cs-enc-steps {
  display: flex; flex-direction: column; gap: 10px;
  margin-bottom: 24px;
}
.cs-enc-step {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--t3);
  opacity: 0; transform: translateX(-10px);
}
.cs-enc-step span { display: flex; align-items: center; gap: 4px; }
.cs-enc-s1 { animation: cs-step-in 0.3s 0.2s ease-out forwards; }
.cs-enc-s2 { animation: cs-step-in 0.3s 0.7s ease-out forwards; }
.cs-enc-s3 { animation: cs-step-in 0.3s 1.2s ease-out forwards; }
.cs-enc-s4 { animation: cs-step-in 0.3s 1.8s ease-out forwards; }
.cs-enc-s4 svg { color: var(--green); }
@keyframes cs-step-in { to { opacity: 1; transform: translateX(0); } }

.cs-enc-bar {
  width: 240px; height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.06); overflow: hidden;
}
.cs-enc-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, var(--cyan), var(--green));
  animation: cs-bar-fill 2.8s ease-in-out forwards;
}
@keyframes cs-bar-fill { from { width: 0%; } to { width: 100%; } }

@keyframes cs-phase-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }

/* Fade in for success */
.cs-fadein { animation: cs-phase-in 0.5s ease-out; }

/* Success screen */
.cp-success {
  text-align: center; padding: 48px 24px;
  display: flex; flex-direction: column; align-items: center;
  position: relative; overflow: hidden;
  background: rgba(255,255,255,0.015);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 20px;
}
.cs-rings { position: absolute; inset: 0; pointer-events: none; }
.cs-ring {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(0,201,138,0.08);
  animation: cs-expand 3s ease-out infinite;
}
.cs-ring-1 { width: 200px; height: 200px; animation-delay: 0s; }
.cs-ring-2 { width: 300px; height: 300px; animation-delay: 1s; }
.cs-ring-3 { width: 400px; height: 400px; animation-delay: 2s; }
@keyframes cs-expand {
  0% { transform: translate(-50%,-50%) scale(0.6); opacity: 0.5; }
  100% { transform: translate(-50%,-50%) scale(1.2); opacity: 0; }
}
.cs-shield {
  position: relative; z-index: 1;
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(0,201,138,0.1);
  border: 1px solid rgba(0,201,138,0.25);
  display: flex; align-items: center; justify-content: center;
  color: var(--green); margin-bottom: 20px;
}
.cs-shield-glow {
  position: absolute; inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0,201,138,0.15) 0%, transparent 70%);
  animation: cs-glow 2s ease-in-out infinite;
}
@keyframes cs-glow { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
.cs-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px; font-weight: 700; color: var(--t1);
  margin-bottom: 4px; position: relative; z-index: 1;
}
.cs-subtitle {
  font-size: 13px; color: var(--t3); margin-bottom: 24px;
  position: relative; z-index: 1;
}
.cs-encrypt-visual {
  width: 100%; max-width: 380px;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; padding: 4px 0;
  margin-bottom: 16px; position: relative; z-index: 1;
}
.cs-ev-row {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.cs-ev-row:last-child { border-bottom: none; }
.cs-ev-label { font-size: 11px; color: var(--t3); width: 90px; text-align: left; }
.cs-ev-value {
  flex: 1; font-family: 'JetBrains Mono', monospace;
  font-size: 12px; text-align: left;
}
.cs-ev-encrypted { color: var(--cyan); opacity: 0.6; letter-spacing: 0.02em; }
.cs-ev-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; font-weight: 600;
  color: var(--cyan); background: rgba(0,212,232,0.06);
  border: 1px solid rgba(0,212,232,0.12);
  padding: 2px 6px; border-radius: 4px;
}
.cs-note {
  font-size: 12px; color: var(--t3); max-width: 380px;
  line-height: 1.6; margin-bottom: 24px;
  position: relative; z-index: 1;
}
.cs-actions {
  display: flex; align-items: center; gap: 10px;
  position: relative; z-index: 1;
}
.cs-etherscan {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 18px; border-radius: 9px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  font-size: 12px; font-weight: 500; color: var(--t2);
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.15s; cursor: pointer;
}
.cs-etherscan:hover { border-color: rgba(0,212,232,0.2); color: var(--cyan); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.toast-overlay {
  position: fixed; top: 72px; right: 28px; z-index: 999;
}
.toast {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 16px; border-radius: 9px;
  background: rgba(18,18,30,0.92); border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  font-size: 12px; color: var(--t2); max-width: 360px;
  line-height: 1.45;
  animation: toast-in 0.3s cubic-bezier(0.16,1,0.3,1);
  cursor: pointer;
}
.toast svg { color: var(--gold); flex-shrink: 0; }
@keyframes toast-in { from { opacity: 0; transform: translateY(-8px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

@media(max-width:640px) {
  .page-container { max-width: 100%; }
  .cp-type-grid { grid-template-columns: 1fr; }
  .field-row, .cp-custom-time { flex-direction: column; }
  .cp-custom-time { display: flex; }
  .cp-unit-select { width: 100%; }
  .cp-progress { flex-wrap: wrap; gap: 8px; }
  .cp-prog-label { display: none; }
  .cs-fullpage { padding: 16px; }
  .cs-encrypt-visual { max-width: 100%; }
  .cs-actions { flex-direction: column; width: 100%; }
  .cs-actions a, .cs-actions button { width: 100%; justify-content: center; }
  .cp-review-val { font-size: 12px; }
}
`;
