import { useSettings } from '../context/SettingsContext'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'

  return (
    <section
      id="top"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {settings?.hero_image_url ? (
          <img
            src={settings.hero_image_url}
            alt="Furniture workshop"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: primary }} />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p
          className="text-sm sm:text-base uppercase tracking-[0.3em] mb-4 text-white/80 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          {settings?.tagline || 'Handcrafted Furniture Made with Passion'}
        </p>
        <h1
          className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in leading-tight"
          style={{ fontFamily: 'var(--font-serif)', animationDelay: '0.2s' }}
        >
          {settings?.hero_title || 'Crafting Timeless Furniture'}
        </h1>
        <p
          className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          {settings?.hero_subtitle ||
            'Each piece tells a story of dedication, skill, and the beauty of natural wood.'}
        </p>
        <a
          href="#gallery"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium transition-all hover:scale-105 animate-fade-in shadow-lg"
          style={{
            backgroundColor: primary,
            animationDelay: '0.4s',
          }}
        >
          View Our Work
          <ArrowDown className="w-4 h-4" />
        </a>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 text-white/60" />
      </div>
    </section>
  )
}
