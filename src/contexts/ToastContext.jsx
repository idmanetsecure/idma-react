import { createContext, useContext } from 'react'
import { useToast } from '../hooks/useToast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const toast = useToast()
  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastContext doit être dans ToastProvider')
  return ctx
}

/** Hook rapide — showToast('message') depuis n'importe quel composant */
export function useShowToast() {
  return useToastContext().showToast
}
