'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ReactNode, useRef, MouseEvent } from 'react'
import { cn } from '@/lib/utils'

// ============================================================================
// MESH GRADIENT BACKGROUND
// ============================================================================

interface MeshGradientProps {
  className?: string
  variant?: 'hero' | 'section' | 'card'
}

export function MeshGradient({ className, variant = 'hero' }: MeshGradientProps) {
  const variants = {
    hero: 'from-blue-600/30 via-purple-600/20 to-pink-600/30',
    section: 'from-cyan-500/20 via-blue-500/15 to-purple-500/20',
    card: 'from-white/40 via-white/20 to-white/40 dark:from-white/10 dark:via-white/5 dark:to-white/10',
  }

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Primary mesh blob */}
      <motion.div
        className={cn(
          'absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br blur-3xl',
          variants[variant]
        )}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Secondary mesh blob */}
      <motion.div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-tl from-pink-500/25 via-violet-500/20 to-cyan-500/25 blur-3xl"
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -60, -120, 0],
          scale: [1, 1.15, 1.05, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Tertiary accent blob */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// ============================================================================
// 3D FLOATING CARD
// ============================================================================

interface FloatingCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
  intensity?: 'subtle' | 'medium' | 'intense'
}

export function FloatingCard({
  children,
  className,
  glowColor = 'blue',
  intensity = 'medium',
}: FloatingCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg'])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const glowColors = {
    blue: 'shadow-blue-500/20 hover:shadow-blue-500/40',
    purple: 'shadow-purple-500/20 hover:shadow-purple-500/40',
    cyan: 'shadow-cyan-500/20 hover:shadow-cyan-500/40',
    pink: 'shadow-pink-500/20 hover:shadow-pink-500/40',
    green: 'shadow-emerald-500/20 hover:shadow-emerald-500/40',
    orange: 'shadow-orange-500/20 hover:shadow-orange-500/40',
  }

  const intensities = {
    subtle: 'shadow-lg hover:shadow-xl',
    medium: 'shadow-xl hover:shadow-2xl',
    intense: 'shadow-2xl hover:shadow-[0_35px_60px_-12px]',
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative rounded-3xl bg-white/70 dark:bg-neutral-900/70',
        'backdrop-blur-xl border border-white/50 dark:border-neutral-800/50',
        'transition-shadow duration-500',
        intensities[intensity],
        glowColors[glowColor as keyof typeof glowColors] || glowColors.blue,
        className
      )}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Glass reflection overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />

      {/* Inner glow */}
      <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

      {/* Content */}
      <div style={{ transform: 'translateZ(50px)' }}>{children}</div>
    </motion.div>
  )
}

// ============================================================================
// GRADIENT TEXT
// ============================================================================

interface GradientTextProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'accent' | 'rainbow'
  animate?: boolean
}

export function GradientText({
  children,
  className,
  variant = 'primary',
  animate = false,
}: GradientTextProps) {
  const gradients = {
    primary: 'from-blue-600 via-purple-600 to-blue-600',
    secondary: 'from-cyan-500 via-blue-500 to-purple-500',
    accent: 'from-pink-500 via-purple-500 to-indigo-500',
    rainbow: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
  }

  return (
    <motion.span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent bg-[length:200%_auto]',
        gradients[variant],
        animate && 'animate-gradient',
        className
      )}
      style={animate ? {
        animation: 'gradient 3s linear infinite',
      } : undefined}
    >
      {children}
    </motion.span>
  )
}

// ============================================================================
// PREMIUM BUTTON
// ============================================================================

interface PremiumButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  onClick?: () => void
  href?: string
}

export function PremiumButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  glow = true,
  onClick,
  href,
}: PremiumButtonProps) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  }

  const variants = {
    primary: cn(
      'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto]',
      'text-white font-semibold',
      'hover:bg-[position:right_center]',
      glow && 'shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-purple-500/40'
    ),
    secondary: cn(
      'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl',
      'text-neutral-900 dark:text-white font-semibold',
      'border border-white/50 dark:border-neutral-700/50',
      glow && 'shadow-lg shadow-black/5 hover:shadow-xl'
    ),
    ghost: cn(
      'bg-transparent hover:bg-white/50 dark:hover:bg-neutral-800/50',
      'text-neutral-700 dark:text-neutral-300 font-medium',
      'backdrop-blur-sm'
    ),
    outline: cn(
      'bg-transparent border-2 border-blue-500/50 hover:border-blue-500',
      'text-blue-600 dark:text-blue-400 font-semibold',
      'hover:bg-blue-500/10'
    ),
  }

  const Component = href ? motion.a : motion.button

  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'rounded-2xl overflow-hidden',
        'transition-all duration-500',
        sizes[size],
        variants[variant],
        className
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
        whileHover={{ translateX: '200%' }}
        transition={{ duration: 0.6 }}
      />

      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Component>
  )
}

