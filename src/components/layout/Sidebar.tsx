'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
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
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-r border-neutral-200/50 dark:border-neutral-800/50 z-40 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-neutral-900 dark:text-white">
            Termyx
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={pathname === item.href || (pathname?.startsWith(item.href + '/') ?? false)}
          />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50 space-y-1">
        {bottomItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={pathname === item.href}
          />
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          aria-label="Sair da conta"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
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
      <div
        className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:translate-x-1 active:scale-[0.98] ${
          isActive
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  )
}
