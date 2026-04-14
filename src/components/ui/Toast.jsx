export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const colors = {
    success: 'bg-[#0D2B5E] text-white',
    error:   'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info:    'bg-blue-600 text-white',
  }
  return (
    <div
      className={`
        animate-toast-in pointer-events-auto
        flex items-center gap-3
        px-4 py-3 rounded-xl shadow-xl
        text-sm font-medium min-w-[260px] max-w-[380px]
        ${colors[toast.type] || colors.success}
      `}
      onClick={() => onRemove(toast.id)}
    >
      <span className="flex-1">{toast.message}</span>
      <button className="opacity-70 hover:opacity-100 text-base leading-none">×</button>
    </div>
  )
}