// ============================================================================
// FEATURE ICON
// ============================================================================

interface FeatureIconProps {
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  className?: string
}

export function FeatureIcon({ icon: Icon, gradient, className }: FeatureIconProps) {
  return (
    <motion.div
      className={cn(
        'relative w-16 h-16 rounded-2xl',
        'flex items-center justify-center',
        'bg-gradient-to-br',
        gradient,
        'shadow-lg',
        className
      )}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      {/* Inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-white/20 backdrop-blur-sm" />

      {/* Icon */}
      <Icon className="w-8 h-8 text-white relative z-10 drop-shadow-md" />

      {/* Floating particles effect */}
      <motion.div
        className="absolute -inset-1 rounded-2xl bg-gradient-to-br opacity-50 blur-md -z-10"
        style={{ background: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  )
}

// ============================================================================
// STAT COUNTER
// ============================================================================

interface StatCounterProps {
  value: string
  label: string
  suffix?: string
  className?: string
}

export function StatCounter({ value, label, suffix, className }: StatCounterProps) {
  return (
    <motion.div
      className={cn('text-center', className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        initial={{ scale: 0.5 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
      >
        {value}
        {suffix && <span className="text-3xl">{suffix}</span>}
      </motion.div>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400 font-medium">{label}</p>
    </motion.div>
  )
}

// ============================================================================
// TESTIMONIAL CARD
// ============================================================================

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  avatar?: string
  rating?: number
  className?: string
}

export function TestimonialCard({
  quote,
  author,
  role,
  rating = 5,
  className,
}: TestimonialCardProps) {
  return (
    <FloatingCard className={cn('p-8', className)} glowColor="purple" intensity="subtle">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <motion.svg
            key={i}
            className="w-5 h-5 text-yellow-400 fill-current"
            viewBox="0 0 20 20"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </motion.svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6">
        &ldquo;{quote}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{author.charAt(0)}</span>
        </div>
        <div>
          <p className="font-semibold text-neutral-900 dark:text-white">{author}</p>
          <p className="text-sm text-neutral-500">{role}</p>
        </div>
      </div>
    </FloatingCard>
  )
}

// ============================================================================
// PRICING CARD
// ============================================================================

interface PricingCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  ctaText?: string
  ctaHref?: string
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  highlighted = false,
  ctaText = 'Comecar',
  ctaHref = '/signup',
}: PricingCardProps) {
  return (
    <FloatingCard
      className={cn(
        'relative p-8',
        highlighted && 'border-2 border-blue-500/50 scale-105 z-10'
      )}
      glowColor={highlighted ? 'blue' : 'purple'}
      intensity={highlighted ? 'intense' : 'medium'}
    >
      {/* Popular badge */}
      {highlighted && (
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-sm font-semibold shadow-lg"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Mais Popular
        </motion.div>
      )}

      {/* Plan name */}
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{name}</h3>
      <p className="text-neutral-500 mb-6">{description}</p>

      {/* Price */}
      <div className="mb-8">
        <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {price}
        </span>
        <span className="text-neutral-500 ml-2">{period}</span>
      </div>

      {/* Features */}
      <ul className="space-y-4 mb-8">
        {features.map((feature, i) => (
          <motion.li
            key={i}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
          </motion.li>
        ))}
      </ul>

      {/* CTA */}
      <PremiumButton
        href={ctaHref}
        variant={highlighted ? 'primary' : 'secondary'}
        size="lg"
        className="w-full"
      >
        {ctaText}
      </PremiumButton>
    </FloatingCard>
  )
}

// ============================================================================
// ANIMATED BORDER
// ============================================================================

interface AnimatedBorderProps {
  children: ReactNode
  className?: string
}

export function AnimatedBorder({ children, className }: AnimatedBorderProps) {
  return (
    <div className={cn('relative rounded-3xl p-[2px] overflow-hidden', className)}>
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-blue-500 bg-[length:400%_100%]"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />

      {/* Content container */}
      <div className="relative bg-white dark:bg-neutral-900 rounded-[22px] h-full">
        {children}
      </div>
    </div>
  )
}

// ============================================================================
// FLOATING BADGE
// ============================================================================

interface FloatingBadgeProps {
  children: ReactNode
  className?: string
}

export function FloatingBadge({ children, className }: FloatingBadgeProps) {
  return (
    <motion.div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2',
        'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl',
        'border border-white/50 dark:border-neutral-700/50',
        'rounded-full shadow-lg shadow-black/5',
        'text-sm font-medium text-neutral-700 dark:text-neutral-300',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -2 }}
    >
      {children}
    </motion.div>
  )
}
