import { Hexagon, Lock, Shield } from 'lucide-react'

export default function FHEBadge() {
  return (
    <div className="fhe-footer">
      <div className="fhe-f-left">
        <div className="fhe-hex-icon">
          <Hexagon size={16} strokeWidth={1.5} />
        </div>
        <div>
          <div className="fhe-f-title">Protected by Zama fhEVM</div>
          <div className="fhe-f-sub">All sensitive data encrypted with Fully Homomorphic Encryption</div>
        </div>
      </div>
      <div className="fhe-f-chips">
        <span className="fhe-chip"><Lock size={9} strokeWidth={2} /> eaddress</span>
        <span className="fhe-chip"><Lock size={9} strokeWidth={2} /> euint128</span>
        <span className="fhe-chip"><Shield size={9} strokeWidth={2} /> Threshold</span>
      </div>
    </div>
  )
}
