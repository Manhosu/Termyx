'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FileText, Zap, Shield, CreditCard, ArrowRight, Sparkles, Users, TrendingUp, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import {
  MeshGradient,
  FloatingCard,
  GradientText,
  PremiumButton,
  FeatureIcon,
  StatCounter,
  TestimonialCard,
  PricingCard,
  FloatingBadge,
  AnimatedBorder,
} from '@/components/ui/premium-design'

const features = [
  {
    icon: FileText,
    title: 'Templates Profissionais',
    description: 'Biblioteca com contratos, recibos, orcamentos e mais. Todos juridicamente revisados por especialistas.',
    gradient: 'from-emerald-500 to-teal-500',
    delay: 0,
  },
  {
    icon: Zap,
    title: 'Geracao Instantanea',
    description: 'Preencha os dados e receba seu PDF profissional em segundos. Otimizado para produtividade maxima.',
    gradient: 'from-teal-500 to-cyan-500',
    delay: 0.1,
  },
  {
    icon: Shield,
    title: 'Seguranca Total',
    description: 'Seus documentos protegidos com criptografia de ponta a ponta. Conformidade total com LGPD.',
    gradient: 'from-emerald-500 to-teal-500',
    delay: 0.2,
  },
  {
    icon: CreditCard,
    title: 'Flexibilidade de Pagamento',
    description: 'Modelo pay-as-you-go. Sem mensalidades obrigatorias, compre creditos quando precisar.',
    gradient: 'from-orange-500 to-amber-500',
    delay: 0.3,
  },
]

const stats = [
  { value: '50K', suffix: '+', label: 'Documentos Gerados' },
  { value: '15K', suffix: '+', label: 'Usuarios Ativos' },
  { value: '99.9', suffix: '%', label: 'Uptime Garantido' },
  { value: '4.9', suffix: '', label: 'Avaliacao Media' },
]

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: '/mes',
    description: 'Perfeito para comecar',
    features: ['3 documentos/mes', 'Templates basicos', 'Suporte por email', 'Exportacao PDF'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    period: '/mes',
    description: 'Para profissionais',
    features: ['Documentos ilimitados', 'Todos os templates', 'Suporte prioritario', 'API de integracao', 'Marca d\'agua removida', 'Analytics avancado'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 199',
    period: '/mes',
    description: 'Para grandes equipes',
    features: ['Tudo do Pro', 'Usuarios ilimitados', 'Templates customizados', 'SSO/SAML', 'SLA garantido', 'Gerente de conta dedicado'],
    highlighted: false,
  },
]

const testimonials = [
  {
    quote: 'O Termyx revolucionou como geramos contratos. O que levava horas agora leva segundos. Economia incrivel de tempo.',
    author: 'Maria Silva',
    role: 'Advogada, Silva & Associados',
    rating: 5,
  },
  {
    quote: 'Interface intuitiva e documentos de alta qualidade. Meus clientes ficam impressionados com a rapidez na entrega.',
    author: 'Carlos Santos',
    role: 'Contador, CS Contabilidade',
    rating: 5,
  },
  {
    quote: 'A melhor plataforma de documentos que ja usei. Suporte excepcional e recursos que realmente fazem diferenca.',
    author: 'Ana Oliveira',
    role: 'Empreendedora',
    rating: 5,
  },
]

