import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, sbSave, sbPatch } from '../lib/supabase'

function compteFromDB(r) {
  return {
    id:           r.id,
    nom:          r.nom,
    type:         r.type         || 'Caisse',
    devise:       r.devise       || 'DZD',
    solde:        parseFloat(r.solde)       || 0,
    taux_change:  parseFloat(r.taux_change) || 1,
    note:         r.note         || '',
    updated_at:   r.updated_at   || '',
  }
}

function ligneFromDB(r) {
  return {
    id:         r.id,
    compte_id:  r.compte_id,
    date_op:    r.date_op,
    libelle:    r.libelle,
    montant:    parseFloat(r.montant) || 0,
    sens:       r.sens || 'credit',
  }
}

export function useComptes() {
  return useQuery({
    queryKey: ['comptes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comptes').select('*').order('type')
      if (error) throw error
      return data.map(compteFromDB)
    }
  })
}

export function useComptesLignes(compteId) {
  return useQuery({
    queryKey: ['comptes_lignes', compteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comptes_lignes')
        .select('*')
        .eq('compte_id', compteId)
        .order('date_op', { ascending: false })
        .limit(50)
      if (error) throw error
      return data.map(ligneFromDB)
    },
    enabled: !!compteId,
  })
}

export function useAddLigneCompte() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ compteId, ligne, nouveauSolde }) => {
      await sbSave('comptes_lignes', {
        compte_id: compteId,
        date_op:   ligne.date_op,
        libelle:   ligne.libelle,
        montant:   ligne.montant,
        sens:      ligne.sens,
      })
      await sbPatch('comptes', compteId, { solde: nouveauSolde })
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['comptes'] })
      qc.invalidateQueries({ queryKey: ['comptes_lignes', variables.compteId] })
    }
  })
}

export function useCreateCompte() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (compte) => {
      const res = await sbSave('comptes', {
        nom: compte.nom, type: compte.type,
        devise: compte.devise || 'DZD',
        solde: compte.solde || 0,
        taux_change: compte.taux_change || 1,
        note: compte.note || null,
      })
      if (!res) throw new Error('Erreur création compte')
      return res
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comptes'] })
  })
}

// Taux de marché noir par défaut
export const TAUX_DEFAUT = { EUR: 279, USD: 236 }

export function soldeEnDA(compte, taux = TAUX_DEFAUT) {
  if (compte.devise === 'DZD') return compte.solde
  const t = taux[compte.devise] || compte.taux_change || 1
  return compte.solde * t
}
