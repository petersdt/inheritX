import { useEffect, useState, useRef } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { HeartPulse, FileText, ShieldCheck, AlertTriangle, Clock, Hexagon, Gift } from 'lucide-react'
import { CONTRACT_ADDRESS } from '../lib/constants'

interface ActivityItem {
  icon: typeof FileText
  color: string
  bg: string
  label: string
  detail: string
  time: string
  blockNumber: bigint
  txHash: string
}

// Cache activities so we don't re-fetch on every mount
let cachedActivities: ActivityItem[] | null = null
let cachedFor: string | null = null

export default function ActivityPage() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [activities, setActivities] = useState<ActivityItem[]>(cachedActivities || [])
  const [loading, setLoading] = useState(!cachedActivities || cachedFor !== address)
  const fetched = useRef(false)

  useEffect(() => {
    if (!publicClient || !address || !CONTRACT_ADDRESS) {
      setLoading(false)
      return
    }

    // Use cache if available for this address
    if (cachedActivities && cachedFor === address) {
      setActivities(cachedActivities)
      setLoading(false)
      return
    }

    if (fetched.current) return
    fetched.current = true

    async function fetchEvents() {
      try {
        const currentBlock = await publicClient!.getBlockNumber()
        // Smaller range to reduce load
        const fromBlock = currentBlock > 5000n ? currentBlock - 5000n : 0n

        const items: ActivityItem[] = []

        // Fetch sequentially with small delays to avoid rate limiting
        const eventConfigs = [
          {
            event: { type: 'event' as const, name: 'PlanCreated', inputs: [
              { indexed: true, name: 'planId', type: 'uint256' },
              { indexed: true, name: 'owner', type: 'address' },
              { indexed: false, name: 'planType', type: 'uint8' },
              { indexed: false, name: 'name', type: 'string' },
            ]},
            args: { owner: address },
            transform: (log: any) => ({
              icon: FileText, color: 'var(--cyan)', bg: 'rgba(0,212,232,0.06)',
              label: 'Plan Created',
              detail: `${(log.args as any)?.name || 'Plan'} — ETH encrypted on-chain`,
            }),
          },
          {
            event: { type: 'event' as const, name: 'CheckIn', inputs: [
              { indexed: true, name: 'planId', type: 'uint256' },
              { indexed: true, name: 'owner', type: 'address' },
              { indexed: false, name: 'timestamp', type: 'uint256' },
            ]},
            args: { owner: address },
            transform: () => ({
              icon: HeartPulse, color: 'var(--green)', bg: 'rgba(0,201,138,0.06)',
              label: 'Check-in',
              detail: 'Proof of life confirmed — timer reset',
            }),
          },
          {
            event: { type: 'event' as const, name: 'KYCSubmitted', inputs: [
              { indexed: true, name: 'wallet', type: 'address' },
            ]},
            args: { wallet: address },
            transform: () => ({
              icon: ShieldCheck, color: 'var(--gold)', bg: 'rgba(240,160,32,0.06)',
              label: 'KYC Submitted',
              detail: 'Identity verification submitted on-chain',
            }),
          },
          {
            event: { type: 'event' as const, name: 'KYCVerified', inputs: [
              { indexed: true, name: 'wallet', type: 'address' },
            ]},
            args: { wallet: address },
            transform: () => ({
              icon: ShieldCheck, color: 'var(--green)', bg: 'rgba(0,201,138,0.06)',
              label: 'KYC Verified',
              detail: 'Identity verification complete',
            }),
          },
          {
            event: { type: 'event' as const, name: 'InheritanceClaimed', inputs: [
              { indexed: true, name: 'planId', type: 'uint256' },
              { indexed: false, name: 'beneficiaryIndex', type: 'uint8' },
              { indexed: false, name: 'claimer', type: 'address' },
            ]},
            args: {},
            transform: (log: any) => ({
              icon: Gift, color: 'var(--green)', bg: 'rgba(0,201,138,0.06)',
              label: 'Inheritance Claimed',
              detail: `Plan #${(log.args as any)?.planId?.toString() || '?'} — assets transferred to heir`,
            }),
          },
        ]

        for (const config of eventConfigs) {
          try {
            const logs = await publicClient!.getLogs({
              address: CONTRACT_ADDRESS,
              event: config.event,
              args: config.args,
              fromBlock,
              toBlock: currentBlock,
            })

            for (const log of logs) {
              const data = config.transform(log)
              // Estimate time from block number instead of fetching each block
              const blocksAgo = Number(currentBlock - (log.blockNumber || 0n))
              const secondsAgo = blocksAgo * 12 // ~12s per block on Sepolia
              items.push({
                ...data,
                time: timeAgo(Math.floor(Date.now() / 1000) - secondsAgo),
                blockNumber: log.blockNumber || 0n,
                txHash: log.transactionHash || '',
              })
            }

            // Small delay between requests to avoid rate limiting
            await new Promise(r => setTimeout(r, 300))
          } catch (err) {
            console.warn(`Failed to fetch ${config.event.name} events:`, err)
          }
        }

        // Sort newest first
        items.sort((a, b) => Number(b.blockNumber - a.blockNumber))

        // Cache
        cachedActivities = items
        cachedFor = address!
        setActivities(items)
      } catch (err) {
        console.error('Failed to fetch events:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [address, publicClient])

  return (
    <div className="page-container-wide">
      <style>{styles}</style>
      <div className="act-header">
        <h1 className="pg-title">Activity</h1>
        <p className="pg-sub">Your on-chain activity from the InheritX contract.</p>
      </div>

      {loading ? (
        <div className="act-loading">
          <Hexagon size={20} strokeWidth={1.5} className="spin" style={{ color: 'var(--cyan)' }} />
          <span>Loading on-chain events...</span>
        </div>
      ) : activities.length > 0 ? (
        <div className="act-list">
          {activities.map((item, i) => (
            <div className="act-row" key={i}>
              <div className="act-icon" style={{ background: item.bg, color: item.color }}>
                <item.icon size={15} strokeWidth={1.8} />
              </div>
              <div className="act-info">
                <div className="act-label">{item.label}</div>
                <div className="act-detail">{item.detail}</div>
              </div>
              <div className="act-right">
                <div className="act-time"><Clock size={10} strokeWidth={2} /> {item.time}</div>
                {item.txHash && (
                  <a className="act-tx" href={`https://sepolia.etherscan.io/tx/${item.txHash}`} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}>
                    {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="act-empty">
          <Hexagon size={28} strokeWidth={1} style={{ color: 'var(--t3)', opacity: 0.3 }} />
          <p>No activity yet. Submit KYC or create a plan to see events here.</p>
        </div>
      )}
    </div>
  )
}

function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(timestamp * 1000).toLocaleDateString()
}

const styles = `
.page-container-wide { max-width: 800px; }
.act-header { margin-bottom: 20px; }
.pg-title { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: var(--t1); margin-bottom: 2px; }
.pg-sub { font-size: 13px; color: var(--t3); }
.act-list { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; overflow: hidden; }
.act-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.12s; }
.act-row:last-child { border-bottom: none; }
.act-row:hover { background: rgba(255,255,255,0.015); }
.act-icon { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.act-info { flex: 1; }
.act-label { font-size: 13px; font-weight: 600; color: var(--t1); margin-bottom: 2px; }
.act-detail { font-size: 12px; color: var(--t3); }
.act-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
.act-time { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--t3); white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
.act-tx { font-size: 10px; color: var(--cyan); font-family: 'JetBrains Mono', monospace; opacity: 0.6; transition: opacity 0.15s; }
.act-tx:hover { opacity: 1; }
.act-loading { display: flex; align-items: center; gap: 10px; justify-content: center; padding: 40px; color: var(--t3); font-size: 13px; }
.act-empty { text-align: center; padding: 48px 20px; color: var(--t3); font-size: 13px; display: flex; flex-direction: column; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 14px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
`
