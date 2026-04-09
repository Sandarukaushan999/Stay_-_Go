import { useState } from 'react'
import api from '../../../lib/axios'
import { useAuthStore } from '../../../app/store/authStore'

export default function RiderAvailabilityToggle({ initial = 'offline', onChange }) {
  const user = useAuthStore((s) => s.user)
  const [value, setValue] = useState(initial)
  const [loading, setLoading] = useState(false)

  async function setAvailability(next) {
    if (user?.role !== 'rider') return
    setLoading(true)
    try {
      await api.put('/ride-sharing/profile/me/availability', { availability: next })
      setValue(next)
      onChange?.(next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">Availability</div>
          <div className="text-sm text-slate-400">
            {user?.role === 'rider'
              ? 'Set online to receive requests.'
              : `Waiting for admin approval (${user?.riderVerificationStatus ?? 'pending'}).`}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading || user?.role !== 'rider'}
            onClick={() => setAvailability('offline')}
            className={
              value === 'offline'
                ? 'rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900'
                : 'rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900'
            }
          >
            Offline
          </button>
          <button
            type="button"
            disabled={loading || user?.role !== 'rider'}
            onClick={() => setAvailability('online')}
            className={
              value === 'online'
                ? 'rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white'
                : 'rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900'
            }
          >
            Online
          </button>
        </div>
      </div>
    </div>
  )
}

