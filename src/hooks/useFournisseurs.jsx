import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, sbSave, sbPatch } from '../lib/supabase'

// ── Mapper DB → objet JS
function foFromDB(r) {
  return {
    id:     r.id,
    nom:    r.nom,
    tel:    r.tel    || '—',
    spec:   r.spec   || '',
    solde:  parseFloat(r.solde)  || 0,
    achats: parseFloat(r.achats) || 0,
  }
}

// ── Charger tous les fournisseurs
export function useFournisseurs() {
  return useQuery({
    queryKey: ['fournisseurs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fournisseurs').select('*').order('nom')
      if (error) throw error
      return data.map(foFromDB)
    }
  })
}

// ── Charger les opérations d'un fournisseur
export function useFournisseurOps(fournId) {
  return useQuery({
    queryKey: ['operations', 'fournisseur', fournId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operations')
        .select('id,date_op,libelle,montant,type_mouvement,statut_paiement')
        .eq('fournisseur_id', fournId)
        .order('date_op', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!fournId,
  })
}

// ── Créer un fournisseur
export function useCreateFourn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (fourn) => {
      const res = await sbSave('fournisseurs', {
        nom: fourn.nom, tel: fourn.tel || null,
        spec: fourn.spec || null, solde: 0, achats: 0
      })
      if (!res) throw new Error('Erreur création fournisseur')
      return res
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fournisseurs'] })
  })
}

// ── Enregistrer un paiement fournisseur
export function usePaiementFourn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ fourn, montant, ref }) => {
      const nouveauSolde = Math.max(0, fourn.solde - montant)
      // 1. Mettre à jour le solde fournisseur
      await sbPatch('fournisseurs', fourn.id, { solde: nouveauSolde })
      // 2. Créer l'opération dans le journal
      const today = new Date().toISOString().split('T')[0]
      await sbSave('operations', {
        date_op:          today,
        libelle:          `Paiement ${fourn.nom}${ref ? ' — ' + ref : ''}`,
        type_op:          'Achat',
        montant,
        sens:             'dec',
        client_nom:       fourn.nom,
        fournisseur_id:   fourn.id,
        fournisseur_nom:  fourn.nom,
        type_mouvement:   'reglement',
        statut_paiement:  'payé',
      })
      return nouveauSolde
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fournisseurs'] })
      qc.invalidateQueries({ queryKey: ['operations'] })
    }
  })
}
