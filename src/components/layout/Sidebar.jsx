import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { to: '/',             icon: '📊', label: 'Dashboard' },
  { to: '/journal',      icon: '📒', label: 'Journal' },
  { to: '/chantiers',    icon: '🏗️',  label: 'Chantiers' },
  { to: '/rd',           icon: '📋', label: 'Rapports Dép.' },
  { to: '/clients',      icon: '👥', label: 'Clients' },
  { to: '/fournisseurs', icon: '🏭', label: 'Fournisseurs' },
  { to: '/equipe',       icon: '👷', label: 'Équipe' },
  { to: '/tresorerie',   icon: '💰', label: 'Trésorerie' },
]

export function Sidebar({ open, onClose }) {
  const { nom, role, logout } = useAuth()

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50
        w-64 bg-white border-r border-gray-100
        flex flex-col shadow-xl
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0D2B5E] flex items-center justify-center">
              <span className="text-white font-bold text-sm">IN</span>
            </div>
            <div>
              <p className="font-bold text-[#0D2B5E] text-sm leading-tight">IDMA NetSecure</p>
              <p className="text-xs text-gray-400">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-[#EBF1FB] text-[#0D2B5E] font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#0D2B5E]'
                }
              `}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Séparateur + Module Vente */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <a
              href="/vente.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
            >
              <span className="text-base w-5 text-center">🛒</span>
              Module Vente
              <span className="ml-auto text-xs opacity-50">↗</span>
            </a>
          </div>
        </nav>

        {/* Profil utilisateur */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0D2B5E] flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {nom.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{nom}</p>
              <p className="text-xs text-gray-400 capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-xs text-gray-400 hover:text-red-500 text-left transition-colors py-1"
          >
            Se déconnecter
          </button>
        </div>
      </aside>
    </>
  )
}
