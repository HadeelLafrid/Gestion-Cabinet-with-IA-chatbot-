export default function StatsCards({ stats, loading }) {
  const items = [
    {
      label: 'Nouveaux patients (mois)',
      value: stats?.new_patients_month ?? '—',
      badge: stats?.change_in_patients ? `+${stats.change_in_patients}%` : null,
      color: 'bg-indigo-100', iconColor: 'text-indigo-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="10" cy="7" r="4" /><path d="M10 15H6a4 4 0 00-4 4" /><path d="M19 12v6M16 15h6" />
        </svg>
      ),
    },
    {
      label: 'Total patients',
      value: stats?.total_patients ?? '—',
      color: 'bg-cyan-100', iconColor: 'text-cyan-500',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="10" cy="7" r="4" /><path d="M10 15H6a4 4 0 00-4 4" /><circle cx="17" cy="17" r="3" /><path d="M21 21l-1.5-1.5" />
        </svg>
      ),
    },
    {
      label: "Consultations aujourd'hui",
      value: stats?.patients_today ?? '—',
      color: 'bg-pink-100', iconColor: 'text-pink-400',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="7" r="3" /><circle cx="15" cy="7" r="3" /><path d="M3 19a6 6 0 0112 0M15 11a4 4 0 014 4" />
        </svg>
      ),
    },
    {
      label: 'Consultations (mois)',
      value: stats?.consultations_month ?? '—',
      color: 'bg-indigo-100', iconColor: 'text-indigo-400',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8M8 12h8" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {items.map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 relative">
          {stat.badge && (
            <span className="absolute top-4 right-4 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
              {stat.badge}
            </span>
          )}
          <div className={`w-11 h-11 rounded-full ${stat.color} ${stat.iconColor} flex items-center justify-center`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {loading ? '...' : stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}