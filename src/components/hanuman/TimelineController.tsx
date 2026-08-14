import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import { lockScroll, unlockScroll } from '@/utils/scrollLock'
import { buildSpline, ease, findSegment, lerpNum } from '@/components/mahadev/timelineMath'
import { SHOTS, sampleFov, mapCurveT, WIND_KEYS, STORM_KEYS } from './cameraShots'
import { DEVOTION_T, FREEZE_DURATION, RAUDRA_T } from './chapters'
import { GRADE_KEYS, EXPOSURE_KEYS } from './hanumanPalette'

// The single "ground responds" impulse for Raudra's one step (terrain.ts's
// hanumanPositionAt moves his feet across this exact same window) — a
// short, sharp camera tremor rather than a sustained shake, so it reads as
// one footfall's worth of impact, not an earthquake.
const STEP_SHAKE_START = RAUDRA_T + 0.02
const STEP_SHAKE_END = RAUDRA_T + 0.09

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
 * The director. Moves the camera along the shot spline (cameraShots.ts),
 * grades fog/key/ambient/rim lighting continuously from GRADE_KEYS, keeps
 * the wind/storm tracks in sync with scroll, owns the devotion freeze, and
 * adds the one physical camera reaction the whole piece has — a brief
 * tremor at Raudra's single step. There is no orbit/follow camera blend
 * any more: that machinery existed only to chase him through the old
 * leap-across-the-ocean arc, which per direction no longer exists — he
 * never leaves the ground, so the plain shot spline is the whole camera
 * path now.
 */
export function TimelineController({ progress, signals }: { progress: MotionValue<number>; signals: SceneSignals }) {
  const { camera } = useThree()
  const posCurve = useMemo(() => buildSpline(SHOTS.map((s) => s.pos)), [])
  const lookCurve = useMemo(() => buildSpline(SHOTS.map((s) => s.look)), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

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
    const fov = sampleFov(p)

    const t = state.clock.elapsedTime
    let shakeX = 0
    let shakeY = 0
    if (p >= STEP_SHAKE_START && p <= STEP_SHAKE_END) {
      const local = (p - STEP_SHAKE_START) / (STEP_SHAKE_END - STEP_SHAKE_START)
      const decay = 1 - local
      shakeX = Math.sin(t * 38) * 0.35 * decay * decay
      shakeY = Math.cos(t * 51) * 0.22 * decay * decay
    }

    camera.position.set(pos.x + Math.sin(t * 0.07) * 0.06 + shakeX, pos.y + Math.cos(t * 0.05) * 0.04 + shakeY, pos.z)
    camera.lookAt(look)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }

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
      {/* castShadow + a shadow camera frustum wide enough to cover the
          ground/rock/mountain cluster around HANUMAN_GROUND (chapters.ts's
          RAUDRA aside, he never actually leaves that spot) — this is what
          actually grounds everything in contact shadow instead of the flat,
          shadowless lighting the scene had before. */}
      <directionalLight ref={keyLight} position={[40, 80, 20]} intensity={0.3} castShadow shadow-mapSize={[2048, 2048]}>
        <orthographicCamera attach="shadow-camera" args={[-160, 160, 160, -20, 10, 420]} />
      </directionalLight>
      <primitive object={rimTarget} />
      <directionalLight ref={rimLight} position={[-40, 40, -40]} intensity={0.1} />
    </>
  )
}
