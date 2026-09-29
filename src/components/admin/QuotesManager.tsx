import type { QuoteRequest } from '../../lib/types'
import { useSettings } from '../../context/SettingsContext'
import { supabase } from '../../lib/supabase'
import { Trash2, FileText, CheckCircle, Clock, User, Mail, Phone } from 'lucide-react'

interface QuotesManagerProps {
  quotes: QuoteRequest[]
  onRefresh: () => Promise<void>
}

export default function QuotesManager({ quotes, onRefresh }: QuotesManagerProps) {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'

  async function updateStatus(id: string, status: string) {
    await supabase.from('quote_requests').update({ status }).eq('id', id)
    await onRefresh()
  }

  async function deleteQuote(id: string) {
    if (!confirm('Delete this quote request?')) return
    await supabase.from('quote_requests').delete().eq('id', id)
    await onRefresh()
  }

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    contacted: '#3b82f6',
    completed: '#10b981',
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-500">{quotes.length} quote requests</p>

      {quotes.length === 0 ? (
        <div className="text-center py-16 text-stone-400 bg-white rounded-xl border border-stone-100">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No quote requests yet.</p>
        </div>
      ) : (
        quotes.map((quote) => (
          <div
            key={quote.id}
            className="bg-white rounded-xl p-5 shadow-sm border border-stone-100"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${statusColors[quote.status] || '#999'}20` }}
                >
                  <User className="w-5 h-5" style={{ color: statusColors[quote.status] || '#999' }} />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">{quote.name}</p>
                  <div className="flex items-center gap-3 text-sm text-stone-500">
                    <a href={`mailto:${quote.email}`} className="flex items-center gap-1 hover:underline">
                      <Mail className="w-3 h-3" />
                      {quote.email}
                    </a>
                    {quote.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {quote.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span
                className="text-xs px-3 py-1 rounded-full font-medium capitalize flex items-center gap-1.5"
                style={{
                  backgroundColor: `${statusColors[quote.status] || '#999'}20`,
                  color: statusColors[quote.status] || '#999',
                }}
              >
                {quote.status === 'pending' && <Clock className="w-3 h-3" />}
                {quote.status === 'contacted' && <CheckCircle className="w-3 h-3" />}
                {quote.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                {quote.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                {quote.project_type}
              </span>
              {quote.budget_range && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-stone-100 text-stone-600">
                  {quote.budget_range}
                </span>
              )}
            </div>

            <p className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3 mb-3">
              {quote.description}
            </p>

            <p className="text-xs text-stone-400 mb-3">
              Received: {new Date(quote.created_at).toLocaleString()}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {quote.status === 'pending' && (
                <button
                  onClick={() => updateStatus(quote.id, 'contacted')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mark Contacted
                </button>
              )}
              {quote.status === 'contacted' && (
                <button
                  onClick={() => updateStatus(quote.id, 'completed')}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Mark Completed
                </button>
              )}
              <a
                href={`mailto:${quote.email}?subject=Re: Your quote request for ${quote.project_type}&body=Hi ${quote.name},%0D%0A%0D%0AThank you for your interest...`}
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5" />
                Reply
              </a>
              <button
                onClick={() => deleteQuote(quote.id)}
                className="px-3 py-1.5 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
