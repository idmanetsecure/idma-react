import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) await loadProfile(session.user.id)
        else { setProfile(null); setLoading(false) }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', userId).single()
      setProfile(data)
    } catch (_) {}
    setLoading(false)
  }

  async function login(email, password) {
    const fullEmail = email.includes('@') ? email : `${email}@idma.dz`
    const { data, error } = await supabase.auth.signInWithPassword({
      email: fullEmail, password
    })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  const isAdmin     = profile?.role === 'admin'
  const isAssistant = ['admin','assistant'].includes(profile?.role)

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, logout,
      isAdmin, isAssistant,
      role: profile?.role ?? 'operateur',
      nom:  profile?.nom  ?? user?.email ?? ''
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
