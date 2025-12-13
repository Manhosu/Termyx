'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Bell, Search, Menu } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile } = useUser()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const initialTheme = stored || (systemDark ? 'dark' : 'light')
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  if (!mounted) return null

  return (
    <header className="h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50 sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4 lg:mx-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="search"
            placeholder="Buscar documentos..."
            aria-label="Buscar documentos"
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-neutral-900 placeholder:text-neutral-400 text-sm transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Credits */}
        {profile && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <span className="text-xs text-neutral-500">Creditos:</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
              {profile.credits}
            </span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-neutral-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          aria-label="Notificacoes"
          className="relative p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-neutral-700">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {profile?.name || 'Usuario'}
            </p>
            <p className="text-xs text-neutral-500">
              {profile?.plan?.name || 'Free'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold">
              {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
