import { createClient } from '@supabase/supabase-js'

// La clé anon Supabase est publique par conception (role: anon).
// La sécurité est assurée par les politiques RLS côté Supabase.
// Elle est déjà visible dans le dashboard HTML déployé.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  || 'https://wlksvsfyggtbqjpxqigh.supabase.co'

const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsa3N2c2Z5Z2d0YnFqcHhxaWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDY5NjYsImV4cCI6MjA5MDM4Mjk2Nn0.m2rmyAfhabGZj-8PTt0swlypVgtXpAxTlJAB4AoYCE4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/** Insert → retourne l'objet créé avec son id */
export async function sbSave(table, data) {
  try {
    const { data: res, error } = await supabase
      .from(table).insert(data).select('id').single()
    if (error) { console.error(`sbSave(${table})`, error.message); return null }
    return res
  } catch (e) { console.error(e); return null }
}

/** Update partiel par id */
export async function sbPatch(table, id, patch) {
  try {
    const { error } = await supabase.from(table).update(patch).eq('id', id)
    if (error) { console.error(`sbPatch(${table})`, error.message); return false }
    return true
  } catch (e) { console.error(e); return false }
}

/** Suppression par id */
export async function sbDelete(table, id) {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) { console.error(`sbDelete(${table})`, error.message); return false }
    return true
  } catch (e) { console.error(e); return false }
}

/** Session courante */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
