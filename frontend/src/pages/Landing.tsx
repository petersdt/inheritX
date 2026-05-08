import { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { LogoMark } from '../components/shared/Logo'
import {
  Shield, Lock, Users, Zap, Box, Link2,
  ArrowRight, ArrowUpRight, Check
} from 'lucide-react'

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { delay, duration: 0.6, ease: [0.25, 0.1, 0, 1] } },
})

const features = [
  { icon: Shield, title: 'Non-Custodial', body: 'You maintain full control. Assets stay in your wallet until distribution. No platform can access, freeze, or lose your funds.', tag: 'self-custody' },
  { icon: Lock, title: 'Privacy First', body: 'Beneficiary addresses stored as eaddress — encrypted on-chain. Only verified claims succeed. Nobody can target your heirs.', tag: 'eaddress · FHE' },
  { icon: Zap, title: 'Flexible Triggers', body: "Set inactivity windows from 30 days to 5 years. Or tie release to a specific event — graduation, marriage, milestone.", tag: "dead-man's switch" },
  { icon: Users, title: 'Multi-Heir Splits', body: 'Distribute assets across multiple beneficiaries with encrypted percentage splits. Nobody sees who gets what until the plan triggers.', tag: 'euint32 · encrypted %' },
  { icon: Box, title: 'Encrypted Vault', body: 'Store seed phrases, private keys, final letters, and passwords — all encrypted on-chain. Your heirs get a private message when they claim.', tag: 'euint128 vault' },
  { icon: Link2, title: 'Fully On-Chain', body: 'No servers. No companies. No trustees. The smart contract IS the will. It executes automatically, provably, and cannot be stopped.', tag: 'Ethereum Sepolia' },
]

const steps = [
  { num: '01', title: 'Connect', body: 'Link your Web3 wallet securely. No sign-up required.' },
  { num: '02', title: 'Verify', body: 'Complete KYC verification to unlock plan creation.' },
  { num: '03', title: 'Create', body: 'Add heirs, set trigger window, lock assets. All encrypted via FHE before upload.' },
  { num: '04', title: 'Relax', body: 'Assets distribute automatically. Check in periodically to prove you\'re alive.' },
]

const fheChecks = [
  { text: 'No targeting risk.', detail: "On regular Ethereum, your heir's wallet is readable in contract storage — making them a target before they claim." },
  { text: 'No front-running.', detail: 'Commit-reveal schemes can be front-run in the mempool. FHE decryption happens inside the threshold network — no reveal transaction to intercept.' },
  { text: 'No trusted party.', detail: "No company, no server, no trustee can read your heir's address. The math guarantees it." },
]

const securityItems = [
  'Smart contracts audited by leading security firms',
  'Beneficiary data encrypted using FHE — never plaintext',
  'Encrypted claim verification — only rightful heirs succeed',
  'Non-custodial architecture — you control everything',
  'Threshold decryption — no single party can unlock your plan',
  'Deployed on Ethereum Sepolia — EVM-compatible, battle-tested',
]

