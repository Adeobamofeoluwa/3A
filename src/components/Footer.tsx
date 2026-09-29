import { useSettings } from '../context/SettingsContext'
import { useNavigate, Link } from 'react-router-dom'
import { Lock } from 'lucide-react'

export default function Footer() {
  const { settings } = useSettings()
  const navigate = useNavigate()
  const secondary = settings?.secondary_color || '#3E2C1C'

  return (
    <footer
      className="px-4 sm:px-6 lg:px-8 py-12"
      style={{ backgroundColor: secondary }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings?.site_name || 'Logo'}
                className="h-10 w-auto object-contain mb-3"
              />
            ) : (
              <div className="flex items-center gap-2.5 mb-3">
                <img src="./logo.svg" alt="" className="h-10 w-auto object-contain" />
                <h3
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {settings?.site_name || '3A Furniture Workshop'}
                </h3>
              </div>
            )}
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              {settings?.tagline || 'Handcrafted Furniture Made with Passion'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wide">Explore</h4>
            <ul className="space-y-2">
              <li>
                <a href="#services" className="text-white/70 hover:text-white text-sm transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-white/70 hover:text-white text-sm transition-colors">
                  Collection
                </a>
              </li>
              <li>
                <Link to="/exhibitions" className="text-white/70 hover:text-white text-sm transition-colors">
                  Exhibitions
                </Link>
              </li>
              <li>
                <a href="#about" className="text-white/70 hover:text-white text-sm transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#quote" className="text-white/70 hover:text-white text-sm transition-colors">
                  Request Quote
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/70 hover:text-white text-sm transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wide">Connect</h4>
            <div className="flex gap-3">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <span className="text-white font-bold text-sm">IG</span>
                </a>
              )}
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                >
                  <span className="text-white font-bold text-sm">FB</span>
                </a>
              )}
              {settings?.whatsapp_url && (
                <a
                  href={settings.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white font-bold text-sm"
                >
                  W
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm">
            {settings?.footer_text || '3A Furniture Workshop — Handcrafted with care.'}
          </p>

          {/* Admin Link */}
          {settings?.admin_link_visible !== false && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-all group"
              title="Admin Panel"
            >
              <Lock className="w-3 h-3 group-hover:scale-110 transition-transform" />
              {settings?.admin_link_label || 'Admin'}
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
