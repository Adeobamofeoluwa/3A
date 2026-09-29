import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'
import type { Work, Booking, ContactMessage, Exhibition, QuoteRequest } from '../lib/types'
import {
  LayoutDashboard,
  Package,
  Settings,
  Inbox,
  LogOut,
  Menu,
  ExternalLink,
  Save,
  Calendar,
  FileText,
  Download,
  X,
  Bell,
} from 'lucide-react'
import WorksManager from '../components/admin/WorksManager'
import ExhibitionsManager from '../components/admin/ExhibitionsManager'
import SettingsManager from '../components/admin/SettingsManager'
import MessagesManager from '../components/admin/MessagesManager'
import QuotesManager from '../components/admin/QuotesManager'
import Dashboard from '../components/admin/Dashboard'

type AdminTab = 'dashboard' | 'works' | 'exhibitions' | 'quotes' | 'messages' | 'settings'

interface Toast {
  id: string
  text: string
  tab: AdminTab
}

export default function AdminPanel() {
  const { settings, refresh } = useSettings()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [works, setWorks] = useState<Work[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const saveFnRef = useRef<(() => Promise<void>) | null>(null)
  const [saving, setSaving] = useState(false)
  const [hasSaveFn, setHasSaveFn] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') !== 'true') {
      navigate('/admin')
    }
  }, [navigate])

  useEffect(() => {
    fetchAll()
  }, [])

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Realtime subscriptions for new entries
  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const b = payload.new as Booking
        addToast(`New booking request: ${b.customer_name}`, 'messages')
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, (payload) => {
        const m = payload.new as ContactMessage
        addToast(`New message from ${m.name}`, 'messages')
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quote_requests' }, (payload) => {
        const q = payload.new as QuoteRequest
        addToast(`New quote request from ${q.name}`, 'quotes')
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const addToast = useCallback((text: string, tab: AdminTab) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, text, tab }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 6000)
  }, [])

  async function fetchAll() {
    const [worksRes, bookingsRes, messagesRes, exhibitionsRes, quotesRes] = await Promise.all([
      supabase.from('works').select('*').order('display_order', { ascending: true }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('exhibitions').select('*').order('start_date', { ascending: false }),
      supabase.from('quote_requests').select('*').order('created_at', { ascending: false }),
    ])

    if (worksRes.data) setWorks(worksRes.data as Work[])
    if (bookingsRes.data) setBookings(bookingsRes.data as Booking[])
    if (messagesRes.data) setMessages(messagesRes.data as ContactMessage[])
    if (exhibitionsRes.data) setExhibitions(exhibitionsRes.data as Exhibition[])
    if (quotesRes.data) setQuotes(quotesRes.data as QuoteRequest[])
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_authed')
    navigate('/admin')
  }

  async function handleInstall() {
    if (!installEvent) return
    installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
    setShowInstallBanner(false)
  }

  const primary = settings?.primary_color || '#8B6F47'

  const tabs: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'works', label: 'Works', icon: Package },
    { id: 'exhibitions', label: 'Booths', icon: Calendar },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'messages', label: 'Messages', icon: Inbox },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const pendingBookings = bookings.filter((b) => b.status === 'pending').length
  const pendingQuotes = quotes.filter((q) => q.status === 'pending').length
  const canSave = activeTab === 'settings' || ((activeTab === 'works' || activeTab === 'exhibitions') && hasSaveFn)

  async function handleSaveAll() {
    if (!saveFnRef.current) return
    setSaving(true)
    await saveFnRef.current()
    setSaving(false)
  }

  const headerTitle: Record<AdminTab, string> = {
    dashboard: 'Dashboard',
    works: 'Manage Works',
    exhibitions: 'Manage Booths',
    quotes: 'Quote Requests',
    messages: 'Messages & Bookings',
    settings: 'Site Settings',
  }

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-30 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: settings?.secondary_color || '#3E2C1C' }}
      >
        <div className="p-5 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={settings?.site_name || 'Logo'} className="h-10 w-auto object-contain mb-1" />
            ) : (
              <div className="flex items-center gap-2">
                <img src="./logo.svg" alt="" className="h-8 w-auto object-contain" />
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                  {settings?.site_name || '3A Furniture'}
                </h2>
              </div>
            )}
            <p className="text-white/50 text-xs mt-0.5">Admin Panel</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                style={activeTab === tab.id ? { backgroundColor: primary } : {}}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.id === 'messages' && (pendingBookings + messages.length) > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingBookings + messages.length}
                  </span>
                )}
                {tab.id === 'quotes' && pendingQuotes > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingQuotes}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="space-y-1 pt-4 border-t border-white/10">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              View Website
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-stone-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-stone-800 capitalize flex-1">
            {headerTitle[activeTab]}
          </h1>
          {canSave && (
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primary }}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save All'}
            </button>
          )}
        </header>

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="bg-stone-800 text-white px-4 py-3 flex items-center gap-3 animate-fade-in">
            <Download className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm flex-1">
              Install this app on your phone for quick access. It works offline and opens full-screen.
            </p>
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white text-stone-800 hover:bg-stone-100 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard works={works} bookings={bookings} messages={messages} exhibitions={exhibitions} quotes={quotes} onNavigate={setActiveTab} />
          )}
          {activeTab === 'works' && <WorksManager works={works} onRefresh={fetchAll} saveFnRef={saveFnRef} onSaveAvailable={setHasSaveFn} />}
          {activeTab === 'exhibitions' && <ExhibitionsManager exhibitions={exhibitions} onRefresh={fetchAll} saveFnRef={saveFnRef} onSaveAvailable={setHasSaveFn} />}
          {activeTab === 'quotes' && <QuotesManager quotes={quotes} onRefresh={fetchAll} />}
          {activeTab === 'messages' && <MessagesManager bookings={bookings} messages={messages} onRefresh={fetchAll} />}
          {activeTab === 'settings' && <SettingsManager onRefresh={async () => { await refresh(); }} saveFnRef={saveFnRef} />}
        </main>
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
          {toasts.map((toast) => (
            <button
              key={toast.id}
              onClick={() => {
                setActiveTab(toast.tab)
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }}
              className="w-full flex items-center gap-3 bg-white rounded-xl shadow-lg border border-stone-200 px-4 py-3 text-left animate-fade-in hover:shadow-xl transition-shadow"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${primary}15` }}
              >
                <Bell className="w-4 h-4" style={{ color: primary }} />
              </div>
              <p className="text-sm text-stone-700 flex-1">{toast.text}</p>
              <X
                className="w-4 h-4 text-stone-400 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
