import { useState } from 'react'
import type { Work, WorkReview } from '../lib/types'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'
import { sendNotification } from '../lib/notify'
import { X, Heart, Star, ShoppingBag, MessageSquare, Send, Loader2 } from 'lucide-react'

interface WorkModalProps {
  work: Work
  liked: boolean
  likeCount: number
  reviews: WorkReview[]
  onLike: () => void
  onClose: () => void
  onReviewSubmit: (workId: string, name: string, rating: number, comment: string) => Promise<any>
}

type Tab = 'details' | 'review' | 'book'

export default function WorkModal({
  work,
  liked,
  likeCount,
  reviews,
  onLike,
  onClose,
  onReviewSubmit,
}: WorkModalProps) {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [activeImage, setActiveImage] = useState(0)

  const allImages = [work.image_url, ...(work.gallery_urls || [])].filter(Boolean) as string[]

  // Review form state
  const [reviewerName, setReviewerName] = useState('')
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  // Booking form state
  const [bookName, setBookName] = useState('')
  const [bookEmail, setBookEmail] = useState('')
  const [bookPhone, setBookPhone] = useState('')
  const [bookMessage, setBookMessage] = useState('')
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault()
    setReviewSubmitting(true)
    const error = await onReviewSubmit(work.id, reviewerName, rating, reviewComment)
    setReviewSubmitting(false)
    if (!error) {
      setReviewSuccess(true)
      setReviewerName('')
      setReviewComment('')
      setRating(5)
      setTimeout(() => setReviewSuccess(false), 3000)
    }
  }

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBookingSubmitting(true)
    const { error } = await supabase.from('bookings').insert({
      work_id: work.id,
      customer_name: bookName,
      customer_email: bookEmail,
      customer_phone: bookPhone,
      message: bookMessage,
    })
    setBookingSubmitting(false)
    if (!error) {
      setBookingSuccess(true)
      setBookName('')
      setBookEmail('')
      setBookPhone('')
      setBookMessage('')
      setTimeout(() => setBookingSuccess(false), 4000)
      sendNotification({
        type: 'booking',
        workTitle: work.title,
        customerName: bookName,
        customerEmail: bookEmail,
        customerPhone: bookPhone,
        bookingMessage: bookMessage,
      })
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all"
        >
          <X className="w-5 h-5 text-stone-700" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Section */}
          <div className="bg-stone-100 p-6">
            <div className="rounded-xl overflow-hidden mb-4">
              {allImages[activeImage] && (
                <img
                  src={allImages[activeImage]}
                  alt={work.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-stone-800' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-20 h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 flex flex-col">
            <p className="text-xs uppercase tracking-wide text-stone-400 mb-2">{work.category}</p>
            <h2
              className="text-2xl md:text-3xl font-bold text-stone-800 mb-3"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {work.title}
            </h2>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onLike}
                className="flex items-center gap-2 text-sm transition-all hover:scale-105"
              >
                <Heart
                  className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-stone-300'}`}
                />
                <span className="text-stone-600 font-medium">{likeCount} likes</span>
              </button>
              {avgRating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-stone-600 font-medium">{avgRating} ({reviews.length})</span>
                </div>
              )}
              {work.status === 'sold' && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  Sold
                </span>
              )}
            </div>

            <p className="text-stone-600 text-sm leading-relaxed mb-5">{work.description}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {work.material && (
                <div className="bg-stone-50 rounded-lg p-3">
                  <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Material</p>
                  <p className="text-sm font-medium text-stone-700">{work.material}</p>
                </div>
              )}
              {work.dimensions && (
                <div className="bg-stone-50 rounded-lg p-3">
                  <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Dimensions</p>
                  <p className="text-sm font-medium text-stone-700">{work.dimensions}</p>
                </div>
              )}
              {work.price && (
                <div className="bg-stone-50 rounded-lg p-3">
                  <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Price</p>
                  <p className="text-sm font-bold" style={{ color: primary }}>{work.price}</p>
                </div>
              )}
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Status</p>
                <p className="text-sm font-medium text-stone-700 capitalize">{work.status}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-stone-200 mb-4">
              {([
                { id: 'details' as Tab, label: 'Reviews', icon: MessageSquare },
                { id: 'review' as Tab, label: 'Leave Review', icon: Star },
                { id: 'book' as Tab, label: 'Book / Enquire', icon: ShoppingBag },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'text-stone-800'
                      : 'text-stone-400 border-transparent hover:text-stone-600'
                  }`}
                  style={activeTab === tab.id ? { borderColor: primary } : {}}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto max-h-[300px]">
              {activeTab === 'details' && (
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-8">
                      No reviews yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-stone-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-stone-700 text-sm">{review.reviewer_name}</p>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-stone-600">{review.comment}</p>
                        )}
                        <p className="text-xs text-stone-400 mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'review' && (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  {reviewSuccess && (
                    <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 animate-fade-in">
                      Thank you! Your review has been posted.
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                      style={{ '--tw-ring-color': primary } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                        >
                          <Star
                            className={`w-7 h-7 transition-all hover:scale-110 ${
                              s <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Comment</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm resize-none"
                      style={{ '--tw-ring-color': primary } as React.CSSProperties}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: primary }}
                  >
                    {reviewSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post Review
                      </>
                    )}
                  </button>
                </form>
              )}

              {activeTab === 'book' && (
                <form onSubmit={handleBookingSubmit} className="space-y-3">
                  {bookingSuccess && (
                    <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3 animate-fade-in">
                      Your booking request has been sent! We'll get back to you soon.
                    </div>
                  )}
                  <p className="text-sm text-stone-500 mb-2">
                    Interested in this piece? Send us a booking enquiry and we'll contact you.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Name</label>
                      <input
                        type="text"
                        required
                        value={bookName}
                        onChange={(e) => setBookName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                        style={{ '--tw-ring-color': primary } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-500 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={bookEmail}
                        onChange={(e) => setBookEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                        style={{ '--tw-ring-color': primary } as React.CSSProperties}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      value={bookPhone}
                      onChange={(e) => setBookPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                      style={{ '--tw-ring-color': primary } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1">Message</label>
                    <textarea
                      required
                      value={bookMessage}
                      onChange={(e) => setBookMessage(e.target.value)}
                      rows={3}
                      placeholder="I'd like to enquire about this piece..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm resize-none"
                      style={{ '--tw-ring-color': primary } as React.CSSProperties}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ backgroundColor: primary }}
                  >
                    {bookingSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Send Booking Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
