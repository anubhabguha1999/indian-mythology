import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { Footer } from '@/components/shared/Footer'
import { Header } from '@/components/mahadev/ui/Header'
import { ChapterIndicator } from '@/components/mahadev/ui/ChapterIndicator'
import { ScrollIndicator } from '@/components/mahadev/ui/ScrollIndicator'
import { Loader } from '@/components/mahadev/ui/Loader'
import { OpeningHero } from '@/components/mahadev/ui/OpeningHero'
import { useAmbientAudio } from '@/components/mahadev/audio/useAmbientAudio'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSectionLoadLock } from '@/hooks/useSectionLoadLock'
import { shivaProfile } from '@/data/shiva'

// Real Three.js weight — split into its own chunk so it only downloads
// once a visitor actually scrolls toward it (see Home's ManifestationScene
// for the original reasoning).
const MahadevExperience = lazy(() =>
  import('@/components/mahadev/MahadevExperience').then((m) => ({ default: m.MahadevExperience })),
)

/** Suspense fallback for the above — reserves the real pinned height and
 * locks scroll + shows a loader only while the visitor is actually here
 * and it isn't ready yet. */
function MahadevPending() {
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
    <div ref={ref} className={reducedMotion ? 'min-h-[85vh] bg-[#1A2027]' : 'relative h-[1000vh] bg-[#08090A]'}>
      {active && <Loader />}
    </div>
  )
}

/**
 * /shiva — "Mahadev: The Mountain That Breathes". A bespoke header and
 * indicator system rather than the shared site chrome — see Header.tsx for
 * why: the standard `<Navbar>` is exactly the generic-template look this
 * page is meant to move away from.
 */
export function ShivaPage() {
  const reducedMotion = useReducedMotion()
  const { muted, toggleMute } = useAmbientAudio(!reducedMotion)
  // index.html's <title> is one static string ("KALI · The Power Beyond
  // Time") shared by every route — nothing overrides it per page, so this
  // tab showed Kali's title even here: found by testing.
  useDocumentTitle('SHIVA · The Mountain That Breathes')

  return (
    <>
      <Header muted={muted} onToggleMute={toggleMute} />
      <ChapterIndicator />
      <ScrollIndicator />
      <main>
        <OpeningHero />
        <Suspense fallback={<MahadevPending />}>
          <MahadevExperience />
        </Suspense>
      </main>
      <Footer glyph={shivaProfile.devanagari} description={shivaProfile.description} />
    </>
  )
}