const navLinks = [
  { label: 'Recursos', href: '#recursos' },
  { label: 'Planos', href: '#planos' },
  { label: 'Depoimentos', href: '#depoimentos' },
]

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 overflow-x-hidden">
      {/* ============================================================ */}
      {/* HEADER / NAVIGATION */}
      {/* ============================================================ */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-white/20 dark:border-neutral-800/20 shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Image
                src="/logo.png"
                alt="Termyx"
                width={150}
                height={40}
                className="h-10 w-auto"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium transition-colors"
                whileHover={{ y: -2 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <motion.button
                className="px-5 py-2.5 text-neutral-700 dark:text-neutral-300 font-medium hover:text-neutral-900 dark:hover:text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Entrar
              </motion.button>
            </Link>
            <Link href="/signup">
              <motion.button
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Cadastrar
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2.5 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-white/30 dark:border-neutral-700/30"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            ) : (
              <Menu className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            )}
          </motion.button>
        </nav>

        {/* Mobile Menu */}
        <motion.div
          className={`md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-b border-white/20 dark:border-neutral-800/20 ${
            mobileMenuOpen ? 'block' : 'hidden'
          }`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: mobileMenuOpen ? 1 : 0, height: mobileMenuOpen ? 'auto' : 0 }}
        >
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block py-2 text-neutral-700 dark:text-neutral-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              <Link href="/login" className="block">
                <button className="w-full py-3 text-neutral-700 dark:text-neutral-300 font-medium border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                  Entrar
                </button>
              </Link>
              <Link href="/signup" className="block">
                <button className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl">
                  Cadastrar
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.header>
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Mesh gradient background */}
        <MeshGradient variant="hero" />

        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 text-center"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FloatingBadge className="mb-8">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Novo: Templates de contratos atualizados para 2025</span>
            </FloatingBadge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="text-neutral-900 dark:text-white">Documentos</span>
            <br />
            <GradientText variant="primary" animate>
              Profissionais
            </GradientText>
            <br />
            <span className="text-neutral-900 dark:text-white">em Segundos</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="max-w-2xl mx-auto text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Crie contratos, recibos e orcamentos com qualidade juridica.
            <br className="hidden sm:block" />
            Preencha, gere e envie — tudo em uma unica plataforma.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Link href="/signup">
              <PremiumButton variant="primary" size="xl" glow>
                Comecar Gratis
                <ArrowRight className="w-5 h-5" />
              </PremiumButton>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8 text-neutral-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">SSL Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              <span className="text-sm">+15.000 usuarios</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              <span className="text-sm">99.9% uptime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ opacity: { delay: 1.5 }, y: { duration: 2, repeat: Infinity } }}
        >
          <div className="w-8 h-12 rounded-full border-2 border-neutral-300 dark:border-neutral-700 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-3 bg-neutral-400 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* STATS SECTION */}
      {/* ============================================================ */}
      <section className="relative py-24 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <StatCounter {...stat} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================================ */}
      <section id="recursos" className="relative py-32 overflow-hidden">
        <MeshGradient variant="section" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              Por que escolher Termyx
            </motion.div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
              Recursos que fazem
              <br />
              <GradientText variant="primary">a diferenca</GradientText>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600 dark:text-neutral-400">
              Desenvolvido para profissionais que valorizam qualidade, velocidade e seguranca.
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
              >
                <FloatingCard className="p-8 h-full" glowColor={feature.gradient.includes('emerald') ? 'green' : feature.gradient.includes('teal') ? 'cyan' : feature.gradient.includes('orange') ? 'orange' : 'green'}>
                  <FeatureIcon icon={feature.icon} gradient={feature.gradient} className="mb-6" />
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </FloatingCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS SECTION */}
      {/* ============================================================ */}
      <section className="relative py-32 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
              Simples como
              <br />
              <GradientText variant="secondary">1, 2, 3</GradientText>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600 dark:text-neutral-400">
              Processo otimizado para maxima produtividade. Seu documento pronto em menos de um minuto.
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Escolha o Template', description: 'Navegue pela biblioteca e selecione o modelo ideal para sua necessidade.' },
              { step: '02', title: 'Preencha os Dados', description: 'Complete os campos do formulario inteligente. Preview em tempo real.' },
              { step: '03', title: 'Gere e Envie', description: 'Baixe o PDF profissional ou envie diretamente por email ou WhatsApp.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <AnimatedBorder>
                  <div className="p-8 text-center">
                    <div className="text-7xl font-bold bg-gradient-to-r from-emerald-600/20 to-teal-600/20 bg-clip-text text-transparent mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                </AnimatedBorder>

                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-neutral-300 dark:border-neutral-700" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIALS SECTION */}
      {/* ============================================================ */}
      <section id="depoimentos" className="relative py-32 overflow-hidden">
        <MeshGradient variant="section" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
              Amado por
              <br />
              <GradientText variant="accent">milhares</GradientText>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600 dark:text-neutral-400">
              Veja o que nossos clientes dizem sobre a experiencia com Termyx.
            </p>
          </motion.div>

          {/* Testimonials grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* PRICING SECTION */}
      {/* ============================================================ */}
      <section id="planos" className="relative py-32 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6">
              Planos para
              <br />
              <GradientText variant="primary">cada necessidade</GradientText>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-neutral-600 dark:text-neutral-400">
              Comece gratis e escale conforme seu negocio cresce. Sem surpresas.
            </p>
          </motion.div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <PricingCard {...plan} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA SECTION */}
      {/* ============================================================ */}
      <section className="relative py-32 overflow-hidden">
        <MeshGradient variant="hero" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-8">
              Pronto para
              <br />
              <GradientText variant="primary" animate>
                transformar seu trabalho?
              </GradientText>
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que ja economizam horas por semana com o Termyx.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <PremiumButton variant="primary" size="xl" glow>
                  Criar Conta Gratis
                  <ArrowRight className="w-5 h-5" />
                </PremiumButton>
              </Link>
              <Link href="/login">
                <PremiumButton variant="ghost" size="xl">
                  Ja tenho conta
                </PremiumButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="relative py-16 bg-neutral-900 dark:bg-black border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="mb-6">
                <Image
                  src="/logo.png"
                  alt="Termyx"
                  width={150}
                  height={40}
                  className="h-10 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-neutral-400 max-w-sm mb-6">
                A plataforma mais avancada para geracao de documentos profissionais. Simples, rapido e seguro.
              </p>
              <div className="flex gap-4">
                {['twitter', 'linkedin', 'instagram'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-neutral-400 text-sm capitalize">{social[0].toUpperCase()}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-3">
                {['Templates', 'Precos', 'API', 'Integrações'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Termos de Uso', href: '/terms' },
                  { label: 'Privacidade', href: '/privacy' },
                  { label: 'LGPD', href: '/privacy' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-neutral-400 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-sm">
              © 2025 Termyx. Todos os direitos reservados.
            </p>
            <p className="text-neutral-500 text-sm flex items-center gap-2">
              Feito com <span className="text-red-500">❤</span> no Brasil
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
