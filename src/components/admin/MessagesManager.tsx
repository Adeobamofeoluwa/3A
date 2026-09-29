import { useState } from 'react'
import type { Booking, ContactMessage } from '../../lib/types'
import { useSettings } from '../../context/SettingsContext'
import { supabase } from '../../lib/supabase'
import { Trash2, Mail, ShoppingBag, CheckCircle, Clock, User } from 'lucide-react'

interface MessagesManagerProps {
  bookings: Booking[]
  messages: ContactMessage[]
  onRefresh: () => Promise<void>
}

type Tab = 'bookings' | 'contact'

export default function MessagesManager({ bookings, messages, onRefresh }: MessagesManagerProps) {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'
  const [activeTab, setActiveTab] = useState<Tab>('bookings')

  async function updateBookingStatus(id: string, status: string) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    await onRefresh()
  }

  async function deleteBooking(id: string) {
    if (!confirm('Delete this booking?')) return
    await supabase.from('bookings').delete().eq('id', id)
    await onRefresh()
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return
    await supabase.from('contact_messages').delete().eq('id', id)
    await onRefresh()
  }

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#10b981',
    completed: '#3b82f6',
    cancelled: '#ef4444',
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border border-stone-100 w-fit">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'bookings' ? 'text-white' : 'text-stone-500 hover:text-stone-700'
          }`}
          style={activeTab === 'bookings' ? { backgroundColor: primary } : {}}
        >
          <ShoppingBag className="w-4 h-4" />
          Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'contact' ? 'text-white' : 'text-stone-500 hover:text-stone-700'
          }`}
          style={activeTab === 'contact' ? { backgroundColor: primary } : {}}
        >
          <Mail className="w-4 h-4" />
          Contact ({messages.length})
        </button>
      </div>

      {/* Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-16 text-stone-400 bg-white rounded-xl border border-stone-100">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No bookings yet.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-stone-100"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${statusColors[booking.status] || '#999'}20` }}
                    >
                      <User className="w-5 h-5" style={{ color: statusColors[booking.status] || '#999' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{booking.customer_name}</p>
                      <p className="text-sm text-stone-500">{booking.customer_email}</p>
                    </div>
                  </div>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium capitalize flex items-center gap-1.5"
                    style={{
                      backgroundColor: `${statusColors[booking.status] || '#999'}20`,
                      color: statusColors[booking.status] || '#999',
                    }}
                  >
                    {booking.status === 'pending' && <Clock className="w-3 h-3" />}
                    {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                    {booking.status}
                  </span>
                </div>

                {booking.customer_phone && (
                  <p className="text-sm text-stone-500 mb-2">Phone: {booking.customer_phone}</p>
                )}
                {booking.message && (
                  <p className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3 mb-3">
                    {booking.message}
                  </p>
                )}
                <p className="text-xs text-stone-400 mb-3">
                  Received: {new Date(booking.created_at).toLocaleString()}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Confirm
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Completed
                    </button>
                  )}
                  <a
                    href={`mailto:${booking.customer_email}?subject=Re: Your booking enquiry&body=Hi ${booking.customer_name},%0D%0A%0D%0AThank you for your enquiry...`}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Reply
                  </a>
                  <button
                    onClick={() => deleteBooking(booking.id)}
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
      )}

      {/* Contact Messages */}
      {activeTab === 'contact' && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-stone-400 bg-white rounded-xl border border-stone-100">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No messages yet.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-stone-100"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primary}15` }}
                    >
                      <Mail className="w-5 h-5" style={{ color: primary }} />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{msg.name}</p>
                      <p className="text-sm text-stone-500">{msg.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {msg.subject && (
                  <p className="text-sm font-medium text-stone-700 mb-2">Subject: {msg.subject}</p>
                )}
                {msg.phone && (
                  <p className="text-sm text-stone-500 mb-2">Phone: {msg.phone}</p>
                )}
                <p className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3 mb-2">
                  {msg.message}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-stone-400">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                  <a
                    href={`mailto:${msg.email}?subject=Re: ${msg.subject || 'Your message'}&body=Hi ${msg.name},%0D%0A%0D%0AThank you for reaching out...`}
                    className="text-xs font-medium hover:underline flex items-center gap-1"
                    style={{ color: primary }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Reply via Email
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
