import { useState } from 'react'

const TEAM = [
  {
    id: 1,
    name: 'Hadil Lafrid',
    role: 'Lead Frontend Developer',
    initials: 'TD',
    color: 'bg-indigo-100 text-indigo-600',
    phone: '0770000001',
    email: 'hadil.lafrid@ensia.edu.dz',
  },
  {
    id: 2,
    name: 'Ibtihal Djezzar',
    role: 'Backend Engineer',
    initials: 'SM',
    color: 'bg-cyan-100 text-cyan-600',
    phone: '0770000002',
    email: 'Ibtihal.djezzar@ensia.edu.dz',
  },
  {
    id: 3,
    name: 'Ahmed-ben-djebara',
    role: 'Full Stack Developer',
    initials: 'LB',
    color: 'bg-pink-100 text-pink-600',
    phone: '0770000003',
    email: 'lucas.bernard@devteam.com',
  },
  {
    id: 4,
    name: 'Ilyes Anior',
    role: 'UI/UX Designer',
    initials: 'IK',
    color: 'bg-purple-100 text-purple-600',
    phone: '0770000004',
    email: 'ines.khelif@devteam.com',
  },
  {
    id: 5,
    name: 'Lounis Raouaf',
    role: 'DevOps & IA Engineer',
    initials: 'MB',
    color: 'bg-amber-100 text-amber-600',
    phone: '0770000005',
    email: 'mehdi.benyamina@devteam.com',
  },
]

export default function ContactPage() {
  const [copied, setCopied] = useState(null)

  const handleCopy = (text, id, type) => {
    navigator.clipboard.writeText(text)
    setCopied(`${id}-${type}`)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Page title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Contact & Équipe</h1>
        <p className="text-sm text-gray-400 mt-1">
          Coordonnées de l'équipe médicale et du cabinet.
        </p>
      </div>

      {/* System Name Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-6">
        <p className="text-indigo-200 text-xs uppercase tracking-widest font-semibold mb-1">
          Système
        </p>
        <h2 className="text-white text-xl font-bold">Cabinet Med-IA</h2>
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-2 gap-4">
        {TEAM.map(member => (
          <div
            key={member.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-100 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${member.color}`}>
                  {member.initials}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{member.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{member.role}</p>
              </div>
            </div>

            {/* Contact info */}
            <div className="mt-4 flex flex-col gap-2">

              {/* Phone */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 013 1.18 2 2 0 014.18 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span className="text-sm text-gray-700 font-medium">{member.phone}</span>
                </div>
                <button
                  onClick={() => handleCopy(member.phone, member.id, 'phone')}
                  className="text-xs text-indigo-400 hover:text-indigo-600 font-medium transition-colors"
                >
                  {copied === `${member.id}-phone` ? '✓ Copié' : 'Copier'}
                </button>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="flex-shrink-0">
                    <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    <polyline points="22 6 12 13 2 6" />
                  </svg>
                  <span className="text-sm text-gray-700 font-medium truncate">{member.email}</span>
                </div>
                <button
                  onClick={() => handleCopy(member.email, member.id, 'email')}
                  className="text-xs text-indigo-400 hover:text-indigo-600 font-medium transition-colors flex-shrink-0 ml-2"
                >
                  {copied === `${member.id}-email` ? '✓ Copié' : 'Copier'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}