import { useState, useEffect } from 'react'
import type { Work } from '../../lib/types'
import { useSettings } from '../../context/SettingsContext'
import { supabase } from '../../lib/supabase'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  ChevronUp,
  ChevronDown,
  Star,
  Package,
  Image as ImageIcon,
} from 'lucide-react'
import ImageUpload from '../../lib/ImageUpload'

interface WorksManagerProps {
  works: Work[]
  onRefresh: () => Promise<void>
  saveFnRef?: React.MutableRefObject<(() => Promise<void>) | null>
  onSaveAvailable?: (available: boolean) => void
}

const emptyWork = {
  title: '',
  description: '',
  category: 'General',
  material: '',
  dimensions: '',
  price: '',
  status: 'available',
  image_url: '',
  gallery_urls: [] as string[],
  featured: false,
  display_order: 0,
}

export default function WorksManager({ works, onRefresh, saveFnRef, onSaveAvailable }: WorksManagerProps) {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'
  const [editing, setEditing] = useState<Work | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState(emptyWork)
  const [saving, setSaving] = useState(false)

  function startCreate() {
    setFormData({ ...emptyWork, display_order: works.length + 1 })
    setCreating(true)
    setEditing(null)
  }

  function startEdit(work: Work) {
    setFormData({
      title: work.title,
      description: work.description || '',
      category: work.category || 'General',
      material: work.material || '',
      dimensions: work.dimensions || '',
      price: work.price || '',
      status: work.status || 'available',
      image_url: work.image_url || '',
      gallery_urls: work.gallery_urls || [],
      featured: work.featured,
      display_order: work.display_order,
    })
    setEditing(work)
    setCreating(false)
  }

  function closeForm() {
    setEditing(null)
    setCreating(false)
    setFormData(emptyWork)
  }

  async function handleSave() {
    setSaving(true)
    if (editing) {
      await supabase
        .from('works')
        .update({
          title: formData.title,
          description: formData.description || null,
          category: formData.category || null,
          material: formData.material || null,
          dimensions: formData.dimensions || null,
          price: formData.price || null,
          status: formData.status,
          image_url: formData.image_url || null,
          gallery_urls: formData.gallery_urls.filter(Boolean),
          featured: formData.featured,
          display_order: formData.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editing.id)
    } else {
      await supabase.from('works').insert({
        title: formData.title,
        description: formData.description || null,
        category: formData.category || null,
        material: formData.material || null,
        dimensions: formData.dimensions || null,
        price: formData.price || null,
        status: formData.status,
        image_url: formData.image_url || null,
        gallery_urls: formData.gallery_urls.filter(Boolean),
        featured: formData.featured,
        display_order: formData.display_order,
      })
    }
    setSaving(false)
    closeForm()
    await onRefresh()
  }

  async function handleDelete(work: Work) {
    if (!confirm(`Delete "${work.title}"? This cannot be undone.`)) return
    await supabase.from('works').delete().eq('id', work.id)
    await onRefresh()
  }

  async function moveWork(work: Work, direction: 'up' | 'down') {
    const sorted = [...works].sort((a, b) => a.display_order - b.display_order)
    const index = sorted.findIndex((w) => w.id === work.id)
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sorted.length - 1) return

    const swapWith = direction === 'up' ? sorted[index - 1] : sorted[index + 1]
    await Promise.all([
      supabase.from('works').update({ display_order: swapWith.display_order }).eq('id', work.id),
      supabase.from('works').update({ display_order: work.display_order }).eq('id', swapWith.id),
    ])
    await onRefresh()
  }

  function removeGalleryImage(idx: number) {
    setFormData((prev) => ({
      ...prev,
      gallery_urls: prev.gallery_urls.filter((_, i) => i !== idx),
    }))
  }

  const isFormOpen = editing || creating

  useEffect(() => {
    if (saveFnRef && isFormOpen) {
      saveFnRef.current = handleSave
      onSaveAvailable?.(true)
      return () => {
        saveFnRef.current = null
        onSaveAvailable?.(false)
      }
    }
  })

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{works.length} pieces in your collection</p>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: primary }}
        >
          <Plus className="w-4 h-4" />
          Add New Work
        </button>
      </div>

      {/* Works List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {works.map((work, idx) => (
          <div
            key={work.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 group"
          >
            <div className="relative h-40 bg-stone-200 overflow-hidden">
              {work.image_url ? (
                <img src={work.image_url} alt={work.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-stone-300" />
                </div>
              )}
              {work.featured && (
                <div className="absolute top-2 right-2 bg-amber-400 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  Featured
                </div>
              )}
              {work.status === 'sold' && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                  Sold
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-stone-800 text-sm truncate">{work.title}</p>
              <p className="text-xs text-stone-400 mb-3">{work.category} · {work.price || 'No price'}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(work)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => moveWork(work, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 transition-colors disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveWork(work, 'down')}
                  disabled={idx === works.length - 1}
                  className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 transition-colors disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(work)}
                  className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {works.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No works yet. Click "Add New Work" to get started.</p>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={closeForm}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-scale"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-stone-200 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-stone-800 text-lg">
                {editing ? 'Edit Work' : 'Add New Work'}
              </h3>
              <button onClick={closeForm} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Main Image Upload */}
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Main Image (upload or paste URL)"
                primaryColor={primary}
              />

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': primary } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm resize-none"
                  style={{ '--tw-ring-color': primary } as React.CSSProperties}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Material</label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="$1,200"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm bg-white"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    <option value="reserved">Reserved</option>
                    <option value="made-to-order">Made to Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={{ '--tw-ring-color': primary } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-stone-700">Feature this piece on the homepage</span>
                </label>
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-2">Gallery Images (additional photos)</label>
                <div className="space-y-3">
                  {formData.gallery_urls.map((url, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="flex-1">
                        <ImageUpload
                          value={url}
                          onChange={(newUrl) => {
                            if (newUrl === '') {
                              removeGalleryImage(idx)
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                gallery_urls: prev.gallery_urls.map((u, i) => i === idx ? newUrl : u),
                              }))
                            }
                          }}
                          label={`Gallery image ${idx + 1}`}
                          primaryColor={primary}
                          previewHeight="h-32"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, gallery_urls: [...prev.gallery_urls, ''] }))}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-stone-300 text-stone-500 text-sm font-medium hover:border-stone-400 hover:bg-stone-50 transition-all w-full justify-center"
                  >
                    <Plus className="w-4 h-4" />
                    Add Gallery Image
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="p-5 border-t border-stone-200 flex gap-3">
              <button
                onClick={closeForm}
                className="flex-1 py-2.5 rounded-lg border border-stone-300 text-stone-600 font-medium text-sm hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title}
                className="flex-1 py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: primary }}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editing ? 'Update' : 'Create'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
