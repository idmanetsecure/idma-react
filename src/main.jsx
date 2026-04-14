import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './hooks/useAuth'
import { ToastProvider } from './contexts/ToastContext'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:        60 * 1000,      // 1 minute — données fraîches
      gcTime:           5 * 60 * 1000,  // 5 minutes — durée de vie cache
      retry:            1,
      refetchOnWindowFocus: false,       // éviter les rechargements intempestifs
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error)
      }
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
        {/* Devtools TanStack Query — visible uniquement en développement */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
