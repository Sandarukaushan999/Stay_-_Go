import { X, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function ConfirmActionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText, 
  cancelText = "Cancel", 
  type = 'emerald' // 'emerald' | 'amber' | 'rose'
}) {
  if (!isOpen) return null

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/10',
      iconBg: 'bg-emerald-500/20',
      iconText: 'text-emerald-500',
      btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20',
      shadow: 'shadow-emerald-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10',
      iconBg: 'bg-amber-500/20',
      iconText: 'text-amber-500',
      btn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20',
      shadow: 'shadow-amber-500/20'
    },
    rose: {
      bg: 'bg-rose-500/10',
      iconBg: 'bg-rose-500/20',
      iconText: 'text-rose-500',
      btn: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20',
      shadow: 'shadow-rose-500/20'
    }
  }

  const theme = colorClasses[type]

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[24px] p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bg} rounded-bl-[100px]`} />

        <div className="flex flex-col items-center text-center relative z-10">
          <div className={`w-16 h-16 ${theme.iconBg} ${theme.iconText} rounded-full flex items-center justify-center mb-4`}>
            {type === 'emerald' ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-sm text-slate-400 mb-8">
            {description}
          </p>

          <div className="flex w-full gap-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-colors border border-slate-700 hover:border-slate-600 outline-none"
            >
              {cancelText}
            </button>
            <button 
              onClick={handleConfirm}
              className={`flex-1 ${theme.btn} text-white font-bold py-3 rounded-xl transition-colors shadow-lg outline-none`}
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Close Button X */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1 z-20"
        >
            <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
