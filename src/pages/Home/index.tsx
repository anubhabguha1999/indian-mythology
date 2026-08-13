import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { Navbar } from '@/components/navigation/Navbar'
import { Footer } from '@/components/shared/Footer'
import { VoidScene } from '@/components/kali/VoidScene'
import { EyesScene } from '@/components/kali/EyesScene'
import { RevelationScene } from '@/components/kali/RevelationScene'
import { KaliHero } from '@/components/kali/KaliHero'
import { FormScene } from '@/components/kali/FormScene'
import { SymbolismScene } from '@/components/kali/SymbolismScene'
import { StoryScene } from '@/components/kali/StoryScene'
import { DanceScene } from '@/components/kali/DanceScene'
import { MotherScene } from '@/components/kali/MotherScene'
import { TemplesTeaser } from '@/components/kali/TemplesTeaser'
import { FestivalScene } from '@/components/kali/FestivalScene'
import { GoddessArchive } from '@/components/archive/GoddessArchive'
import { FinalScene } from '@/components/kali/FinalScene'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSectionLoadLock } from '@/hooks/useSectionLoadLock'
import { ManifestationLoader } from '@/components/kali/ManifestationLoader'

// Three.js is real weight (~150kB+ gzipped) — split it into its own chunk so
// it only loads once a visitor is actually scrolling toward it, not on
// first paint of the homepage.
const ManifestationScene = lazy(() =>
  import('@/components/kali/ManifestationScene').then((m) => ({ default: m.ManifestationScene })),
)

/**
 * Suspense fallback for the above — reserves the *same* height the real
 * scene will (320vh, or reduced-motion's much shorter static fallback) so
 * nothing jumps once the chunk resolves, and locks scroll + shows a loader
 * while the user is actually at this section and the chunk hasn't arrived
 * yet. Without this a slow connection just reads as a blank/broken page.
 */
function ManifestationPending() {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '20% 0px 20% 0px' })
  const [gaveUp, setGaveUp] = useState(false)
  const active = inView && !reducedMotion && !gaveUp

  useSectionLoadLock(active)

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setGaveUp(true), 8000)
    return () => clearTimeout(timer)
  }, [active])

  return (
    <div ref={ref} className={reducedMotion ? 'min-h-[80vh] bg-obsidian' : 'relative h-[320vh] bg-obsidian'}>
      {active && <ManifestationLoader />}
    </div>
  )
}

/**
 * The complete Maa Kali cinematic experience — one continuous scroll,
 * eleven scenes plus the final beat. See CLAUDE.md / README for the
 * scene-by-scene motion rationale.
 */
export function HomePage() {
  return (
    <>
      <Navbar revealOnScroll />
      <main>
        <VoidScene />
        <EyesScene />
        <Suspense fallback={<ManifestationPending />}>
          <ManifestationScene />
        </Suspense>
        <RevelationScene />
        <KaliHero />
        <FormScene />
        <SymbolismScene />
        <StoryScene />
        <DanceScene />
        <MotherScene />
        <TemplesTeaser />
        <FestivalScene />
        <GoddessArchive intro="Kali is one face of a single, unbroken current — Shakti, the divine feminine in every form she takes." />
        <FinalScene />
      </main>
      <Footer />
    </>
  )
}
