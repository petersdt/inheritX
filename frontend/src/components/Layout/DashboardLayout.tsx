import Topbar from './Topbar'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  activePage: string
  onNavigate: (id: string) => void
  kycStatus: 'NOT_SUBMITTED' | 'SUBMITTED' | 'VERIFIED'
}

export default function DashboardLayout({ children, activePage, onNavigate, kycStatus }: DashboardLayoutProps) {
  return (
    <div className="dashboard-root">
      <Topbar />
      <div className="body">
        <Sidebar active={activePage} onNavigate={onNavigate} kycStatus={kycStatus} />
        <main className="main">
          {children}
        </main>
      </div>
    </div>
  )
}
