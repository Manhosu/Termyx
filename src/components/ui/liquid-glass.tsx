'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LiquidGlassProps {
  children: ReactNode
  className?: string
  intensity?: 'light' | 'medium' | 'strong'
  hover?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  border?: boolean
  shadow?: boolean
  as?: 'div' | 'section' | 'article' | 'aside' | 'nav' | 'header' | 'footer'
}

const intensityClasses = {
  light: 'bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm',
  medium: 'bg-white/50 dark:bg-gray-900/50 backdrop-blur-md',
  strong: 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg',
}

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
}

export function LiquidGlass({
  children,
  className,
  intensity = 'medium',
  hover = false,
  rounded = '2xl',
  border = true,
  shadow = true,
  as: Component = 'div',
}: LiquidGlassProps) {
  const MotionComponent = motion[Component]

  return (
    <MotionComponent
      className={cn(
        intensityClasses[intensity],
        roundedClasses[rounded],
        border && 'border border-white/20 dark:border-gray-700/30',
        shadow && 'shadow-lg shadow-black/5 dark:shadow-black/20',
        'transition-all duration-300',
        className
      )}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </MotionComponent>
  )
}

// Liquid Glass Card
interface LiquidGlassCardProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  icon?: ReactNode
  onClick?: () => void
  hoverable?: boolean
}

export function LiquidGlassCard({
  children,
  className,
  title,
  description,
  icon,
  onClick,
  hoverable = true,
}: LiquidGlassCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden',
        'bg-white/60 dark:bg-gray-800/60',
        'backdrop-blur-xl',
        'border border-white/30 dark:border-gray-700/30',
        'rounded-3xl',
        'shadow-xl shadow-black/5 dark:shadow-black/20',
        'transition-all duration-500',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={hoverable ? {
        scale: 1.02,
        y: -4,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative p-6">
        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-4 shadow-lg">
            {icon}
          </div>
        )}
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </motion.div>
  )
}

// Liquid Glass Button
interface LiquidGlassButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent hover:from-emerald-700 hover:to-teal-700',
  secondary: 'bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white border-white/30 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80',
  ghost: 'bg-transparent text-gray-700 dark:text-gray-300 border-transparent hover:bg-white/40 dark:hover:bg-gray-800/40',
}

const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export function LiquidGlassButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
}: LiquidGlassButtonProps) {
  return (
    <motion.button
      type={type}
      className={cn(
        'relative overflow-hidden',
        'backdrop-blur-md',
        'border',
        'rounded-2xl',
        'font-medium',
        'shadow-lg shadow-black/5',
        'transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <span className="relative">{children}</span>
    </motion.button>
  )
}

// Liquid Glass Input
interface LiquidGlassInputProps {
  className?: string
  label?: string
  placeholder?: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  icon?: ReactNode
}

export function LiquidGlassInput({
  className,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  icon,
}: LiquidGlassInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <motion.input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            'w-full',
            'bg-white/60 dark:bg-gray-800/60',
            'backdrop-blur-md',
            'border border-white/30 dark:border-gray-700/30',
            'rounded-2xl',
            'px-5 py-4',
            icon && 'pl-12',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50',
            'transition-all duration-300',
            error && 'border-red-500/50 focus:ring-red-500/50'
          )}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// Liquid Glass Sidebar
interface LiquidGlassSidebarProps {
  children: ReactNode
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

export function LiquidGlassSidebar({
  children,
  className,
  isOpen = true,
}: LiquidGlassSidebarProps) {
  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-0 h-full',
        'bg-white/70 dark:bg-gray-900/70',
        'backdrop-blur-xl',
        'border-r border-white/20 dark:border-gray-700/30',
        'shadow-2xl shadow-black/10',
        'z-40',
        className
      )}
      initial={{ x: -280 }}
      animate={{ x: isOpen ? 0 : -280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.aside>
  )
}

// Liquid Glass Modal
interface LiquidGlassModalProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  className?: string
}

export function LiquidGlassModal({
  children,
  isOpen,
  onClose,
  title,
  className,
}: LiquidGlassModalProps) {
  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className={cn(
          'relative',
          'bg-white/80 dark:bg-gray-900/80',
          'backdrop-blur-xl',
          'border border-white/30 dark:border-gray-700/30',
          'rounded-3xl',
          'shadow-2xl',
          'max-w-lg w-full',
          'max-h-[90vh] overflow-auto',
          className
        )}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-gray-700/30">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Fechar modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}
