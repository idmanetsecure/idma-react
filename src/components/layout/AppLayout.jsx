import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header }  from './Header'
import { ToastContainer } from '../ui/Toast'
import { useToastContext } from '../../contexts/ToastContext'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toasts, removeToast } = useToastContext()

  return (
    <div className="flex h-screen bg-[#F4F6FA] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Zone de contenu scrollable */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
