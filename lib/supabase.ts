import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type LumaEvent = {
  id: string
  event_link: string
  created_at: string
}

export async function getLumaEvents() {
  const { data, error } = await supabase
    .from('luma_events')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as LumaEvent[]
}

export async function addLumaEvent(eventLink: string) {
  const { data, error } = await supabase
    .from('luma_events')
    .insert([{ event_link: eventLink }])
    .select()
  
  if (error) throw error
  return data[0] as LumaEvent
} 