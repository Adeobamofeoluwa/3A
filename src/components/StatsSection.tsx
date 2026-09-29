import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../context/SettingsContext'

interface Stat {
  value: number
  suffix: string
  label: string
}

const stats: Stat[] = [
  { value: 10, suffix: '+', label: 'Years Experience' },
  { value: 500, suffix: '+', label: 'Projects Completed' },
  { value: 200, suffix: '+', label: 'Happy Clients' },
  { value: 50, suffix: '+', label: 'Exhibition Booths' },
]

function useCountUp(target: number, durationMs: number, start: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let raf = 0
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs, start])

  return count
}

function StatItem({ stat, start, color }: { stat: Stat; start: boolean; color: string }) {
  const count = useCountUp(stat.value, 2000, start)
  return (
    <div className="text-center">
      <p
        className="text-4xl sm:text-5xl font-bold mb-2"
        style={{ fontFamily: 'var(--font-serif)', color }}
      >
        {count}
        {stat.suffix}
      </p>
      <p className="text-white/70 text-sm sm:text-base uppercase tracking-wide">
        {stat.label}
      </p>
    </div>
  )
}

export default function StatsSection() {
  const { settings } = useSettings()
  const accent = settings?.accent_color || '#C4A062'
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.3 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: settings?.secondary_color || '#3E2C1C' }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} start={visible} color={accent} />
        ))}
      </div>
    </section>
  )
}
