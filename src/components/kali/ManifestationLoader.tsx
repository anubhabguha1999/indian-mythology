/**
 * Shown while ManifestationScene's chunk is still downloading, and again
 * while its canvas has loaded but hasn't rendered a first frame yet. Kept
 * in its own file, deliberately with zero heavy imports (no three.js, no
 * @react-three/*) — Home/index.tsx needs to import this statically for the
 * Suspense fallback, and a static import sitting in the same file as
 * ManifestationScene's own Three.js imports would pull the entire 3D scene
 * back into the main chunk, defeating the lazy-load it's split out for.
 */
export function ManifestationLoader() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-obsidian">
      <div className="flex flex-col items-center gap-4">
        <span className="h-2 w-2 animate-pulse rounded-full bg-divine" aria-hidden="true" />
        <span className="font-sans text-[10px] tracking-[0.45em] text-ivory/35">ENTERING THE DARKNESS</span>
      </div>
    </div>
  )
}
