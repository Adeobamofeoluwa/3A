import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext'
import type { Exhibition } from '../lib/types'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Calendar, MapPin, Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

function formatDateRange(start: string, end: string | null): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  const startStr = new Date(start + 'T00:00:00').toLocaleDateString('en-US', opts)
  if (!end) return startStr
  const endStr = new Date(end + 'T00:00:00').toLocaleDateString('en-US', opts)
  return `${startStr} — ${endStr}`
}

function getStatusLabel(ex: Exhibition): string {
  if (ex.status && ex.status !== 'upcoming') return ex.status
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(ex.start_date + 'T00:00:00')
  const end = ex.end_date ? new Date(ex.end_date + 'T00:00:00') : start
  if (today < start) return 'Upcoming'
  if (today > end) return 'Past'
  return 'Ongoing'
}

function getStatusColor(status: string, primary: string): string {
  if (status === 'Upcoming') return primary
  if (status === 'Ongoing') return '#10b981'
  return '#94a3b8'
}

export default function ExhibitionsPage() {
  const { settings, loading } = useSettings()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loadingEx, setLoadingEx] = useState(true)

  useEffect(() => {
    fetchExhibitions()
  }, [])

  async function fetchExhibitions() {
    const { data } = await supabase
      .from('exhibitions')
      .select('*')
      .order('start_date', { ascending: false })
    if (data) setExhibitions(data as Exhibition[])
    setLoadingEx(false)
  }

  const primary = settings?.primary_color || '#8B6F47'
  const secondary = settings?.secondary_color || '#3E2C1C'

  const sorted = [...exhibitions].sort((a, b) => {
    const aStatus = getStatusLabel(a)
    const bStatus = getStatusLabel(b)
    const order: Record<string, number> = { Ongoing: 0, Upcoming: 1, Past: 2 }
    const aOrder = order[aStatus] ?? 3
    const bOrder = order[bStatus] ?? 3
    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  })

  const upcoming = sorted.filter((ex) => getStatusLabel(ex) !== 'Past')
  const past = sorted.filter((ex) => getStatusLabel(ex) === 'Past')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: primary }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Page Header */}
      <div
        className="pt-32 pb-16 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: secondary }}
      >
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1
            className="text-4xl sm:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Exhibition Booths
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Exhibition booths we've designed and built for clients.
          </p>
        </div>
      </div>

      {loadingEx ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
        </div>
      ) : exhibitions.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <Calendar className="w-14 h-14 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No booth projects yet. Add one from the admin panel.</p>
        </div>
      ) : (
        <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
          {/* Upcoming & Ongoing */}
          {upcoming.length > 0 && (
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-serif)', color: secondary }}
              >
                Recent &amp; Upcoming Booths
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((ex) => (
                  <ExhibitionCard
                    key={ex.id}
                    ex={ex}
                    primary={primary}
                    secondary={secondary}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Exhibitions */}
          {past.length > 0 && (
            <div>
              <h2
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: 'var(--font-serif)', color: secondary }}
              >
                Past Booth Projects
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((ex) => (
                  <ExhibitionCard
                    key={ex.id}
                    ex={ex}
                    primary={primary}
                    secondary={secondary}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  )
}

function ExhibitionCard({
  ex,
  primary,
  secondary,
}: {
  ex: Exhibition
  primary: string
  secondary: string
}) {
  const status = getStatusLabel(ex)
  const statusColor = getStatusColor(status, primary)

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg transition-all group">
      <div className="relative h-52 overflow-hidden bg-stone-200">
        {ex.image_url ? (
          <img
            src={ex.image_url}
            alt={ex.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: `${primary}10` }}
          >
            <Calendar className="w-10 h-10" style={{ color: `${primary}40` }} />
          </div>
        )}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
          style={{ backgroundColor: statusColor }}
        >
          {status}
        </div>
      </div>
      <div className="p-5 space-y-3">
        <h3
          className="text-xl font-semibold"
          style={{ color: secondary, fontFamily: 'var(--font-serif)' }}
        >
          {ex.title}
        </h3>
        {ex.description && (
          <p className="text-sm text-stone-600 leading-relaxed">{ex.description}</p>
        )}
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
          <span>{formatDateRange(ex.start_date, ex.end_date)}</span>
        </div>
        {ex.location && (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: primary }} />
            <span>{ex.location}</span>
          </div>
        )}
      </div>
    </div>
  )
}
