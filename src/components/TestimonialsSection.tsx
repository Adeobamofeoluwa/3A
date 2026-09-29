import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext'
import type { Testimonial } from '../lib/types'
import { Star, Quote, Loader2 } from 'lucide-react'

export default function TestimonialsSection() {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'
  const secondary = settings?.secondary_color || '#3E2C1C'
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTestimonials() {
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (data) setTestimonials(data as Testimonial[])
      setLoading(false)
    }
    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: primary }}>
            What Our Clients Say
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-serif)', color: secondary }}
          >
            Testimonials
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Don't just take our word for it — here's what our satisfied clients have to say.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-all"
            >
              <Quote className="w-8 h-8 mb-4" style={{ color: `${primary}40` }} />
              <p className="text-stone-600 leading-relaxed mb-5 italic">"{t.quote}"</p>
              <div className="flex items-center gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ backgroundColor: primary }}
                >
                  {t.client_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{t.client_name}</p>
                  {t.client_role && (
                    <p className="text-xs text-stone-400">{t.client_role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
