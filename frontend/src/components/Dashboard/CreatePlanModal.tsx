import { useState } from 'react'
import { X, Landmark, Target, Lock, Hexagon } from 'lucide-react'

interface CreatePlanModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function CreatePlanModal({ open, onClose, onConfirm }: CreatePlanModalProps) {
  const [selectedType, setSelectedType] = useState<'inheritance' | 'goal'>('inheritance')

  return (
    <div className={`modal-bg${open ? ' open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Create Inheritance Plan</div>
          <button className="modal-close" onClick={onClose}>
            <X size={14} strokeWidth={2} />
          </button>
        </div>
        <div className="modal-body">
          <div className="field-label" style={{ marginBottom: 10 }}>Choose plan type</div>
          <div className="plan-types">
            <div
              className={`pt-card${selectedType === 'inheritance' ? ' selected' : ''}`}
              onClick={() => setSelectedType('inheritance')}
            >
              <div className="pt-icon-wrap">
                <Landmark size={22} strokeWidth={1.5} />
              </div>
              <div className="pt-name">Inheritance</div>
              <div className="pt-desc">Transfer assets to heirs on death or inactivity</div>
            </div>
            <div
              className={`pt-card${selectedType === 'goal' ? ' selected' : ''}`}
              onClick={() => setSelectedType('goal')}
            >
              <div className="pt-icon-wrap">
                <Target size={22} strokeWidth={1.5} />
              </div>
              <div className="pt-name">Future Goal</div>
              <div className="pt-desc">Release on condition — wedding, tuition, milestone</div>
            </div>
          </div>

          <div className="field-label" style={{ marginBottom: 8 }}>Designated heirs</div>

          <div className="heir-row-modal">
            <div className="hr-avatar" style={{ background: 'var(--cyan-dim)', color: 'var(--cyan)' }}>S</div>
            <div className="hr-name">Sarah (Spouse)</div>
            <div className="hr-pct">60%</div>
            <div className="hr-enc">eaddress</div>
          </div>
          <div className="heir-row-modal">
            <div className="hr-avatar" style={{ background: 'var(--purple-dim)', color: 'var(--purple)' }}>J</div>
            <div className="hr-name">James (Son)</div>
            <div className="hr-pct">40%</div>
            <div className="hr-enc">eaddress</div>
          </div>

          <div className="enc-notice" style={{ marginTop: 10 }}>
            <Lock size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2, color: 'var(--cyan)' }} />
            <div>
              <strong style={{ color: 'var(--t1)', fontWeight: 600 }}>End-to-end encrypted.</strong>{' '}
              Heir addresses are stored as <code>eaddress</code> ciphertext — unreadable on-chain until trigger.
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Assets to lock (ETH)</label>
              <input className="field-input" type="number" placeholder="0.00" />
            </div>
            <div className="field">
              <label className="field-label">Inactivity trigger</label>
              <select className="field-input" style={{ cursor: 'pointer' }} defaultValue="180 days">
                <option>90 days</option>
                <option>180 days</option>
                <option>1 year</option>
                <option>2 years</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel-m" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={onConfirm}>
            <Hexagon size={13} strokeWidth={2} /> Encrypt & Deploy Plan
          </button>
        </div>
      </div>
    </div>
  )
}
