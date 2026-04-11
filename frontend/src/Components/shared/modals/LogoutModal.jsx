import { useAuthStore } from '../../../app/store/authStore'
import { LogOut, X } from 'lucide-react'

export default function LogoutModal() {
  const { isLogoutModalOpen, closeLogoutModal, logout } = useAuthStore()

  if (!isLogoutModalOpen) return null

  const handleConfirm = () => {
    logout()
    window.location.href = '/auth/login' // Hard navigate to clear states appropriately
  }

  const handleCancel = () => {
    closeLogoutModal()
    // It remains on current page per user logic request natively
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[24px] p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-bl-[100px]" />

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4">
            <LogOut className="w-8 h-8 ml-1" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Sign Out Session?</h2>
          <p className="text-sm text-slate-400 mb-8">
            You will be securely disconnected from your current session. You will need to re-authenticate to access the platform.
          </p>

          <div className="flex w-full gap-3">
            <button 
              onClick={handleCancel}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors border border-slate-700 hover:border-slate-600 outline-none"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-rose-500/20 outline-none"
            >
              Yes, Sign Out
            </button>
          </div>
        </div>

        {/* Close Button X */}
        <button 
            onClick={handleCancel}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1 z-20"
        >
            <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
