import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Part from './Part'
import { DIMS } from '../parts'
import { lidGeometry } from '../geometry'
import { chip, controlPanel, growBeam, growLed, growPanel, halo, metal, pcb, ringGlow, statusLed, walnut } from '../materials'
import { getRingColor } from '../../lib/store'

export function Lid() {
  const { y0, y1, r } = DIMS.lid
  const h = y1 - y0
  const geo = useMemo(() => lidGeometry(r, h), [r, h])
  return (
    <Part id="lid">
      <group position-y={y0}>
        <mesh geometry={geo} material={walnut()} />
        <mesh position-y={h - 0.035} rotation-x={-Math.PI / 2} material={controlPanel()}>
          <circleGeometry args={[0.765, 96]} />
        </mesh>
      </group>
    </Part>
  )
}

const CHIPS: [number, number, number, number][] = [
  [0, 0, 0.26, 0.26],
  [0.38, 0.15, 0.14, 0.1],
  [-0.36, 0.2, 0.18, 0.12],
  [-0.2, -0.42, 0.12, 0.12],
  [0.3, -0.36, 0.2, 0.08],
  [0.05, 0.5, 0.1, 0.16],
]

export function Electronics() {
  const { y0, y1, r } = DIMS.electronics
  const h = y1 - y0
  const leds = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2
        return [Math.sin(a) * (r - 0.07), Math.cos(a) * (r - 0.07)] as const
      }),
    [r],
  )
  return (
    <Part id="electronics">
      <group position-y={y0}>
        <mesh position-y={h / 2} material={pcb()}>
          <cylinderGeometry args={[r, r, h, 96]} />
        </mesh>
        {CHIPS.map(([x, z, w, d], i) => (
          <mesh key={i} position={[x, h + 0.012, z]} material={chip()}>
            <boxGeometry args={[w, 0.024, d]} />
          </mesh>
        ))}
        <mesh position={[0, h + 0.026, 0]} material={metal()}>
          <boxGeometry args={[0.2, 0.006, 0.2]} />
        </mesh>
        {[-0.5, 0.52].map((x, i) => (
          <mesh key={i} position={[x, h + 0.04, -0.1]} material={metal()}>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 20]} />
          </mesh>
        ))}
        {leds.map(([x, z], i) => (
          <mesh key={i} position={[x, h + 0.004, z]} material={ringGlow()}>
            <cylinderGeometry args={[0.018, 0.018, 0.008, 12]} />
          </mesh>
        ))}
      </group>
    </Part>
  )
}

const tmp = new THREE.Color()

/** Eases every glowing material toward the current mood colour. */
export function GlowController() {
  useFrame((state, delta) => {
    tmp.set(getRingColor())
    const k = 1 - Math.exp(-delta * 4)
    const glow = ringGlow()
    glow.emissive.lerp(tmp, k)
    glow.emissiveIntensity = 2.3 + Math.sin(state.clock.elapsedTime * 1.1) * 0.35
    halo().color.lerp(tmp, k)
    statusLed().color.copy(glow.emissive).multiplyScalar(2.2)
  })
  return null
}

export function MoodLight(props: { position?: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null!)
  useFrame(() => light.current.color.copy(ringGlow().emissive))
  return <pointLight ref={light} intensity={2.2} distance={3.2} decay={1.6} color="#ffe9c7" {...props} />
}

export function GrowLight() {
  const { y0, y1, r, lightR } = DIMS.grow
  const h = y1 - y0
  const target = useMemo(() => new THREE.Object3D(), [])
  const leds = useMemo(() => {
    const out: [number, number][] = []
    for (let ring = 1; ring <= 5; ring++) {
      const rr = (ring / 5.6) * lightR
      const n = ring * 7
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.4
        out.push([Math.cos(a) * rr, Math.sin(a) * rr])
      }
    }
    return out
  }, [lightR])

  return (
    <Part id="grow">
      <group position-y={y0}>
        <mesh position-y={h / 2} material={walnut()}>
          <cylinderGeometry args={[r, r, h, 128, 1, true]} />
        </mesh>
        <mesh position-y={h} rotation-x={-Math.PI / 2} material={walnut()}>
          <circleGeometry args={[r, 96]} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} material={walnut()}>
          <ringGeometry args={[lightR + 0.03, r, 128]} />
        </mesh>
        <mesh position-y={0.012} rotation-x={Math.PI / 2} material={metal()}>
          <ringGeometry args={[lightR, lightR + 0.03, 128]} />
        </mesh>
        <mesh position-y={0.012} rotation-x={Math.PI / 2} material={growPanel()}>
          <circleGeometry args={[lightR, 96]} />
        </mesh>
        {leds.map(([x, z], i) => (
          <mesh key={i} position={[x, 0.008, z]} material={growLed()}>
            <cylinderGeometry args={[0.022, 0.022, 0.006, 12]} />
          </mesh>
        ))}
        <mesh position-y={-0.95} material={growBeam()} renderOrder={6}>
          <cylinderGeometry args={[lightR, 0.86, 1.9, 64, 1, true]} />
        </mesh>
        <primitive object={target} position={[0, -2, 0]} />
        <spotLight
          target={target}
          position={[0, -0.02, 0]}
          angle={0.9}
          penumbra={0.7}
          intensity={14}
          distance={3}
          decay={1.4}
          color="#fff4e6"
        />
      </group>
    </Part>
  )
}

/** Height of the lit LED strip on the halo ring's walnut core. */
const STRIP = 0.024

export function LightRing() {
  const { y0, y1, r } = DIMS.ring
  const h = y1 - y0

  return (
    <Part id="ring">
      <group position-y={y0}>
        <mesh position-y={h / 2} material={walnut()}>
          <cylinderGeometry args={[r, r, h, 128]} />
        </mesh>
        {[h / 2 - STRIP / 2 - 0.004, h / 2 + STRIP / 2 + 0.004].map((y, i) => (
          <mesh key={i} position-y={y} rotation-x={Math.PI / 2} material={metal()}>
            <torusGeometry args={[r + 0.002, 0.0035, 6, 128]} />
          </mesh>
        ))}
        <mesh position-y={h / 2} material={ringGlow()}>
          <cylinderGeometry args={[r + 0.004, r + 0.004, STRIP, 128, 1, true]} />
        </mesh>
        <mesh position-y={h / 2} material={halo()} renderOrder={5}>
          <cylinderGeometry args={[r + 0.02, r + 0.02, 0.12, 96, 1, true]} />
        </mesh>
        <MoodLight position={[0, -0.25, 0]} />
      </group>
    </Part>
  )
}
