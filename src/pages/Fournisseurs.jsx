import { useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { useFournisseurs, useCreateFourn, useFournisseurOps, usePaiementFourn } from '../hooks/useFournisseurs'
import { useShowToast } from '../contexts/ToastContext'
import { fmt, fmtDate } from '../lib/format'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Page principale
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function Fournisseurs() {
  const { data: fournisseurs = [], isLoading } = useFournisseurs()
  const [selectedId, setSelectedId]   = useState(null)
  const [showCreate,  setShowCreate]  = useState(false)
  const [search,      setSearch]      = useState('')

  const filtered = fournisseurs.filter(f =>
    f.nom.toLowerCase().includes(search.toLowerCase()) ||
    f.spec.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <FournisseursSkeleton />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20 focus:border-[#0D2B5E]"
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0D2B5E] text-white text-sm font-semibold rounded-xl hover:bg-[#1E3A7A] transition-colors shadow-sm"
        >
          <span>+</span> Nouveau fournisseur
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Fournisseurs',   value: fournisseurs.length,                                    color: 'text-[#0D2B5E]' },
          { label: 'Total achats',   value: fmt(fournisseurs.reduce((s,f) => s+f.achats, 0)),        color: 'text-blue-600'  },
          { label: 'Solde total dû', value: fmt(fournisseurs.reduce((s,f) => s+f.solde,  0)),        color: 'text-red-500'   },
          { label: 'À régler',       value: fournisseurs.filter(f => f.solde > 0).length + ' fourn', color: 'text-amber-600' },
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
          <p className="text-gray-400 text-sm">Aucun fournisseur trouvé</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(f => (
            <FournisseurCard key={f.id} fourn={f} onClick={() => setSelectedId(f.id)} />
          ))}
        </div>
      )}

      {/* Modal détail */}
      <FournisseurDetail
        fournId={selectedId}
        fournisseurs={fournisseurs}
        onClose={() => setSelectedId(null)}
      />

      {/* Modal création */}
      <CreateFournModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Card fournisseur
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FournisseurCard({ fourn: f, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-[#0D2B5E]/30 hover:shadow-sm transition-all"
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
        {f.nom[0]}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{f.nom}</p>
        <p className="text-xs text-gray-400">{f.spec} · {f.tel}</p>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6">
        <div className="text-right">
          <p className="text-xs text-gray-400">Achats</p>
          <p className="text-sm font-bold text-blue-600 font-mono">{fmt(f.achats)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Solde dû</p>
          <p className={`text-sm font-bold font-mono ${f.solde > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
            {fmt(f.solde)}
          </p>
        </div>
        <Badge label={f.solde > 0 ? 'À régler' : 'À jour'} />
      </div>

      <span className="text-gray-300 text-lg">›</span>
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Modal détail fournisseur
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FournisseurDetail({ fournId, fournisseurs, onClose }) {
  const f = fournisseurs.find(x => x.id === fournId)
  const { data: ops = [], isLoading } = useFournisseurOps(fournId)
  const paiement  = usePaiementFourn()
  const showToast = useShowToast()

  const [montant, setMontant] = useState('')
  const [ref,     setRef]     = useState('')

  const totalAchats  = ops.filter(o => o.type_mouvement === 'achat').reduce((s,o) => s + parseFloat(o.montant), 0)
  const totalRegle   = ops.filter(o => o.type_mouvement === 'reglement').reduce((s,o) => s + parseFloat(o.montant), 0)
  const totalAttente = ops.filter(o => o.type_mouvement === 'achat' && o.statut_paiement === 'en_attente').reduce((s,o) => s + parseFloat(o.montant), 0)
  const soldeCalc    = totalAchats - totalRegle

  async function handlePaiement() {
    const mnt = parseFloat(montant)
    if (!mnt || mnt <= 0) { showToast('❌ Montant invalide', 'error'); return }
    try {
      await paiement.mutateAsync({ fourn: f, montant: mnt, ref })
      showToast('✓ Paiement fournisseur enregistré')
      setMontant('')
      setRef('')
    } catch {
      showToast('❌ Erreur enregistrement', 'error')
    }
  }

  if (!f) return null

  return (
    <Modal open={!!fournId} onClose={onClose} title={f.nom} size="lg">
      {/* En-tête fournisseur */}
      <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl mb-5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {f.nom[0]}
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800">{f.nom}</p>
          <p className="text-xs text-gray-500">{f.spec}</p>
          <p className="text-xs text-gray-400">📞 {f.tel}</p>
        </div>
        <Badge label={f.solde > 0 ? 'À régler' : 'À jour'} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total achats',  value: fmt(totalAchats),  color: 'text-blue-600'   },
          { label: 'Total réglé',   value: fmt(totalRegle),   color: 'text-emerald-600' },
          { label: 'En attente',    value: fmt(totalAttente), color: 'text-amber-600'   },
          { label: 'Solde dû',      value: fmt(soldeCalc),    color: soldeCalc > 0 ? 'text-red-500' : 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">{k.label}</p>
            <p className={`text-sm font-bold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Historique mouvements */}
      <p className="text-xs font-bold text-[#0D2B5E] uppercase tracking-wide mb-2">Historique</p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden mb-5">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400">Chargement...</div>
        ) : ops.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">Aucun mouvement</div>
        ) : (
          <div>
            {/* Header tableau */}
            <div className="grid grid-cols-[70px_1fr_90px_110px_80px] gap-2 px-4 py-2 bg-[#0D2B5E]/5 text-xs font-semibold text-gray-500 uppercase">
              <span>Date</span><span>Libellé</span><span className="text-center">Type</span>
              <span className="text-right">Montant</span><span className="text-center">Statut</span>
            </div>
            {ops.map(op => (
              <div key={op.id} className="grid grid-cols-[70px_1fr_90px_110px_80px] gap-2 px-4 py-2.5 border-t border-gray-200 text-xs items-center">
                <span className="text-gray-400">{fmtDate(op.date_op)}</span>
                <span className="text-gray-600 truncate">{op.libelle}</span>
                <span className="text-center">
                  {op.type_mouvement === 'achat'
                    ? <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-semibold">📦 Achat</span>
                    : <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-semibold">💳 Règlement</span>
                  }
                </span>
                <span className={`text-right font-bold font-mono ${op.type_mouvement === 'achat' ? 'text-red-500' : 'text-emerald-600'}`}>
                  {op.type_mouvement === 'achat' ? '-' : '+'}{fmt(op.montant)}
                </span>
                <span className="text-center">
                  <Badge label={op.statut_paiement === 'en_attente' ? 'en_attente' : 'payé'} />
                </span>
              </div>
            ))}
            {/* Ligne total */}
            {ops.length > 0 && (
              <div className="grid grid-cols-[70px_1fr_90px_110px_80px] gap-2 px-4 py-2 border-t-2 border-[#0D2B5E]/20 bg-[#0D2B5E]/5">
                <span className="col-span-3 text-xs font-bold text-gray-600">SOLDE</span>
                <span className={`text-right text-sm font-bold font-mono ${soldeCalc > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {fmt(soldeCalc)}
                </span>
                <span />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saisie paiement */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-3">💳 Enregistrer un paiement</p>
        <div className="flex gap-2 flex-wrap">
          <input
            type="number"
            placeholder="Montant (DA)"
            value={montant}
            onChange={e => setMontant(e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <input
            type="text"
            placeholder="Réf. ou motif"
            value={ref}
            onChange={e => setRef(e.target.value)}
            className="flex-1 min-w-[120px] px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <button
            onClick={handlePaiement}
            disabled={paiement.isPending}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {paiement.isPending ? '...' : 'Payer'}
          </button>
        </div>
        {f.solde > 0 && (
          <p className="text-xs text-amber-600 mt-2">Solde restant : <strong>{fmt(f.solde)}</strong></p>
        )}
      </div>
    </Modal>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Modal création fournisseur
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function CreateFournModal({ open, onClose }) {
  const [nom,   setNom]   = useState('')
  const [tel,   setTel]   = useState('')
  const [spec,  setSpec]  = useState('')
  const create    = useCreateFourn()
  const showToast = useShowToast()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nom) { showToast('❌ Nom requis', 'error'); return }
    try {
      await create.mutateAsync({ nom, tel, spec })
      showToast('✓ Fournisseur ajouté')
      setNom(''); setTel(''); setSpec('')
      onClose()
    } catch {
      showToast('❌ Erreur création', 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau fournisseur" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: 'Nom *', value: nom, set: setNom, placeholder: 'Nom du fournisseur', required: true },
          { label: 'Téléphone', value: tel, set: setTel, placeholder: '0X XX XX XX XX' },
          { label: 'Spécialité', value: spec, set: setSpec, placeholder: 'Câbles, matériel réseau...' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
            <input
              type="text"
              value={f.value}
              onChange={e => f.set(e.target.value)}
              placeholder={f.placeholder}
              required={f.required}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D2B5E]/20 focus:border-[#0D2B5E]"
            />
          </div>
        ))}
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
// Skeleton loading
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function FournisseursSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 flex items-center gap-4">
          <div className="skeleton w-9 h-9 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3.5 w-40 rounded" />
            <div className="skeleton h-2.5 w-24 rounded" />
          </div>
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      ))}
    </div>
  )
}
