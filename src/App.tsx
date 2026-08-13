import { lazy, Suspense, useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import type Lenis from 'lenis'
import { useLenis } from '@/hooks/useLenis'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { registerLenis } from '@/utils/scrollLock'
import { LoadingScreen } from '@/components/transitions/LoadingScreen'
import { PageTransition } from '@/components/transitions/PageTransition'
import { shivaProfile } from '@/data/shiva'

const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.HomePage })))
const ShivaPage = lazy(() => import('@/pages/Shiva').then((m) => ({ default: m.ShivaPage })))
const HanumanPage = lazy(() => import('@/pages/Hanuman').then((m) => ({ default: m.HanumanPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFoundPage })))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian">
      <div className="h-2 w-2 animate-pulse rounded-full bg-divine" />
    </div>
  )
}

/** Scroll restoration: top on a plain route change, to the target on a hash link — both routed through Lenis when it's active. */
function ScrollManager({ lenisRef }: { lenisRef: RefObject<Lenis | null> }) {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) {
        const el = document.getElementById(hash.slice(1))
        if (el) {
          if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -90 })
          else el.scrollIntoView({ block: 'start' })
          return
        }
      }
      if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
      else window.scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, lenisRef])

  return null
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const reducedMotion = useReducedMotion()
  const location = useLocation()
  const lenisRef = useRef<Lenis | null>(null)

  useLenis(!reducedMotion, (instance) => {
    lenisRef.current = instance
    registerLenis(instance)
  })

  // This fires once, on the very first mount of the whole app — whichever
  // route the visitor actually landed on (a direct link or a refresh, not
  // just "/"). It used to announce "KALI" unconditionally regardless of
  // that, which meant landing straight on /shiva still opened with a
  // different deity's name: found by testing.
  const isShivaRoute = location.pathname.startsWith('/shiva')

  return (
    <>
      {loading && (
        <LoadingScreen
          onComplete={() => setLoading(false)}
          devanagari={isShivaRoute ? shivaProfile.devanagari : undefined}
          roman={isShivaRoute ? shivaProfile.name : undefined}
          gradient={isShivaRoute ? 'radial-gradient(circle, rgba(157,176,188,0.9) 0%, rgba(17,20,24,0.6) 55%, transparent 78%)' : undefined}
        />
      )}

      <div className="grain-overlay" aria-hidden="true" />
      <ScrollManager lenisRef={lenisRef} />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Suspense fallback={<RouteFallback />}>
                  <HomePage />
                </Suspense>
              </PageTransition>
            }
          />
          <Route
            path="/shiva"
            element={
              <PageTransition>
                <Suspense fallback={<RouteFallback />}>
                  <ShivaPage />
                </Suspense>
              </PageTransition>
            }
          />
          <Route
            path="/hanuman"
            element={
              <PageTransition>
                <Suspense fallback={<RouteFallback />}>
                  <HanumanPage />
                </Suspense>
              </PageTransition>
            }
          />
          <Route
            path="*"
            element={
              <PageTransition>
                <Suspense fallback={<RouteFallback />}>
                  <NotFoundPage />
                </Suspense>
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  )
}
