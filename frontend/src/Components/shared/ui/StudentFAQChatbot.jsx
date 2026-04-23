import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, ChevronDown, RotateCcw, Headphones } from 'lucide-react'

// ─── FAQ Data ──────────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  {
    id: 'account',
    label: '👤 Account',
    color: 'bg-[#876DFF]/10 text-[#5b4ccc] border-[#876DFF]/20',
    activeColor: 'bg-[#876DFF] text-white border-[#876DFF]',
    items: [
      {
        question: 'How do I update my profile?',
        answer:
          'Click on your avatar in the top-right corner of any page, then select "Profile". You can update your full name, university email, profile photo, phone number, student ID, and emergency contact from there.',
      },
      {
        question: 'How do I change my password?',
        answer:
          'Go to Profile → Security tab. Under "Change Password", enter your current password, then type your new password twice and click "Save Password". Passwords must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
      },
      {
        question: 'I forgot my password',
        answer:
          'On the Login page, click "Forgot password?" below the password field. Enter your university email and we will send you a reset link. Check your spam folder if you do not see it within a few minutes.',
      },
    ],
  },
  {
    id: 'navigation',
    label: '🧭 Navigation',
    color: 'bg-[#BAF91A]/15 text-[#5a7000] border-[#BAF91A]/30',
    activeColor: 'bg-[#BAF91A] text-[#101312] border-[#BAF91A]',
    items: [
      {
        question: 'How do I use this system?',
        answer:
          'Stay & Go has three main areas: (1) Ride Sharing — request or join campus rides, (2) Roommate Matching — find compatible hostel roommates, and (3) Maintenance — submit hostel maintenance tickets. Use the top navigation bar to move between them.',
      },
      {
        question: 'Where can I find my dashboard?',
        answer:
          'After logging in, you are automatically taken to your Student Dashboard. You can also click "STAY & GO" in the top-left at any time to return to it, or use the "Dashboard" link in the top navigation bar.',
      },
      {
        question: 'How do I access different features?',
        answer:
          'Use the top navigation bar: "Rides" takes you to the ride-sharing workspace, "Maintenance" opens the maintenance ticket system, and "Roommates" opens the roommate matching portal. Each feature also has a shortcut card on your Student Dashboard.',
      },
    ],
  },
  {
    id: 'support',
    label: '🛟 Support',
    color: 'bg-rose-50 text-rose-600 border-rose-200',
    activeColor: 'bg-rose-500 text-white border-rose-500',
    items: [
      {
        question: 'How can I contact support?',
        answer:
          'For technical issues, submit a ticket through the Maintenance section. For urgent matters, use the SOS feature during a live ride. You can also email your university IT helpdesk — the address is shown in the footer of the application.',
      },
      {
        question: 'What should I do if something is not working?',
        answer:
          'First, try refreshing the page. If the problem persists: (1) Clear your browser cache, (2) Try a different browser, (3) Check your internet connection. If it still does not work, report it via the Maintenance section with a description and screenshot.',
      },
      {
        question: 'Who can I report issues to?',
        answer:
          'You can report: System bugs → Maintenance → "Report a bug". Safety concerns during a ride → use the in-app SOS button. Roommate disputes → Roommate portal → Issues section. General feedback → your university student portal.',
      },
    ],
  },
]

const ALL_ITEMS = FAQ_CATEGORIES.flatMap((cat) =>
  cat.items.map((item) => ({ ...item, categoryId: cat.id }))
)

const BOT_GREETING = {
  id: 'greeting',
  from: 'bot',
  text: "👋 Hi! I'm your Stay & Go assistant. I can help you with account questions, navigating the platform, and getting support. Choose a category or pick a question below!",
}

// ─── Message bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isBot = msg.from === 'bot'
  return (
    <div className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}>
      {isBot && (
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#BAF91A] text-[10px] font-bold text-[#101312] mt-0.5">
          SG
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isBot
            ? 'rounded-tl-sm bg-white border border-[#101312]/10 text-[#101312] shadow-sm'
            : 'rounded-br-sm bg-[#101312] text-white'
        }`}
      >
        {msg.text}
      </div>
    </div>
  )
}

// ─── Main chatbot component ───────────────────────────────────────────────────
export default function StudentFAQChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([BOT_GREETING])
  const [activeCategory, setActiveCategory] = useState(null)
  const [answeredCount, setAnsweredCount] = useState(0)
  const scrollRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  const handleQuestionClick = (item) => {
    const userMsg = { id: Date.now(), from: 'user', text: item.question }
    // Simulate a short bot typing delay
    setMessages((prev) => [...prev, userMsg])
    setTimeout(() => {
      const botMsg = { id: Date.now() + 1, from: 'bot', text: item.answer }
      setMessages((prev) => [...prev, botMsg])
      setAnsweredCount((c) => c + 1)
    }, 420)
  }

  const handleReset = () => {
    setMessages([BOT_GREETING])
    setActiveCategory(null)
    setAnsweredCount(0)
  }

  const currentItems =
    activeCategory === null
      ? []
      : FAQ_CATEGORIES.find((c) => c.id === activeCategory)?.items ?? []

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        id="faq-chatbot-trigger"
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
          open ? 'bg-[#101312] text-white' : 'bg-[#BAF91A] text-[#101312]'
        }`}
        aria-label="Toggle FAQ chatbot"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {/* Unread dot when closed */}
        {!open && answeredCount === 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#876DFF] border-2 border-white animate-pulse" />
        )}
      </button>

      {/* ── Chat window ── */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-3xl border border-[#101312]/12 bg-[#fafdf4] shadow-[0_20px_60px_rgba(16,19,18,0.18)] transition-all duration-300 origin-bottom-right ${
          open ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'
        }`}
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-3xl bg-[#101312] px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BAF91A] text-[11px] font-bold text-[#101312]">
              SG
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Stay &amp; Go Assistant</div>
              <div className="flex items-center gap-1 text-[10px] text-[#BAF91A]/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#BAF91A]" />
                Online · Student support
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"
              title="Reset chat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-4 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id ?? i} msg={msg} />
          ))}
        </div>

        {/* Category + question selector */}
        <div className="border-t border-[#101312]/08 bg-white rounded-b-3xl px-3 py-3 space-y-2.5">
          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`flex-shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all duration-200 ${
                  activeCategory === cat.id ? cat.activeColor : cat.color
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Question buttons */}
          {activeCategory && (
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
              {currentItems.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuestionClick(item)}
                  className="w-full rounded-xl border border-[#101312]/10 bg-[#fafdf4] px-3 py-2 text-left text-xs font-medium text-[#101312]/80 transition hover:border-[#BAF91A] hover:bg-[#E2FF99]/60 hover:text-[#101312]"
                >
                  <Send className="mr-1.5 inline h-3 w-3 opacity-50" />
                  {item.question}
                </button>
              ))}
            </div>
          )}

          {/* Still need help */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            <Headphones className="h-3 w-3 text-[#101312]/30" />
            <span className="text-[10px] text-[#101312]/40">
              Still need help?{' '}
              <a
                href="/maintenance"
                className="font-semibold text-[#876DFF] underline underline-offset-2"
              >
                Contact support
              </a>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
