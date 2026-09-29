import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { settings } = useSettings()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', hash: 'top', to: '/' },
    { label: 'Services', hash: 'services', to: '/' },
    { label: 'Collection', hash: 'gallery', to: '/' },
    { label: 'Booths', to: '/exhibitions' },
    { label: 'About', hash: 'about', to: '/' },
    { label: 'Quote', hash: 'quote', to: '/' },
    { label: 'Contact', hash: 'contact', to: '/' },
  ]

  function handleNavClick(hash: string) {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate(`/#${hash}`)
    } else {
      const el = document.getElementById(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const linkColor = scrolled ? '#444' : '#fff'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          onClick={() => handleNavClick('top')}
          className="flex items-center gap-2.5 transition-all"
        >
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings?.site_name || 'Logo'}
              className="h-9 sm:h-11 w-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <img
                src="./logo.svg"
                alt=""
                className="h-9 sm:h-11 w-auto object-contain"
              />
              <span
                className="text-xl sm:text-2xl font-bold transition-colors"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: scrolled ? settings?.secondary_color || '#3E2C1C' : '#fff',
                }}
              >
                {settings?.site_name || '3A Furniture Workshop'}
              </span>
            </div>
          )}
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.to !== '/' ? (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: linkColor }}
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.hash!)}
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: linkColor }}
              >
                {link.label}
              </button>
            )
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: linkColor }}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 animate-fade-in">
          <div className="flex flex-col py-4">
            {navLinks.map((link) =>
              link.to !== '/' ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="px-6 py-3 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.hash!)}
                  className="px-6 py-3 text-left text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                >
                  {link.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
