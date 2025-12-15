'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/documents', label: 'Documentos', icon: FolderOpen },
  { href: '/billing', label: 'Plano', icon: CreditCard },
]

const bottomItems = [
  { href: '/settings', label: 'Configuracoes', icon: Settings },
  { href: '/help', label: 'Ajuda', icon: HelpCircle },
]

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full w-64 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-2xl border-r border-white/40 dark:border-neutral-800/40 z-40 flex flex-col shadow-xl shadow-black/5"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      {/* Logo */}
      <motion.div
        className="h-16 flex items-center px-6 border-b border-white/30 dark:border-neutral-800/30"
        variants={itemVariants}
      >
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-white font-bold text-xl">T</span>
          </motion.div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Termyx
            </span>
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <Sparkles className="w-3 h-3" />
              <span>Pro</span>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item, index) => (
          <motion.div key={item.href} variants={itemVariants} custom={index}>
            <NavItem
              {...item}
              isActive={pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false)}
            />
          </motion.div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-white/30 dark:border-neutral-800/30 space-y-1.5">
        {bottomItems.map((item, index) => (
          <motion.div key={item.href} variants={itemVariants} custom={index}>
            <NavItem {...item} isActive={pathname === item.href} />
          </motion.div>
        ))}

        {/* Logout */}
        <motion.button
          onClick={handleLogout}
          aria-label="Sair da conta"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-neutral-500 hover:text-red-600 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-all duration-200 group"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:rotate-12" aria-hidden="true" />
          <span className="font-medium">Sair</span>
        </motion.button>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-r-3xl" />
    </motion.aside>
  )
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}

function NavItem({ href, label, icon: Icon, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <motion.div
        className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 overflow-hidden ${
          isActive
            ? 'text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/40 shadow-lg shadow-blue-500/10'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800/60'
        }`}
        whileHover={{ x: 4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Active Indicator */}
        {isActive && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full"
            layoutId="activeIndicator"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        {/* Icon with glow effect when active */}
        <div className="relative">
          <Icon className="w-5 h-5 relative z-10" />
          {isActive && (
            <div className="absolute inset-0 bg-blue-500/30 blur-lg" />
          )}
        </div>

        <span className="font-medium">{label}</span>

        {/* Hover shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0"
          whileHover={{ opacity: 1, x: ['-100%', '100%'] }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>
    </Link>
  )
}
