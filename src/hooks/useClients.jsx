import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, sbSave, sbPatch } from '../lib/supabase'

// ── Mapper DB → objet JS
export function clientFromDB(r) {
  return {
    id:                r.id,
    nom:               r.nom,
    tel:               r.tel               || '—',
    type:              r.type              || 'Particulier',
    nif:               r.nif              || '',
    rc:                r.rc               || '',
    nis:               r.nis              || '',
    ai:                r.ai               || '',
    adresse:           r.adr              || '',
    wil:               r.wil              || '',
    contrat:           parseFloat(r.contrat)          || 0,
    paye:              parseFloat(r.paye)             || 0,
    statut:            r.statut           || 'À jour',
    note:              r.note             || '',
    dernier_versement: r.dernier_versement || null,
    derniere_relance:  r.derniere_relance  || null,
  }
}

function clientToDB(c) {
  return {
    nom: c.nom, tel: c.tel, type: c.type,
    nif: c.nif || null, rc: c.rc || null,
    nis: c.nis || null, ai: c.ai || null,
    adr: c.adresse || null, wil: c.wil || null,
    contrat: c.contrat, paye: c.paye,
    statut: c.statut, note: c.note || null,
  }
}

// ── Nb jours depuis dernier versement (depuis les ops)
export function joursDepuisVersement(client, ops = []) {
  const enc = ops.filter(o => o.client_id === client.id && o.sens === 'enc')
  if (enc.length > 0) {
    const last = enc.sort((a, b) => new Date(b.date_op) - new Date(a.date_op))[0]
    return Math.floor((Date.now() - new Date(last.date_op).getTime()) / 86400000)
  }
  if (!client.dernier_versement) return 999
  return Math.floor((Date.now() - new Date(client.dernier_versement).getTime()) / 86400000)
}

export function aRelancer(client, ops = []) {
  if (client.contrat <= 0) return false
  const reste = client.contrat - client.paye
  if (reste <= 0) return false
  return joursDepuisVersement(client, ops) >= 15
}

// ── Message WhatsApp
export function genRelanceMsg(nom, montant, fmt) {
  const prenom = nom.split(' ')[0]
  return `Bonjour ${prenom},\n\nJ'espère que vous allez bien. Je me permets de vous contacter concernant le règlement de votre solde de ${fmt(montant)} relatif à nos prestations IDMA NetSecure.\n\nPourriez-vous me confirmer une date de paiement ? Je reste disponible pour tout arrangement.\n\nCordialement,\nIDMA NetSecure`
}

export function lancerWhatsApp(client, montant, fmt) {
  let tel = (client.tel || '').replace(/\s/g, '').replace(/^0/, '213').replace(/[^0-9]/g, '')
  if (!tel || tel === '213') return null
  const msg = genRelanceMsg(client.nom, montant, fmt)
  return `https://wa.me/${tel}?text=${encodeURIComponent(msg)}`
}

// ── Hooks TanStack Query

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients').select('*').order('nom')
      if (error) throw error
      return data.map(clientFromDB)
    }
  })
}

export function useClientOps(clientId) {
  return useQuery({
    queryKey: ['operations', 'client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operations')
        .select('id,date_op,libelle,montant,sens,statut_paiement')
        .eq('client_id', clientId)
        .order('date_op', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!clientId,
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (client) => {
      const res = await sbSave('clients', clientToDB(client))
      if (!res) throw new Error('Erreur création client')
      return res
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] })
  })
}

export function useMarquerRelance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (clientId) => {
      const today = new Date().toISOString().split('T')[0]
      await sbPatch('clients', clientId, { dernier_versement: today })
      return today
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] })
  })
}
