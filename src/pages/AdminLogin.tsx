import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'
import { Lock, User, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const { settings, loading } = useSettings()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect to panel if already authenticated
  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') === 'true') {
      navigate('/admin/panel')
    }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // Fetch the admin credentials from the database
    const { data, error: dbError } = await supabase
      .from('site_settings')
      .select('admin_username, admin_password')
      .eq('id', 1)
      .maybeSingle()

    setSubmitting(false)

    if (dbError || !data) {
      setError('Unable to verify credentials. Please try again.')
      return
    }

    if (username === data.admin_username && password === data.admin_password) {
      sessionStorage.setItem('admin_authed', 'true')
      navigate('/admin/panel')
    } else {
      setError('Incorrect username or password.')
    }
  }

  const primary = settings?.primary_color || '#8B6F47'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 40% 80%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Back to site */}
        <button
          onClick={() => navigate('/')}
          className="text-stone-400 hover:text-white text-sm flex items-center gap-1.5 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to website
        </button>

        <div className="bg-stone-800 rounded-2xl p-8 shadow-2xl border border-stone-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${primary}30` }}
            >
              <Lock className="w-7 h-7" style={{ color: primary }} />
            </div>
            <h1
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Admin Access
            </h1>
            <p className="text-stone-400 text-sm">
              {settings?.site_name || '3A Furniture Workshop'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 text-sm transition-all"
                  style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-lg bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 text-sm transition-all"
                  style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: primary }}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Unlock Admin Panel
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
