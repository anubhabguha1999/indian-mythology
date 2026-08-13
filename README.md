# KALI — The Power Beyond Time

A cinematic, single-deity web experience centered on Maa Kali: a scroll-driven
revelation, her iconography and symbolism, one telling of her story, the
temples where she's worshipped, and the wider Divine Feminine archive.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Framer Motion · React Router
· Lenis (smooth scroll) · Lucide React. Most of the "cosmic" atmosphere is a
canvas-2D particle system (`components/particles/ParticleField.tsx`), which
is cheaper and plenty convincing at that scale — the one exception is
`components/kali/ManifestationScene.tsx` + `ManifestationEnvironment.tsx`, a
genuine Three.js / React Three Fiber scene: an eleven-shot camera path
(Catmull-Rom spline, not a two-point tween) through a dark temple chamber —
pillars, a floor, a rotating 3D mandala, four particle layers — toward a
monumental, procedurally-built silhouette (no sculpted model exists in this
project; she's deliberately left under-detailed. RevelationScene does the
actual face/crown reveal immediately after, against the real painted
portrait). Real post-processing (`@react-three/postprocessing`: bloom, depth
of field, vignette, grain) runs on top, gated off entirely on the 'low'
quality tier. `manifestationQuality.ts` picks a starting quality tier from
`navigator.hardwareConcurrency`/mobile, and `<PerformanceMonitor>` steps it
down further at runtime if the frame rate actually sags. Lazy-loaded as its
own chunk so the ~260kB+ of Three.js/postprocessing only downloads once a
visitor actually scrolls near it.

Cut from scope after trying: true volumetric light shafts (a cheap
additive-cone approximation rendered as a solid, ugly, cheap-looking cone
once bloom hit it — removed rather than shipped; a correct version needs a
raymarched shader). Also intentionally skipped: LOD (the geometry here is
already too cheap for LOD to matter) and baked lighting (impossible for a
lightscape that changes continuously with scroll anyway).

## Running it

```
npm install
npm run dev      # http://localhost:5183 (or whatever port Vite picks)
npm run build    # production build → dist/
```

## Routes

- `/` — the full cinematic homepage: Void → Eyes → Revelation → Hero → Form →
  Symbolism → Story → Dance → Mother → Temples → Festivals → Divine Feminine
  → Final scene.
- `/kali` — a hub page (chapter select).
- `/kali/symbolism`, `/kali/story`, `/kali/temples` — deep-dive pages, reusing
  the homepage's scene components with expanded content.
- `/goddesses` — the wider Divine Feminine archive (Kali stays the anchor).
- `/archive` — master index + image credits.

## Architecture notes

- **`src/data/`** is the single source of truth for content and imagery.
  `images.ts` centralizes every Wikimedia Commons asset (classical
  Raja Ravi Varma-era paintings + freely-licensed temple photography) with
  attribution baked into the type — never hardcode an image URL in a
  component.
- **Every pinned/scroll-linked scene** (`components/kali/*Scene.tsx`) has a
  static, non-animated fallback rendered when `useReducedMotion()` is true —
  see e.g. `VoidScene.tsx`'s `VoidStatic`. Hooks are always called
  unconditionally before that branch.
- **Scroll offset convention**: pinned sections use
  `useScrollProgress(['start start', 'end end'])`. The `end end` matters —
  it maps progress 0→1 to exactly the span a `position: sticky` element is
  actually stuck for. Using `end start` instead looks fine for any section
  that has more content after it (the shortfall is masked by the section
  scrolling off-screen), but silently breaks the *last* section on a page,
  since there's rarely a full viewport of trailing content to supply the
  extra scroll room `end start` needs. Keep this offset on any new pinned
  scene, especially ones that might end up last.
- **Camera-move framing** (`FormScene.tsx`'s `FRAMING` array) sets
  `transformOrigin` equal to `objectPosition` on purpose — see the comment
  there. Without it, `scale()` zooms from the viewport's centre instead of
  the intended focal point, which is very wrong for a portrait image inside
  a much-wider container.
- **`data-cursor="EXPLORE" | "VIEW" | "OPEN"`** on an element feeds the
  custom cursor (desktop, fine-pointer only). Add it to new interactive
  elements for consistency.

## Gotchas

- **`@react-three/fiber`'s `<Canvas>` sets `position: relative` via inline
  style**, which beats a Tailwind class of the same property. Pass
  `style={{ position: 'absolute', inset: 0 }}` directly instead of a
  className — see `ManifestationScene.tsx`. Getting this wrong doesn't error,
  it just quietly turns the canvas into a full-width flex item that shoves
  every sibling out of the way.
- **Importing `@react-three/fiber` anywhere in the program** makes
  TypeScript augment `JSX.IntrinsicElements` with every three.js element
  globally, which can break unrelated generic `ElementType`-as-prop
  components elsewhere (their `children` type collapses to `never`). Fixed
  in `RevealText.tsx` by casting the dynamic tag to a concrete element
  before rendering — cheap, and doesn't affect what actually renders.

## Known gaps

- Mobile-viewport and OS-level `prefers-reduced-motion` were verified by
  code review (hooks are called unconditionally, fallbacks are wired up,
  `useIsMobile`/`useHasFinePointer` gate the right things) but not against a
  live narrow viewport or an OS reduced-motion toggle — the sandbox's window
  resize tool wasn't cooperating this session. Worth a manual pass in
  DevTools' device toolbar before shipping.
- The main JS bundle is ~384kB (~122kB gzip), mostly React + Framer Motion +
  Lenis. Reasonable for the ambition here, but a candidate for further
  route-level code-splitting if it ever needs to shrink.
