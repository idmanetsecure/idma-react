const variants = {
  // Statuts chantier
  'En cours':  'bg-blue-100 text-blue-700',
  'Terminé':   'bg-emerald-100 text-emerald-700',
  'En retard': 'bg-red-100 text-red-700',
  'Critique':  'bg-orange-100 text-orange-700',
  // Statuts paiement
  'payé':         'bg-emerald-100 text-emerald-700',
  'À jour':       'bg-blue-100 text-blue-700',
  'en_attente':   'bg-amber-100 text-amber-700',
  // Statuts proforma
  'VALIDÉE':     'bg-emerald-100 text-emerald-700',
  'EN ATTENTE':  'bg-amber-100 text-amber-700',
  'REFUSÉE':     'bg-red-100 text-red-700',
  // Statuts facture
  'ÉMISE':     'bg-blue-100 text-blue-700',
  'PAYÉE':     'bg-emerald-100 text-emerald-700',
  'ANNULÉE':   'bg-gray-100 text-gray-500',
  'BROUILLON': 'bg-gray-100 text-gray-600',
  // Statuts BL
  'LIVRÉ':    'bg-emerald-100 text-emerald-700',
  'PARTIEL':  'bg-amber-100 text-amber-700',
}

export function Badge({ label, className = '' }) {
  const cls = variants[label] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`
      inline-flex items-center px-2 py-0.5
      rounded-full text-xs font-semibold
      ${cls} ${className}
    `}>
      {label}
    </span>
  )
}

export function KpiBadge({ value, label, color = 'blue', sub }) {
  const colors = {
    blue:   'from-blue-500 to-blue-600',
    green:  'from-emerald-500 to-emerald-600',
    red:    'from-red-500 to-red-600',
    amber:  'from-amber-500 to-amber-600',
    navy:   'from-[#0D2B5E] to-[#1E3A7A]',
    purple: 'from-purple-500 to-purple-600',
  }
  return (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br ${colors[color] || colors.blue}
      rounded-2xl p-4 text-white
    `}>
      <p className="text-xs uppercase tracking-wide opacity-75 mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  )
}
