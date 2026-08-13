import { UI_WARM, WARM_GOLD } from '../hanumanPalette'

/** Shown while the experience's chunk is downloading and before its first
 * real frame — near-black, so there's no hand-off jolt into the opening
 * beat's own "start with black, complete silence". */
export function Loader() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0c0d0f]">
      <div className="flex flex-col items-center gap-5">
        <span className="font-deva text-2xl text-ivory/70">हनुमान</span>
        <span className="font-sans text-[10px] tracking-[0.45em] text-ivory/35">THE WIND HAS NOT YET ARRIVED</span>
        <span className="h-px w-28 overflow-hidden bg-ivory/10" aria-hidden="true">
          <span
            className="block h-full w-1/3 animate-[loaderSweep_1.8s_ease-in-out_infinite]"
            style={{ background: `linear-gradient(90deg, ${UI_WARM}, ${WARM_GOLD})` }}
          />
        </span>
      </div>
    </div>
  )
}
