import { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (val: string) => void
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    const d = value ? new Date(value) : new Date()
    return { month: d.getMonth(), year: d.getFullYear() }
  })

  const selected = value ? new Date(value) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate()
  const firstDay = new Date(viewDate.year, viewDate.month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const prevMonth = () => {
    setViewDate(v => v.month === 0 ? { month: 11, year: v.year - 1 } : { month: v.month - 1, year: v.year })
  }
  const nextMonth = () => {
    setViewDate(v => v.month === 11 ? { month: 0, year: v.year + 1 } : { month: v.month + 1, year: v.year })
  }

  const selectDay = (day: number) => {
    const d = new Date(viewDate.year, viewDate.month, day)
    onChange(d.toISOString().split('T')[0])
    setOpen(false)
  }

  const isSelected = (day: number) =>
    selected?.getFullYear() === viewDate.year && selected?.getMonth() === viewDate.month && selected?.getDate() === day

  const isPast = (day: number) => new Date(viewDate.year, viewDate.month, day) < today

  const isToday = (day: number) => new Date(viewDate.year, viewDate.month, day).getTime() === today.getTime()

  return (
    <>
      <style>{styles}</style>
      <div className="dp-wrap">
        <button type="button" className="dp-trigger" onClick={() => setOpen(!open)}>
          <Calendar size={14} strokeWidth={1.8} />
          <span className={value ? 'dp-trigger-val' : 'dp-trigger-placeholder'}>
            {value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select a date'}
          </span>
        </button>

        {open && (
          <>
            <div className="dp-backdrop" onClick={() => setOpen(false)} />
            <div className="dp-dropdown">
              <div className="dp-header">
                <button type="button" className="dp-nav-btn" onClick={prevMonth}>
                  <ChevronLeft size={14} strokeWidth={2} />
                </button>
                <span className="dp-month">{monthNames[viewDate.month]} {viewDate.year}</span>
                <button type="button" className="dp-nav-btn" onClick={nextMonth}>
                  <ChevronRight size={14} strokeWidth={2} />
                </button>
              </div>
              <div className="dp-days-header">
                {dayNames.map(d => <span key={d} className="dp-day-name">{d}</span>)}
              </div>
              <div className="dp-grid">
                {blanks.map(i => <span key={`b${i}`} className="dp-cell dp-blank" />)}
                {days.map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`dp-cell ${isSelected(day) ? 'dp-selected' : ''} ${isToday(day) ? 'dp-today' : ''} ${isPast(day) ? 'dp-past' : ''}`}
                    onClick={() => !isPast(day) && selectDay(day)}
                    disabled={isPast(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

const styles = `
.dp-wrap { position: relative; }

.dp-trigger {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 10px 13px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; cursor: pointer; transition: all 0.15s;
  font-family: 'Inter', sans-serif; font-size: 13px;
  text-align: left;
}
.dp-trigger:hover { border-color: rgba(0,212,232,0.2); }
.dp-trigger svg { color: var(--cyan); flex-shrink: 0; }
.dp-trigger-val { color: var(--t1); }
.dp-trigger-placeholder { color: rgba(255,255,255,0.25); }

.dp-backdrop {
  position: fixed; inset: 0; z-index: 99;
}

.dp-dropdown {
  position: absolute; top: calc(100% + 6px); left: 0;
  width: 280px; z-index: 100;
  background: rgba(18,18,32,0.97);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 14px;
  backdrop-filter: blur(20px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
  animation: dp-in 0.2s ease-out;
}
@keyframes dp-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

.dp-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.dp-month {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px; font-weight: 600; color: var(--t1);
}
.dp-nav-btn {
  width: 28px; height: 28px; border-radius: 7px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  color: var(--t2); cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.dp-nav-btn:hover { border-color: rgba(0,212,232,0.2); color: var(--cyan); }

.dp-days-header {
  display: grid; grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}
.dp-day-name {
  text-align: center; font-size: 10px; font-weight: 600;
  color: var(--t3); padding: 4px 0;
  letter-spacing: 0.04em;
}

.dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }

.dp-cell {
  width: 100%; aspect-ratio: 1;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 500; color: var(--t2);
  border-radius: 8px; border: none;
  background: transparent; cursor: pointer;
  transition: all 0.12s;
  font-family: 'Inter', sans-serif;
}
.dp-cell:hover:not(.dp-past):not(.dp-blank) {
  background: rgba(0,212,232,0.08); color: var(--cyan);
}
.dp-blank { cursor: default; }
.dp-past { color: var(--t4); cursor: not-allowed; opacity: 0.4; }
.dp-today {
  color: var(--cyan);
  background: rgba(0,212,232,0.06);
  border: 1px solid rgba(0,212,232,0.15);
}
.dp-selected {
  background: var(--cyan) !important;
  color: #000 !important;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(0,212,232,0.3);
}
`
