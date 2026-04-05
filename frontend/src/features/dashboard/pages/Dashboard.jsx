import { useAuth } from '../../../hooks/useAuth'
import StatsCards from '../components/StatsCards'
import RevenueSection from '../components/RevenueSection'
import RecentPatients from '../components/RecentPatients'
import WeeklyChart from '../components/WeeklyChart'
import QuickAccess from '../components/QuickAccess'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-6">

      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour, {user?.name || 'Dr. Hadil'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Voici le résumé de votre activité pour aujourd'hui.
        </p>
      </div>

      {/* Stats row */}
      <StatsCards />

      {/* Revenue + shortcuts */}
      <RevenueSection />

      {/* Recent patients table */}
      <RecentPatients />

      {/* Chart + Quick access */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <WeeklyChart />
        </div>
        <QuickAccess />
      </div>

    </div>
  )
}