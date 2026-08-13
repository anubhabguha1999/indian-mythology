import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

// Down to the site's only two routes — the former five-link chapter nav
// (THE MOTHER/THE FORM/THE STORY/TEMPLES/ARCHIVE) pointed at pages that no
// longer exist, since Home now carries that whole journey inline as one
// continuous scroll (see pages/Home/index.tsx).
const DEFAULT_CENTER_LINKS = [{ label: 'MAHADEV', to: '/shiva' }]

const DEFAULT_MENU_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Mahadev — Shiva', to: '/shiva' },
]

interface NavLink {
  label: string
  to: string
}

interface NavbarProps {
  /** Home holds the navbar back until the hero has developed; other pages show it immediately. */
  revealOnScroll?: boolean
  /** Wordmark text — defaults to the site-wide "KALI" identity. */
  logo?: string
  logoTo?: string
  /** Desktop center nav — pass an empty array for a bare logo+menu bar (e.g. an immersive cinematic page that wants minimal UI). */
  centerLinks?: NavLink[]
  menuLinks?: NavLink[]
  /** Devanagari line shown top-left of the full-screen menu overlay. */
  menuGlyph?: string
  menuTagline?: string
}

export function Navbar({
  revealOnScroll = false,
  logo = 'KALI',
  logoTo = '/',
  centerLinks = DEFAULT_CENTER_LINKS,
  menuLinks = DEFAULT_MENU_LINKS,
  menuGlyph = 'माँ काली',
  menuTagline = 'A CINEMATIC EXPLORATION OF THE DIVINE FEMININE',
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  const navOpacity = useTransform(scrollY, [0, 500, 780], revealOnScroll ? [0, 0, 1] : [1, 1, 1])
  const bgOpacity = useTransform(scrollY, [0, 60, 240], [0, 0.3, 1])

  useEffect(() => {
    const root = document.documentElement
    if (menuOpen) {
      root.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      root.style.overflow = ''
      document.body.style.overflow = ''
    }
    return () => {
      root.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <motion.header
        style={{ opacity: navOpacity }}
        className="fixed inset-x-0 top-0 z-40"
      >
        <motion.div
          aria-hidden="true"
          style={{ opacity: bgOpacity }}
          className="absolute inset-0 border-b border-ivory/[0.06] bg-obsidian/80 backdrop-blur-md"
        />
        <nav className="relative mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10">
          <Link
            to={logoTo}
            data-cursor="OPEN"
            className="font-display text-sm tracking-[0.35em] text-ivory transition-colors hover:text-divine md:text-base"
          >
            {logo}
          </Link>

          <ul className="hidden items-center gap-9 md:flex">
            {centerLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  data-cursor="OPEN"
                  className={({ isActive }) =>
                    cn(
                      'font-sans text-[11px] tracking-[0.2em] transition-colors',
                      isActive ? 'text-divine' : 'text-ivory/60 hover:text-ivory',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            data-cursor="OPEN"
            onClick={() => setMenuOpen(true)}
            className="font-sans text-[11px] tracking-[0.3em] text-ivory/70 transition-colors hover:text-divine"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            MENU
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[160] flex flex-col bg-obsidian/[0.98] backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex items-center justify-between px-5 py-5 md:px-10 md:py-8">
              <span className="font-deva text-lg text-ivory/50">{menuGlyph}</span>
              <button
                type="button"
                data-cursor="OPEN"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="text-ivory/70 transition-colors hover:text-divine"
              >
                <X size={26} strokeWidth={1.25} />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-start justify-center gap-2 px-6 md:px-16">
              {menuLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <NavLink
                    to={link.to}
                    data-cursor="OPEN"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'font-display text-4xl uppercase tracking-wide transition-colors sm:text-5xl md:text-6xl',
                        isActive ? 'text-divine' : 'text-ivory/85 hover:text-divine',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </div>

            <div className="px-6 pb-8 text-[10px] tracking-[0.3em] text-ivory/30 md:px-16">
              {menuTagline}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
