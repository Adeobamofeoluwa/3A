import type { Work } from '../lib/types'
import { useSettings } from '../context/SettingsContext'
import { Heart, Eye } from 'lucide-react'

interface WorkCardProps {
  work: Work
  liked: boolean
  likeCount: number
  onLike: () => void
  onClick: () => void
}

export default function WorkCard({ work, liked, likeCount, onLike, onClick }: WorkCardProps) {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'

  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        {work.image_url ? (
          <img
            src={work.image_url}
            alt={work.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full aspect-[4/3] bg-stone-200 flex items-center justify-center">
            <span className="text-stone-400">No image</span>
          </div>
        )}

        {/* Status Badge */}
        {work.status === 'sold' && (
          <div className="absolute top-3 left-3 bg-red-600/90 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
            Sold
          </div>
        )}
        {work.featured && work.status !== 'sold' && (
          <div
            className="absolute top-3 left-3 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm"
            style={{ backgroundColor: `${primary}cc` }}
          >
            Featured
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-medium text-stone-800 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4" />
            View Details
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-stone-400 mb-1">
              {work.category}
            </p>
            <h3
              className="text-lg font-semibold text-stone-800 leading-tight"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {work.title}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLike()
            }}
            className="flex items-center gap-1.5 text-sm flex-shrink-0 transition-all hover:scale-110"
            aria-label="Like"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 text-red-500 animate-heart-pop' : 'text-stone-300'}`}
            />
            <span className="text-stone-500 font-medium">{likeCount}</span>
          </button>
        </div>
        {work.material && (
          <p className="text-sm text-stone-500 mt-2">{work.material}</p>
        )}
        {work.price && (
          <p className="text-base font-semibold mt-2" style={{ color: primary }}>
            {work.price}
          </p>
        )}
      </div>
    </div>
  )
}
