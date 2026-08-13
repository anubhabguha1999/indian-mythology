import { useEffect } from 'react'
import { lockScroll, unlockScroll } from '@/utils/scrollLock'

/**
 * Locks page scroll for as long as `active` is true — used while a heavy
 * scroll-pinned scene is still loading (chunk still downloading, or the
 * WebGL canvas hasn't rendered its first frame yet) *and* the user has
 * actually scrolled to it. Without this, a slow chunk fetch or a first-
 * paint shader compile just looks like a blank/broken page rather than
 * "still loading". Always unlocks on unmount so a component that
 * disappears mid-load (route change, fast scroll-past) can't leave scroll
 * stuck.
 */
export function useSectionLoadLock(active: boolean) {
  useEffect(() => {
    if (active) lockScroll()
    else unlockScroll()
    return () => {
      unlockScroll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}
