import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const data = [
  { day: 'LUN', consultations: 3,  rdvs: 2 },
  { day: 'MAR', consultations: 7,  rdvs: 4 },
  { day: 'MER', consultations: 4,  rdvs: 3 },
  { day: 'JEU', consultations: 9,  rdvs: 5 },
  { day: 'VEN', consultations: 6,  rdvs: 7 },
  { day: 'SAM', consultations: 4,  rdvs: 2 },
  { day: 'DIM', consultations: 8,  rdvs: 3 },
]

export default function WeeklyChart() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-base font-bold text-gray-800 mb-6">Activité hebdomadaire</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={10} barGap={3}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
          />
          <Bar dataKey="consultations" name="Consultations" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="rdvs"          name="RDVs"          fill="#c7d2fe" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
