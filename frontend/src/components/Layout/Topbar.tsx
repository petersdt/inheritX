import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { LogoMark } from '../shared/Logo'

export default function Topbar() {
  const navigate = useNavigate()

  return (
    <div className="topbar">
      <div className="tb-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <LogoMark size={26} />
        <span className="logo-text">InheritX</span>
        <span className="logo-tag">Testnet</span>
      </div>

      <div className="tb-search">
        <input type="text" placeholder="Search plans, heirs, activity..." className="tb-search-input" />
      </div>

      <div className="tb-actions">
        <div className="tb-network">
          <span className="net-dot" />
          <span className="net-name">Ethereum Sepolia</span>
        </div>

        <div className="tb-bell">
          <Bell size={15} strokeWidth={1.8} />
          <div className="bell-dot" />
        </div>

        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const connected = mounted && account && chain
            return (
              <div
                {...(!mounted && {
                  'aria-hidden': true,
                  style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                })}
              >
                {!connected ? (
                  <button className="tb-connect-btn" onClick={openConnectModal}>
                    Connect Wallet
                  </button>
                ) : (
                  <div className="tb-wallet" onClick={openAccountModal}>
                    <div className="wallet-avatar" />
                    <div className="wallet-info">
                      <div className="wallet-addr">{account.displayName}</div>
                      <div className="wallet-bal">{account.displayBalance || '0 ETH'}</div>
                    </div>
                  </div>
                )}
              </div>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  )
}
