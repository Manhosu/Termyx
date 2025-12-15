'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Bell, Search, Menu, Coins, X } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile } = useUser()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')

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

    // Add transition class for smooth theme change
    document.documentElement.classList.add('theme-transition')
    document.documentElement.classList.toggle('dark', newTheme === 'dark')

    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 300)
  }

  if (!mounted) return null

  return (
    <motion.header
      className="h-16 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl border-b border-white/40 dark:border-neutral-800/40 sticky top-0 z-30 px-6 flex items-center justify-between shadow-sm"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mobile Menu Button */}
      <motion.button
        onClick={onMenuClick}
        aria-label="Abrir menu"
        className="lg:hidden p-2.5 rounded-2xl bg-white/60 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 border border-white/50 dark:border-neutral-700/50 shadow-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
      </motion.button>

      {/* Search */}
      <motion.div
        className="flex-1 max-w-md mx-4 lg:mx-0"
        animate={{ scale: searchFocused ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused ? 'text-blue-500' : 'text-neutral-400'}`} />
          <input
            type="search"
            placeholder="Buscar documentos..."
            aria-label="Buscar documentos"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-11 pr-10 py-2.5 bg-white/60 dark:bg-neutral-800/60 border border-white/50 dark:border-neutral-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white dark:focus:bg-neutral-800 placeholder:text-neutral-400 text-sm transition-all shadow-sm backdrop-blur-sm"
          />
          <AnimatePresence>
            {searchValue && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Credits */}
        {profile && (
          <motion.div
            className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/50 dark:border-amber-700/30 rounded-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {profile.credits}
            </span>
          </motion.div>
        )}

        {/* Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          className="p-2.5 rounded-2xl bg-white/60 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 border border-white/50 dark:border-neutral-700/50 shadow-sm transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, rotate: 15 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Notifications */}
        <motion.button
          aria-label="Notificacoes"
          className="relative p-2.5 rounded-2xl bg-white/60 dark:bg-neutral-800/60 hover:bg-white dark:hover:bg-neutral-800 border border-white/50 dark:border-neutral-700/50 shadow-sm transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <motion.span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-neutral-800"
            aria-hidden="true"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>

        {/* User Avatar */}
        <motion.div
          className="flex items-center gap-3 pl-3 ml-1 border-l border-neutral-200/50 dark:border-neutral-700/50"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {profile?.name || 'Usuario'}
            </p>
            <p className="text-xs text-neutral-500">
              {profile?.plan?.name || 'Free'}
            </p>
          </div>
          <motion.div
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white font-semibold">
              {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  )
}
