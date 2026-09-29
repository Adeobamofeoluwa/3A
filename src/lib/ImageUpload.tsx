import { useState, useRef, useCallback } from 'react'
import { supabase } from './supabase'
import { Upload, Loader2, X, Link as LinkIcon } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  primaryColor?: string
  /** Show the URL text input as an optional alternative to uploading */
  allowUrl?: boolean
  /** Height of the preview area */
  previewHeight?: string
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
  primaryColor = '#8B6F47',
  allowUrl = true,
  previewHeight = 'h-48',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = `uploads/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('work-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('work-images')
      .getPublicUrl(filePath)

    onChange(urlData.publicUrl)
    setUploading(false)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
    }
  }, [urlInput, onChange])

  const ringStyle = { '--tw-ring-color': primaryColor } as React.CSSProperties

  return (
    <div>
      <label className="block text-xs font-medium text-stone-500 mb-1">{label}</label>

      {value ? (
        <div className={`relative rounded-lg overflow-hidden ${previewHeight} bg-stone-100 group`}>
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4 text-stone-700" />
          </button>
          {allowUrl && (
            <button
              onClick={() => { setShowUrlInput(true); setUrlInput(value) }}
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white rounded-md px-2 py-1 text-xs text-stone-600 shadow-md transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              Edit URL
            </button>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`${previewHeight} rounded-lg border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            dragOver ? 'border-stone-600 bg-stone-50' : 'border-stone-300 hover:border-stone-400 hover:bg-stone-50'
          }`}
          style={dragOver ? { borderColor: primaryColor } : {}}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-stone-400" />
              <p className="text-xs text-stone-500 text-center px-4">
                Drag &amp; drop an image here, or <span className="font-medium" style={{ color: primaryColor }}>click to browse</span>
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {allowUrl && !value && (
        <div className="mt-2">
          {showUrlInput ? (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 text-sm"
                style={ringStyle}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-3 py-2 rounded-lg bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 transition-colors"
              >
                Set
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              Or paste an image URL instead
            </button>
          )}
        </div>
      )}
    </div>
  )
}
