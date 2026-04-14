import { useLocation } from 'react-router-dom'

const PAGE_INFO = {
  '/':             { title: 'Dashboard',         phase: 4, icon: '📊' },
  '/journal':      { title: 'Journal',           phase: 3, icon: '📒' },
  '/chantiers':    { title: 'Chantiers',         phase: 3, icon: '🏗️'  },
  '/rd':           { title: 'Rapports Dépenses', phase: 3, icon: '📋' },
  '/clients':      { title: 'Clients',           phase: 2, icon: '👥' },
  '/fournisseurs': { title: 'Fournisseurs',      phase: 2, icon: '🏭' },
  '/equipe':       { title: 'Équipe',            phase: 4, icon: '👷' },
  '/tresorerie':   { title: 'Trésorerie',        phase: 2, icon: '💰' },
}

const PHASE_COLORS = {
  2: { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  3: { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  4: { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',   badge: 'bg-red-100 text-red-700'   },
}

const PHASES = [
  { n: 1, label: 'Fondations',     done: true  },
  { n: 2, label: 'Pages simples',  done: false },
  { n: 3, label: 'Pages métier',   done: false },
  { n: 4, label: 'Pages complexes',done: false },
  { n: 5, label: 'Production',     done: false },
]

export default function Placeholder() {
  const { pathname } = useLocation()
  const info  = PAGE_INFO[pathname] || { title: 'Page', phase: 3, icon: '📄' }
  const color = PHASE_COLORS[info.phase] || PHASE_COLORS[3]

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Card principale */}
      <div className={`${color.bg} ${color.border} border rounded-2xl p-8 text-center`}>
        <div className="text-5xl mb-4">{info.icon}</div>
        <h2 className={`text-xl font-bold ${color.text} mb-2`}>{info.title}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Cette section est en cours de migration vers React.
        </p>
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${color.badge}`}>
          Phase {info.phase} — {PHASES[info.phase-1]?.label}
        </span>
      </div>

      {/* Progression des phases */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="text-sm font-bold text-[#0D2B5E] mb-4">Plan de migration</h3>
        <div className="space-y-2">
          {PHASES.map(ph => (
            <div key={ph.n} className="flex items-center gap-3">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                ${ph.done
                  ? 'bg-[#0D2B5E] text-white'
                  : ph.n === info.phase
                    ? 'bg-amber-400 text-white'
                    : 'bg-gray-100 text-gray-400'
                }
              `}>
                {ph.done ? '✓' : ph.n}
              </div>
              <span className={`text-sm ${ph.done ? 'text-[#0D2B5E] font-semibold' : ph.n === info.phase ? 'text-amber-700 font-semibold' : 'text-gray-400'}`}>
                Phase {ph.n} — {ph.label}
              </span>
              {ph.n === info.phase && (
                <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                  En cours
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lien vers version HTML */}
      <div className="bg-[#EBF1FB] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#0D2B5E]">Version HTML disponible</p>
          <p className="text-xs text-gray-500">Toutes les fonctionnalités sont accessibles sur l'ancien dashboard</p>
        </div>
        <a
          href="/"
          className="text-xs bg-[#0D2B5E] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#1E3A7A] transition-colors"
        >
          Accéder →
        </a>
      </div>
    </div>
  )
}
