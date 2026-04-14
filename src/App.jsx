import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import Login from './pages/Login'
import Placeholder from './pages/Placeholder'
import Fournisseurs from './pages/Fournisseurs'

/** Redirige vers /login si pas connecté */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-[#F4F6FA] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#0D2B5E] flex items-center justify-center mx-auto animate-pulse">
          <span className="text-white font-bold">IN</span>
        </div>
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Page de connexion */}
      <Route path="/login" element={<LoginRedirect />} />

      {/* App protégée */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Phase 1 — Fondations ✓ (toutes les pages sont des placeholders pour l'instant) */}
        <Route index                   element={<Placeholder />} />
        <Route path="journal"          element={<Placeholder />} />
        <Route path="chantiers"        element={<Placeholder />} />
        <Route path="rd"               element={<Placeholder />} />
        <Route path="clients"          element={<Placeholder />} />
        <Route path="fournisseurs"     element={<Fournisseurs />} />
        <Route path="equipe"           element={<Placeholder />} />
        <Route path="tresorerie"       element={<Placeholder />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

/** Redirige vers / si déjà connecté */
function LoginRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <Login />
}
