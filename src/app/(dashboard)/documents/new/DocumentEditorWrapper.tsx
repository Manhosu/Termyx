'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic import with SSR disabled
const DocumentEditor = dynamic(
  () => import('./DocumentEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }
)

export default function DocumentEditorWrapper() {
  return <DocumentEditor />
}
