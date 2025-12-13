import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: 'up' | 'down' | 'unknown'
    storage: 'up' | 'down' | 'unknown'
    stripe: 'configured' | 'not_configured'
    email: 'configured' | 'not_configured'
  }
  uptime: number
}

const startTime = Date.now()

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      storage: 'unknown',
      stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
      email: process.env.SENDGRID_API_KEY ? 'configured' : 'not_configured',
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  }

  // Check database connection
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const { error: dbError } = await supabase
        .from('plans')
        .select('id')
        .limit(1)

      health.services.database = dbError ? 'down' : 'up'

      // Check storage
      const { error: storageError } = await supabase.storage.listBuckets()
      health.services.storage = storageError ? 'down' : 'up'
    }
  } catch {
    health.services.database = 'down'
    health.services.storage = 'down'
  }

  // Determine overall status
  if (health.services.database === 'down') {
    health.status = 'unhealthy'
  } else if (
    health.services.stripe === 'not_configured' ||
    health.services.email === 'not_configured'
  ) {
    health.status = 'degraded'
  }

  const statusCode = health.status === 'unhealthy' ? 503 : 200

  return NextResponse.json(health, { status: statusCode })
}
