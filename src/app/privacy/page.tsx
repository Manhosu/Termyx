import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politica de Privacidade',
  description: 'Politica de privacidade da plataforma Termyx. Saiba como protegemos seus dados.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">Termyx</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Politica de Privacidade</h1>
            <p className="text-neutral-500">Ultima atualizacao: Dezembro 2025</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">1. Introducao</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              A Termyx valoriza sua privacidade. Esta politica descreve como coletamos, usamos, armazenamos
              e protegemos suas informacoes pessoais quando voce utiliza nossa plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">2. Dados que Coletamos</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Coletamos os seguintes tipos de informacoes:
            </p>
            <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Dados de Cadastro</h3>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li>Nome completo</li>
              <li>Endereco de email</li>
              <li>Telefone (opcional)</li>
              <li>CPF/CNPJ (opcional)</li>
            </ul>
            <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Dados de Uso</h3>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li>Documentos criados e seus conteudos</li>
              <li>Historico de atividades na plataforma</li>
              <li>Informacoes de pagamento (processadas por terceiros)</li>
            </ul>
            <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Dados Tecnicos</h3>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li>Endereco IP</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Cookies e tecnologias similares</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">3. Como Usamos seus Dados</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Utilizamos suas informacoes para:
            </p>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li>Fornecer e manter nossos servicos</li>
              <li>Processar transacoes e pagamentos</li>
              <li>Enviar comunicacoes importantes sobre sua conta</li>
              <li>Melhorar e personalizar sua experiencia</li>
              <li>Detectar e prevenir fraudes</li>
              <li>Cumprir obrigacoes legais</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">4. Compartilhamento de Dados</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Nao vendemos suas informacoes pessoais. Podemos compartilhar dados com:
            </p>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li>Provedores de servicos (processamento de pagamentos, hospedagem)</li>
              <li>Autoridades legais quando exigido por lei</li>
              <li>Parceiros de negocios com seu consentimento explicito</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">5. Seguranca dos Dados</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Implementamos medidas de seguranca robustas para proteger suas informacoes:
            </p>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li>Criptografia de dados em transito (HTTPS/TLS)</li>
              <li>Criptografia de dados em repouso</li>
              <li>Controle de acesso baseado em funcoes</li>
              <li>Monitoramento continuo de seguranca</li>
              <li>Backups regulares e redundancia de dados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">6. Seus Direitos (LGPD)</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              De acordo com a Lei Geral de Protecao de Dados (LGPD), voce tem direito a:
            </p>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou imprecisos</li>
              <li>Solicitar a exclusao de seus dados</li>
              <li>Revogar consentimentos</li>
              <li>Solicitar portabilidade dos dados</li>
              <li>Ser informado sobre o compartilhamento de dados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">7. Cookies</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Utilizamos cookies para melhorar sua experiencia. Voce pode controlar o uso de cookies
              atraves das configuracoes do seu navegador. Os tipos de cookies que usamos incluem:
            </p>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li><strong>Essenciais:</strong> necessarios para o funcionamento do site</li>
              <li><strong>Funcionais:</strong> lembram suas preferencias</li>
              <li><strong>Analiticos:</strong> nos ajudam a entender como voce usa o site</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">8. Retencao de Dados</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Mantemos seus dados pelo tempo necessario para fornecer nossos servicos ou conforme
              exigido por lei. Apos o encerramento da conta, seus dados serao excluidos em ate 90 dias,
              exceto quando houver obrigacao legal de retencao.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">9. Alteracoes nesta Politica</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Podemos atualizar esta politica periodicamente. Notificaremos sobre alteracoes
              significativas por email ou atraves de aviso em nossa plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">10. Contato</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Para exercer seus direitos ou tirar duvidas sobre privacidade:
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              Email: <a href="mailto:privacidade@termyx.com.br" className="text-emerald-600 hover:underline">privacidade@termyx.com.br</a>
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Encarregado de Dados (DPO): <a href="mailto:dpo@termyx.com.br" className="text-emerald-600 hover:underline">dpo@termyx.com.br</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/terms" className="text-emerald-600 hover:underline">
              Ver Termos de Uso
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Voltar para o inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
