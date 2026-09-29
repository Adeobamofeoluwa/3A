import { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext'
import { getVisitorId } from '../lib/visitor'
import type { Work, WorkLike, WorkReview } from '../lib/types'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import WorkCard from '../components/WorkCard'
import WorkModal from '../components/WorkModal'
import AboutSection from '../components/AboutSection'
import ContactSection from '../components/ContactSection'
import ExhibitionsSection from '../components/ExhibitionsSection'
import ServicesSection from '../components/ServicesSection'
import StatsSection from '../components/StatsSection'
import TestimonialsSection from '../components/TestimonialsSection'
import QuoteSection from '../components/QuoteSection'
import Footer from '../components/Footer'
import { Search, X, Loader2 } from 'lucide-react'

export default function HomePage() {
  const { settings, loading } = useSettings()
  const [works, setWorks] = useState<Work[]>([])
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [loadingWorks, setLoadingWorks] = useState(true)
  const visitorId = getVisitorId()
  const quoteRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  function scrollToQuote() {
    quoteRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchWorks()
    fetchLikes()
  }, [])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
      }
    }
  }, [location, loadingWorks])

  async function fetchWorks() {
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (!error && data) {
      setWorks(data as Work[])
    }
    setLoadingWorks(false)
  }

  async function fetchLikes() {
    const [{ data: myLikes }, { data: allLikes }] = await Promise.all([
      supabase.from('work_likes').select('work_id').eq('visitor_id', visitorId),
      supabase.from('work_likes').select('work_id'),
    ])

    const likedMap: Record<string, boolean> = {}
    if (myLikes) {
      ;(myLikes as WorkLike[]).forEach((l) => {
        likedMap[l.work_id] = true
      })
    }

    const countMap: Record<string, number> = {}
    if (allLikes) {
      ;(allLikes as WorkLike[]).forEach((l) => {
        countMap[l.work_id] = (countMap[l.work_id] || 0) + 1
      })
    }

    setLikes(likedMap)
    setLikeCounts(countMap)
  }

  async function toggleLike(workId: string) {
    if (likes[workId]) {
      await supabase.from('work_likes').delete().eq('work_id', workId).eq('visitor_id', visitorId)
      setLikes((prev) => ({ ...prev, [workId]: false }))
      setLikeCounts((prev) => ({ ...prev, [workId]: Math.max((prev[workId] || 1) - 1, 0) }))
    } else {
      await supabase.from('work_likes').insert({ work_id: workId, visitor_id: visitorId })
      setLikes((prev) => ({ ...prev, [workId]: true }))
      setLikeCounts((prev) => ({ ...prev, [workId]: (prev[workId] || 0) + 1 }))
    }
  }

  const categories = useMemo(() => {
    const cats = new Set<string>()
    works.forEach((w) => { if (w.category) cats.add(w.category) })
    return ['All', ...Array.from(cats)]
  }, [works])

  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      const matchesCategory = activeCategory === 'All' || w.category === activeCategory
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        w.title.toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        (w.category || '').toLowerCase().includes(q) ||
        (w.material || '').toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [works, activeCategory, searchQuery])

  async function handleReviewSubmit(workId: string, name: string, rating: number, comment: string) {
    const { error } = await supabase
      .from('work_reviews')
      .insert({ work_id: workId, reviewer_name: name, rating, comment })
    if (!error) {
      if (selectedWork && selectedWork.id === workId) {
        const { data } = await supabase
          .from('work_reviews')
          .select('*')
          .eq('work_id', workId)
          .order('created_at', { ascending: false })
        if (data) {
          setReviewsForWork(data as WorkReview[])
        }
      }
    }
    return error
  }

  const [reviewsForWork, setReviewsForWork] = useState<WorkReview[]>([])

  async function openWorkModal(work: Work) {
    setSelectedWork(work)
    const { data } = await supabase
      .from('work_reviews')
      .select('*')
      .eq('work_id', work.id)
      .order('created_at', { ascending: false })
    if (data) {
      setReviewsForWork(data as WorkReview[])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: settings?.primary_color || '#8B6F47' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <Hero />

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-serif)', color: settings?.secondary_color || '#3E2C1C' }}
          >
            Our Collection
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Explore our handcrafted furniture pieces, each made with care and precision.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Search furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-stone-300 bg-white focus:outline-none focus:ring-2 transition-all text-stone-700"
            style={{ '--tw-ring-color': settings?.primary_color || '#8B6F47' } as React.CSSProperties}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'text-white shadow-md'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
              style={activeCategory === cat ? { backgroundColor: settings?.primary_color || '#8B6F47' } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Works Grid */}
        {loadingWorks ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="text-center py-20 text-stone-500">
            <p className="text-lg">No pieces found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="masonry-grid">
            {filteredWorks.map((work) => (
              <div key={work.id} className="masonry-item animate-fade-in">
                <WorkCard
                  work={work}
                  liked={likes[work.id] || false}
                  likeCount={likeCounts[work.id] || 0}
                  onLike={() => toggleLike(work.id)}
                  onClick={() => openWorkModal(work)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <ServicesSection onQuoteRequest={scrollToQuote} />
      <StatsSection />
      <AboutSection />
      <ExhibitionsSection />
      <TestimonialsSection />
      <QuoteSection ref={quoteRef} />
      <ContactSection />
      <Footer />

      {selectedWork && (
        <WorkModal
          work={selectedWork}
          liked={likes[selectedWork.id] || false}
          likeCount={likeCounts[selectedWork.id] || 0}
          reviews={reviewsForWork}
          onLike={() => toggleLike(selectedWork.id)}
          onClose={() => setSelectedWork(null)}
          onReviewSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
