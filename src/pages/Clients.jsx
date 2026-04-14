import { useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import {
  useClients, useClientOps, useCreateClient, useMarquerRelance,
  aRelancer, joursDepuisVersement, lancerWhatsApp
} from '../hooks/useClients'
import { useShowToast } from '../contexts/ToastContext'
import { fmt, fmtDate } from '../lib/format'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Page principale
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Clients() {
  const { data: clients = [], isLoading } = useClients()
  const [selectedId,  setSelectedId]  = useState(null)
  const [showCreate,  setShowCreate]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState('tous')

  const filtered = clients
    .filter(c => {
      if (filter === 'relance') return aRelancer(c)
      if (filter === 'encours') return (c.contrat - c.paye) > 0
      return true
    })
    .filter(c =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.tel.includes(search)
    )

  const totalCreances = clients.reduce((s, c) => s + Math.max(0, c.contrat - c.paye), 0)
  const nbRelancer    = clients.filter(c => aRelancer(c)).length

  if (isLoading) return <ClientsSkeleton />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20 focus:border-[#0D2B5E]"
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D2B5E] text-white text-sm font-semibold rounded-xl hover:bg-[#1E3A7A] transition-colors shadow-sm"
        >
          <span>+</span> Nouveau client
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'tous',    label: `Tous (${clients.length})` },
          { key: 'encours', label: 'Solde en cours' },
          { key: 'relance', label: `⏰ À relancer (${nbRelancer})`, alert: nbRelancer > 0 },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filter === f.key
                ? f.alert ? 'bg-amber-500 text-white' : 'bg-[#0D2B5E] text-white'
                : f.alert ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0D2B5E]/30'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Clients',         value: clients.length,             color: 'text-[#0D2B5E]' },
          { label: 'Créances totales', value: fmt(totalCreances),         color: 'text-red-500'   },
          { label: 'À relancer',       value: nbRelancer + ' clients',    color: 'text-amber-600' },
          { label: 'À jour',           value: clients.filter(c => !aRelancer(c) && (c.contrat - c.paye) <= 0).length, color: 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
            <p className={`text-lg font-bold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 text-sm">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <ClientCard key={c.id} client={c} onClick={() => setSelectedId(c.id)} />
          ))}
        </div>
      )}

      {/* Modals */}
      <ClientDetail
        clientId={selectedId}
        clients={clients}
        onClose={() => setSelectedId(null)}
      />
      <CreateClientModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Card client
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ClientCard({ client: c, onClick }) {
  const reste   = c.contrat - c.paye
  const pct     = c.contrat > 0 ? Math.round((c.paye / c.contrat) * 100) : 100
  const relance = aRelancer(c)
  const jours   = joursDepuisVersement(c)

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm transition-all ${
        relance ? 'border-amber-200 hover:border-amber-400' : 'border-gray-100 hover:border-[#0D2B5E]/30'
      }`}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0D2B5E] to-[#3B82F6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {c.nom[0]}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-800">{c.nom}</p>
          {relance && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">⏰ {jours}j sans versement</span>}
        </div>
        <p className="text-xs text-gray-400">{c.type} · {c.tel}</p>
        {/* Barre de progression */}
        {c.contrat > 0 && (
          <div className="mt-1.5 h-1 bg-gray-100 rounded-full w-32 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, pct)}%`,
                background: pct === 100 ? '#10B981' : pct > 50 ? '#3B82F6' : '#F59E0B'
              }}
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6">
        {c.contrat > 0 && (
          <>
            <div className="text-right">
              <p className="text-xs text-gray-400">Payé</p>
              <p className="text-sm font-bold text-emerald-600 font-mono">{fmt(c.paye)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Reste</p>
              <p className={`text-sm font-bold font-mono ${reste > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                {fmt(reste)}
              </p>
            </div>
          </>
        )}
        <Badge label={c.statut} />
      </div>

      <span className="text-gray-300 text-lg">›</span>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Modal détail client
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ClientDetail({ clientId, clients, onClose }) {
  const c           = clients.find(x => x.id === clientId)
  const { data: ops = [], isLoading } = useClientOps(clientId)
  const marquer     = useMarquerRelance()
  const showToast   = useShowToast()

  if (!c) return null

  const reste    = c.contrat - c.paye
  const pct      = c.contrat > 0 ? Math.round((c.paye / c.contrat) * 100) : 100
  const relance  = aRelancer(c)
  const jours    = joursDepuisVersement(c)
  const encaiss  = ops.filter(o => o.sens === 'enc').reduce((s, o) => s + parseFloat(o.montant), 0)

  function handleWhatsApp() {
    const url = lancerWhatsApp(c, reste, fmt)
    if (!url) { showToast('❌ Numéro de téléphone manquant', 'error'); return }
    window.open(url, '_blank')
  }

  async function handleMarquerRelance() {
    await marquer.mutateAsync(c.id)
    showToast('✓ Relance tracée')
  }

  return (
    <Modal open={!!clientId} onClose={onClose} title={c.nom} size="lg">
      {/* En-tête */}
      <div className="flex items-start gap-3 p-4 bg-[#EBF1FB] border border-[#0D2B5E]/10 rounded-xl mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0D2B5E] to-[#3B82F6] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {c.nom[0]}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{c.nom}</p>
          <p className="text-xs text-gray-500">{c.type} · {c.adresse || '—'}</p>
          <p className="text-xs text-gray-400">📞 {c.tel}</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge label={c.statut} />
          {relance && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
              ⏰ {jours}j sans versement
            </span>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Contrat',      value: fmt(c.contrat),  color: 'text-[#0D2B5E]' },
          { label: 'Encaissé',     value: fmt(encaiss),    color: 'text-emerald-600' },
          { label: 'Reste dû',     value: fmt(reste),      color: reste > 0 ? 'text-red-500' : 'text-emerald-600' },
          { label: 'Progression',  value: `${pct}%`,       color: pct === 100 ? 'text-emerald-600' : 'text-amber-600' },
        ].map(k => (
          <div key={k.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">{k.label}</p>
            <p className={`text-sm font-bold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Barre progression */}
      {c.contrat > 0 && (
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, pct)}%`,
              background: pct === 100 ? '#10B981' : pct > 50 ? '#3B82F6' : '#F59E0B'
            }}
          />
        </div>
      )}

      {/* Infos fiscales */}
      {(c.nif || c.rc || c.nis || c.ai) && (
        <div className="grid grid-cols-2 gap-2 mb-5 p-3 bg-gray-50 rounded-xl text-xs">
          {[['NIF', c.nif], ['RC', c.rc], ['NIS', c.nis], ['AI', c.ai]].filter(([,v]) => v).map(([k,v]) => (
            <div key={k}><span className="text-gray-400">{k} : </span><span className="font-mono text-gray-700">{v}</span></div>
          ))}
        </div>
      )}

      {/* Historique paiements */}
      <p className="text-xs font-bold text-[#0D2B5E] uppercase tracking-wide mb-2">Historique paiements</p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-5">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-400">Chargement...</div>
        ) : ops.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Aucun paiement enregistré</div>
        ) : (
          <>
            <div className="grid grid-cols-[80px_1fr_120px_90px] gap-2 px-4 py-2 bg-[#0D2B5E]/5 text-xs font-semibold text-gray-500 uppercase">
              <span>Date</span><span>Libellé</span><span className="text-right">Montant</span><span className="text-center">Statut</span>
            </div>
            {ops.map(op => (
              <div key={op.id} className="grid grid-cols-[80px_1fr_120px_90px] gap-2 px-4 py-2.5 border-t border-gray-200 text-xs items-center">
                <span className="text-gray-400">{fmtDate(op.date_op)}</span>
                <span className="text-gray-600 truncate">{op.libelle}</span>
                <span className={`text-right font-bold font-mono ${op.sens === 'enc' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {op.sens === 'enc' ? '+' : '-'}{fmt(op.montant)}
                </span>
                <span className="text-center"><Badge label={op.statut_paiement || 'À jour'} /></span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Note */}
      {c.note && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-xs text-blue-700">
          📝 {c.note}
        </div>
      )}

      {/* Actions relance */}
      {relance && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 mb-3">
            ⏰ Ce client n'a pas versé depuis <strong>{jours} jours</strong> — solde restant : <strong>{fmt(reste)}</strong>
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <span>📱</span> WhatsApp
            </button>
            <button
              onClick={handleMarquerRelance}
              disabled={marquer.isPending}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              ✓ Marquer relancé
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Modal création client
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CreateClientModal({ open, onClose }) {
  const [form, setForm]   = useState({ nom:'', tel:'', type:'Entreprise', adresse:'', nif:'', rc:'', nis:'', ai:'', contrat:'0', statut:'À jour', note:'' })
  const create    = useCreateClient()
  const showToast = useShowToast()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nom) { showToast('❌ Nom requis', 'error'); return }
    try {
      await create.mutateAsync({ ...form, contrat: parseFloat(form.contrat)||0, paye: 0 })
      showToast(`✓ Client "${form.nom}" créé`)
      setForm({ nom:'', tel:'', type:'Entreprise', adresse:'', nif:'', rc:'', nis:'', ai:'', contrat:'0', statut:'À jour', note:'' })
      onClose()
    } catch {
      showToast('❌ Erreur création', 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau client" size="md">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'Nom *', key:'nom', required:true, cols:2 },
            { label:'Téléphone', key:'tel' },
            { label:'Wilaya', key:'adresse' },
          ].map(f => (
            <div key={f.key} className={f.cols === 2 ? 'col-span-2' : ''}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{f.label}</label>
              <input type="text" value={form[f.key]} onChange={e => set(f.key, e.target.value)} required={f.required}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20 focus:border-[#0D2B5E]" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20">
              {['Entreprise','Particulier','Administration','Association'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Montant contrat (DA)</label>
            <input type="number" value={form.contrat} onChange={e => set('contrat', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20" />
          </div>
        </div>

        {/* Infos fiscales optionnelles */}
        <details className="group">
          <summary className="text-xs font-semibold text-gray-500 cursor-pointer hover:text-[#0D2B5E] select-none">
            ▶ Infos fiscales (optionnel)
          </summary>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {['nif','rc','nis','ai'].map(k => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{k.toUpperCase()}</label>
                <input type="text" value={form[k]} onChange={e => set(k, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20" />
              </div>
            ))}
          </div>
        </details>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={create.isPending} className="flex-1 py-2.5 bg-[#0D2B5E] text-white text-sm font-semibold rounded-xl hover:bg-[#1E3A7A] transition-colors disabled:opacity-60">
            {create.isPending ? '...' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Skeleton
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ClientsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-4">
          <div className="skeleton w-9 h-9 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-44 rounded" />
            <div className="skeleton h-2.5 w-28 rounded" />
            <div className="skeleton h-1 w-32 rounded-full" />
          </div>
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}
