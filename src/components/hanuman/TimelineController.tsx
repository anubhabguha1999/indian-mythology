import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import { lockScroll, unlockScroll } from '@/utils/scrollLock'
import { buildSpline, ease, findSegment, lerpNum } from '@/components/mahadev/timelineMath'
import { SHOTS, sampleFov, mapCurveT, WIND_KEYS, STORM_KEYS } from './cameraShots'
import { DEVOTION_T, FREEZE_DURATION } from './chapters'
import { GRADE_KEYS, EXPOSURE_KEYS } from './hanumanPalette'
import { hanumanPositionAt, HANUMAN_GROUND, HANUMAN_HEIGHT, LEAP_END_T, LEAP_START_T } from './terrain'

// The mountain/leap-anticipation stretch used to dip the camera down near
// his feet (a low "foot impact" shot) — per direction, this replaces that
// with a full 360° orbit instead: circling him once while descending from
// just above his head to chest height, never down toward the legs.
const ORBIT_START = 0.3
// Ends exactly where the leap begins (LEAP_START_T, terrain.ts) rather
// than its own hardcoded copy of that value — orbit hands off to the
// follow-cam right as he actually starts moving, and the two can't drift
// apart if this reads the same constant the leap arc itself does.
const ORBIT_END = LEAP_START_T
const ORBIT_BLEND = 0.03
const ORBIT_RADIUS = HANUMAN_HEIGHT * 0.95
const ORBIT_TOP_Y = HANUMAN_HEIGHT * 1.05
const ORBIT_BOTTOM_Y = HANUMAN_HEIGHT * 0.55
const ORBIT_LOOK_Y = HANUMAN_HEIGHT * 0.5
const ORBIT_FOV = 40

// The leap/sky stretch — the shot list's own hand-authored positions there
// were guessed independently of `hanumanPositionAt`'s actual arc, so as he
// rose the *real* moving point and the camera's fixed look-target quietly
// drifted apart, leaving him out of frame (mostly-empty sky/ground
// screenshots is exactly what that looks like — found by testing, or
// rather by being shown the actual screenshots). A real chase camera,
// keyed off his own live position, replaces that stretch instead: it can
// never lose him because it's built from the same function that moves him.
const FOLLOW_BLEND = 0.04
const FOLLOW_FOV = 42

/** Continuous 0→1→0 weight for a window, ramping over `blend` at each
 * edge rather than a hard cut — used to combine the spline/orbit/follow
 * camera candidates below as one weighted average instead of three
 * independently-clamped overrides (which is what left a discontinuity at
 * every handoff point the first time this was written). */
function windowWeight(p: number, start: number, end: number, blend: number): number {
  if (p <= start - blend || p >= end + blend) return 0
  if (p < start) return THREE.MathUtils.smoothstep(p, start - blend, start)
  if (p > end) return 1 - THREE.MathUtils.smoothstep(p, end, end + blend)
  return 1
}

export interface SceneSignals {
  worldTime: MotionValue<number>
  windIntensity: MotionValue<number>
  stormIntensity: MotionValue<number>
  rimIntensity: MotionValue<number>
  devotionActive: MotionValue<number>
  thunderTrigger: MotionValue<number>
  /** The same eased progress the camera curve itself reads — Hanuman.tsx
   * samples this to place/orient him, so his position and the camera's
   * framing of him can never drift onto two different domains (see
   * mahadev/TimelineController.tsx's own comment on exactly this bug —
   * gating the devotion freeze below on raw `smoothed` instead of this
   * eased value would reproduce it here). */
  easedProgress: MotionValue<number>
}

/**
 * The director. Moves the camera along the shot spline, grades fog/key/
 * ambient/rim lighting continuously from GRADE_KEYS, keeps the wind/storm
 * tracks in sync with scroll, and owns the devotion freeze — pausing
 * scroll and `worldTime` for one real second when the camera reaches the
 * kneeling close-up, same role as mahadev/TimelineController.tsx's
 * third-eye freeze.
 */
