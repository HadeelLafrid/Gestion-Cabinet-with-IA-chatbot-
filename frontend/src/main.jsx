import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthProvider'
import './styles/global.css'
import App from './app/App.jsx'

const queryClient = new QueryClient()

document.documentElement.style.fontSize = localStorage.getItem('app-font-size') === 'sm'
  ? '14px'
  : localStorage.getItem('app-font-size') === 'lg'
    ? '18px'
    : localStorage.getItem('app-font-size') === 'xl'
      ? '20px'
      : '16px'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)