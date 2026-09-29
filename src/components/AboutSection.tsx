import { useSettings } from '../context/SettingsContext'

export default function AboutSection() {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-xl">
            {settings?.about_image_url ? (
              <img
                src={settings.about_image_url}
                alt="About the workshop"
                className="w-full h-80 md:h-96 object-cover"
              />
            ) : (
              <div className="w-full h-80 md:h-96 bg-stone-200" />
            )}
          </div>
          <div
            className="absolute -bottom-5 -right-5 rounded-2xl px-6 py-4 text-white shadow-lg hidden sm:block"
            style={{ backgroundColor: primary }}
          >
            <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>100%</p>
            <p className="text-sm opacity-90">Handcrafted</p>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: primary }}>
            Our Story
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-5 text-stone-800"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {settings?.about_title || 'About Our Workshop'}
          </h2>
          <p className="text-stone-600 leading-relaxed text-lg">
            {settings?.about_text ||
              'At 3A Furniture Workshop, we believe furniture should be more than functional — it should be a work of art.'}
          </p>
        </div>
      </div>
    </section>
  )
}
