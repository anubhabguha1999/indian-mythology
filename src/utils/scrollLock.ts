import type Lenis from 'lenis'

let activeLenis: Lenis | null = null
let locked = false

/**
 * Registered once from App.tsx with whatever Lenis instance is currently
 * driving scroll (or null under reduced motion, where scroll is native).
 * Lets any component lock scroll correctly without threading the instance
 * through props.
 *
 * IMPORTANT: this picks exactly one strategy, never both. `overflow:
 * hidden` on `<html>` looks like a harmless belt-and-suspenders addition
 * alongside `lenis.stop()`, but it actively breaks `position: sticky` in
 * Chrome — every pinned scene on this site (Kali's and Shiva's alike) is
 * `position: sticky`, and toggling `overflow: hidden` on an ancestor while
 * one is on screen made it jump off-screen entirely, which flipped its
 * `useInView` to false, which unmounted its canvas, which killed the very
 * `useFrame` loop that was supposed to call `unlockScroll()` a second
 * later — a real, reproduced deadlock (found while testing Shiva's
 * third-eye freeze event; scroll never recovered without a reload).
 * `overflow: hidden` is only safe here when Lenis isn't running at all
 * (reduced motion), because that path never renders a sticky pinned scene
 * in the first place — the reduced-motion fallback is a plain static
 * section.
 */
export function registerLenis(lenis: Lenis | null) {
  activeLenis = lenis
}

export function lockScroll() {
  if (locked) return
  locked = true
  if (activeLenis) activeLenis.stop()
  else document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll() {
  if (!locked) return
  locked = false
  if (activeLenis) activeLenis.start()
  else document.documentElement.style.overflow = ''
}
