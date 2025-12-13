export interface Plan {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_annual: number
  credits_included: number
  max_templates: number
  features: string[]
  is_active: boolean
  gateway_price_id: string | null
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string | null
  company_name: string | null
  company_logo: string | null
  role: 'user' | 'admin' | 'enterprise'
  plan_id: string | null
  credits: number
  is_active: boolean
  onboarding_completed: boolean
  business_category: string | null
  stripe_customer_id: string | null
  subscription_id: string | null
  subscription_status: string | null
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
  plan?: Plan
}

export type PlaceholderType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'cpf_cnpj'
  | 'phone'
  | 'email'

export interface Placeholder {
  name: string
  label: string
  type: PlaceholderType
  required: boolean
  options?: string[]
  defaultValue?: string
}

export interface Template {
  id: string
  owner_id: string | null
  name: string
  category: 'contrato' | 'recibo' | 'orcamento' | 'termo' | 'outro'
  description: string | null
  content_html: string
  placeholders: Placeholder[]
  is_public: boolean
  price_credit: number
  version: number
  created_at: string
  updated_at: string
}

export type DocumentStatus = 'draft' | 'generated' | 'sent' | 'archived'

export interface Document {
  id: string
  user_id: string
  template_id: string | null
  title: string
  data: Record<string, unknown>
  pdf_path: string | null
  status: DocumentStatus
  credits_charged: number
  created_at: string
  updated_at: string
  generated_at: string | null
  template?: Template
}

export type PaymentType = 'subscription' | 'credits' | 'one_time'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Payment {
  id: string
  user_id: string
  amount: number
  currency: string
  gateway: string
  gateway_id: string | null
  type: PaymentType
  status: PaymentStatus
  metadata: Record<string, unknown>
  created_at: string
}

export interface DocumentSend {
  id: string
  document_id: string
  user_id: string
  channel: 'email' | 'whatsapp'
  recipient: string
  status: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface DocumentShare {
  id: string
  document_id: string
  user_id: string
  token: string
  expires_at: string
  views: number
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  payload: Record<string, unknown>
  ip_address: string | null
  created_at: string
}
