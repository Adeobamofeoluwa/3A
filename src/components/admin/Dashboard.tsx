import type { Work, Booking, ContactMessage, Exhibition, QuoteRequest } from '../../lib/types'
import { useSettings } from '../../context/SettingsContext'
import { Package, Inbox, Mail, Calendar, Eye, MapPin, FileText } from 'lucide-react'

interface DashboardProps {
  works: Work[]
  bookings: Booking[]
  messages: ContactMessage[]
  exhibitions: Exhibition[]
  quotes: QuoteRequest[]
  onNavigate: (tab: 'dashboard' | 'works' | 'exhibitions' | 'quotes' | 'messages' | 'settings') => void
}

export default function Dashboard({ works, bookings, messages, exhibitions, quotes, onNavigate }: DashboardProps) {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'

  const pendingBookings = bookings.filter((b) => b.status === 'pending')
  const recentWorks = works.slice(0, 5)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingExhibitions = exhibitions.filter((ex) => {
    const start = new Date(ex.start_date + 'T00:00:00')
    return start >= today && ex.status !== 'past'
  })

  const stats = [
    {
      label: 'Total Works',
      value: works.length,
      icon: Package,
      color: primary,
    },
    {
      label: 'Pending Bookings',
      value: pendingBookings.length,
      icon: Inbox,
      color: '#f59e0b',
    },
    {
      label: 'Quote Requests',
      value: quotes.filter((q) => q.status === 'pending').length,
      icon: FileText,
      color: '#8b5cf6',
    },
    {
      label: 'Contact Messages',
      value: messages.length,
      icon: Mail,
      color: '#3b82f6',
    },
    {
      label: 'Upcoming Booths',
      value: upcomingExhibitions.length,
      icon: Calendar,
      color: '#10b981',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-shadow"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <p className="text-3xl font-bold text-stone-800">{stat.value}</p>
            <p className="text-sm text-stone-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('works')}
          className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-all text-left group"
        >
          <Package className="w-6 h-6 text-stone-400 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-stone-800 mt-3">Manage Works</p>
          <p className="text-sm text-stone-500 mt-1">Add, edit, or remove furniture pieces</p>
        </button>
        <button
          onClick={() => onNavigate('exhibitions')}
          className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-all text-left group"
        >
          <Calendar className="w-6 h-6 text-stone-400 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-stone-800 mt-3">Manage Booths</p>
          <p className="text-sm text-stone-500 mt-1">Add and manage exhibition booth projects</p>
        </button>
        <button
          onClick={() => onNavigate('quotes')}
          className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-all text-left group"
        >
          <FileText className="w-6 h-6 text-stone-400 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-stone-800 mt-3">Quote Requests</p>
          <p className="text-sm text-stone-500 mt-1">Review and manage project quote enquiries</p>
        </button>
        <button
          onClick={() => onNavigate('messages')}
          className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-all text-left group"
        >
          <Inbox className="w-6 h-6 text-stone-400 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-stone-800 mt-3">View Messages</p>
          <p className="text-sm text-stone-500 mt-1">Check bookings and contact form submissions</p>
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 hover:shadow-md transition-all text-left group"
        >
          <Eye className="w-6 h-6 text-stone-400 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-stone-800 mt-3">Site Settings</p>
          <p className="text-sm text-stone-500 mt-1">Customize colors, text, images, and more</p>
        </button>
      </div>

      {/* Recent Works */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800">Recent Works</h3>
          <button
            onClick={() => onNavigate('works')}
            className="text-sm font-medium hover:underline"
            style={{ color: primary }}
          >
            View all
          </button>
        </div>
        {recentWorks.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-6">No works yet. Add some from the Works tab.</p>
        ) : (
          <div className="space-y-3">
            {recentWorks.map((work) => (
              <div key={work.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                  {work.image_url && (
                    <img src={work.image_url} alt={work.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-700 text-sm truncate">{work.title}</p>
                  <p className="text-xs text-stone-400">{work.category} · {work.status}</p>
                </div>
                {work.featured && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${primary}15`, color: primary }}>
                    Featured
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Exhibitions */}
      {upcomingExhibitions.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800">Upcoming Booths</h3>
            <button
              onClick={() => onNavigate('exhibitions')}
              className="text-sm font-medium hover:underline"
              style={{ color: primary }}
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {upcomingExhibitions.slice(0, 4).map((ex) => (
              <div key={ex.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${primary}10` }}
                >
                  <Calendar className="w-5 h-5" style={{ color: primary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-700 text-sm truncate">{ex.title}</p>
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span>
                      {new Date(ex.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {ex.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ex.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
