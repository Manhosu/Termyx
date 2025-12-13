'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Bell, Shield, Loader2, Check, Camera } from 'lucide-react'

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  company_name: string | null
  cpf_cnpj: string | null
  avatar_url: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const supabase = createClient()

  const loadProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

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
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSave = async () => {
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

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificacoes', icon: Bell },
    { id: 'security', label: 'Seguranca', icon: Shield },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'profile' && profile && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile.name?.[0]?.toUpperCase() || profile.email[0]?.toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
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
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
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
                  <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
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
