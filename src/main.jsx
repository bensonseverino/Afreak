import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { queryClient } from './lib/queryClient'
import { resolveVariantId as _resolveVariantId } from './lib/catalog'

// Expose a thin bridge so diagnostics tooling can resolve a cart line to a
// variant id on the live storefront without importing the module graph.
globalThis.__CMS_BRIDGE__ = {
  invalidateContent: () => queryClient.invalidateQueries({ queryKey: ['catalog'] }),
  resolveVariantId: _resolveVariantId,
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
