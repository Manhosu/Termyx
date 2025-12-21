'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Bell, Shield, Loader2, Check, Camera, Building2, MapPin, Phone, Globe } from 'lucide-react'

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  company_name: string | null
  cpf_cnpj: string | null
  avatar_url: string | null
}

interface CompanyProfile {
  id?: string
  user_id: string
  name: string
  legal_name: string | null
  document_number: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  logo_url: string | null
  website: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const supabase = createClient()

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load user profile
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile({
        ...data,
        email: user.email || ''
      })
    }

    // Load company profile
    const { data: company } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (company) {
      setCompanyProfile(company)
    } else {
      // Initialize empty company profile
      setCompanyProfile({
        user_id: user.id,
        name: '',
        legal_name: null,
        document_number: null,
        email: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip_code: null,
        logo_url: null,
        website: null,
      })
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)

    const { error } = await supabase
      .from('users')
      .update({
        name: profile.name,
        phone: profile.phone,
        company_name: profile.company_name,
        cpf_cnpj: profile.cpf_cnpj,
      })
      .eq('id', profile.id)

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleSaveCompany = async () => {
    if (!companyProfile) return
    setSaving(true)

    if (companyProfile.id) {
      // Update existing
      const { error } = await supabase
        .from('company_profiles')
        .update({
          name: companyProfile.name,
          legal_name: companyProfile.legal_name,
          document_number: companyProfile.document_number,
          email: companyProfile.email,
          phone: companyProfile.phone,
          address: companyProfile.address,
          city: companyProfile.city,
          state: companyProfile.state,
          zip_code: companyProfile.zip_code,
          website: companyProfile.website,
        })
        .eq('id', companyProfile.id)

      setSaving(false)
      if (!error) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('company_profiles')
        .insert({
          user_id: companyProfile.user_id,
          name: companyProfile.name,
          legal_name: companyProfile.legal_name,
          document_number: companyProfile.document_number,
          email: companyProfile.email,
          phone: companyProfile.phone,
          address: companyProfile.address,
          city: companyProfile.city,
          state: companyProfile.state,
          zip_code: companyProfile.zip_code,
          website: companyProfile.website,
        })
        .select()
        .single()

      setSaving(false)
      if (!error && data) {
        setCompanyProfile(data)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    }
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'notifications', label: 'Notificacoes', icon: Bell },
    { id: 'security', label: 'Seguranca', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Configuracoes
        </h1>
        <p className="text-neutral-500 mt-1">
          Gerencie suas preferencias e informacoes pessoais
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && profile && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile.name?.[0]?.toUpperCase() || profile.email[0]?.toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Foto de Perfil
              </h3>
              <p className="text-sm text-neutral-500">
                JPG, PNG ou GIF. Max 2MB.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                O email nao pode ser alterado
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Empresa
              </label>
              <input
                type="text"
                value={profile.company_name || ''}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nome da empresa"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                CPF/CNPJ
              </label>
              <input
                type="text"
                value={profile.cpf_cnpj || ''}
                onChange={(e) => setProfile({ ...profile, cpf_cnpj: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : null}
              {saved ? 'Salvo!' : 'Salvar alteracoes'}
            </button>
          </div>
        </div>
      )}

      {/* Company Tab */}
      {activeTab === 'company' && companyProfile && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Dados da Empresa
              </h3>
              <p className="text-sm text-neutral-500">
                Essas informacoes serao usadas nos seus documentos
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nome Fantasia *
              </label>
              <input
                type="text"
                value={companyProfile.name || ''}
                onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nome da sua empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Razao Social
              </label>
              <input
                type="text"
                value={companyProfile.legal_name || ''}
                onChange={(e) => setCompanyProfile({ ...companyProfile, legal_name: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Razao social completa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                CNPJ/CPF
              </label>
              <input
                type="text"
                value={companyProfile.document_number || ''}
                onChange={(e) => setCompanyProfile({ ...companyProfile, document_number: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email Comercial
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={companyProfile.email || ''}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Telefone Comercial
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="tel"
                  value={companyProfile.phone || ''}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="(00) 0000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="url"
                  value={companyProfile.website || ''}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://www.empresa.com"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Endereco
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={companyProfile.address || ''}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Rua, numero, complemento"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Cidade
              </label>
              <input
                type="text"
                value={companyProfile.city || ''}
                onChange={(e) => setCompanyProfile({ ...companyProfile, city: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Cidade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Estado
              </label>
              <select
                value={companyProfile.state || ''}
                onChange={(e) => setCompanyProfile({ ...companyProfile, state: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Selecione</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapa</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceara</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espirito Santo</option>
                <option value="GO">Goias</option>
                <option value="MA">Maranhao</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Para</option>
                <option value="PB">Paraiba</option>
                <option value="PR">Parana</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piaui</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondonia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">Sao Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                CEP
              </label>
              <input
                type="text"
                value={companyProfile.zip_code || ''}
                onChange={(e) => setCompanyProfile({ ...companyProfile, zip_code: e.target.value })}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="00000-000"
              />
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-700 dark:text-emerald-400">
              <strong>Dica:</strong> Preencha os dados da empresa para que eles sejam automaticamente preenchidos nos seus documentos.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleSaveCompany}
              disabled={saving || !companyProfile.name}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : null}
              {saved ? 'Salvo!' : 'Salvar dados da empresa'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Preferencias de Notificacao
          </h3>

          <div className="space-y-4">
            {[
              { id: 'email_marketing', label: 'Emails promocionais', desc: 'Receba novidades e ofertas especiais' },
              { id: 'email_updates', label: 'Atualizacoes do produto', desc: 'Seja notificado sobre novas funcionalidades' },
              { id: 'email_documents', label: 'Documentos', desc: 'Notificacoes sobre seus documentos gerados' },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">{item.label}</p>
                  <p className="text-sm text-neutral-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Seguranca da Conta
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Alterar senha</p>
                  <p className="text-sm text-neutral-500">Atualize sua senha periodicamente</p>
                </div>
                <button className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                  Alterar
                </button>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">Autenticacao em duas etapas</p>
                  <p className="text-sm text-neutral-500">Adicione uma camada extra de seguranca</p>
                </div>
                <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                  Em breve
                </span>
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">Excluir conta</p>
                  <p className="text-sm text-red-600/70 dark:text-red-400/70">Esta acao e irreversivel</p>
                </div>
                <button className="px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
