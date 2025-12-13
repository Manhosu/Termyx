import { createClient } from '@/lib/supabase/server'
import { Settings, Save, AlertCircle } from 'lucide-react'

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // Fetch plans for pricing config
  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .order('price_monthly', { ascending: true })

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Configuracoes
        </h1>
        <p className="text-neutral-500 mt-1">
          Configure as opcoes gerais da plataforma
        </p>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuracoes Gerais
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nome da Plataforma
            </label>
            <input
              type="text"
              defaultValue="Termyx"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Email de Suporte
            </label>
            <input
              type="email"
              defaultValue="suporte@termyx.com"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Creditos Iniciais para Novos Usuarios
            </label>
            <input
              type="number"
              defaultValue={3}
              min={0}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Plans Configuration */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
          Configuracao de Planos
        </h2>

        <div className="space-y-4">
          {plans?.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
            >
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-sm text-neutral-500">
                  {plan.credits_included} creditos inclusos
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Mensal</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    R$ {plan.price_monthly?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-500">Anual</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    R$ {plan.price_annual?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <button className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
          Configuracao de Email
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Email Remetente
            </label>
            <input
              type="email"
              placeholder="noreply@seudominio.com"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nome Remetente
            </label>
            <input
              type="text"
              placeholder="Termyx"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              A configuracao do SendGrid e feita atraves de variaveis de ambiente no servidor.
              Configure SENDGRID_API_KEY, SENDGRID_FROM_EMAIL e SENDGRID_FROM_NAME no seu arquivo .env.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900 p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-6">
          Zona de Perigo
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-white">
                Modo Manutencao
              </h3>
              <p className="text-sm text-neutral-500">
                Bloqueia acesso de usuarios durante manutencao
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-white">
                Limpar Cache
              </h3>
              <p className="text-sm text-neutral-500">
                Remove dados em cache da plataforma
              </p>
            </div>
            <button className="px-4 py-2 text-sm text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
          <Save className="w-5 h-5" />
          Salvar Alteracoes
        </button>
      </div>
    </div>
  )
}
