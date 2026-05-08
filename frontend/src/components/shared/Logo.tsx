interface LogoProps {
  size?: number
}

export function LogoMark({ size = 28 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 2L28 7.5V15C28 22 22.5 27.5 16 29C9.5 27.5 4 22 4 15V7.5L16 2Z"
        fill="rgba(0,212,232,0.08)" stroke="#00d4e8" strokeWidth="1.5"/>
      <circle cx="16" cy="13" r="3.5" stroke="#00d4e8" strokeWidth="1.5" fill="none"/>
      <rect x="12" y="15.5" width="8" height="6.5" rx="1.5"
        stroke="#00d4e8" strokeWidth="1.5" fill="rgba(0,212,232,0.1)"/>
      <circle cx="16" cy="18" r="1" fill="#00d4e8"/>
      <path d="M16 18.8V20.5" stroke="#00d4e8" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

export function LogoFull({ size = 28 }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <LogoMark size={size} />
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: size * 0.6,
        fontWeight: 700,
        color: '#fff',
        letterSpacing: '-0.02em',
      }}>
        InheritX
      </span>
    </div>
  )
}
