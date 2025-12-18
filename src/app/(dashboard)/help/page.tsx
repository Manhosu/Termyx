'use client'

import { useState } from 'react'
import { HelpCircle, MessageCircle, Mail, FileText, ChevronDown, ChevronUp, ExternalLink, Search } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    category: 'Geral',
    questions: [
      {
        q: 'O que e o Termyx?',
        a: 'O Termyx e uma plataforma SaaS para geracao de documentos profissionais como contratos, recibos, orcamentos e termos. Voce preenche um formulario simples e recebe um PDF pronto para uso.'
      },
      {
        q: 'Preciso instalar algum software?',
        a: 'Nao! O Termyx funciona 100% no navegador. Basta acessar o site, fazer login e comecar a criar seus documentos.'
      },
      {
        q: 'Meus documentos ficam salvos?',
        a: 'Sim, todos os documentos gerados ficam salvos na sua conta por tempo indeterminado. Voce pode acessar, baixar ou reenviar a qualquer momento.'
      },
    ]
  },
  {
    category: 'Creditos e Planos',
    questions: [
      {
        q: 'Como funciona o sistema de creditos?',
        a: 'Cada documento gerado consome um numero de creditos baseado na complexidade do template. Templates simples consomem 1 credito, enquanto templates mais complexos podem consumir 2 ou mais.'
      },
      {
        q: 'O que acontece quando meus creditos acabam?',
        a: 'Voce pode comprar mais creditos avulsos ou fazer upgrade do seu plano para receber mais creditos mensais.'
      },
      {
        q: 'Posso cancelar minha assinatura?',
        a: 'Sim, voce pode cancelar a qualquer momento. Seus creditos restantes continuam validos ate o final do periodo pago.'
      },
    ]
  },
  {
    category: 'Documentos',
    questions: [
      {
        q: 'Posso editar um documento depois de gerado?',
        a: 'Os documentos PDF gerados nao podem ser editados. Porem, voce pode criar um novo documento baseado nos mesmos dados e fazer as alteracoes necessarias.'
      },
      {
        q: 'Como envio um documento por WhatsApp?',
        a: 'Na pagina do documento, clique no botao "Enviar por WhatsApp". Voce sera redirecionado para o WhatsApp Web com o link do documento pronto para enviar.'
      },
      {
        q: 'Os links de compartilhamento expiram?',
        a: 'Sim, os links publicos de compartilhamento expiram apos 7 dias por seguranca. Voce pode gerar um novo link a qualquer momento.'
      },
    ]
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Central de Ajuda
        </h1>
        <p className="text-neutral-500 mt-2">
          Encontre respostas para suas duvidas ou entre em contato conosco
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar na ajuda..."
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="mailto:suporte@termyx.com.br"
          className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-emerald-500 transition-colors"
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">Email</p>
            <p className="text-sm text-neutral-500">suporte@termyx.com.br</p>
          </div>
        </a>

        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-green-500 transition-colors"
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">WhatsApp</p>
            <p className="text-sm text-neutral-500">Atendimento rapido</p>
          </div>
        </a>

        <Link
          href="/documents"
          className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-teal-500 transition-colors"
        >
          <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-900 dark:text-white">Documentacao</p>
            <p className="text-sm text-neutral-500">Guias e tutoriais</p>
          </div>
        </Link>
      </div>

      {/* FAQs */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Perguntas Frequentes
        </h2>

        {filteredFaqs.map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">
              {category.category}
            </h3>
            <div className="space-y-2">
              {category.questions.map((item, idx) => {
                const key = `${category.category}-${idx}`
                const isOpen = openItems[key]

                return (
                  <div
                    key={key}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4">
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {item.a}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-500">
              Nenhum resultado encontrado para &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-center text-white">
        <h3 className="text-xl font-bold mb-2">
          Ainda precisa de ajuda?
        </h3>
        <p className="text-emerald-100 mb-6">
          Nossa equipe esta pronta para ajudar voce
        </p>
        <a
          href="mailto:suporte@termyx.com.br"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-600 font-medium rounded-xl hover:bg-emerald-50 transition-colors"
        >
          <Mail className="w-5 h-5" />
          Entrar em contato
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
