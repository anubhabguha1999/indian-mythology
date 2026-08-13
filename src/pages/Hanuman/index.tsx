import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { Footer } from '@/components/shared/Footer'
import { Header } from '@/components/hanuman/ui/Header'
import { ChapterIndicator } from '@/components/hanuman/ui/ChapterIndicator'
import { ScrollIndicator } from '@/components/hanuman/ui/ScrollIndicator'
import { Loader } from '@/components/hanuman/ui/Loader'
import { HanumanHero } from '@/components/hanuman/ui/HanumanHero'
import { useAmbientAudio } from '@/components/mahadev/audio/useAmbientAudio'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useSectionLoadLock } from '@/hooks/useSectionLoadLock'

// Three.js weight — its own chunk, loaded only once a visitor actually
// scrolls toward it (see Shiva/index.tsx's identical reasoning).
const HanumanExperience = lazy(() =>
  import('@/components/hanuman/HanumanExperience').then((m) => ({ default: m.HanumanExperience })),
)

function HanumanPending() {
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
    <div ref={ref} className={reducedMotion ? 'min-h-[85vh] bg-[#1a130e]' : 'relative h-[1000vh] bg-[#0c0d0f]'}>
      {active && <Loader />}
    </div>
  )
}

/**
 * /hanuman — "Hanuman: The Impossible". A bespoke minimal header rather
 * than the shared site chrome, same reasoning as /shiva's own Header.
 */
export function HanumanPage() {
  const reducedMotion = useReducedMotion()
  const { muted, toggleMute } = useAmbientAudio(!reducedMotion)
  useDocumentTitle('HANUMAN · The Impossible')

  return (
    <>
      <Header muted={muted} onToggleMute={toggleMute} />
      <ChapterIndicator />
      <ScrollIndicator />
      <main>
        <HanumanHero />
        <Suspense fallback={<HanumanPending />}>
          <HanumanExperience />
        </Suspense>
      </main>
      <Footer
        glyph="हनुमान"
        description="Devotion has no limit. Presented with respect for the diversity of Hindu tradition — accounts of this story vary by region, lineage and text."
        credit={
          'This work is based on "Hanuman Ji" (sketchfab.com/3d-models/hanuman-ji-cd6c69a559d8477d8fff4778b2f38ebb) ' +
          'by Rijul Tekriwal (sketchfab.com/tekriwalrijul1234), licensed under CC-BY-4.0 (creativecommons.org/licenses/by/4.0).'
        }
      />
    </>
  )
}
