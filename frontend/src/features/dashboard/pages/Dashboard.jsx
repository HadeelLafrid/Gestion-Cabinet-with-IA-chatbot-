import { useState, useEffect } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import apiClient from '../../../services/apiClient'
import StatsCards from '../components/StatsCards'
import RevenueSection from '../components/RevenueSection'
import RecentPatients from '../components/RecentPatients'
import WeeklyChart from '../components/WeeklyChart'
import QuickAccess from '../components/QuickAccess'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/dashboard/')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour, {user?.first_name ? `Dr. ${user.first_name}` : 'Dr. Hadil'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Voici le résumé de votre activité pour aujourd'hui.
        </p>
      </div>

      <StatsCards stats={data?.stats} loading={loading} />
      <RevenueSection revenue={data?.revenue_month} loading={loading} />
      <RecentPatients patients={data?.recent_patients} loading={loading} />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <WeeklyChart activity={data?.weekly_activity} loading={loading} />
        </div>
        <QuickAccess />
      </div>
    </div>
  )
}