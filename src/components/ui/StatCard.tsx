import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  color?: string
  bg?: string
  suffix?: string
}

export default function StatCard({ label, value, icon: Icon, color = 'text-violet-light', bg = 'bg-violet-deep/30', suffix }: StatCardProps) {
  return (
    <div className="card-mystic p-5 text-center hover:border-violet-glow/30 transition-colors">
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="font-serif text-2xl font-bold text-star">
        {value}{suffix && <span className="text-base text-star/50 ml-1">{suffix}</span>}
      </div>
      <div className="text-xs text-star/40 mt-1">{label}</div>
    </div>
  )
}
