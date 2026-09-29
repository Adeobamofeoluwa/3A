import { supabase } from './supabase'

export async function sendNotification(payload: Record<string, unknown>) {
  try {
    const { data } = await supabase.functions.invoke('send-notification', {
      body: JSON.stringify(payload),
    })
    return data
  } catch {
    return null
  }
}
