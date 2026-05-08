import type { LucideIcon } from 'lucide-react'
import { TrendingUp } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  iconClass: string
  value: string
  label: string
  trend?: string
}

export default function StatCard({ icon: Icon, iconClass, value, label, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="sc-top">
        <div className={`sc-icon-wrap ${iconClass}`}>
          <Icon size={16} strokeWidth={1.8} />
        </div>
        {trend && (
          <div className="sc-trend">
            <TrendingUp size={10} strokeWidth={2} />
            {trend}
          </div>
        )}
      </div>
      <div className="sc-val">{value}</div>
      <div className="sc-label">{label}</div>
    </div>
  )
}
