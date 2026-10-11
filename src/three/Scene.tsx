import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import Sproutly from './Sproutly'
import { AnnotationLayer, LabelProjector } from '../components/Annotation'
import { DIMS, MODEL_CENTER, PART_BY_ID, type PartId } from './parts'
import {
  ExplodeContext,
  TILT_MAX,
  TILT_MIN,
  easeExplode,
  stepExplode,
  useExplode,
  type ExplodeState,
} from './useExplode'
import { radialTexture } from './textures'
import { ringGlow } from './materials'
import { useInView } from '../lib/hooks'
import { isCoarseOrSmall } from '../lib/store'
import styles from './Scene.module.css'

export type SceneMode = 'hero' | 'mood' | 'product'

type Fit = {
  h0: number
  h1: number
  w0: number
  w1: number
  elev: number
  elev1: number
  lookY: number
  x: number
  /** Side-framed (`frame` = 1) layout: shift as a fraction of the viewport. */
  sx?: number
  /** Portrait: assembled height, and downward shift to clear the headline. */
  nh0?: number
  sy?: number
}

const FITS: Record<SceneMode, Fit> = {
  hero: {
    h0: 5.6,
    h1: 10.8,
    w0: 2.9,
    w1: 7.4,
    elev: 0.14,
    elev1: 0.34,
    lookY: 0.1,
    x: 0,
    sx: 0.21,
    nh0: 6.8,
    sy: 0.05,
  },
  mood: { h0: 4.7, h1: 7.6, w0: 2.7, w1: 6.4, elev: 0.1, elev1: 0.1, lookY: 0.1, x: 0 },
  product: { h0: 5.1, h1: 10.6, w0: 2.8, w1: 8.2, elev: 0.16, elev1: 0.3, lookY: 0, x: 0 },
}

/** Must match the `min-aspect-ratio` breakpoint in Home.module.css. */
const WIDE_ASPECT = 1.05

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const camTarget = new THREE.Vector3()

function Rig({ fit, wrap }: { fit: Fit; wrap: RefObject<HTMLDivElement | null> }) {
  const s = useExplode()
  const camera = useThree((st) => st.camera) as THREE.PerspectiveCamera
  const size = useThree((st) => st.size)
  const last = useRef(-1)
  const first = useRef(true)
  const frame = useRef(-1)
  const offset = useRef({ x: Infinity, y: Infinity })

  useFrame((state, delta) => {
    stepExplode(s, state.clock.elapsedTime, delta)
    const e = easeExplode(s.current)
    const dt = Math.min(delta, 0.1)
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const aspect = size.width / Math.max(1, size.height)
    const wide = aspect > WIDE_ASPECT

    frame.current = frame.current < 0 ? s.frame : frame.current + (s.frame - frame.current) * (1 - Math.exp(-dt * 3))
    const f = frame.current
    const h = lerp(!wide && fit.nh0 ? lerp(fit.h0, fit.nh0, f) : fit.h0, fit.h1, e)
    const w = lerp(fit.w0, fit.w1, e)
    const d = Math.max(h / (2 * tan), w / (2 * tan * aspect))
    const angle = Math.atan(lerp(fit.elev, fit.elev1, e)) + s.tilt
    camTarget.set(
      fit.x + state.pointer.x * 0.35,
      Math.sin(angle) * d + state.pointer.y * 0.2,
      Math.cos(angle) * d,
    )
    if (first.current) {
      camera.position.copy(camTarget)
      first.current = false
    } else {
      camera.position.lerp(camTarget, 1 - Math.exp(-dt * (s.dragging ? 10 : 4)))
    }
    camera.lookAt(0, fit.lookY, 0)

    const ox = wide ? -(fit.sx ?? 0) * f * size.width : 0
    const oy = wide ? 0 : -(fit.sy ?? 0) * f * size.height
    if (Math.abs(ox - offset.current.x) > 0.5 || Math.abs(oy - offset.current.y) > 0.5) {
      offset.current = { x: ox, y: oy }
      camera.setViewOffset(size.width, size.height, ox, oy, size.width, size.height)
    }

    if (Math.abs(last.current - e) > 0.001) {
      last.current = e
      wrap.current?.style.setProperty('--explode', e.toFixed(3))
    }
  })
  return null
}

