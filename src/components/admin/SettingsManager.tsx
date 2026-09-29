import { useState, useEffect } from 'react'
import { useSettings } from '../../context/SettingsContext'
import { supabase } from '../../lib/supabase'
import type { SiteSettings } from '../../lib/types'
import { Save, Loader2, Check, Palette, Image as ImageIcon, Type, Mail, Lock, Link2, Eye, EyeOff } from 'lucide-react'
import ImageUpload from '../../lib/ImageUpload'

interface SettingsManagerProps {
  onRefresh: () => Promise<void>
  saveFnRef?: React.MutableRefObject<(() => Promise<void>) | null>
}

type Section = 'content' | 'images' | 'colors' | 'contact' | 'footer' | 'security'

export default function SettingsManager({ onRefresh, saveFnRef }: SettingsManagerProps) {
  const { settings } = useSettings()
  const primary = settings?.primary_color || '#8B6F47'
  const [form, setForm] = useState<Partial<SiteSettings>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    if (settings) {
      setForm(settings)
    }
  }, [settings])

  useEffect(() => {
    if (saveFnRef) {
      saveFnRef.current = handleSave
      return () => { saveFnRef.current = null }
    }
  })

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('site_settings')
      .update({
        site_name: form.site_name,
        logo_url: form.logo_url,
        tagline: form.tagline,
        hero_title: form.hero_title,
        hero_subtitle: form.hero_subtitle,
        hero_image_url: form.hero_image_url,
        about_title: form.about_title,
        about_text: form.about_text,
        about_image_url: form.about_image_url,
        contact_email: form.contact_email,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        accent_color: form.accent_color,
        footer_text: form.footer_text,
        admin_link_label: form.admin_link_label,
        admin_link_visible: form.admin_link_visible,
        admin_username: form.admin_username,
        admin_password: form.admin_password,
        instagram_url: form.instagram_url,
        facebook_url: form.facebook_url,
        whatsapp_url: form.whatsapp_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)

    setSaving(false)
    if (!error) {
      setSaved(true)
      await onRefresh()
      setTimeout(() => setSaved(false), 3000)
    }
  }

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const sections: { id: Section; label: string; icon: typeof Type }[] = [
    { id: 'content', label: 'Text & Content', icon: Type },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'contact', label: 'Contact & Social', icon: Mail },
    { id: 'footer', label: 'Footer & Admin Link', icon: Link2 },
    { id: 'security', label: 'Admin Credentials', icon: Lock },
  ]

  const [activeSection, setActiveSection] = useState<Section>('content')

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm'
  const ringStyle = { '--tw-ring-color': primary } as React.CSSProperties

  return (
    <div className="space-y-6">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === section.id ? 'text-white' : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
            style={activeSection === section.id ? { backgroundColor: primary } : {}}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content Section */}
      {activeSection === 'content' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 space-y-4">
          <h3 className="font-semibold text-stone-800 mb-2">Site Text & Content</h3>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Site Name</label>
            <input
              type="text"
              value={form.site_name || ''}
              onChange={(e) => update('site_name', e.target.value)}
              className={inputClass}
              style={ringStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Tagline</label>
            <input
              type="text"
              value={form.tagline || ''}
              onChange={(e) => update('tagline', e.target.value)}
              className={inputClass}
              style={ringStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Hero Title</label>
            <input
              type="text"
              value={form.hero_title || ''}
              onChange={(e) => update('hero_title', e.target.value)}
              className={inputClass}
              style={ringStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Hero Subtitle</label>
            <textarea
              value={form.hero_subtitle || ''}
              onChange={(e) => update('hero_subtitle', e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              style={ringStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">About Section Title</label>
            <input
              type="text"
              value={form.about_title || ''}
              onChange={(e) => update('about_title', e.target.value)}
              className={inputClass}
              style={ringStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">About Section Text</label>
            <textarea
              value={form.about_text || ''}
              onChange={(e) => update('about_text', e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
              style={ringStyle}
            />
          </div>
        </div>
      )}

      {/* Images Section */}
      {activeSection === 'images' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 space-y-4">
          <h3 className="font-semibold text-stone-800 mb-2">Site Images</h3>
          <ImageUpload
            value={form.logo_url || ''}
            onChange={(url) => update('logo_url', url)}
            label="Logo (shown in navbar & footer)"
            primaryColor={primary}
            previewHeight="h-28"
          />
          <ImageUpload
            value={form.hero_image_url || ''}
            onChange={(url) => update('hero_image_url', url)}
            label="Hero Background Image (upload or paste URL)"
            primaryColor={primary}
            previewHeight="h-32"
          />
          <ImageUpload
            value={form.about_image_url || ''}
            onChange={(url) => update('about_image_url', url)}
            label="About Section Image (upload or paste URL)"
            primaryColor={primary}
            previewHeight="h-32"
          />
        </div>
      )}

      {/* Colors Section */}
      {activeSection === 'colors' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 space-y-4">
          <h3 className="font-semibold text-stone-800 mb-2">Color Scheme</h3>
          <p className="text-sm text-stone-500">Customize the colors used throughout your website.</p>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-2">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primary_color || '#8B6F47'}
                  onChange={(e) => update('primary_color', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.primary_color || ''}
                  onChange={(e) => update('primary_color', e.target.value)}
                  className={`${inputClass} font-mono`}
                  style={ringStyle}
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Buttons, links, accents</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-2">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondary_color || '#3E2C1C'}
                  onChange={(e) => update('secondary_color', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.secondary_color || ''}
                  onChange={(e) => update('secondary_color', e.target.value)}
                  className={`${inputClass} font-mono`}
                  style={ringStyle}
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Footer, headings</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-2">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accent_color || '#C4A062'}
                  onChange={(e) => update('accent_color', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.accent_color || ''}
                  onChange={(e) => update('accent_color', e.target.value)}
                  className={`${inputClass} font-mono`}
                  style={ringStyle}
                />
              </div>
              <p className="text-xs text-stone-400 mt-1">Highlights, badges</p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: `${form.primary_color}10` }}>
            <p className="text-xs text-stone-400 mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: form.primary_color }}
              >
                Primary Button
              </button>
              <span className="text-sm font-medium" style={{ color: form.primary_color }}>
                Link text
              </span>
              <div className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: form.secondary_color }}>
                Secondary
              </div>
              <div className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: form.accent_color }}>
                Accent
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact & Social Section */}
      {activeSection === 'contact' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 space-y-4">
          <h3 className="font-semibold text-stone-800 mb-2">Contact & Social Links</h3>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Contact Email (where messages get sent)
            </label>
            <input
              type="email"
              value={form.contact_email || ''}
              onChange={(e) => update('contact_email', e.target.value)}
              className={inputClass}
              style={ringStyle}
            />
            <p className="text-xs text-stone-400 mt-1">
              Booking enquiries and contact form messages will be associated with this email.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Instagram URL</label>
            <input
              type="url"
              value={form.instagram_url || ''}
              onChange={(e) => update('instagram_url', e.target.value)}
              placeholder="https://instagram.com/..."
              className={inputClass}
              style={ringStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Facebook URL</label>
            <input
              type="url"
              value={form.facebook_url || ''}
              onChange={(e) => update('facebook_url', e.target.value)}
              placeholder="https://facebook.com/..."
              className={inputClass}
              style={ringStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">WhatsApp URL</label>
            <input
              type="url"
              value={form.whatsapp_url || ''}
              onChange={(e) => update('whatsapp_url', e.target.value)}
              placeholder="https://wa.me/..."
              className={inputClass}
              style={ringStyle}
            />
          </div>
        </div>
      )}

      {/* Footer & Admin Link Section */}
      {activeSection === 'footer' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 space-y-4">
          <h3 className="font-semibold text-stone-800 mb-2">Footer & Admin Link</h3>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Footer Text</label>
            <input
              type="text"
              value={form.footer_text || ''}
              onChange={(e) => update('footer_text', e.target.value)}
              className={inputClass}
              style={ringStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Admin Link Label</label>
            <input
              type="text"
              value={form.admin_link_label || ''}
              onChange={(e) => update('admin_link_label', e.target.value)}
              placeholder="Admin"
              className={inputClass}
              style={ringStyle}
            />
            <p className="text-xs text-stone-400 mt-1">
              This is the text shown on the footer link that leads to the admin panel.
            </p>
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.admin_link_visible ?? true}
                onChange={(e) => update('admin_link_visible', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-stone-700">Show admin link in footer</span>
            </label>
            <p className="text-xs text-stone-400 mt-1 ml-6">
              If hidden, you can still access the admin panel by going to /admin directly.
            </p>
          </div>
        </div>
      )}

      {/* Security Section */}
      {activeSection === 'security' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-stone-100 space-y-4">
          <h3 className="font-semibold text-stone-800 mb-2">Admin Credentials</h3>
          <p className="text-sm text-stone-500">
            Change your admin panel username and password. Make sure to remember these — you'll need them to log in.
          </p>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Admin Username</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={form.admin_username || ''}
              onChange={(e) => update('admin_username', e.target.value)}
              className={inputClass}
              style={ringStyle}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Admin Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={form.admin_password || ''}
              onChange={(e) => update('admin_password', e.target.value)}
              className={inputClass}
              style={ringStyle}
            />
          </div>
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPasswords ? 'Hide' : 'Show'} credentials
          </button>
        </div>
      )}

      {/* Save Button */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium text-sm shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: primary }}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save All Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}
