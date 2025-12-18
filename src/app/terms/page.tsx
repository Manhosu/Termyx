import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos de uso da plataforma Termyx para geracao de documentos profissionais.',
}

export default function TermsPage() {
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
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Termos de Uso</h1>
            <p className="text-neutral-500">Ultima atualizacao: Dezembro 2025</p>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">1. Aceitacao dos Termos</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Ao acessar e usar a plataforma Termyx, voce concorda em cumprir e estar vinculado a estes Termos de Uso.
              Se voce nao concordar com qualquer parte destes termos, nao devera usar nossos servicos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">2. Descricao do Servico</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              O Termyx e uma plataforma de geracao de documentos profissionais que permite aos usuarios criar
              contratos, recibos, orcamentos e outros documentos comerciais de forma rapida e eficiente.
            </p>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Nossos servicos incluem:
            </p>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li>Templates de documentos pre-formatados</li>
              <li>Geracao de PDF</li>
              <li>Armazenamento seguro de documentos</li>
              <li>Compartilhamento via email e WhatsApp</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">3. Cadastro e Conta</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Para utilizar nossos servicos, voce devera criar uma conta fornecendo informacoes verdadeiras e completas.
              Voce e responsavel por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">4. Uso Aceitavel</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Voce concorda em usar o Termyx apenas para fins legais e de acordo com estes termos. Voce nao deve:
            </p>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
              <li>Criar documentos fraudulentos ou enganosos</li>
              <li>Violar direitos de propriedade intelectual</li>
              <li>Transmitir virus ou codigo malicioso</li>
              <li>Tentar acessar contas de outros usuarios</li>
              <li>Usar o servico para atividades ilegais</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">5. Pagamentos e Assinaturas</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Alguns recursos do Termyx requerem pagamento. Os precos estao sujeitos a alteracoes com aviso previo.
              Assinaturas sao renovadas automaticamente ate que sejam canceladas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">6. Propriedade Intelectual</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              O Termyx e seu conteudo original, recursos e funcionalidades sao e permanecerao propriedade exclusiva
              da Termyx e seus licenciadores. Os documentos criados por voce permanecem sua propriedade.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">7. Limitacao de Responsabilidade</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              O Termyx nao sera responsavel por quaisquer danos indiretos, incidentais, especiais, consequenciais
              ou punitivos resultantes do uso ou incapacidade de uso do servico.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">8. Alteracoes nos Termos</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alteracoes significativas
              serao notificadas por email ou atraves da plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">9. Contato</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Para duvidas sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              Email: <a href="mailto:suporte@termyx.com.br" className="text-emerald-600 hover:underline">suporte@termyx.com.br</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/privacy" className="text-emerald-600 hover:underline">
              Ver Politica de Privacidade
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
