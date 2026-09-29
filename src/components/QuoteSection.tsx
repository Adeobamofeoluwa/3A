import { useState, forwardRef } from 'react'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'
import { sendNotification } from '../lib/notify'
import { Send, Loader2 } from 'lucide-react'

const projectTypes = [
  'Custom Furniture',
  'Interior Design',
  'Exhibition Booth',
  'Ceiling & Interiors',
  'Other',
]

const budgetRanges = [
  'Under ₦500k',
  '₦500k - ₦1M',
  '₦1M - ₦3M',
  '₦3M - ₦5M',
  'Above ₦5M',
]

interface QuoteSectionProps {
  id?: string
}

const QuoteSection = forwardRef<HTMLDivElement, QuoteSectionProps>(
  ({ id = 'quote' }, ref) => {
    const { settings } = useSettings()
    const primary = settings?.primary_color || '#8B6F47'
    const secondary = settings?.secondary_color || '#3E2C1C'

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [projectType, setProjectType] = useState(projectTypes[0])
    const [budgetRange, setBudgetRange] = useState(budgetRanges[0])
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      setSubmitting(true)
      setError('')

      const { error: insertError } = await supabase.from('quote_requests').insert({
        name,
        email,
        phone: phone || null,
        project_type: projectType,
        budget_range: budgetRange,
        description,
      })

      setSubmitting(false)

      if (insertError) {
        setError('Something went wrong. Please try again.')
        return
      }

      setSuccess(true)
      setName('')
      setEmail('')
      setPhone('')
      setProjectType(projectTypes[0])
      setBudgetRange(budgetRanges[0])
      setDescription('')
      setTimeout(() => setSuccess(false), 5000)
      sendNotification({
        type: 'quote',
        name,
        email,
        phone,
        projectType,
        budgetRange,
        description,
        subject: `Quote Request: ${projectType} (${budgetRange})`,
        message: description,
      })
    }

    const inputClass =
      'w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm'
    const ringStyle = { '--tw-ring-color': primary } as React.CSSProperties

    return (
      <section
        ref={ref}
        id={id}
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor: secondary }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-sm uppercase tracking-[0.2em] mb-3"
              style={{ color: settings?.accent_color || '#C4A062' }}
            >
              Have a Unique Project in Mind?
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-4 text-white"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Request a Quote
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Tell us about your project and we'll get back to you within 24 hours
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
            {success && (
              <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4 animate-fade-in">
                Quote submitted successfully! We'll contact you soon.
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 animate-fade-in">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    style={ringStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    style={ringStyle}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    style={ringStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">
                    Project Type *
                  </label>
                  <select
                    required
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className={`${inputClass} bg-white`}
                    style={ringStyle}
                  >
                    {projectTypes.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Budget Range *
                </label>
                <select
                  required
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className={`${inputClass} bg-white`}
                  style={ringStyle}
                >
                  {budgetRanges.map((br) => (
                    <option key={br} value={br}>
                      {br}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">
                  Project Description *
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Tell us about your project requirements, preferred materials, timeline, etc."
                  className={`${inputClass} resize-none`}
                  style={ringStyle}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: primary }}
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Quote Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    )
  }
)

QuoteSection.displayName = 'QuoteSection'

export default QuoteSection