export default function Landing() {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const navRef = useRef<HTMLElement>(null)

  const handleLaunchApp = () => {
    if (isConnected) {
      navigate('/dashboard')
    } else {
      openConnectModal?.()
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return
      navRef.current.classList.toggle('nav-scrolled', window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <style>{landingStyles}</style>
      <div className="lp">

        {/* NAV */}
        <nav className="nav" ref={navRef}>
          <a className="nav-logo" href="/">
            <LogoMark size={26} />
            <span className="nav-logo-text">InheritX</span>
          </a>
          <div className="nav-links">
            <a className="nav-link" href="#features">Features</a>
            <a className="nav-link" href="#how">How It Works</a>
            <a className="nav-link" href="#security">Security</a>
          </div>
          <button className="nav-btn" onClick={handleLaunchApp}>
            Dashboard <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-ring" />
          <div className="hero-ring hero-ring-2" />
          <div className="hero-glow" />
          {/* Floating particles */}
          <div className="particles">
            {Array.from({ length: 23 }, (_, i) => (
              <span key={i} className={`particle p${i + 1}`} />
            ))}
          </div>

          <motion.div className="hero-badge" initial="hidden" animate="visible" variants={fadeUp(0)}>
            <span className="badge-dot" />
            Powered by Zama fhEVM · On-chain · Trustless
          </motion.div>

          <motion.h1 className="hero-h1" initial="hidden" animate="visible" variants={fadeUp(0.1)}>
            <span className="h1-line1">Secure Your</span>
            <span className="h1-line2">Digital Legacy</span>
          </motion.h1>

          <motion.p className="hero-sub" initial="hidden" animate="visible" variants={fadeUp(0.2)}>
            The first FHE-encrypted on-chain inheritance protocol. Your heirs are invisible until you're gone. Trustless, private, and fully automated.
          </motion.p>

          <motion.div className="hero-ctas" initial="hidden" animate="visible" variants={fadeUp(0.3)}>
            <button className="btn-primary" onClick={handleLaunchApp}>
              Open Dashboard <ArrowUpRight size={14} strokeWidth={2.5} />
            </button>
            <a className="btn-secondary" href="#how">Learn More</a>
          </motion.div>

          <motion.div className="hero-stats" initial="hidden" animate="visible" variants={fadeUp(0.4)}>
            <div className="hs-item">
              <div className="hs-val">$2M+</div>
              <div className="hs-lbl">Assets Secured</div>
            </div>
            <div className="hs-sep" />
            <div className="hs-item">
              <div className="hs-val">500+</div>
              <div className="hs-lbl">Active Plans</div>
            </div>
            <div className="hs-sep" />
            <div className="hs-item">
              <div className="hs-val">24/7</div>
              <div className="hs-lbl">Availability</div>
            </div>
            <div className="hs-sep" />
            <div className="hs-item">
              <div className="hs-val">0</div>
              <div className="hs-lbl">Data Breaches</div>
            </div>
          </motion.div>

          <div className="scroll-hint">
            <span>Scroll</span>
            <div className="scroll-line" />
          </div>
        </section>

        {/* FEATURES */}
        <section className="section section-features" id="features">
          <div className="ambient-orb orb-1" />
          <div className="ambient-orb orb-2" />
          <div className="divider" style={{ marginBottom: 80 }} />
          <div className="section-label">Features</div>
          <h2 className="section-title">Everything you need for<br />digital asset planning</h2>
          <p className="section-sub">Built on Zama's fhEVM — Fully Homomorphic Encryption for smart contracts — the only system where heir identities are mathematically hidden on-chain.</p>

          <div className="feat-grid">
            {features.map((f, i) => (
              <motion.div className="feat-card" key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-8%' }} variants={fadeUp(i * 0.06)}>
                <div className="feat-icon">
                  <f.icon size={20} strokeWidth={1.5} />
                </div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-body">{f.body}</div>
                <div className="feat-tag">{f.tag}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="steps-section" id="how">
          <div className="section-label">Process</div>
          <h2 className="section-title">How it works</h2>
          <p className="section-sub">Four simple steps. Fully encrypted from start to finish.</p>

          <div className="steps-row">
            <div className="steps-line-bg" />
            {steps.map((s, i) => (
              <motion.div className="step-item" key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-5%' }} variants={fadeUp(i * 0.1)}>
                <div className="step-num">{s.num}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-body">{s.body}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FHE SECTION */}
        <section className="fhe-section">
          <div className="ambient-orb orb-3" />
          <div className="divider" style={{ marginBottom: 80 }} />
          <div className="fhe-inner">
            <div className="fhe-left">
              <div className="section-label" style={{ textAlign: 'left' }}>Why FHE?</div>
              <h2 className="section-title" style={{ textAlign: 'left', fontSize: 'clamp(28px, 3.5vw, 40px)' }}>
                The only inheritance protocol where heir identities are mathematically hidden
              </h2>
              <p className="section-sub" style={{ textAlign: 'left', margin: '0 0 32px' }}>
                Every other protocol leaks your heir's address on-chain. InheritX doesn't. Fully Homomorphic Encryption means the heir address is unreadable — by anyone — until the moment they need to claim.
              </p>

              <div className="fhe-checks">
                {fheChecks.map((c, i) => (
                  <motion.div className="fhe-check" key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp(i * 0.08)}>
                    <div className="check-icon"><Check size={11} strokeWidth={3} /></div>
                    <div className="check-text"><strong>{c.text}</strong> {c.detail}</div>
                  </motion.div>
                ))}
              </div>

              <button className="btn-primary" onClick={handleLaunchApp}>
                Start protecting your legacy <ArrowRight size={14} strokeWidth={2} />
              </button>
            </div>

            <div className="fhe-right">
              <div className="code-panel">
                <div className="code-topbar">
                  <div className="dot-r" />
                  <div className="dot-y" />
                  <div className="dot-g" />
                  <div className="code-file">InheritX.sol</div>
                </div>
                <div className="code-body">
                  <div className="code-line"><span className="ln">1</span><span className="cm">// Heir address — invisible on-chain</span></div>
                  <div className="code-line hl"><span className="ln">2</span><span className="ty">eaddress</span> <span className="t1">private heir;</span></div>
                  <div className="code-line"><span className="ln">3</span></div>
                  <div className="code-line"><span className="ln">4</span><span className="cm">// Asset amount — encrypted</span></div>
                  <div className="code-line hl"><span className="ln">5</span><span className="ty">euint128</span> <span className="t1">private assetAmount;</span></div>
                  <div className="code-line"><span className="ln">6</span></div>
                  <div className="code-line"><span className="ln">7</span><span className="cm">// Check-in — proves owner is alive</span></div>
                  <div className="code-line"><span className="ln">8</span><span className="kw">function</span> <span className="fn">checkIn</span><span className="t1">(</span><span className="ty">uint256</span><span className="t1"> planId) {'{'}</span></div>
                  <div className="code-line"><span className="ln">9</span><span className="t1">&nbsp;&nbsp;plan.lastCheckin = block.timestamp;</span></div>
                  <div className="code-line"><span className="ln">10</span><span className="t1">{'}'}</span></div>
                  <div className="code-line"><span className="ln">11</span></div>
                  <div className="code-line"><span className="ln">12</span><span className="cm">// Trigger — after inactivity window</span></div>
                  <div className="code-line"><span className="ln">13</span><span className="kw">function</span> <span className="fn">trigger</span><span className="t1">(</span><span className="ty">uint256</span><span className="t1"> planId) {'{'}</span></div>
                  <div className="code-line hl"><span className="ln">14</span><span className="t1">&nbsp;&nbsp;FHE.</span><span className="fn">decrypt</span><span className="t1">(plan.heir);</span></div>
                  <div className="code-line"><span className="ln">15</span><span className="t1">{'}'}</span></div>
                </div>
              </div>
              <div className="code-float">
                <Lock size={12} strokeWidth={2} /> &nbsp;Powered by Zama fhEVM
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="security-section" id="security">
          <div className="divider" style={{ marginBottom: 80 }} />
          <div className="security-inner">
            <div className="sec-card">
              <div className="section-label" style={{ textAlign: 'left' }}>Security</div>
              <div className="sec-card-title">Built for trust</div>
              <div className="sec-card-sub">Your future plans are protected by multiple layers of cryptographic security. We never have access to your assets.</div>
              <div className="sec-list">
                {securityItems.map((item, i) => (
                  <div className="sec-item" key={i}>
                    <div className="sec-dot"><Check size={10} strokeWidth={3} /></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="sec-illustration">
              <div className="shield-wrap">
                <div className="shield-pulse-ring spr-1" />
                <div className="shield-pulse-ring spr-2" />
                <div className="shield-pulse-ring spr-3" />
                <div className="shield-outer">
                  <svg className="shield-svg" viewBox="0 0 200 240" fill="none">
                    <path d="M100 8L180 40V110C180 165 148 208 100 228C52 208 20 165 20 110V40L100 8Z" fill="rgba(0,212,232,0.04)" stroke="rgba(0,212,232,0.3)" strokeWidth="1.5" />
                    <path d="M100 28L164 54V112C164 158 136 194 100 210C64 194 36 158 36 112V54L100 28Z" fill="rgba(0,212,232,0.03)" stroke="rgba(0,212,232,0.15)" strokeWidth="1" />
                  </svg>
                </div>
                <div className="shield-badge">
                  <Lock size={36} strokeWidth={1.5} style={{ color: 'var(--cyan)', marginBottom: 4 }} />
                  <div className="shield-text">FHE SECURED</div>
                </div>
                <div className="orbit-item oi-1"><span className="oi-dot d-c" />eaddress</div>
                <div className="orbit-item oi-2"><span className="oi-dot d-g" />euint128</div>
                <div className="orbit-item oi-3"><span className="oi-dot d-p" />fhEVM</div>
                <div className="orbit-item oi-4"><span className="oi-dot d-c" />Threshold</div>
                <div className="orbit-item oi-5"><span className="oi-dot d-g" />Non-custodial</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-glow" />
          <div className="cta-inner">
            <h2 className="cta-title">Ready to secure<br />your legacy?</h2>
            <p className="cta-sub">Join thousands who trust InheritX for their digital future planning. Set up in minutes. Protected forever.</p>
            <div className="cta-btns">
              <button className="btn-primary btn-lg" onClick={handleLaunchApp}>Go to Dashboard <ArrowUpRight size={15} strokeWidth={2} /></button>
              <a className="btn-secondary" href="/docs">Read the Docs</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-left">
            <LogoMark size={18} />
            <span className="footer-name">InheritX</span>
          </div>
          <div className="footer-copy">© 2026 InheritX. Built on Zama fhEVM.</div>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="/docs">Docs</a>
          </div>
        </footer>

      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const landingStyles = `
.lp { position: relative; z-index: 1; }
.lp::before {
  content: '';
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(0,212,232,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,232,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none; z-index: 0;
}

/* ─── NAV ─── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  height: 64px;
  display: flex; align-items: center; padding: 0 5%;
  background: rgba(8,8,16,0.6);
  backdrop-filter: blur(20px) saturate(1.3);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: all 0.3s;
}
.nav-scrolled { background: rgba(8,8,16,0.94); border-bottom-color: rgba(255,255,255,0.06); }
.nav-logo { display: flex; align-items: center; gap: 9px; margin-right: auto; text-decoration: none; }
.nav-logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 17px; font-weight: 700; color: var(--t1); letter-spacing: -0.02em;
}
.nav-links { display: flex; align-items: center; gap: 28px; margin-right: 28px; }
.nav-link { font-size: 13px; color: var(--t3); text-decoration: none; transition: color 0.2s; }
.nav-link:hover { color: var(--t1); }
.nav-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; background: var(--cyan);
  border: none; border-radius: 8px; color: #000;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.nav-btn:hover { background: var(--cyan-hi); box-shadow: 0 0 24px rgba(0,212,232,0.35); transform: translateY(-1px); }

/* ─── HERO ─── */
.hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 120px 5% 80px;
  position: relative; overflow: hidden;
}
.hero-glow {
  position: absolute;
  width: 700px; height: 700px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,212,232,0.07) 0%, transparent 65%);
  top: 50%; left: 50%; transform: translate(-50%, -55%);
  pointer-events: none; filter: blur(30px);
}
.hero-ring {
  position: absolute;
  width: 580px; height: 580px; border-radius: 50%;
  border: 1px solid rgba(0,212,232,0.05);
  top: 50%; left: 50%;
  transform: translate(-50%, -55%);
  animation: ring-spin 30s linear infinite;
  pointer-events: none;
}
.hero-ring::before {
  content: '';
  position: absolute;
  width: 7px; height: 7px;
  background: var(--cyan); border-radius: 50%;
  top: -3px; left: 50%; transform: translateX(-50%);
  box-shadow: 0 0 10px var(--cyan);
}
.hero-ring-2 { width: 420px; height: 420px; animation: ring-spin 20s linear infinite reverse; }
.hero-ring-2::before { top: auto; bottom: -3px; background: rgba(0,212,232,0.4); box-shadow: none; }
@keyframes ring-spin { from{transform:translate(-50%,-55%) rotate(0)} to{transform:translate(-50%,-55%) rotate(360deg)} }

.hero-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px;
  background: rgba(0,212,232,0.06);
  border: 1px solid rgba(0,212,232,0.15);
  border-radius: 100px;
  font-size: 12px; color: var(--cyan);
  letter-spacing: 0.03em; margin-bottom: 28px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}
.badge-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
  animation: bdot 2s ease-in-out infinite;
}
@keyframes bdot { 0%,100%{opacity:1} 50%{opacity:0.3} }

.hero-h1 {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(44px, 7vw, 88px);
  font-weight: 700; line-height: 1.0;
  letter-spacing: -0.03em; margin-bottom: 10px;
}
.h1-line1 { color: var(--t1); display: block; }
.h1-line2 { color: var(--cyan); display: block; }
.hero-sub {
  font-size: clamp(15px, 2vw, 18px); color: var(--t2);
  max-width: 520px; margin: 16px auto 36px;
  line-height: 1.65; font-weight: 300;
}

.hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; background: var(--cyan);
  border: none; border-radius: 10px; color: #000;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.25s;
  letter-spacing: -0.01em;
}
.btn-primary:hover { background: var(--cyan-hi); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,212,232,0.35); }
.btn-lg { padding: 15px 32px; font-size: 15px; }
.btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; background: transparent;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
  color: var(--t2);
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px; font-weight: 500;
  cursor: pointer; transition: all 0.25s; text-decoration: none;
}
.btn-secondary:hover { border-color: rgba(0,212,232,0.25); color: var(--cyan); background: rgba(0,212,232,0.04); }

.hero-stats { display: flex; gap: 48px; justify-content: center; flex-wrap: wrap; }
.hs-item { text-align: center; }
.hs-val {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px; font-weight: 700; color: var(--t1);
  letter-spacing: -0.02em; margin-bottom: 4px;
}
.hs-lbl { font-size: 11px; color: var(--t3); letter-spacing: 0.06em; text-transform: uppercase; font-weight: 500; }
.hs-sep { width: 1px; background: rgba(255,255,255,0.06); align-self: stretch; }

.scroll-hint {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  color: var(--t3); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
}
.scroll-line {
  width: 1px; height: 36px;
  background: linear-gradient(180deg, var(--cyan), transparent);
  animation: scroll-drop 1.8s ease-in-out infinite;
}
@keyframes scroll-drop { 0%,100%{opacity:0;transform:scaleY(0.4) translateY(-8px)} 50%{opacity:1;transform:scaleY(1) translateY(0)} }

/* ─── SECTIONS ─── */
.section { padding: 100px 5%; }
.section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--cyan); margin-bottom: 14px; text-align: center;
  font-weight: 500;
}
.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(30px, 4vw, 46px);
  font-weight: 700; letter-spacing: -0.02em;
  color: var(--t1); text-align: center;
  margin-bottom: 14px; line-height: 1.1;
}
.section-sub {
  font-size: 15px; color: var(--t2); text-align: center;
  max-width: 500px; margin: 0 auto 60px;
  line-height: 1.6; font-weight: 300;
}

/* ─── FEATURES ─── */
.feat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 14px; max-width: 1100px; margin: 0 auto;
}
.feat-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px; padding: 28px;
  transition: all 0.3s;
  position: relative; overflow: hidden;
}
.feat-card::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
}
.feat-card:hover {
  border-color: rgba(0,212,232,0.15);
  background: rgba(0,212,232,0.03);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}
.feat-icon {
  width: 44px; height: 44px; border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
  background: rgba(0,212,232,0.06);
  border: 1px solid rgba(0,212,232,0.12);
  color: var(--cyan);
  transition: all 0.3s;
}
.feat-card:hover .feat-icon {
  background: rgba(0,212,232,0.1);
  border-color: rgba(0,212,232,0.25);
  box-shadow: 0 0 16px rgba(0,212,232,0.1);
}
.feat-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px; font-weight: 600; color: var(--t1);
  margin-bottom: 10px; letter-spacing: -0.01em;
}
.feat-body { font-size: 13px; color: var(--t2); line-height: 1.65; font-weight: 300; }
.feat-tag {
  display: inline-block; margin-top: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: var(--cyan);
  background: rgba(0,212,232,0.06);
  border: 1px solid rgba(0,212,232,0.12);
  padding: 3px 9px; border-radius: 4px;
  letter-spacing: 0.03em;
}

/* ─── STEPS ─── */
.steps-section {
  padding: 100px 5%;
  background: linear-gradient(180deg, transparent 0%, rgba(0,212,232,0.015) 50%, transparent 100%);
}
.steps-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0; max-width: 960px; margin: 0 auto;
  position: relative;
}
.steps-line-bg {
  position: absolute; top: 28px;
  left: calc(12.5% + 18px); right: calc(12.5% + 18px);
  height: 1px;
  background: linear-gradient(90deg, rgba(0,212,232,0.3), rgba(0,212,232,0.06));
}
.step-item {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  padding: 0 14px; position: relative;
}
.step-num {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(0,212,232,0.05);
  border: 1.5px solid rgba(0,212,232,0.3);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 18px; font-weight: 700; color: var(--cyan);
  margin-bottom: 18px;
  position: relative; z-index: 1;
  transition: all 0.25s;
}
.step-item:hover .step-num {
  box-shadow: 0 0 28px rgba(0,212,232,0.15);
  background: rgba(0,212,232,0.08);
  border-color: rgba(0,212,232,0.5);
}
.step-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px; font-weight: 600; color: var(--t1);
  margin-bottom: 8px;
}
.step-body { font-size: 13px; color: var(--t2); line-height: 1.55; font-weight: 300; }

/* ─── FHE ─── */
.fhe-section { padding: 100px 5%; }
.fhe-inner {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 60px; align-items: center;
}
.fhe-checks { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
.fhe-check {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 10px;
  transition: all 0.2s;
}
.fhe-check:hover { border-color: rgba(0,212,232,0.15); background: rgba(0,212,232,0.03); }
.check-icon {
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(0,212,232,0.08);
  border: 1px solid rgba(0,212,232,0.2);
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan); flex-shrink: 0; margin-top: 1px;
}
.check-text { font-size: 13px; color: var(--t2); line-height: 1.5; }
.check-text strong { color: var(--t1); font-weight: 500; }

/* Code panel */
.fhe-right { position: relative; }
.code-panel {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px; overflow: hidden;
}
.code-topbar {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  background: rgba(255,255,255,0.015);
}
.dot-r { width:9px;height:9px;border-radius:50%;background:#ff5f57; }
.dot-y { width:9px;height:9px;border-radius:50%;background:#ffbd2e; }
.dot-g { width:9px;height:9px;border-radius:50%;background:#28ca41; }
.code-file {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: var(--t3);
}
.code-body {
  padding: 18px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; line-height: 2; color: var(--t3);
}
.code-line { display: flex; gap: 12px; }
.ln { color: var(--t4); min-width: 18px; text-align: right; user-select: none; font-size: 10px; }
.cm { color: var(--t3); font-style: italic; font-size: 11px; }
.kw { color: #c792ea; }
.fn { color: #82aaff; }
.ty { color: var(--cyan); }
.t1 { color: var(--t2); }
.hl {
  background: rgba(0,212,232,0.04);
  border-left: 2px solid rgba(0,212,232,0.3);
  margin: 0 -18px; padding: 0 18px;
  display: flex; gap: 12px;
}
.code-float {
  position: absolute; bottom: -14px; right: 24px;
  display: flex; align-items: center; gap: 6px;
  background: var(--cyan); color: #000;
  padding: 7px 14px; border-radius: 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px; font-weight: 700;
  box-shadow: 0 8px 28px rgba(0,212,232,0.3);
}

/* ─── SECURITY ─── */
.security-section { padding: 100px 5%; }
.security-inner {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1.1fr;
  gap: 60px; align-items: center;
}
.sec-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 20px; padding: 36px;
  position: relative; overflow: hidden;
}
.sec-card::before {
  content: '';
  position: absolute; top: -60px; right: -60px;
  width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,212,232,0.06) 0%, transparent 70%);
}
.sec-card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 26px; font-weight: 700; color: var(--t1);
  margin-bottom: 8px; letter-spacing: -0.02em;
}
.sec-card-sub { font-size: 13px; color: var(--t2); margin-bottom: 24px; line-height: 1.55; font-weight: 300; }
.sec-list { display: flex; flex-direction: column; gap: 10px; }
.sec-item {
  display: flex; align-items: center; gap: 12px;
  font-size: 13px; color: var(--t2);
}
.sec-dot {
  width: 20px; height: 20px; border-radius: 50%;
  background: rgba(0,212,232,0.08);
  border: 1px solid rgba(0,212,232,0.2);
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan); flex-shrink: 0;
}

/* Shield illustration */
.sec-illustration { display: flex; align-items: center; justify-content: center; }
.shield-wrap {
  position: relative; width: 280px; height: 320px;
  display: flex; align-items: center; justify-content: center;
}
.shield-outer { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.shield-svg { width: 240px; filter: drop-shadow(0 0 24px rgba(0,212,232,0.15)); }
.shield-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; }
.shield-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 11px; font-weight: 700; color: var(--cyan);
  letter-spacing: 0.1em;
}
.orbit-item {
  position: absolute;
  background: rgba(16,16,32,0.9);
  border: 1px solid rgba(0,212,232,0.15);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 11px; color: var(--t1); font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.02em;
}
.oi-1 { top: 30px; left: -20px; }
.oi-2 { top: 30px; right: -20px; }
.oi-3 { bottom: 60px; left: -10px; }
.oi-4 { bottom: 60px; right: -10px; }
.oi-5 { bottom: 10px; left: 50%; transform: translateX(-50%); }
.oi-dot { width:6px;height:6px;border-radius:50%;display:inline-block;margin-right:5px; }
.d-c { background: var(--cyan); }
.d-g { background: #00c98a; }
.d-p { background: #7c5ce8; }

/* ─── CTA ─── */
.cta-section { padding: 120px 5%; text-align: center; position: relative; overflow: hidden; }
.cta-glow {
  position: absolute; width: 600px; height: 400px;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  background: radial-gradient(ellipse, rgba(0,212,232,0.05) 0%, transparent 60%);
  pointer-events: none; filter: blur(40px);
}
.cta-inner { max-width: 600px; margin: 0 auto; position: relative; z-index: 1; }
.cta-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 700; color: var(--t1);
  letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 16px;
}
.cta-sub { font-size: 16px; color: var(--t2); margin-bottom: 36px; font-weight: 300; }
.cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ─── FOOTER ─── */
.footer {
  border-top: 1px solid rgba(255,255,255,0.04);
  padding: 24px 5%;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px;
}
.footer-left { display: flex; align-items: center; gap: 8px; }
.footer-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px; font-weight: 700; color: var(--t1);
}
.footer-copy { font-size: 12px; color: var(--t3); }
.footer-links { display: flex; gap: 20px; }
.footer-links a { font-size: 12px; color: var(--t3); text-decoration: none; transition: color 0.15s; }
.footer-links a:hover { color: var(--t2); }

/* ─── DIVIDER ─── */
.divider {
  max-width: 1100px; margin: 0 auto; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
}

/* ─── FLOATING PARTICLES ─── */
.particles {
  position: absolute; inset: 0;
  pointer-events: none; overflow: hidden;
}
.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--cyan);
  opacity: 0;
  animation: float-particle linear infinite;
}
.p1  { width: 8px;  height: 8px;  left: 3%;  animation-duration: 18s; animation-delay: 0s; }
.p2  { width: 7px;  height: 7px;  left: 10%; animation-duration: 22s; animation-delay: 3s; }
.p3  { width: 10px; height: 10px; left: 17%; animation-duration: 16s; animation-delay: 1s; }
.p4  { width: 7px;  height: 7px;  left: 24%; animation-duration: 24s; animation-delay: 5s; }
.p5  { width: 9px;  height: 9px;  left: 31%; animation-duration: 20s; animation-delay: 2s; }
.p6  { width: 7px;  height: 7px;  left: 37%; animation-duration: 19s; animation-delay: 7s; }
.p7  { width: 8px;  height: 8px;  left: 43%; animation-duration: 21s; animation-delay: 4s; }
.p8  { width: 7px;  height: 7px;  left: 50%; animation-duration: 17s; animation-delay: 6s; }
.p9  { width: 9px;  height: 9px;  left: 56%; animation-duration: 23s; animation-delay: 1.5s; }
.p10 { width: 7px;  height: 7px;  left: 62%; animation-duration: 15s; animation-delay: 8s; }
.p11 { width: 10px; height: 10px; left: 68%; animation-duration: 20s; animation-delay: 3.5s; }
.p12 { width: 8px;  height: 8px;  left: 74%; animation-duration: 18s; animation-delay: 5.5s; }
.p13 { width: 7px;  height: 7px;  left: 80%; animation-duration: 25s; animation-delay: 9s; }
.p14 { width: 9px;  height: 9px;  left: 86%; animation-duration: 19s; animation-delay: 2.5s; }
.p15 { width: 8px;  height: 8px;  left: 92%; animation-duration: 22s; animation-delay: 7.5s; }
.p16 { width: 7px;  height: 7px;  left: 97%; animation-duration: 16s; animation-delay: 4.5s; }
.p17 { width: 10px; height: 10px; left: 7%;  animation-duration: 21s; animation-delay: 1.8s; }
.p18 { width: 8px;  height: 8px;  left: 20%; animation-duration: 17s; animation-delay: 6.5s; }
.p19 { width: 9px;  height: 9px;  left: 34%; animation-duration: 23s; animation-delay: 0.5s; }
.p20 { width: 7px;  height: 7px;  left: 47%; animation-duration: 19s; animation-delay: 8.5s; }
.p21 { width: 10px; height: 10px; left: 59%; animation-duration: 16s; animation-delay: 3.2s; }
.p22 { width: 8px;  height: 8px;  left: 72%; animation-duration: 24s; animation-delay: 5.8s; }
.p23 { width: 9px;  height: 9px;  left: 85%; animation-duration: 18s; animation-delay: 2.2s; }

@keyframes float-particle {
  0%   { transform: translateY(100vh) scale(0); opacity: 0; }
  10%  { opacity: 0.4; }
  50%  { opacity: 0.15; }
  90%  { opacity: 0.3; }
  100% { transform: translateY(-20vh) scale(1); opacity: 0; }
}

/* ─── AMBIENT ORBS ─── */
.ambient-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
  animation: orb-breathe 8s ease-in-out infinite;
}
.orb-1 {
  width: 400px; height: 400px;
  top: 10%; right: -5%;
  background: radial-gradient(circle, rgba(0,212,232,0.04) 0%, transparent 70%);
  animation-delay: 0s;
}
.orb-2 {
  width: 300px; height: 300px;
  bottom: 5%; left: -3%;
  background: radial-gradient(circle, rgba(124,92,232,0.035) 0%, transparent 70%);
  animation-delay: 4s;
}
.orb-3 {
  width: 350px; height: 350px;
  top: 20%; left: 55%;
  background: radial-gradient(circle, rgba(0,212,232,0.04) 0%, transparent 70%);
  animation-delay: 2s;
}
@keyframes orb-breathe {
  0%,100% { transform: scale(1) translate(0, 0); opacity: 0.6; }
  25%     { transform: scale(1.1) translate(10px, -8px); opacity: 1; }
  50%     { transform: scale(0.95) translate(-5px, 5px); opacity: 0.5; }
  75%     { transform: scale(1.05) translate(-8px, -3px); opacity: 0.8; }
}

/* Sections need relative for orbs */
.section-features { position: relative; overflow: hidden; }
.fhe-section { position: relative; overflow: hidden; }

/* ─── SHIELD PULSE RINGS ─── */
.shield-pulse-ring {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(0,212,232,0.1);
  animation: shield-pulse 4s ease-out infinite;
  pointer-events: none;
}
.spr-1 { width: 200px; height: 200px; animation-delay: 0s; }
.spr-2 { width: 260px; height: 260px; animation-delay: 1.3s; }
.spr-3 { width: 320px; height: 320px; animation-delay: 2.6s; }
@keyframes shield-pulse {
  0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 0.4; }
  100% { transform: translate(-50%,-50%) scale(1.4); opacity: 0; }
}

/* ─── RESPONSIVE ─── */
@media(max-width:960px) {
  .feat-grid { grid-template-columns: 1fr 1fr; }
  .fhe-inner { grid-template-columns: 1fr; }
  .security-inner { grid-template-columns: 1fr; }
  .sec-illustration { display: none; }
  .steps-row { grid-template-columns: repeat(2,1fr); gap: 32px; }
  .steps-line-bg { display: none; }
}
@media(max-width:640px) {
  .feat-grid { grid-template-columns: 1fr; }
  .nav-links { display: none; }
  .hero-stats { gap: 28px; }
  .steps-row { grid-template-columns: 1fr; }
}
`
