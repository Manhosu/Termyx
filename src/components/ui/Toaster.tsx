'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={5000}
      toastOptions={{
        className: 'rounded-xl shadow-lg',
        style: {
          borderRadius: '0.75rem',
        },
      }}
    />
  )
}
