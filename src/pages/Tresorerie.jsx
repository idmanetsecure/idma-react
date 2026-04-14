import { useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { useComptes, useComptesLignes, useAddLigneCompte, useCreateCompte, soldeEnDA, TAUX_DEFAUT } from '../hooks/useComptes'
import { useShowToast } from '../contexts/ToastContext'
import { fmt, fmtDate, toYMD } from '../lib/format'

const TYPE_ICONS = {
  'Bancaire':  '🏦',
  'Caisse':    '💵',
  'Devise':    '💱',
  'Actif':     '🏗️',
}

const TYPE_COLORS = {
  'Bancaire': 'from-[#0D2B5E] to-[#1E3A7A]',
  'Caisse':   'from-emerald-600 to-emerald-700',
  'Devise':   'from-amber-500 to-amber-600',
  'Actif':    'from-purple-600 to-purple-700',
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Page principale
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Tresorerie() {
  const { data: comptes = [], isLoading } = useComptes()
  const [selectedId,   setSelectedId]  = useState(null)
  const [showCreate,   setShowCreate]  = useState(false)
  const [taux,         setTaux]        = useState(TAUX_DEFAUT)

  // Total patrimonial en DA (tous comptes convertis)
  const totalDA = comptes.reduce((s, c) => s + soldeEnDA(c, taux), 0)

  // Grouper par type
  const grouped = comptes.reduce((acc, c) => {
    const t = c.type || 'Caisse'
    if (!acc[t]) acc[t] = []
    acc[t].push(c)
    return acc
  }, {})

  if (isLoading) return <TresorerieSkeleton />

  return (
    <div className="space-y-5">
      {/* Total patrimoine */}
      <div className="bg-gradient-to-br from-[#0D2B5E] to-[#1E3A7A] rounded-2xl p-5 text-white">
        <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Patrimoine total estimé</p>
        <p className="text-3xl font-bold font-mono">{fmt(totalDA)}</p>
        <div className="flex items-center gap-4 mt-3 text-xs opacity-70">
          <span>Taux marché : EUR = {taux.EUR} DA</span>
          <span>USD = {taux.USD} DA</span>
          <button
            onClick={() => {
              const eur = prompt('Taux EUR (DA) :', taux.EUR)
              const usd = prompt('Taux USD (DA) :', taux.USD)
              if (eur && usd) setTaux({ EUR: parseFloat(eur), USD: parseFloat(usd) })
            }}
            className="underline opacity-80 hover:opacity-100"
          >
            Modifier
          </button>
        </div>
      </div>

      {/* Bouton créer */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D2B5E] text-white text-sm font-semibold rounded-xl hover:bg-[#1E3A7A] transition-colors shadow-sm"
        >
          <span>+</span> Nouveau compte
        </button>
      </div>

      {/* Comptes par type */}
      {Object.entries(grouped).map(([type, cpts]) => (
        <div key={type}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{TYPE_ICONS[type] || '💰'}</span>
            <h3 className="text-sm font-bold text-[#0D2B5E]">{type}</h3>
            <span className="text-xs text-gray-400">({cpts.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cpts.map(c => (
              <CompteCard key={c.id} compte={c} taux={taux} onClick={() => setSelectedId(c.id)} />
            ))}
          </div>
        </div>
      ))}

      {/* Modals */}
      <CompteDetail
        compteId={selectedId}
        comptes={comptes}
        taux={taux}
        onClose={() => setSelectedId(null)}
      />
      <CreateCompteModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Card compte
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CompteCard({ compte: c, taux, onClick }) {
  const enDA    = soldeEnDA(c, taux)
  const isDev   = c.devise !== 'DZD'
  const gradient = TYPE_COLORS[c.type] || 'from-gray-600 to-gray-700'

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden`}
    >
      {/* Bulle déco */}
      <div className="absolute bottom-[-12px] right-[-12px] w-20 h-20 rounded-full bg-white/10" />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs opacity-70">{c.type}</p>
          <p className="font-bold text-sm">{c.nom}</p>
        </div>
        <span className="text-2xl">{TYPE_ICONS[c.type] || '💰'}</span>
      </div>

      <p className="text-2xl font-bold font-mono mb-0.5">
        {isDev
          ? `${c.solde.toLocaleString('fr-DZ')} ${c.devise}`
          : fmt(c.solde)
        }
      </p>
      {isDev && (
        <p className="text-xs opacity-70">≈ {fmt(enDA)} (taux {taux[c.devise] || c.taux_change})</p>
      )}
      {c.note && <p className="text-xs opacity-60 mt-1 truncate">{c.note}</p>}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Modal détail compte
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CompteDetail({ compteId, comptes, taux, onClose }) {
  const c = comptes.find(x => x.id === compteId)
  const { data: lignes = [], isLoading } = useComptesLignes(compteId)
  const addLigne  = useAddLigneCompte()
  const showToast = useShowToast()

  const [form, setForm] = useState({
    libelle: '', montant: '', sens: 'credit',
    date_op: toYMD(new Date())
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleAdd(e) {
    e.preventDefault()
    const mnt = parseFloat(form.montant)
    if (!form.libelle || !mnt || mnt <= 0) {
      showToast('❌ Libellé et montant requis', 'error'); return
    }
    const delta         = form.sens === 'credit' ? mnt : -mnt
    const nouveauSolde  = c.solde + delta
    try {
      await addLigne.mutateAsync({
        compteId, nouveauSolde,
        ligne: { ...form, montant: mnt }
      })
      showToast('✓ Mouvement enregistré')
      setForm({ libelle: '', montant: '', sens: 'credit', date_op: toYMD(new Date()) })
    } catch {
      showToast('❌ Erreur enregistrement', 'error')
    }
  }

  if (!c) return null

  const isDev = c.devise !== 'DZD'

  return (
    <Modal open={!!compteId} onClose={onClose} title={c.nom} size="lg">
      {/* Solde actuel */}
      <div className={`bg-gradient-to-br ${TYPE_COLORS[c.type] || 'from-gray-600 to-gray-700'} rounded-xl p-4 text-white mb-5`}>
        <p className="text-xs opacity-70 mb-1">Solde actuel</p>
        <p className="text-2xl font-bold font-mono">
          {isDev ? `${c.solde.toLocaleString('fr-DZ')} ${c.devise}` : fmt(c.solde)}
        </p>
        {isDev && <p className="text-xs opacity-70">≈ {fmt(soldeEnDA(c, taux))}</p>}
      </div>

      {/* Ajouter un mouvement */}
      <p className="text-xs font-bold text-[#0D2B5E] uppercase tracking-wide mb-2">Nouveau mouvement</p>
      <form onSubmit={handleAdd} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="col-span-2">
            <input type="text" placeholder="Libellé *" value={form.libelle} onChange={e => set('libelle', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20" />
          </div>
          <input type="number" placeholder={`Montant (${c.devise})`} value={form.montant} onChange={e => set('montant', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20" />
          <select value={form.sens} onChange={e => set('sens', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20">
            <option value="credit">+ Entrée</option>
            <option value="debit">- Sortie</option>
          </select>
          <input type="date" value={form.date_op} onChange={e => set('date_op', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20" />
          <button type="submit" disabled={addLigne.isPending}
            className="px-4 py-2 bg-[#0D2B5E] text-white text-sm font-semibold rounded-lg hover:bg-[#1E3A7A] transition-colors disabled:opacity-60">
            {addLigne.isPending ? '...' : 'Ajouter'}
          </button>
        </div>
      </form>

      {/* Historique */}
      <p className="text-xs font-bold text-[#0D2B5E] uppercase tracking-wide mb-2">Historique</p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-gray-400">Chargement...</div>
        ) : lignes.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Aucun mouvement</div>
        ) : (
          <>
            <div className="grid grid-cols-[80px_1fr_120px] gap-2 px-4 py-2 bg-[#0D2B5E]/5 text-xs font-semibold text-gray-500 uppercase">
              <span>Date</span><span>Libellé</span><span className="text-right">Montant</span>
            </div>
            {lignes.map(l => (
              <div key={l.id} className="grid grid-cols-[80px_1fr_120px] gap-2 px-4 py-2.5 border-t border-gray-200 text-xs items-center">
                <span className="text-gray-400">{fmtDate(l.date_op)}</span>
                <span className="text-gray-600 truncate">{l.libelle}</span>
                <span className={`text-right font-bold font-mono ${l.sens === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {l.sens === 'credit' ? '+' : '-'}{l.montant.toLocaleString('fr-DZ')} {c.devise}
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </Modal>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Modal création compte
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CreateCompteModal({ open, onClose }) {
  const [form, setForm] = useState({ nom:'', type:'Caisse', devise:'DZD', solde:'0', note:'' })
  const create    = useCreateCompte()
  const showToast = useShowToast()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nom) { showToast('❌ Nom requis', 'error'); return }
    try {
      await create.mutateAsync({ ...form, solde: parseFloat(form.solde) || 0 })
      showToast('✓ Compte créé')
      setForm({ nom:'', type:'Caisse', devise:'DZD', solde:'0', note:'' })
      onClose()
    } catch {
      showToast('❌ Erreur création', 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau compte" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nom *</label>
          <input type="text" value={form.nom} onChange={e => set('nom', e.target.value)} required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none">
              {['Bancaire','Caisse','Devise','Actif'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Devise</label>
            <select value={form.devise} onChange={e => set('devise', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none">
              {['DZD','EUR','USD'].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Solde initial</label>
          <input type="number" value={form.solde} onChange={e => set('solde', e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20" />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50">Annuler</button>
          <button type="submit" disabled={create.isPending} className="flex-1 py-2.5 bg-[#0D2B5E] text-white text-sm font-semibold rounded-xl hover:bg-[#1E3A7A] disabled:opacity-60">
            {create.isPending ? '...' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function TresorerieSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-28 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    </div>
  )
}
