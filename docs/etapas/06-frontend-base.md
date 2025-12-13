# Etapa 6: Frontend Base

## Objetivo
Criar a estrutura base do frontend com layout, sistema de temas (Dark/Light), componentes UI reutilizaveis e navegacao.

---

## Checklist

### 6.1 Layout Principal
- [ ] Layout wrapper (`/app/(dashboard)/layout.tsx`)
- [ ] Sidebar com navegacao
- [ ] Header fixo
- [ ] Area de conteudo principal
- [ ] Footer (opcional)

### 6.2 Sistema de Temas
- [ ] Provider de tema (`ThemeProvider`)
- [ ] Hook `useTheme()`
- [ ] Variaveis CSS para cada tema
- [ ] Toggle Dark/Light
- [ ] Persistir preferencia (localStorage)
- [ ] Respeitar preferencia do sistema

### 6.3 Sidebar Liquid Glass
- [ ] Componente `Sidebar`
- [ ] Efeito translucido (blur, glassmorphism)
- [ ] Animacao suave ao selecionar item
- [ ] Items de navegacao:
  - Dashboard
  - Templates
  - Meus Documentos
  - Configuracoes
  - Ajuda
- [ ] Collapse para mobile

### 6.4 Header
- [ ] Logo/Nome do produto
- [ ] Barra de busca
- [ ] Toggle de tema
- [ ] Avatar do usuario
- [ ] Menu dropdown do usuario
- [ ] Notificacoes (badge)

### 6.5 Componentes UI Base
- [ ] Button (variantes: primary, secondary, ghost, danger)
- [ ] Input (com label flutuante)
- [ ] Select
- [ ] Textarea
- [ ] Card
- [ ] Modal
- [ ] Toast/Notification
- [ ] Badge
- [ ] Dropdown
- [ ] Table
- [ ] Pagination
- [ ] Loading/Spinner
- [ ] Skeleton
- [ ] Tooltip

### 6.6 Animacoes
- [ ] Page transitions (fade + slide)
- [ ] Modal (elastic pop)
- [ ] Hover states
- [ ] Ripple effect em botoes
- [ ] Loading states

### 6.7 Responsividade
- [ ] Mobile first approach
- [ ] Breakpoints definidos
- [ ] Sidebar colapsavel
- [ ] Menu hamburger
- [ ] Touch-friendly

---

## Implementacao

### Theme Provider
```typescript
// /lib/providers/theme-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) setTheme(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement

    const updateTheme = () => {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      const resolved = theme === 'system' ? systemTheme : theme
      setResolvedTheme(resolved)

      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }

    updateTheme()
    localStorage.setItem('theme', theme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateTheme)

    return () => mediaQuery.removeEventListener('change', updateTheme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

### Variaveis CSS de Tema
```css
/* /styles/themes.css */

:root {
  /* Light Theme */
  --background: 250 250 250;
  --foreground: 23 23 23;
  --card: 255 255 255;
  --card-foreground: 23 23 23;
  --primary: 59 130 246;
  --primary-foreground: 255 255 255;
  --secondary: 241 245 249;
  --secondary-foreground: 51 65 85;
  --muted: 241 245 249;
  --muted-foreground: 100 116 139;
  --accent: 241 245 249;
  --accent-foreground: 51 65 85;
  --destructive: 239 68 68;
  --destructive-foreground: 255 255 255;
  --border: 226 232 240;
  --input: 226 232 240;
  --ring: 59 130 246;
  --radius: 0.75rem;

  /* Shadows Light */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.dark {
  --background: 10 10 10;
  --foreground: 250 250 250;
  --card: 23 23 23;
  --card-foreground: 250 250 250;
  --primary: 96 165 250;
  --primary-foreground: 23 23 23;
  --secondary: 38 38 38;
  --secondary-foreground: 250 250 250;
  --muted: 38 38 38;
  --muted-foreground: 163 163 163;
  --accent: 38 38 38;
  --accent-foreground: 250 250 250;
  --destructive: 239 68 68;
  --destructive-foreground: 250 250 250;
  --border: 38 38 38;
  --input: 38 38 38;
  --ring: 96 165 250;

  /* Shadows Dark */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4);
}
```

### Sidebar Liquid Glass
```typescript
// /components/layout/Sidebar.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  HelpCircle
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/documents', label: 'Documentos', icon: FolderOpen },
  { href: '/settings', label: 'Configuracoes', icon: Settings },
  { href: '/help', label: 'Ajuda', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="
      fixed left-0 top-0 h-full w-64
      bg-white/70 dark:bg-neutral-900/70
      backdrop-blur-xl
      border-r border-white/20 dark:border-neutral-800/50
      shadow-lg
      z-40
    ">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/20 dark:border-neutral-800/50">
        <span className="text-xl font-bold text-neutral-900 dark:text-white">
          Termyx
        </span>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-colors duration-200
                  ${isActive
                    ? 'bg-white/80 dark:bg-white/10 shadow-md'
                    : 'hover:bg-white/50 dark:hover:bg-white/5'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`
                  w-5 h-5 relative z-10
                  ${isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                  }
                `} />
                <span className={`
                  relative z-10 font-medium
                  ${isActive
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-300'
                  }
                `}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

### Header
```typescript
// /components/layout/Header.tsx
'use client'

import { useTheme } from '@/lib/providers/theme-provider'
import { useUser } from '@/lib/hooks/useUser'
import { Moon, Sun, Bell, Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const { user } = useUser()

  return (
    <header className="
      h-16 bg-white/70 dark:bg-neutral-900/70
      backdrop-blur-xl
      border-b border-white/20 dark:border-neutral-800/50
      sticky top-0 z-30
      px-6 flex items-center justify-between
    ">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="
              w-full pl-10 pr-4 py-2
              bg-neutral-100 dark:bg-neutral-800
              border border-transparent
              rounded-xl
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              placeholder:text-neutral-400
            "
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-neutral-600" />
          )}
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
```

### Button Component
```typescript
// /components/ui/Button.tsx
'use client'

import { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md',
      secondary: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700',
      ghost: 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800',
      danger: 'bg-red-600 text-white hover:bg-red-700'
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
```

---

## Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        destructive: 'rgb(var(--destructive) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
      },
      borderRadius: {
        xl: 'var(--radius)',
        '2xl': 'calc(var(--radius) + 4px)',
      },
    },
  },
}
```

---

## Entregaveis
- [ ] Layout base funcionando
- [ ] Sidebar com navegacao
- [ ] Header completo
- [ ] Toggle Dark/Light funcionando
- [ ] Componentes UI criados
- [ ] Responsivo em mobile

---

## Proxima Etapa
[Etapa 7: Dashboard e UI](./07-dashboard-ui.md)
