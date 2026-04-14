// ── Règles métier IDMA NetSecure ──

import { arrondi500 } from './format'

/** Modes exonérés du droit de timbre */
export const MODES_EXONERES = ['virement', 'cib', 'edahabia', 'cheque']

/** Taux marché noir (mis à jour manuellement ou via API) */
export const TAUX_MARCHE_DEFAUT = { EUR: 279, USD: 236 }

/** Catégories catalogue */
export const CATALOGUE_CATS = [
  'Vidéosurveillance',
  'Alarme intrusion',
  'Contrôle d\'accès',
  'Réseau & LAN',
  'Énergie & Protection',
  'Accessoires',
  'Main d\'œuvre',
  'PR',
]

/** Jours de la semaine (pointage) */
export const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

/**
 * Droit de timbre
 * Règle : TVA activée ET paiement en ESPÈCES uniquement
 */
export function calcTimbre(ttc, modePaiement, avecTVA) {
  if (!avecTVA || modePaiement !== 'especes') return 0
  const t = ttc <= 30000 ? ttc * 0.01 : ttc <= 100000 ? ttc * 0.015 : ttc * 0.02
  return Math.round(Math.max(5, Math.min(2500, t)) * 100) / 100
}

/** Totaux d'une proforma/facture */
export function calcTotauxDoc(ht, avecTVA, modePaiement) {
  const tva    = avecTVA ? Math.round(ht * 19) / 100 : 0
  const ttc    = ht + tva
  const timbre = calcTimbre(ttc, modePaiement, avecTVA)
  return { ht, tva, ttc, timbre, total: ttc + timbre }
}

/** Total HT d'une liste de lignes */
export function totalHT(lines) {
  return lines.reduce((s, l) => s + (l.q || 0) * (l.pu || 0), 0)
}

/** Salaire d'un employé pour une semaine donnée */
export function calcSalaireEmp(employe, pointageSemaine) {
  if (!employe.actif) return 0
  const ptg = pointageSemaine.filter(p => p.employe_id === employe.id)
  const joursOuvres = ptg.filter(p => ['travaille', 'conge_paye'].includes(p.statut)).length
  const base = (employe.salaire_hebdo || 0) * (joursOuvres / 6)
  const hs   = ptg.reduce((s, p) => s + (p.heures_sup || 0) * (p.taux_hs || 0), 0)
  return arrondi500(base) + hs
}

/** Masse salariale totale (hors exclure_masse) */
export function masseSalariale(employes, pointageSemaine) {
  return employes
    .filter(e => e.actif && !e.exclure_masse)
    .reduce((s, e) => s + calcSalaireEmp(e, pointageSemaine), 0)
}

/** Solde réel depuis les opérations */
export function calcSoldeReel(ops) {
  return ops.reduce((s, o) => {
    const m = parseFloat(o.montant) || 0
    return o.sens === 'enc' ? s + m : s - m
  }, 0)
}
