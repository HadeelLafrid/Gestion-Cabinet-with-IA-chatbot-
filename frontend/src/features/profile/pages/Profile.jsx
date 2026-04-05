import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { ROUTES } from '../../../constants/routes'

const specializations = [
  'Cardiologie', 'Neurologie', 'Pédiatrie', 'Chirurgie',
  'Dermatologie', 'Ophtalmologie', 'Psychiatrie', 'Radiologie',
  'Médecine générale', 'Gynécologie',
]

const languages = ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand']

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [form, setForm] = useState({
    firstName:       user?.name?.split(' ')[1] || 'Lafrid',
    lastName:        user?.name?.split(' ')[0] || 'Hadil',
    email:           user?.email || 'Hadillafrid@gmail.com',
    phone:           user?.phone || '+213',
    dob:             '10.12.1980',
    sex:             'female',
    facilityName:    'Arbi si ahmed ',
    facilityAddress: 'Saad dahlab blida',
    specialization:  user?.specialty || '',
    experience:      '',
    languages:       '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPhoto(url)
    }
  }

  const handleSave = () => {
    // will connect to API later
    alert('Modifications enregistrées !')
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Doctor's Personal Information
        </h1>
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="bg-[#eef0f8] rounded-2xl p-8">
        <div className="flex gap-8">

          {/* Left + Middle columns — form */}
          <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-5">

            {/* First Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Medical Facility Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Medical Facility Name
              </label>
              <input
                type="text"
                name="facilityName"
                value={form.facilityName}
                onChange={handleChange}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Medical Facility Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Medical Facility Address
              </label>
              <input
                type="text"
                name="facilityAddress"
                value={form.facilityAddress}
                onChange={handleChange}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Specialization */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Specialization <span className="text-red-400">*</span>
              </label>
              <select
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors appearance-none cursor-pointer"
              >
                <option value="">Select from the List</option>
                {specializations.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+380"
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Experience (years)
              </label>
              <input
                type="number"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                min="0"
                className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Date of birth + Sex + Languages row */}
            <div className="col-span-2 grid grid-cols-3 gap-4">

              {/* Date of Birth */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <input
                    type="text"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    placeholder="DD.MM.YYYY"
                    className="flex-1 bg-transparent text-sm text-gray-700 outline-none w-full"
                  />
                </div>
              </div>

              {/* Sex */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">Sex</label>
                <select
                  name="sex"
                  value={form.sex}
                  onChange={handleChange}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Languages */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Languages <span className="text-red-400">*</span>
                </label>
                <select
                  name="languages"
                  value={form.languages}
                  onChange={handleChange}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-400 transition-colors cursor-pointer"
                >
                  <option value="">Select from the List</option>
                  {languages.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Right column — photo */}
          <div className="flex flex-col items-center gap-3 w-40 pt-2">

            {/* Avatar circle */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-sm">
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20a8 8 0 0116 0" />
                  </svg>
                </div>
              )}
            </div>

            {/* Upload button */}
            <label className="cursor-pointer w-full">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <div className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-3 rounded-full transition-colors">
                Upload Photo
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
            </label>

            {/* Delete button */}
            <button
              onClick={() => setPhoto(null)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold py-2.5 px-3 rounded-full transition-colors"
            >
              Delete Photo
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            </button>

          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 mt-8">

          {/* Cancel */}
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex items-center gap-2 border border-indigo-300 text-indigo-600 hover:bg-indigo-50 text-sm font-semibold py-3 px-8 rounded-full transition-colors"
          >
            Cancel
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="3" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </button>

          {/* Save Changes */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-3 px-8 rounded-full transition-colors"
          >
            Save Changes
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  )
}