// ── Fonctions utilitaires — portées depuis le dashboard HTML ──

/** Formater un montant en DA */
export function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '0 DA'
  return Number(n).toLocaleString('fr-DZ', { minimumFractionDigits: 0 }) + ' DA'
}

/** Parser une date (DD/MM/YYYY ou YYYY-MM-DD) → Date locale */
export function pDate(str) {
  if (!str) return null
  if (str instanceof Date) return str
  if (str.includes('/')) {
    const [d, m, y] = str.split('/')
    return new Date(+y, +m - 1, +d)
  }
  if (str.includes('-')) {
    const [y, m, d] = str.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(str)
}

/** Date → DD/MM/YYYY */
export function fmtDate(d) {
  if (!d) return ''
  const dt = d instanceof Date ? d : pDate(d)
  if (!dt || isNaN(dt)) return ''
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`
}

/** Date → YYYY-MM-DD */
export function toYMD(d) {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}

/** Lundi de la semaine d'une date */
export function lundiDeSemaine(d) {
  const dt = new Date(d)
  const day = dt.getDay()
  const diff = day === 0 ? -6 : 1 - day
  dt.setDate(dt.getDate() + diff)
  dt.setHours(0, 0, 0, 0)
  return dt
}

/** "Semaine du DD/MM/YYYY" */
export function labelSemaine(lundi) {
  return `Semaine du ${fmtDate(lundi)}`
}

/** Nb de jours depuis une date */
export function joursDepuis(dateStr) {
  if (!dateStr) return 9999
  return Math.floor((Date.now() - pDate(dateStr).getTime()) / 86400000)
}

/** Arrondi au 500 DA supérieur */
export function arrondi500(n) {
  return Math.ceil(n / 500) * 500
}

/** Solde client (paye - doit) */
export function soldeClient(client) {
  return (client.paye || 0) - (client.doit || 0)
}
