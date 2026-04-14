import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':             { title: 'Dashboard',          icon: '📊' },
  '/journal':      { title: 'Journal',             icon: '📒' },
  '/chantiers':    { title: 'Chantiers',           icon: '🏗️'  },
  '/rd':           { title: 'Rapports Dépenses',   icon: '📋' },
  '/clients':      { title: 'Clients',             icon: '👥' },
  '/fournisseurs': { title: 'Fournisseurs',        icon: '🏭' },
  '/equipe':       { title: 'Équipe',              icon: '👷' },
  '/tresorerie':   { title: 'Trésorerie',          icon: '💰' },
}

export function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const page = PAGE_TITLES[pathname] || { title: 'IDMA', icon: '📊' }

  return (
    <header className="
      h-14 px-4 lg:px-6
      flex items-center justify-between
      bg-white border-b border-gray-100
      sticky top-0 z-30
    ">
      {/* Bouton hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Titre de la page */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{page.icon}</span>
        <h1 className="text-base font-bold text-[#0D2B5E]">{page.title}</h1>
      </div>

      {/* Date du jour */}
      <div className="text-xs text-gray-400 font-medium">
        {new Date().toLocaleDateString('fr-DZ', {
          weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
        })}
      </div>
    </header>
  )
}
