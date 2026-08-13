import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CinematicButtonProps {
  children: ReactNode
  to?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'line'
  className?: string
}

/**
 * Every call-to-action in the site funnels through here. No fills, no
 * rounded pills — a cinematic control: a label and a thin line that
 * ignites gold and grows on hover.
 */
export function CinematicButton({
  children,
  to,
  onClick,
  variant = 'primary',
  className,
}: CinematicButtonProps) {
  const cursorLabel = variant === 'secondary' ? 'OPEN' : 'EXPLORE'

  const body =
    variant === 'line' ? (
      <span className="group inline-flex flex-col items-center gap-4">
        <span className="h-px w-14 bg-divine/40 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-36 group-hover:bg-divine" />
        <span className="font-sans text-[11px] tracking-[0.4em] text-ivory/50 transition-colors duration-500 group-hover:text-divine">
          {children}
        </span>
      </span>
    ) : (
      <span className="group inline-flex flex-col items-start gap-3">
        <span
          className={cn(
            'font-sans uppercase tracking-[0.3em] transition-colors duration-400',
            variant === 'primary'
              ? 'text-sm text-ivory group-hover:text-divine md:text-base'
              : 'text-xs text-ivory/55 group-hover:text-ivory',
          )}
        >
          {children}
        </span>
        <span
          className={cn(
            'block h-px bg-ivory/30 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-divine',
            variant === 'primary' ? 'w-10 group-hover:w-28' : 'w-6 group-hover:w-16',
          )}
        />
      </span>
    )

  if (onClick && !to) {
    return (
      <button type="button" onClick={onClick} data-cursor={cursorLabel} className={cn('inline-block text-left', className)}>
        {body}
      </button>
    )
  }

  return (
    <Link to={to ?? '/'} onClick={onClick} data-cursor={cursorLabel} className={cn('inline-block', className)}>
      {body}
    </Link>
  )
}
