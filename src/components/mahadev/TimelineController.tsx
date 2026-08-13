import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import * as THREE from 'three'
import { lockScroll, unlockScroll } from '@/utils/scrollLock'
import { SHOTS, sampleFov, mapCurveT, STORM_KEYS, SKY_REVEAL_KEYS } from './cameraShots'
import { THIRD_EYE_T, FREEZE_DURATION } from './chapters'
import { EXPOSURE_KEYS, GRADE_KEYS } from './mahadevPalette'
import { buildSpline, ease, findSegment, lerpNum } from './timelineMath'

export interface SceneSignals {
  worldTime: MotionValue<number>
  stormIntensity: MotionValue<number>
  skyReveal: MotionValue<number>
  rimIntensity: MotionValue<number>
  thirdEyeOpen: MotionValue<number>
}

/**
 * The director. Moves the camera along the shot spline, grades fog/key/
 * ambient/rim lighting continuously from GRADE_KEYS, keeps the storm/sky
 * tracks in sync with scroll, and owns the third-eye freeze — pausing
 * scroll and `worldTime` for one real second when the camera reaches the
 * macro close-up, per the brief's "everything becomes silent... the third
 * eye opens very slowly" beat.
 */
export function TimelineController({ progress, signals }: { progress: MotionValue<number>; signals: SceneSignals }) {
  const { camera } = useThree()
  const posCurve = useMemo(() => buildSpline(SHOTS.map((s) => s.pos)), [])
  const lookCurve = useMemo(() => buildSpline(SHOTS.map((s) => s.look)), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])

  const smoothed = useRef(0)
  const hasTriggeredEye = useRef(false)
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

  // Real Object3D instances, added to the scene graph below via <primitive>
  // (not `attach="target"`, which sets the property but skips `.add()`) so
  // their matrixWorld actually updates each frame. A DirectionalLight's
  // `target` defaults to an Object3D that is never added to the scene —
  // its world position silently stays (0,0,0) forever unless you do this.
  // Wiring the lights to follow the camera's own *position* while their
  // targets quietly stayed at the origin (fine in the old page, where
  // Shiva sat at the origin) is exactly what made most of this cave — far
  // from the origin — read as unlit black: found by testing.
  const keyTarget = useMemo(() => new THREE.Object3D(), [])
  const rimTarget = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    if (keyLight.current) keyLight.current.target = keyTarget
    if (rimLight.current) rimLight.current.target = rimTarget
  }, [keyTarget, rimTarget])

  useFrame((state, delta) => {
    const raw = progress.get()
    // A slower catch-up than before (was delta * 1.5) — per direction, the
    // whole journey should feel unhurried; the camera trailing raw scroll
    // input a bit further behind reads as a heavier, more deliberate glide
    // rather than something snapping to wherever the wheel just put it.
    smoothed.current += (raw - smoothed.current) * Math.min(1, delta * 0.85)
    const p = ease(smoothed.current)

    // --- third-eye freeze --------------------------------------------------
    if (!hasTriggeredEye.current && smoothed.current > THIRD_EYE_T) {
      hasTriggeredEye.current = true
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
    signals.thirdEyeOpen.set(hasTriggeredEye.current ? 1 : 0)

    // --- camera --------------------------------------------------------
    const mapped = mapCurveT(p)
    posCurve.getPoint(mapped, pos)
    lookCurve.getPoint(mapped, look)
    const t = state.clock.elapsedTime
    // Lens breathing — a hair of drift so a held shot never looks like a
    // frozen render, not enough to read as handheld shake.
    pos.x += Math.sin(t * 0.09) * 0.05
    pos.y += Math.cos(t * 0.065) * 0.035
    camera.position.copy(pos)
    camera.lookAt(look)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = sampleFov(p)
      camera.updateProjectionMatrix()
    }

    // Both lights are aimed at `look` — what the camera is actually
    // pointed at — rather than the camera's own position or a fixed world
    // point, so whatever is on screen is always the lit side regardless of
    // how far this journey travels from the world origin. The key sits
    // high and slightly camera-side of the subject (moonlight from above);
    // the rim sits beyond the subject on the far side from the camera and
    // aims *back* toward it, the classic backlight arrangement that
    // separates a dark silhouette from the darker void behind it.
    keyTarget.position.copy(look)
    if (keyLight.current) keyLight.current.position.set(look.x + pos.x * 0.15 + 12, look.y + 42, look.z + pos.z * 0.1 + 18)

    const towardCamera = pos.clone().sub(look)
    const beyond = look.clone().addScaledVector(towardCamera, -0.4)
    rimTarget.position.copy(pos)
    if (rimLight.current) rimLight.current.position.set(beyond.x, beyond.y + 14, beyond.z)

    // --- storm / sky tracks ------------------------------------------------
    const storm = findSegment(p, STORM_KEYS)
    const stormVal = lerpNum(STORM_KEYS[storm.i].v, STORM_KEYS[storm.i + 1].v, storm.local)
    signals.stormIntensity.set(stormVal)
    const sky = findSegment(p, SKY_REVEAL_KEYS)
    const skyVal = lerpNum(SKY_REVEAL_KEYS[sky.i].v, SKY_REVEAL_KEYS[sky.i + 1].v, sky.local)
    signals.skyReveal.set(skyVal)

    // --- grade ---------------------------------------------------------
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
    signals.rimIntensity.set(rimI + (frozen.current ? 0.2 : 0))

    // --- overall exposure ------------------------------------------------
    // A steady brighten-as-you-descend curve on top of the light grade
    // above, per direction: the first pass of this grade was moody enough
    // that most of the journey read as simply too dark to see.
    const exposure = findSegment(p, EXPOSURE_KEYS)
    state.gl.toneMappingExposure = lerpNum(EXPOSURE_KEYS[exposure.i].v, EXPOSURE_KEYS[exposure.i + 1].v, exposure.local)
  })

  return (
    <>
      <fogExp2 ref={fogRef} attach="fog" args={['#08090A', 0.005]} />
      <color ref={bgRef} attach="background" args={['#08090A']} />
      <ambientLight ref={ambientLight} intensity={0.22} />
      <primitive object={keyTarget} />
      <directionalLight ref={keyLight} position={[40, 60, 20]} intensity={0.4} castShadow={false} />
      <primitive object={rimTarget} />
      <directionalLight ref={rimLight} position={[-40, 30, -40]} intensity={0.15} />
    </>
  )
}

