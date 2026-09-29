import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'
import { sendNotification } from '../lib/notify'
import { Send, Loader2, Mail, Phone, MapPin } from 'lucide-react'

export default function ContactSection() {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const { error: insertError } = await supabase.from('contact_messages').insert({
      name,
      email,
      phone,
      subject,
      message,
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
    setSubject('')
    setMessage('')
    setTimeout(() => setSuccess(false), 5000)
    sendNotification({
      type: 'contact',
      name,
      email,
      phone,
      subject,
      message,
    })
  }

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-stone-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: primary }}>
            Get In Touch
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-stone-800 mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Contact Us
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Have a question or want to commission a custom piece? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Mail className="w-5 h-5" style={{ color: primary }} />
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">Email</p>
                <p className="text-sm font-medium text-stone-700">
                  {settings?.contact_email || 'info@3afurniture.com'}
                </p>
              </div>
            </div>

            {settings?.whatsapp_url && (
              <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${primary}15` }}
                >
                  <Phone className="w-5 h-5" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">WhatsApp</p>
                  <a
                    href={settings.whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-stone-700 hover:underline"
                  >
                    Chat with us
                  </a>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primary}15` }}
              >
                <MapPin className="w-5 h-5" style={{ color: primary }} />
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">Workshop</p>
                <p className="text-sm font-medium text-stone-700">By appointment only</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3 bg-white rounded-xl p-6 shadow-sm">
            {success && (
              <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 mb-4 animate-fade-in">
                Thank you! Your message has been sent. We'll get back to you soon.
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 animate-fade-in">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm resize-none"
                  style={{ '--tw-ring-color': primary } as React.CSSProperties}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: primary }}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