export function TimelineController({ progress, signals }: { progress: MotionValue<number>; signals: SceneSignals }) {
  const { camera } = useThree()
  const posCurve = useMemo(() => buildSpline(SHOTS.map((s) => s.pos)), [])
  const lookCurve = useMemo(() => buildSpline(SHOTS.map((s) => s.look)), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const orbitPos = useMemo(() => new THREE.Vector3(), [])
  const orbitLook = useMemo(() => new THREE.Vector3(), [])
  const orbitCenter = useMemo(() => new THREE.Vector3(...HANUMAN_GROUND), [])
  const followPos = useMemo(() => new THREE.Vector3(), [])
  const followLook = useMemo(() => new THREE.Vector3(), [])
  const followCenter = useMemo(() => new THREE.Vector3(), [])
  const blended = useMemo(() => new THREE.Vector3(), [])
  const blendedLook = useMemo(() => new THREE.Vector3(), [])

  const smoothed = useRef(0)
  const hasTriggeredDevotion = useRef(false)
  const frozen = useRef(false)
  const freezeElapsed = useRef(0)
  const worldTimeAccum = useRef(0)

  const fogColor = useRef(new THREE.Color())
  const keyColor = useRef(new THREE.Color())
  const ambColor = useRef(new THREE.Color())
  const rimColor = useRef(new THREE.Color())
  const gradeColors = useMemo(
    () =>
      GRADE_KEYS.map((k) => ({
        fog: new THREE.Color(k.fog),
        key: new THREE.Color(k.key),
        amb: new THREE.Color(k.amb),
        rim: new THREE.Color(k.rim),
      })),
    [],
  )

  const fogRef = useRef<THREE.FogExp2>(null)
  const bgRef = useRef<THREE.Color>(null)
  const keyLight = useRef<THREE.DirectionalLight>(null)
  const ambientLight = useRef<THREE.AmbientLight>(null)
  const rimLight = useRef<THREE.DirectionalLight>(null)

  // Real Object3D instances added via <primitive> — same reasoning as
  // mahadev/TimelineController.tsx: a DirectionalLight's `target` never
  // updates its matrixWorld unless it's actually in the scene graph.
  const keyTarget = useMemo(() => new THREE.Object3D(), [])
  const rimTarget = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (keyLight.current) keyLight.current.target = keyTarget
    if (rimLight.current) rimLight.current.target = rimTarget
  }, [keyTarget, rimTarget])

  useFrame((state, delta) => {
    const raw = progress.get()
    smoothed.current += (raw - smoothed.current) * Math.min(1, delta * 0.85)
    const p = ease(smoothed.current)
    signals.easedProgress.set(p)

    // --- devotion freeze ----------------------------------------------
    if (!hasTriggeredDevotion.current && p > DEVOTION_T) {
      hasTriggeredDevotion.current = true
      frozen.current = true
      freezeElapsed.current = 0
      lockScroll()
    }
    if (frozen.current) {
      freezeElapsed.current += delta
      if (freezeElapsed.current > FREEZE_DURATION) {
        frozen.current = false
        unlockScroll()
      }
    }
    if (!frozen.current) worldTimeAccum.current += delta
    signals.worldTime.set(worldTimeAccum.current)
    signals.devotionActive.set(hasTriggeredDevotion.current ? 1 : 0)

    // --- camera ----------------------------------------------------------
    const mapped = mapCurveT(p)
    posCurve.getPoint(mapped, pos)
    lookCurve.getPoint(mapped, look)
    const splineFov = sampleFov(p)

    // Orbit candidate — full 360° circle descending from just above his
    // head to chest height.
    const orbitLocal = THREE.MathUtils.clamp((p - ORBIT_START) / (ORBIT_END - ORBIT_START), 0, 1)
    const azimuth = orbitLocal * Math.PI * 2
    const orbitHeight = lerpNum(ORBIT_TOP_Y, ORBIT_BOTTOM_Y, orbitLocal)
    orbitPos.set(orbitCenter.x + Math.cos(azimuth) * ORBIT_RADIUS, orbitCenter.y + orbitHeight, orbitCenter.z + Math.sin(azimuth) * ORBIT_RADIUS)
    orbitLook.set(orbitCenter.x, orbitCenter.y + ORBIT_LOOK_Y, orbitCenter.z)

    // Follow candidate — a chase camera keyed off his own live position
    // through the whole ground-covering "leap" (see terrain.ts's own
    // comment on why it no longer arcs him into the sky), so it can never
    // lose him the way independently-authored shots did. A ground-level
    // chase, widening slightly as he picks up speed rather than the old
    // altitude-scaled offset — there's no altitude to scale against any
    // more.
    hanumanPositionAt(p, followCenter)
    const leapLocal = THREE.MathUtils.clamp((p - LEAP_START_T) / (LEAP_END_T - LEAP_START_T), 0, 1)
    const followDist = 46 + leapLocal * 18
    followPos.set(followCenter.x + followDist * 0.55, followCenter.y + 24, followCenter.z + followDist)
    followLook.set(followCenter.x, followCenter.y + HANUMAN_HEIGHT * 0.45, followCenter.z)

    // Weighted average of all three candidates rather than sequential
    // overrides — see windowWeight's own comment on why: sequential
    // clamped lerps left a visible pop at the exact instant one window's
    // blend reached 1 while the next window's was already ramping in.
    const orbitW = windowWeight(p, ORBIT_START, ORBIT_END, ORBIT_BLEND)
    const followW = windowWeight(p, LEAP_START_T, LEAP_END_T, FOLLOW_BLEND)
    const splineW = Math.max(0, 1 - orbitW - followW)
    const total = orbitW + followW + splineW || 1

    blended.set(0, 0, 0).addScaledVector(pos, splineW / total).addScaledVector(orbitPos, orbitW / total).addScaledVector(followPos, followW / total)
    blendedLook
      .set(0, 0, 0)
      .addScaledVector(look, splineW / total)
      .addScaledVector(orbitLook, orbitW / total)
      .addScaledVector(followLook, followW / total)
    const fov = (splineFov * splineW + ORBIT_FOV * orbitW + FOLLOW_FOV * followW) / total

    const t = state.clock.elapsedTime
    blended.x += Math.sin(t * 0.07) * 0.06
    blended.y += Math.cos(t * 0.05) * 0.04
    camera.position.copy(blended)
    camera.lookAt(blendedLook)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    pos.copy(blended)
    look.copy(blendedLook)

    keyTarget.position.copy(look)
    if (keyLight.current) keyLight.current.position.set(look.x + pos.x * 0.15 + 30, look.y + 60, look.z + pos.z * 0.1 + 20)

    const towardCamera = pos.clone().sub(look)
    const beyond = look.clone().addScaledVector(towardCamera, -0.4)
    rimTarget.position.copy(pos)
    if (rimLight.current) rimLight.current.position.set(beyond.x, beyond.y + 20, beyond.z)

    // --- wind / storm tracks ----------------------------------------------
    const wind = findSegment(p, WIND_KEYS)
    signals.windIntensity.set(lerpNum(WIND_KEYS[wind.i].v, WIND_KEYS[wind.i + 1].v, wind.local))
    const storm = findSegment(p, STORM_KEYS)
    const stormVal = lerpNum(STORM_KEYS[storm.i].v, STORM_KEYS[storm.i + 1].v, storm.local)
    signals.stormIntensity.set(stormVal)

    // --- grade -------------------------------------------------------------
    const grade = findSegment(p, GRADE_KEYS)
    const a = gradeColors[grade.i]
    const b = gradeColors[grade.i + 1]
    fogColor.current.copy(a.fog).lerp(b.fog, grade.local)
    keyColor.current.copy(a.key).lerp(b.key, grade.local)
    ambColor.current.copy(a.amb).lerp(b.amb, grade.local)
    rimColor.current.copy(a.rim).lerp(b.rim, grade.local)
    const keyI = lerpNum(GRADE_KEYS[grade.i].keyI, GRADE_KEYS[grade.i + 1].keyI, grade.local)
    const ambI = lerpNum(GRADE_KEYS[grade.i].ambI, GRADE_KEYS[grade.i + 1].ambI, grade.local)
    const rimI = lerpNum(GRADE_KEYS[grade.i].rimI, GRADE_KEYS[grade.i + 1].rimI, grade.local)
    const fogDensity = lerpNum(GRADE_KEYS[grade.i].fogDensity, GRADE_KEYS[grade.i + 1].fogDensity, grade.local)

    if (fogRef.current) {
      fogRef.current.color.copy(fogColor.current)
      fogRef.current.density = fogDensity
    }
    if (bgRef.current) bgRef.current.copy(fogColor.current)
    if (keyLight.current) {
      keyLight.current.color.copy(keyColor.current)
      keyLight.current.intensity = keyI
    }
    if (ambientLight.current) {
      ambientLight.current.color.copy(ambColor.current)
      ambientLight.current.intensity = ambI
    }
    if (rimLight.current) {
      rimLight.current.color.copy(rimColor.current)
      rimLight.current.intensity = rimI * 1.4
    }
    signals.rimIntensity.set(rimI + (frozen.current ? 0.15 : 0))

    // --- exposure ----------------------------------------------------------
    const exposure = findSegment(p, EXPOSURE_KEYS)
    state.gl.toneMappingExposure = lerpNum(EXPOSURE_KEYS[exposure.i].v, EXPOSURE_KEYS[exposure.i + 1].v, exposure.local)
  })

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={['#0c0d0f', 0.006]} />
      <color ref={bgRef} attach="background" args={['#0c0d0f']} />
      <ambientLight ref={ambientLight} intensity={0.12} />
      <primitive object={keyTarget} />
      <directionalLight ref={keyLight} position={[40, 80, 20]} intensity={0.3} castShadow={false} />
      <primitive object={rimTarget} />
      <directionalLight ref={rimLight} position={[-40, 40, -40]} intensity={0.1} />
    </>
  )
}
