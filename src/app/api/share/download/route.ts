import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Find the share record
  const { data: share, error: shareError } = await supabase
    .from('document_shares')
    .select(`
      *,
      document:documents(pdf_path)
    `)
    .eq('token', token)
    .single()

  if (shareError || !share) {
    return NextResponse.json({ error: 'Share not found' }, { status: 404 })
  }

  // Check if expired
  if (new Date(share.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Link expired' }, { status: 410 })
  }

  const document = share.document as { pdf_path: string | null }

  if (!document?.pdf_path) {
    return NextResponse.json({ error: 'PDF not available' }, { status: 404 })
  }

  // Create signed URL
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.pdf_path, 60) // 60 seconds

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
  }

  // Redirect to signed URL
  return NextResponse.redirect(data.signedUrl)
}
