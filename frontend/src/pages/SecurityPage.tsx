import { Lock, Shield, Hexagon, Check, ExternalLink } from 'lucide-react'

const securityFeatures = [
  { title: 'FHE Encryption', desc: 'All beneficiary data encrypted using Zama fhEVM. Heir addresses stored as eaddress ciphertext — unreadable on-chain.' },
  { title: 'Threshold Decryption', desc: 'Decryption requires consensus from the KMS network. No single party can access encrypted data.' },
  { title: 'Non-Custodial', desc: 'Your assets stay in the smart contract. No admin, company, or third party can access or redirect funds.' },
  { title: 'Input Proof Verification', desc: 'All encrypted inputs are validated on-chain via FHE.fromExternal() with cryptographic proofs.' },
  { title: 'ACL Enforcement', desc: 'FHE.allowThis() is called after every FHE operation. Strict access control on all ciphertexts.' },
  { title: 'Open Source', desc: 'All smart contracts and frontend code are publicly auditable on GitHub.' },
]

export default function SecurityPage() {
  return (
    <div className="page-container-wide">
      <style>{styles}</style>
      <div className="sec-pg-header">
        <Lock size={20} strokeWidth={1.8} style={{ color: 'var(--cyan)' }} />
        <div>
          <h1 className="pg-title">Security</h1>
          <p className="pg-sub">How InheritX protects your digital legacy.</p>
        </div>
      </div>

      <div className="sec-grid">
        {securityFeatures.map((f, i) => (
          <div className="sec-feat" key={i}>
            <div className="sec-feat-check"><Check size={12} strokeWidth={2.5} /></div>
            <div>
              <div className="sec-feat-title">{f.title}</div>
              <div className="sec-feat-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sec-fhe-box">
        <div className="sec-fhe-left">
          <Hexagon size={16} strokeWidth={1.5} style={{ color: 'var(--cyan)' }} />
          <div>
            <div className="sec-fhe-title">Powered by Zama fhEVM</div>
            <div className="sec-fhe-desc">
              Fully Homomorphic Encryption — computation on encrypted data without ever decrypting it.
            </div>
          </div>
        </div>
        <a className="sec-fhe-link" href="https://www.zama.org/" target="_blank" rel="noopener">
          Learn More <ExternalLink size={11} strokeWidth={2} />
        </a>
      </div>
    </div>
  )
}

const styles = `
.page-container-wide { max-width: 800px; }
.sec-pg-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 24px; }
.pg-title { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: var(--t1); margin-bottom: 2px; }
.pg-sub { font-size: 13px; color: var(--t3); }

.sec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
.sec-feat {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 18px; border-radius: 12px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
  transition: all 0.2s;
}
.sec-feat:hover { border-color: rgba(0,212,232,0.12); background: rgba(0,212,232,0.02); }
.sec-feat-check {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(0,212,232,0.08); border: 1px solid rgba(0,212,232,0.2);
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan); flex-shrink: 0; margin-top: 1px;
}
.sec-feat-title { font-size: 14px; font-weight: 600; color: var(--t1); margin-bottom: 4px; }
.sec-feat-desc { font-size: 12px; color: var(--t2); line-height: 1.55; }

.sec-fhe-box {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-radius: 12px;
  background: rgba(0,212,232,0.03); border: 1px solid rgba(0,212,232,0.1);
}
.sec-fhe-left { display: flex; align-items: center; gap: 12px; }
.sec-fhe-title { font-size: 13px; font-weight: 600; color: var(--cyan); font-family: 'Space Grotesk', sans-serif; }
.sec-fhe-desc { font-size: 11px; color: var(--t3); }
.sec-fhe-link {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: var(--cyan); text-decoration: none; font-weight: 500;
  white-space: nowrap; transition: opacity 0.15s;
}
.sec-fhe-link:hover { opacity: 0.8; }

@media(max-width:640px) { .sec-grid { grid-template-columns: 1fr; } }
`
