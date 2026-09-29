import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { SiteSettings } from '../lib/types'

interface SettingsContextValue {
  settings: SiteSettings | null
  loading: boolean
  refresh: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  loading: true,
  refresh: async () => {},
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle()

    if (!error && data) {
      setSettings(data as SiteSettings)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
