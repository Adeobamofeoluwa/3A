import { useState, useEffect } from 'react'
import type { Exhibition } from '../../lib/types'
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
  Calendar,
  MapPin,
} from 'lucide-react'
import ImageUpload from '../../lib/ImageUpload'

interface ExhibitionsManagerProps {
  exhibitions: Exhibition[]
  onRefresh: () => Promise<void>
  saveFnRef?: React.MutableRefObject<(() => Promise<void>) | null>
  onSaveAvailable?: (available: boolean) => void
}

const emptyExhibition = {
  title: '',
  description: '',
  location: '',
  start_date: '',
  end_date: '',
  image_url: '',
  status: 'upcoming',
  display_order: 0,
}

export default function ExhibitionsManager({ exhibitions, onRefresh, saveFnRef, onSaveAvailable }: ExhibitionsManagerProps) {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'
  const [editing, setEditing] = useState<Exhibition | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState(emptyExhibition)
  const [saving, setSaving] = useState(false)

  function startCreate() {
    setFormData({ ...emptyExhibition, display_order: exhibitions.length + 1 })
    setCreating(true)
    setEditing(null)
  }

  function startEdit(ex: Exhibition) {
    setFormData({
      title: ex.title,
      description: ex.description || '',
      location: ex.location || '',
      start_date: ex.start_date,
      end_date: ex.end_date || '',
      image_url: ex.image_url || '',
      status: ex.status || 'upcoming',
      display_order: ex.display_order,
    })
    setEditing(ex)
    setCreating(false)
  }

  function closeForm() {
    setEditing(null)
    setCreating(false)
    setFormData(emptyExhibition)
  }

  async function handleSave() {
    if (!formData.title || !formData.start_date) return
    setSaving(true)
    if (editing) {
      await supabase
        .from('exhibitions')
        .update({
          title: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          image_url: formData.image_url || null,
          status: formData.status,
          display_order: formData.display_order,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editing.id)
    } else {
      await supabase.from('exhibitions').insert({
        title: formData.title,
        description: formData.description || null,
        location: formData.location || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        image_url: formData.image_url || null,
        status: formData.status,
        display_order: formData.display_order,
      })
    }
    setSaving(false)
    closeForm()
    await onRefresh()
  }

  async function handleDelete(ex: Exhibition) {
    if (!confirm(`Delete "${ex.title}"? This cannot be undone.`)) return
    await supabase.from('exhibitions').delete().eq('id', ex.id)
    await onRefresh()
  }

  async function moveExhibition(ex: Exhibition, direction: 'up' | 'down') {
    const sorted = [...exhibitions].sort((a, b) => a.display_order - b.display_order)
    const index = sorted.findIndex((e) => e.id === ex.id)
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === sorted.length - 1) return

    const swapWith = direction === 'up' ? sorted[index - 1] : sorted[index + 1]
    await Promise.all([
      supabase.from('exhibitions').update({ display_order: swapWith.display_order }).eq('id', ex.id),
      supabase.from('exhibitions').update({ display_order: ex.display_order }).eq('id', swapWith.id),
    ])
    await onRefresh()
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

  const ringStyle = { '--tw-ring-color': primary } as React.CSSProperties

  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{exhibitions.length} booth projects</p>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: primary }}
        >
          <Plus className="w-4 h-4" />
          Add New Booth
        </button>
      </div>

      {/* Exhibitions List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exhibitions.map((ex, idx) => (
          <div
            key={ex.id}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-100 group"
          >
            <div className="relative h-36 bg-stone-200 overflow-hidden">
              {ex.image_url ? (
                <img src={ex.image_url} alt={ex.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `${primary}10` }}>
                  <Calendar className="w-8 h-8" style={{ color: `${primary}40` }} />
                </div>
              )}
              <div
                className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{
                  backgroundColor:
                    ex.status === 'ongoing' ? '#10b981'
                    : ex.status === 'past' ? '#94a3b8'
                    : primary,
                }}
              >
                {ex.status === 'ongoing' ? 'Ongoing' : ex.status === 'past' ? 'Past' : 'Upcoming'}
              </div>
            </div>
            <div className="p-3">
              <p className="font-medium text-stone-800 text-sm truncate">{ex.title}</p>
              <div className="flex items-center gap-1 text-xs text-stone-400 mb-1">
                <Calendar className="w-3 h-3" />
                {formatDate(ex.start_date)}
                {ex.end_date && ` — ${formatDate(ex.end_date)}`}
              </div>
              {ex.location && (
                <div className="flex items-center gap-1 text-xs text-stone-400 mb-3">
                  <MapPin className="w-3 h-3" />
                  {ex.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(ex)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => moveExhibition(ex, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 transition-colors disabled:opacity-30"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveExhibition(ex, 'down')}
                  disabled={idx === exhibitions.length - 1}
                  className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 transition-colors disabled:opacity-30"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(ex)}
                  className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {exhibitions.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No booth projects yet. Click "Add New Booth" to get started.</p>
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
                {editing ? 'Edit Booth' : 'Add New Booth'}
              </h3>
              <button onClick={closeForm} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image Upload */}
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Booth Image (upload or paste URL)"
                primaryColor={primary}
              />

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Lagos Furniture Expo Booth 2026"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                  style={ringStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Tell visitors about this exhibition booth project..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm resize-none"
                  style={ringStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Eko Convention Center, Lagos"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                  style={ringStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={ringStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">End Date (optional)</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={ringStyle}
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
                    style={ringStyle}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="past">Past</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                    style={ringStyle}
                  />
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
                disabled={saving || !formData.title || !formData.start_date}
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
