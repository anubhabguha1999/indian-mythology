import { SACRED_GOLD, UI_COOL } from '../mahadevPalette'

/**
 * Shown while the experience's chunk is downloading, and again while its
 * canvas has mounted but hasn't rendered a first frame — kept as close to
 * the opening beat itself as possible (near-black, one line of devanagari,
 * a hairline sweep) so there's no jarring hand-off between "loading
 * screen" and "the darkness the experience actually opens on".
 */
export function Loader() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#08090A]">
      <div className="flex flex-col items-center gap-5">
        <span className="font-deva text-2xl text-ivory/70">महादेव</span>
        <span className="font-sans text-[10px] tracking-[0.45em] text-ivory/35">THE MOUNTAIN IS STILL FORMING</span>
        <span className="h-px w-28 overflow-hidden bg-ivory/10" aria-hidden="true">
          <span
            className="block h-full w-1/3 animate-[loaderSweep_1.8s_ease-in-out_infinite]"
            style={{ background: `linear-gradient(90deg, ${UI_COOL}, ${SACRED_GOLD})` }}
          />
        </span>
      </div>
    </div>
  )
}
