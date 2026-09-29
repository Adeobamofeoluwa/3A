import { useSettings } from '../context/SettingsContext'
import { Check, ArrowRight } from 'lucide-react'

interface Service {
  title: string
  description: string
  features: string[]
  image: string
}

const services: Service[] = [
  {
    title: 'Custom Furniture',
    description:
      'Bespoke furniture crafted to your exact specifications and style preferences.',
    features: [
      'Home furniture (beds, wardrobes, dining sets)',
      'Office furniture and workstations',
      'Commercial furniture for hotels and restaurants',
      'Modern and classic designs',
    ],
    image:
      'https://images.pexels.com/photos/5974327/pexels-photo-5974327.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Interior Design',
    description:
      'Complete interior design solutions that transform your space into a masterpiece.',
    features: [
      'Space planning and layout',
      'Lighting integration',
      'Wall paneling and decorative walls',
      'Premium materials and expert craftsmanship',
    ],
    image:
      'https://images.pexels.com/photos/6980724/pexels-photo-6980724.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Exhibition Booth Design',
    description:
      'Stand out at trade fairs and events with captivating, custom-designed booths.',
    features: [
      'Trade fair and expo booth design',
      'Brand-focused designs',
      'Modern furniture design',
      'Full setup and breakdown service',
    ],
    image:
      'https://images.pexels.com/photos/35138560/pexels-photo-35138560.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Ceiling & Interiors',
    description:
      'Premium ceiling designs and interior finishes that elevate every room.',
    features: [
      'POP ceiling designs',
      'Suspended and gypsum ceilings',
      'Modern furniture design',
      'Premium materials and expert craftsmanship',
    ],
    image:
      'https://images.pexels.com/photos/7147364/pexels-photo-7147364.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
]

interface ServicesSectionProps {
  onQuoteRequest: () => void
}

export default function ServicesSection({ onQuoteRequest }: ServicesSectionProps) {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'
  const secondary = settings?.secondary_color || '#3E2C1C'

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: primary }}>
            What We Offer
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-serif)', color: secondary }}
          >
            Our Services
          </h2>
          <p className="text-stone-600 text-lg max-w-3xl mx-auto leading-relaxed">
            From concept to completion, we deliver exceptional design and craftsmanship across
            all our service areas
          </p>
        </div>

        <div className="space-y-20">
          {services.map((service, idx) => {
            const isEven = idx % 2 === 0
            return (
              <div
                key={service.title}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div className={isEven ? 'md:order-1' : 'md:order-2'}>
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                    style={{ backgroundColor: `${primary}15` }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{ color: primary, fontFamily: 'var(--font-serif)' }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3
                    className="text-3xl font-bold mb-4"
                    style={{ fontFamily: 'var(--font-serif)', color: secondary }}
                  >
                    {service.title}
                  </h3>
                  <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check
                          className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5"
                          style={{ color: primary }}
                        />
                        <span className="text-stone-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onQuoteRequest}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-md text-white font-semibold transition-all hover:opacity-90"
                    style={{ backgroundColor: primary }}
                  >
                    Request Quote
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <div className={isEven ? 'md:order-2' : 'md:order-1'}>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
