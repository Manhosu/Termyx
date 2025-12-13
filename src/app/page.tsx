import Link from 'next/link'
import { FileText, Zap, Shield, CreditCard, ArrowRight, Check, Star } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Templates Profissionais',
    description: 'Contratos, recibos, orcamentos e mais. Todos revisados por especialistas.'
  },
  {
    icon: Zap,
    title: 'Geracao Instantanea',
    description: 'Preencha os dados e receba seu PDF em segundos. Simples assim.'
  },
  {
    icon: Shield,
    title: 'Dados Seguros',
    description: 'Seus documentos ficam armazenados com criptografia de ponta a ponta.'
  },
  {
    icon: CreditCard,
    title: 'Pague por Uso',
    description: 'Sem mensalidades obrigatorias. Compre creditos quando precisar.'
  },
]

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: '/mes',
    description: 'Para comecar',
    features: ['3 documentos/mes', 'Templates basicos', 'Suporte por email'],
    cta: 'Comecar gratis',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'R$ 29',
    period: '/mes',
    description: 'Para profissionais',
    features: ['50 documentos/mes', 'Todos os templates', 'Envio por email/WhatsApp', 'Suporte prioritario'],
    cta: 'Assinar Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 99',
    period: '/mes',
    description: 'Para empresas',
    features: ['Documentos ilimitados', 'Templates personalizados', 'API de integracao', 'Suporte dedicado'],
    cta: 'Falar com vendas',
    popular: false,
  },
]

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Advogada',
    content: 'O Termyx me economiza horas toda semana. Gero contratos em minutos que antes levavam horas para formatar.',
    avatar: 'MS',
  },
  {
    name: 'Carlos Santos',
    role: 'Contador',
    content: 'Meus clientes ficam impressionados com a qualidade dos documentos. Interface muito facil de usar.',
    avatar: 'CS',
  },
  {
    name: 'Ana Costa',
    role: 'Autonoma',
    content: 'Finalmente um sistema que funciona! Envio orcamentos profissionais em segundos pelo WhatsApp.',
    avatar: 'AC',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">Termyx</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                Recursos
              </a>
              <a href="#pricing" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                Precos
              </a>
              <a href="#testimonials" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors">
                Depoimentos
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4" />
            Mais de 10.000 documentos gerados
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            Crie documentos profissionais
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              em minutos, nao horas
            </span>
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-10">
            Contratos, recibos, orcamentos e mais. Preencha um formulario simples e receba seu PDF pronto para uso. Sem complicacao.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-xl transition-colors"
            >
              Comecar gratuitamente
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-lg font-medium rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              Ver como funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Tudo que voce precisa para gerar documentos
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Uma plataforma completa para criar, gerenciar e enviar documentos profissionais
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Planos para todos os tamanhos
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Comece gratis e faca upgrade quando precisar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-medium rounded-full">
                    Mais popular
                  </div>
                )}
                <h3 className={`text-lg font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-blue-100' : 'text-neutral-500'}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? 'text-blue-100' : 'text-neutral-500'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-blue-50' : 'text-neutral-600 dark:text-neutral-400'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full py-3 text-center font-medium rounded-xl transition-colors ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Milhares de profissionais ja confiam no Termyx
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700"
              >
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Pronto para comecar?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Crie sua conta gratuitamente e gere seu primeiro documento em minutos
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-xl transition-colors"
          >
            Criar conta gratuita
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-white">Termyx</span>
            </div>
            <nav className="flex items-center gap-6 text-sm text-neutral-500">
              <Link href="/terms" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Termos</Link>
              <Link href="/privacy" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Privacidade</Link>
              <Link href="/help" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Ajuda</Link>
            </nav>
            <p className="text-sm text-neutral-500">
              2025 Termyx. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
