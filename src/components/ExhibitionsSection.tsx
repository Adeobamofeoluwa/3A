import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext'
import type { Exhibition } from '../lib/types'
import { Calendar, MapPin, Loader2, ArrowRight } from 'lucide-react'

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

export default function ExhibitionsSection() {
  const { settings } = useSettings()
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExhibitions()
  }, [])

  async function fetchExhibitions() {
    const { data } = await supabase
      .from('exhibitions')
      .select('*')
      .order('start_date', { ascending: false })
    if (data) setExhibitions(data as Exhibition[])
    setLoading(false)
  }

  const primary = settings?.primary_color || '#8B6F47'
  const secondary = settings?.secondary_color || '#3E2C1C'

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
        </div>
      </section>
    )
  }

  if (exhibitions.length === 0) return null

  const sorted = [...exhibitions].sort((a, b) => {
    const aStatus = getStatusLabel(a)
    const bStatus = getStatusLabel(b)
    const order: Record<string, number> = { Ongoing: 0, Upcoming: 1, Past: 2 }
    const aOrder = order[aStatus] ?? 3
    const bOrder = order[bStatus] ?? 3
    if (aOrder !== bOrder) return aOrder - bOrder
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  })

  const preview = sorted.slice(0, 3)

  return (
    <section id="exhibitions" className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-serif)', color: secondary }}
          >
            Exhibition Booths
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Exhibition booths we've designed and built for clients.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preview.map((ex) => {
            const status = getStatusLabel(ex)
            const statusColor = getStatusColor(status, primary)
            return (
              <div
                key={ex.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg transition-all group"
              >
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
                    <p className="text-sm text-stone-600 line-clamp-3">{ex.description}</p>
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
          })}
        </div>

        {/* View All Link */}
        {exhibitions.length > 3 && (
          <div className="text-center mt-10">
            <Link
              to="/exhibitions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              View All Booths
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
