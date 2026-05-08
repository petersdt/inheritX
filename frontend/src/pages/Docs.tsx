import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogoMark } from '../components/shared/Logo'
import {
  ArrowLeft, Shield, Lock, Users, Zap, Hexagon, Check,
  FileText, Clock, Gift, Eye, HeartPulse, AlertTriangle,
  ChevronRight, ExternalLink, Copy
} from 'lucide-react'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'problems', label: 'The Problems' },
  { id: 'solutions', label: 'Our Solutions' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'fhe', label: 'FHE Encryption' },
  { id: 'contracts', label: 'Smart Contracts' },
  { id: 'plan-types', label: 'Plan Types' },
  { id: 'kyc', label: 'KYC Verification' },
  { id: 'create-plan', label: 'Creating a Plan' },
  { id: 'check-in', label: 'Proof of Life' },
  { id: 'trigger', label: 'Triggering a Plan' },
  { id: 'claim', label: 'Claiming Inheritance' },
  { id: 'security', label: 'Security Model' },
  { id: 'tech-stack', label: 'Tech Stack' },
]

function CodeBlock({ code, lang = 'solidity' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="doc-code">
      <div className="doc-code-header">
        <span className="doc-code-lang">{lang}</span>
        <button className="doc-code-copy" onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
          {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}

export default function Docs() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')

  const scrollTo = (id: string) => {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <style>{styles}</style>
      <div className="docs-page">
        {/* Top nav */}
        <nav className="docs-nav">
          <div className="docs-nav-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <LogoMark size={24} />
            <span className="docs-nav-title">InheritX</span>
            <span className="docs-nav-tag">Docs</span>
          </div>
          <div className="docs-nav-right">
            <button className="docs-nav-btn" onClick={() => navigate('/dashboard')}>Launch App <ChevronRight size={13} /></button>
          </div>
        </nav>

        <div className="docs-layout">
          {/* Sidebar */}
          <aside className="docs-sidebar">
            <div className="docs-sb-label">Documentation</div>
            {sections.map(s => (
              <div key={s.id} className={`docs-sb-item ${activeSection === s.id ? 'active' : ''}`} onClick={() => scrollTo(s.id)}>
                {s.label}
              </div>
            ))}
            <div className="docs-sb-divider" />
            <a className="docs-sb-link" href="https://github.com/martinvibes/InheritX-Zama" target="_blank" rel="noopener">
              GitHub <ExternalLink size={10} />
            </a>
            <a className="docs-sb-link" href="https://sepolia.etherscan.io/address/0xa53C7b880D1Ce4fef324C2880A22aCC052aa8A06" target="_blank" rel="noopener">
              Etherscan <ExternalLink size={10} />
            </a>
          </aside>

          {/* Content */}
          <main className="docs-content">

            <section id="overview" className="doc-section">
              <h1 className="doc-h1">InheritX Documentation</h1>
              <p className="doc-lead">The first FHE-encrypted on-chain inheritance protocol. Built on Zama fhEVM.</p>

              <div className="doc-cards">
                <div className="doc-card">
                  <Shield size={20} strokeWidth={1.5} />
                  <h3>Privacy by Default</h3>
                  <p>Heir addresses stored as encrypted <code>eaddress</code> — invisible on-chain.</p>
                </div>
                <div className="doc-card">
                  <HeartPulse size={20} strokeWidth={1.5} />
                  <h3>Dead-Man's Switch</h3>
                  <p>Automatic trigger when the owner stops checking in.</p>
                </div>
                <div className="doc-card">
                  <Users size={20} strokeWidth={1.5} />
                  <h3>Multi-Heir Splits</h3>
                  <p>Distribute across beneficiaries with encrypted percentage splits.</p>
                </div>
              </div>
            </section>

            <section id="problems" className="doc-section">
              <h2 className="doc-h2">The Problems</h2>
              <p>Crypto inheritance is broken. Here's why existing solutions fail:</p>

              <div className="doc-problem-list">
                <div className="doc-problem">
                  <div className="doc-problem-icon"><AlertTriangle size={18} strokeWidth={1.5} /></div>
                  <div>
                    <h3>$140B+ in Lost Crypto</h3>
                    <p>An estimated $140 billion in cryptocurrency is permanently inaccessible because owners died without passing on their private keys. Families have no way to recover these assets.</p>
                  </div>
                </div>
                <div className="doc-problem">
                  <div className="doc-problem-icon"><Eye size={18} strokeWidth={1.5} /></div>
                  <div>
                    <h3>Transparent Blockchains Expose Heirs</h3>
                    <p>On regular Ethereum, storing an heir's address in a smart contract makes it visible on block explorers. Your heir becomes a target — phishing, social engineering, MEV attacks — before they even know they've inherited anything.</p>
                  </div>
                </div>
                <div className="doc-problem">
                  <div className="doc-problem-icon"><AlertTriangle size={18} strokeWidth={1.5} /></div>
                  <div>
                    <h3>Commit-Reveal is Front-Runnable</h3>
                    <p>The standard Web3 trick — hash the heir address, reveal later — fails because MEV bots can see the reveal transaction in the mempool and front-run it before it lands on-chain.</p>
                  </div>
                </div>
                <div className="doc-problem">
                  <div className="doc-problem-icon"><AlertTriangle size={18} strokeWidth={1.5} /></div>
                  <div>
                    <h3>Centralized Services = Single Point of Failure</h3>
                    <p>Platforms like Cipherwill or legacy services require trusting a company. They can go offline, get hacked, freeze accounts, or simply shut down — taking your inheritance plan with them.</p>
                  </div>
                </div>
                <div className="doc-problem">
                  <div className="doc-problem-icon"><AlertTriangle size={18} strokeWidth={1.5} /></div>
                  <div>
                    <h3>Multisig = Trust Problem</h3>
                    <p>Multisig wallets require trusting multiple key holders to act honestly and stay available. Key holders can collude, lose keys, or become unreachable — defeating the purpose.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="solutions" className="doc-section">
              <h2 className="doc-h2">Our Solutions</h2>
              <p>InheritX solves every problem above with one technology: <strong>Fully Homomorphic Encryption</strong>.</p>

              <div className="doc-solution-grid">
                <div className="doc-solution">
                  <div className="doc-sol-header">
                    <Lock size={16} strokeWidth={1.8} />
                    <h3>Encrypted Heir Addresses</h3>
                  </div>
                  <p>Heir wallet addresses are stored as <code>eaddress</code> ciphertext. Block explorers, validators, and even the contract itself cannot read who your heirs are. Mathematically guaranteed privacy.</p>
                </div>
                <div className="doc-solution">
                  <div className="doc-sol-header">
                    <Shield size={16} strokeWidth={1.8} />
                    <h3>No Front-Running Possible</h3>
                  </div>
                  <p>There is no "reveal transaction" to intercept. Decryption happens inside the Zama KMS threshold network — not in a public transaction. MEV bots have nothing to front-run.</p>
                </div>
                <div className="doc-solution">
                  <div className="doc-sol-header">
                    <Hexagon size={16} strokeWidth={1.8} />
                    <h3>Fully Decentralized</h3>
                  </div>
                  <p>No company, no server, no trusted third party. The smart contract is the inheritance plan. It executes automatically, provably, and cannot be stopped, frozen, or censored by anyone.</p>
                </div>
                <div className="doc-solution">
                  <div className="doc-sol-header">
                    <HeartPulse size={16} strokeWidth={1.8} />
                    <h3>Automated Dead-Man's Switch</h3>
                  </div>
                  <p>Set a check-in window. If you stop proving you're alive, the plan triggers automatically. No lawyers, no courts, no probate. Just code executing as programmed.</p>
                </div>
                <div className="doc-solution">
                  <div className="doc-sol-header">
                    <Users size={16} strokeWidth={1.8} />
                    <h3>Encrypted Multi-Heir Splits</h3>
                  </div>
                  <p>Distribute to multiple heirs with encrypted percentage splits. Nobody — not even the heirs themselves — can see who gets what until the plan triggers.</p>
                </div>
                <div className="doc-solution">
                  <div className="doc-sol-header">
                    <Eye size={16} strokeWidth={1.8} />
                    <h3>Owner-Controlled Visibility</h3>
                  </div>
                  <p>The plan owner can decrypt and view their own locked ETH amount at any time via wallet signature. Heirs gain access only after claiming. Everyone else sees encrypted ciphertext.</p>
                </div>
              </div>
            </section>

            <section id="use-cases" className="doc-section">
              <h2 className="doc-h2">Use Cases</h2>

              <div className="doc-usecase-list">
                <div className="doc-usecase">
                  <div className="doc-uc-num">01</div>
                  <div>
                    <h3>Family Inheritance</h3>
                    <p>A crypto holder wants their spouse and children to receive their assets if they pass away. They create an Inheritance Plan with a 180-day check-in window. If they stop checking in, the family can claim their share — without ever being visible as beneficiaries on-chain.</p>
                  </div>
                </div>
                <div className="doc-usecase">
                  <div className="doc-uc-num">02</div>
                  <div>
                    <h3>College Fund</h3>
                    <p>A parent locks 2 ETH in a Future Goal Plan set to unlock on their daughter's 18th birthday. The funds are time-locked and encrypted — nobody can touch them early, and the daughter claims when the date arrives.</p>
                  </div>
                </div>
                <div className="doc-usecase">
                  <div className="doc-uc-num">03</div>
                  <div>
                    <h3>Business Succession</h3>
                    <p>A DAO founder designates a co-founder as successor for treasury access. If the founder becomes inactive for 90 days, the co-founder can claim operational funds — ensuring business continuity without exposing the succession plan publicly.</p>
                  </div>
                </div>
                <div className="doc-usecase">
                  <div className="doc-uc-num">04</div>
                  <div>
                    <h3>Charitable Giving</h3>
                    <p>An anonymous donor wants to leave crypto to a charity, but only after their death. They set up an Inheritance Plan with the charity's wallet as beneficiary. The donation is invisible until triggered — no public credit-seeking, just pure giving.</p>
                  </div>
                </div>
                <div className="doc-usecase">
                  <div className="doc-uc-num">05</div>
                  <div>
                    <h3>Emergency Dead-Man's Switch</h3>
                    <p>A journalist or activist in a high-risk environment creates a plan with a 7-day check-in. If they're detained or harmed and can't check in, encrypted information and funds are released to designated contacts automatically.</p>
                  </div>
                </div>
                <div className="doc-usecase">
                  <div className="doc-uc-num">06</div>
                  <div>
                    <h3>Milestone Rewards</h3>
                    <p>A parent sets up multiple Future Goal Plans — one unlocking at graduation, another at first job, another at marriage. Each milestone releases funds automatically on the set date. Private, automatic, unstoppable.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="how-it-works" className="doc-section">
              <h2 className="doc-h2">How It Works</h2>
              <div className="doc-steps">
                <div className="doc-step"><span className="doc-step-num">1</span><div><strong>Connect Wallet</strong><p>Link your Web3 wallet. No sign-up required.</p></div></div>
                <div className="doc-step"><span className="doc-step-num">2</span><div><strong>Verify Identity</strong><p>One-click KYC verification on-chain.</p></div></div>
                <div className="doc-step"><span className="doc-step-num">3</span><div><strong>Create Plan</strong><p>Add heirs, set trigger conditions, lock ETH. All encrypted via fhEVM.</p></div></div>
                <div className="doc-step"><span className="doc-step-num">4</span><div><strong>Check In</strong><p>Periodically prove you're alive to reset the timer.</p></div></div>
                <div className="doc-step"><span className="doc-step-num">5</span><div><strong>Trigger & Claim</strong><p>If you stop checking in, heirs can claim their share.</p></div></div>
              </div>
            </section>

            <section id="fhe" className="doc-section">
              <h2 className="doc-h2">FHE Encryption</h2>
              <p>InheritX uses <strong>Fully Homomorphic Encryption</strong> via Zama's fhEVM to keep all sensitive data encrypted on-chain.</p>

              <div className="doc-table">
                <div className="doc-table-header">
                  <span>Data</span><span>FHE Type</span><span>Visibility</span>
                </div>
                <div className="doc-table-row"><span>Heir address</span><code>eaddress</code><span>Encrypted</span></div>
                <div className="doc-table-row"><span>ETH amount</span><code>euint128</code><span>Encrypted</span></div>
                <div className="doc-table-row"><span>Share splits</span><code>euint32</code><span>Encrypted</span></div>
                <div className="doc-table-row"><span>Vault notes</span><code>euint128</code><span>Encrypted</span></div>
                <div className="doc-table-row"><span>Check-in time</span><span>uint256</span><span>Public (by design)</span></div>
              </div>

              <CodeBlock lang="solidity" code={`// Heir address — mathematically hidden on-chain
eaddress private heir;

// Asset amount — encrypted
euint128 private ethLocked;

// Only the CoFHE threshold network can decrypt
FHE.makePubliclyDecryptable(heir); // on trigger`} />
            </section>

            <section id="contracts" className="doc-section">
              <h2 className="doc-h2">Smart Contracts</h2>
              <p>The InheritX contract is deployed on Ethereum Sepolia testnet.</p>

              <div className="doc-info-box">
                <div className="doc-info-row"><span>Network</span><span>Ethereum Sepolia</span></div>
                <div className="doc-info-row"><span>Solidity</span><span>0.8.24</span></div>
                <div className="doc-info-row"><span>FHE Library</span><span>@fhevm/solidity ^0.11.1</span></div>
                <div className="doc-info-row"><span>Framework</span><span>Hardhat</span></div>
              </div>

              <h3 className="doc-h3">Key Functions</h3>
              <div className="doc-func-list">
                <div className="doc-func"><code>submitKYC()</code><span>Register and auto-verify identity</span></div>
                <div className="doc-func"><code>createPlanDirect(...)</code><span>Create plan with on-chain encryption</span></div>
                <div className="doc-func"><code>checkIn(planId)</code><span>Reset inactivity timer</span></div>
                <div className="doc-func"><code>trigger(planId)</code><span>Trigger plan after timer expires</span></div>
                <div className="doc-func"><code>claimDirect(planId)</code><span>Heir claims their share</span></div>
                <div className="doc-func"><code>cancelPlan(planId)</code><span>Owner cancels and withdraws</span></div>
                <div className="doc-func"><code>getHeirStatus(planId, wallet)</code><span>Check heir eligibility (0/1/2)</span></div>
              </div>
            </section>

            <section id="plan-types" className="doc-section">
              <h2 className="doc-h2">Plan Types</h2>
              <div className="doc-cards doc-cards-2">
                <div className="doc-card">
                  <FileText size={20} strokeWidth={1.5} />
                  <h3>Inheritance Plan</h3>
                  <p>Dead-man's switch. If the owner stops checking in for the set period, the plan triggers and heirs can claim.</p>
                  <div className="doc-tag">Inactivity-based trigger</div>
                </div>
                <div className="doc-card">
                  <Clock size={20} strokeWidth={1.5} />
                  <h3>Future Goal Plan</h3>
                  <p>Time-locked release. Assets unlock on a specific date — graduation, birthday, milestone.</p>
                  <div className="doc-tag">Date-based trigger</div>
                </div>
              </div>
            </section>

            <section id="kyc" className="doc-section">
              <h2 className="doc-h2">KYC Verification</h2>
              <p>Plan creation requires KYC. On testnet, this is a single transaction that auto-verifies.</p>
              <CodeBlock lang="solidity" code={`function submitKYC() external {
    // Auto-verify on testnet — one transaction
    kycStatus[msg.sender] = KYCStatus.VERIFIED;
    emit KYCSubmitted(msg.sender);
    emit KYCVerified(msg.sender);
}`} />
            </section>

            <section id="create-plan" className="doc-section">
              <h2 className="doc-h2">Creating a Plan</h2>
              <p>Plans accept a name, description, heir addresses, share percentages, and trigger conditions. All heir data is encrypted via fhEVM before on-chain storage.</p>
              <CodeBlock lang="typescript" code={`// Frontend encrypts heir addresses client-side
const fhevm = await getFhevmInstance();
const input = fhevm.createEncryptedInput(contract, user);
input.addAddress(heirAddress);
input.add32(shareBps); // basis points
const encrypted = await input.encrypt();

// Send encrypted handles + proof to contract
writeContract({
  functionName: 'createPlan',
  args: [type, name, desc, encAddrs, encShares,
         proofs, heirHashes, inactivity, unlock],
  value: parseEther(amount),
});`} />
            </section>

            <section id="check-in" className="doc-section">
              <h2 className="doc-h2">Proof of Life</h2>
              <p>For Inheritance plans, the owner must periodically check in to prove they're alive. Each check-in resets the inactivity timer.</p>
              <div className="doc-callout">
                <HeartPulse size={16} strokeWidth={2} />
                <span>If the owner doesn't check in before the timer expires, anyone can trigger the plan.</span>
              </div>
            </section>

            <section id="trigger" className="doc-section">
              <h2 className="doc-h2">Triggering a Plan</h2>
              <p>When the inactivity window expires (or the unlock date passes for Future Goal plans), the plan can be triggered by anyone.</p>
              <p>On trigger, the contract calls <code>FHE.makePubliclyDecryptable()</code> on all encrypted heir data, allowing the claim flow to verify identities.</p>
            </section>

            <section id="claim" className="doc-section">
              <h2 className="doc-h2">Claiming Inheritance</h2>
              <p>After a plan is triggered, heirs can claim their share:</p>
              <div className="doc-steps">
                <div className="doc-step"><span className="doc-step-num">1</span><div><strong>Enter Plan ID</strong><p>Find the plan on the Claim page.</p></div></div>
                <div className="doc-step"><span className="doc-step-num">2</span><div><strong>Wallet Verified</strong><p>Contract checks <code>keccak256(msg.sender)</code> against stored heir hashes.</p></div></div>
                <div className="doc-step"><span className="doc-step-num">3</span><div><strong>ETH Transferred</strong><p>Share is sent directly to the heir's wallet.</p></div></div>
              </div>
            </section>

            <section id="security" className="doc-section">
              <h2 className="doc-h2">Security Model</h2>
              <div className="doc-security-grid">
                {[
                  'Heir addresses encrypted as eaddress — never plaintext on-chain',
                  'ETH amounts encrypted as euint128 — block explorers see ciphertext',
                  'Heir verification via keccak256 hash — one-way, non-reversible',
                  'FHE.allowThis() called after every operation — strict ACL',
                  'Non-custodial — no admin can access locked funds',
                  'Threshold decryption via Zama KMS — no single point of failure',
                ].map((item, i) => (
                  <div className="doc-sec-item" key={i}>
                    <Check size={12} strokeWidth={2.5} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="tech-stack" className="doc-section">
              <h2 className="doc-h2">Tech Stack</h2>
              <div className="doc-info-box">
                <div className="doc-info-row"><span>Contracts</span><span>Solidity 0.8.24, @fhevm/solidity, Hardhat</span></div>
                <div className="doc-info-row"><span>Frontend</span><span>React 19, Vite, TypeScript</span></div>
                <div className="doc-info-row"><span>Web3</span><span>wagmi, viem, RainbowKit</span></div>
                <div className="doc-info-row"><span>FHE Client</span><span>@zama-fhe/relayer-sdk</span></div>
                <div className="doc-info-row"><span>Animations</span><span>Framer Motion</span></div>
                <div className="doc-info-row"><span>Network</span><span>Ethereum Sepolia</span></div>
              </div>
            </section>

          </main>
        </div>
      </div>
    </>
  )
}

const styles = `
.docs-page { min-height: 100vh; background: var(--bg); }

/* Nav */
.docs-nav {
  height: 56px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; border-bottom: 1px solid rgba(255,255,255,0.04);
  background: rgba(12,12,24,0.9); backdrop-filter: blur(16px);
  position: sticky; top: 0; z-index: 50;
}
.docs-nav-left { display: flex; align-items: center; gap: 9px; }
.docs-nav-title { font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 700; color: var(--t1); }
.docs-nav-tag {
  font-size: 10px; font-weight: 600; color: var(--cyan); background: var(--cyan-dim);
  border: 1px solid rgba(0,212,232,0.15); padding: 2px 7px; border-radius: 4px;
  letter-spacing: 0.04em;
}
.docs-nav-btn {
  display: flex; align-items: center; gap: 4px;
  padding: 7px 14px; background: var(--cyan); border: none; border-radius: 7px;
  color: #000; font-family: 'Space Grotesk', sans-serif;
  font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.docs-nav-btn:hover { background: var(--cyan-hi); }

/* Layout */
.docs-layout { display: flex; max-width: 1200px; margin: 0 auto; }

/* Sidebar */
.docs-sidebar {
  width: 220px; flex-shrink: 0; padding: 24px 16px;
  border-right: 1px solid rgba(255,255,255,0.04);
  position: sticky; top: 56px; height: calc(100vh - 56px); overflow-y: auto;
}
.docs-sb-label {
  font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--t3); margin-bottom: 12px; padding: 0 8px;
}
.docs-sb-item {
  font-size: 13px; color: var(--t3); padding: 7px 8px; border-radius: 6px;
  cursor: pointer; transition: all 0.12s; margin-bottom: 1px;
}
.docs-sb-item:hover { color: var(--t2); background: rgba(255,255,255,0.03); }
.docs-sb-item.active { color: var(--cyan); background: rgba(0,212,232,0.06); font-weight: 500; }
.docs-sb-divider { height: 1px; background: rgba(255,255,255,0.04); margin: 16px 0; }
.docs-sb-link {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; color: var(--t3); padding: 6px 8px; border-radius: 6px;
  cursor: pointer; transition: color 0.12s; text-decoration: none; margin-bottom: 2px;
}
.docs-sb-link:hover { color: var(--cyan); }

/* Content */
.docs-content { flex: 1; padding: 32px 40px 80px; max-width: 800px; }

.doc-section { margin-bottom: 48px; scroll-margin-top: 72px; }
.doc-h1 {
  font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700;
  color: var(--t1); letter-spacing: -0.02em; margin-bottom: 8px;
}
.doc-lead { font-size: 16px; color: var(--t2); margin-bottom: 28px; line-height: 1.6; }
.doc-h2 {
  font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700;
  color: var(--t1); letter-spacing: -0.01em; margin-bottom: 12px;
}
.doc-h3 {
  font-family: 'Space Grotesk', sans-serif; font-size: 16px; font-weight: 600;
  color: var(--t1); margin: 20px 0 10px;
}
.doc-section p { font-size: 14px; color: var(--t2); line-height: 1.7; margin-bottom: 16px; }
.doc-section code {
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  background: rgba(0,212,232,0.06); color: var(--cyan);
  padding: 2px 6px; border-radius: 4px;
}

/* Cards */
.doc-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.doc-cards-2 { grid-template-columns: repeat(2, 1fr); }
.doc-card {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; padding: 20px; transition: all 0.2s;
}
.doc-card:hover { border-color: rgba(0,212,232,0.15); background: rgba(0,212,232,0.02); }
.doc-card svg { color: var(--cyan); margin-bottom: 12px; }
.doc-card h3 { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: var(--t1); margin-bottom: 6px; }
.doc-card p { font-size: 13px; color: var(--t2); line-height: 1.5; margin: 0; }
.doc-tag {
  display: inline-block; margin-top: 10px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  color: var(--cyan); background: rgba(0,212,232,0.06);
  border: 1px solid rgba(0,212,232,0.12); padding: 2px 8px; border-radius: 4px;
}

/* Steps */
.doc-steps { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.doc-step {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border-radius: 10px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
}
.doc-step-num {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  background: rgba(0,212,232,0.08); border: 1px solid rgba(0,212,232,0.2);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: var(--cyan);
}
.doc-step strong { font-size: 14px; color: var(--t1); display: block; margin-bottom: 2px; }
.doc-step p { font-size: 13px; color: var(--t3); margin: 0; line-height: 1.4; }

/* Code blocks */
.doc-code {
  background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; overflow: hidden; margin-bottom: 20px;
}
.doc-code-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-bottom: 1px solid rgba(255,255,255,0.04);
  background: rgba(255,255,255,0.015);
}
.doc-code-lang { font-size: 10px; color: var(--t3); font-family: 'JetBrains Mono', monospace; }
.doc-code-copy {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; color: var(--t3); background: none; border: none;
  cursor: pointer; font-family: 'JetBrains Mono', monospace; transition: color 0.12s;
}
.doc-code-copy:hover { color: var(--cyan); }
.doc-code pre {
  padding: 16px; margin: 0; overflow-x: auto;
  font-family: 'JetBrains Mono', monospace; font-size: 12px;
  line-height: 1.7; color: var(--t2);
}

/* Table */
.doc-table {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px; overflow: hidden; margin-bottom: 20px;
}
.doc-table-header {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 11px; font-weight: 600; color: var(--t3); text-transform: uppercase; letter-spacing: 0.04em;
}
.doc-table-row {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.03);
  font-size: 13px; color: var(--t2);
}
.doc-table-row:last-child { border-bottom: none; }
.doc-table-row code { font-size: 12px; }

/* Info box */
.doc-info-box {
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px; overflow: hidden; margin-bottom: 20px;
}
.doc-info-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.03);
  font-size: 13px;
}
.doc-info-row:last-child { border-bottom: none; }
.doc-info-row span:first-child { color: var(--t3); }
.doc-info-row span:last-child { color: var(--t1); font-weight: 500; font-family: 'JetBrains Mono', monospace; font-size: 12px; }

/* Function list */
.doc-func-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.doc-func {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: 8px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
  font-size: 13px;
}
.doc-func code { font-size: 12px; font-weight: 600; flex-shrink: 0; }
.doc-func span { color: var(--t3); }

/* Callout */
.doc-callout {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 14px 16px; border-radius: 10px;
  background: rgba(0,201,138,0.04); border: 1px solid rgba(0,201,138,0.12);
  font-size: 13px; color: var(--t2); line-height: 1.5; margin-bottom: 20px;
}
.doc-callout svg { color: var(--green); flex-shrink: 0; margin-top: 2px; }

/* Security grid */
.doc-security-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.doc-sec-item {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 12px 14px; border-radius: 8px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
  font-size: 12px; color: var(--t2); line-height: 1.5;
}
.doc-sec-item svg { color: var(--cyan); flex-shrink: 0; margin-top: 2px; }

/* Problems */
.doc-problem-list { display: flex; flex-direction: column; gap: 12px; }
.doc-problem {
  display: flex; gap: 14px; padding: 18px; border-radius: 12px;
  background: rgba(224,80,80,0.03); border: 1px solid rgba(224,80,80,0.1);
  transition: all 0.2s;
}
.doc-problem:hover { border-color: rgba(224,80,80,0.2); }
.doc-problem-icon {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  background: rgba(224,80,80,0.08); border: 1px solid rgba(224,80,80,0.15);
  display: flex; align-items: center; justify-content: center;
  color: var(--red);
}
.doc-problem h3 { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; color: var(--t1); margin-bottom: 4px; }
.doc-problem p { font-size: 13px; color: var(--t2); line-height: 1.6; margin: 0; }

/* Solutions */
.doc-solution-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.doc-solution {
  padding: 18px; border-radius: 12px;
  background: rgba(0,212,232,0.02); border: 1px solid rgba(0,212,232,0.08);
  transition: all 0.2s;
}
.doc-solution:hover { border-color: rgba(0,212,232,0.18); background: rgba(0,212,232,0.04); }
.doc-sol-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.doc-sol-header svg { color: var(--cyan); }
.doc-sol-header h3 { font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 600; color: var(--t1); }
.doc-solution p { font-size: 13px; color: var(--t2); line-height: 1.6; margin: 0; }

/* Use Cases */
.doc-usecase-list { display: flex; flex-direction: column; gap: 12px; }
.doc-usecase {
  display: flex; gap: 16px; padding: 20px; border-radius: 12px;
  background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.2s;
}
.doc-usecase:hover { border-color: rgba(0,212,232,0.12); background: rgba(0,212,232,0.02); }
.doc-uc-num {
  font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700;
  color: var(--cyan); opacity: 0.4; flex-shrink: 0; min-width: 32px;
}
.doc-usecase h3 { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 600; color: var(--t1); margin-bottom: 6px; }
.doc-usecase p { font-size: 13px; color: var(--t2); line-height: 1.65; margin: 0; }

/* Responsive */
@media(max-width:900px) {
  .doc-solution-grid { grid-template-columns: 1fr; }
  .docs-sidebar { display: none; }
  .docs-content { padding: 24px 16px 60px; }
  .doc-cards { grid-template-columns: 1fr; }
  .doc-cards-2 { grid-template-columns: 1fr; }
  .doc-security-grid { grid-template-columns: 1fr; }
  .doc-table-header, .doc-table-row { grid-template-columns: 1fr 1fr; }
}
`