function Floor() {
  const s = useExplode()
  const ref = useRef<THREE.Group>(null!)
  const pool = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        alphaMap: radialTexture(),
        transparent: true,
        depthWrite: false,
        opacity: 0.22,
        toneMapped: false,
      }),
    [],
  )
  useFrame((state, delta) => {
    stepExplode(s, state.clock.elapsedTime, delta)
    ref.current.position.y = DIMS.base.y0 - MODEL_CENTER + PART_BY_ID.base.offset * easeExplode(s.current) - 0.002
    pool.color.copy(ringGlow().emissive)
  })
  return (
    <group ref={ref}>
      <ContactShadows opacity={0.75} scale={5} blur={2.4} far={2.2} resolution={512} color="#000000" />
      <mesh rotation-x={-Math.PI / 2} material={pool} position-y={0.004}>
        <planeGeometry args={[4.6, 4.6]} />
      </mesh>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3.5, 5, 4]} intensity={2.2} color="#fff1dc" />
      <directionalLight position={[-4, 2, -3]} intensity={1.4} color="#bfe8ff" />
      <spotLight position={[0, 8, 2]} angle={0.5} penumbra={1} intensity={12} color="#ffffff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 5, -5]} scale={[10, 2, 1]} />
        <Lightformer
          form="rect"
          intensity={3}
          position={[-5, 1, 2]}
          rotation-y={Math.PI / 2}
          scale={[1.4, 7, 1]}
          color="#ffe9c7"
        />
        <Lightformer form="rect" intensity={2} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[1, 7, 1]} />
        <Lightformer form="ring" intensity={1.4} position={[0, 3, 5]} scale={2.5} />
      </Environment>
    </>
  )
}

type Props = {
  state: ExplodeState
  mode: SceneMode
  selected?: PartId | null
  labels?: boolean
  className?: string
}

/** Drag sideways to spin (a flick keeps it going), drag up and down to tilt. */
function useDragSpin(wrap: RefObject<HTMLDivElement | null>, s: ExplodeState) {
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    let id = -1
    let lastX = 0
    let lastY = 0
    let lastT = 0
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return
      id = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
      lastT = performance.now()
      s.dragging = true
      s.spinVel = 0
      el.dataset.dragging = ''
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      const now = performance.now()
      const da = (e.clientX - lastX) * 0.009
      s.spin += da
      s.spinVel = s.spinVel * 0.3 + (da / Math.max(0.008, (now - lastT) / 1000)) * 0.7
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
        s.tilt = THREE.MathUtils.clamp(s.tilt + (e.clientY - lastY) * 0.006, TILT_MIN, TILT_MAX)
      }
      lastX = e.clientX
      lastY = e.clientY
      lastT = now
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return
      id = -1
      s.dragging = false
      if (performance.now() - lastT > 90) s.spinVel = 0
      s.spinVel = THREE.MathUtils.clamp(s.spinVel, -9, 9)
      delete el.dataset.dragging
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [wrap, s])
}

export default function SceneCanvas({ state, mode, selected = null, labels = true, className }: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  useDragSpin(wrap, state)
  const labelRefs = useRef<(HTMLDivElement | null)[]>([])
  const inView = useInView(wrap, '150px')
  const [ready, setReady] = useState(false)
  const low = useMemo(isCoarseOrSmall, [])
  const opaque = mode === 'product'

  return (
    <div ref={wrap} className={`${styles.wrap} ${className ?? ''}`} data-ready={ready || undefined}>
      <Canvas
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, low ? 1.5 : 2]}
        camera={{ fov: 30, near: 0.1, far: 100, position: [0, 1, 12] }}
        gl={{ antialias: true, alpha: !opaque, powerPreference: 'high-performance' }}
        onCreated={() => requestAnimationFrame(() => setReady(true))}
      >
        <ExplodeContext.Provider value={state}>
          {opaque && <color attach="background" args={['#0b0d0c']} />}
          <Rig fit={FITS[mode]} wrap={wrap} />
          <Lights />
          <Suspense fallback={null}>
            <Sproutly />
          </Suspense>
          {labels && <LabelProjector labels={labelRefs} />}
          <Floor />
          {opaque && !low && (
            <EffectComposer multisampling={4}>
              <Bloom mipmapBlur luminanceThreshold={1} intensity={0.9} radius={0.7} />
            </EffectComposer>
          )}
        </ExplodeContext.Provider>
      </Canvas>
      {labels && (
        <AnnotationLayer
          labels={labelRefs}
          selected={selected}
          onSelect={state.interactive ? state.onSelect : undefined}
        />
      )}
      <div className={styles.loader} aria-hidden>
        <span />
      </div>
    </div>
  )
}
