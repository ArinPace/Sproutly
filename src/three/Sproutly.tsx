import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Electronics, GlowController, GrowLight, LightRing, Lid, MoodLight } from './parts/Crown'
import { Glass, Plant } from './parts/Chamber'
import { Base, Deck, Reservoir } from './parts/Foundation'
import { DIMS, MODEL_CENTER, PART_IDS, type PartId } from './parts'
import { easeExplode, stepExplode, useExplode } from './useExplode'
import { GLB_URL, useGlbAvailable } from './useGlbAvailable'
import { clearGlass, halo, ringGlow } from './materials'

function Spinner({ children }: { children: ReactNode }) {
  const s = useExplode()
  const ref = useRef<THREE.Group>(null!)
  useFrame((state, delta) => {
    stepExplode(s, state.clock.elapsedTime, delta)
    ref.current.rotation.y = s.spin
  })
  return (
    <group position-y={-MODEL_CENTER}>
      <group ref={ref}>{children}</group>
    </group>
  )
}

function ProceduralSproutly() {
  return (
    <Spinner>
      <Lid />
      <Electronics />
      <LightRing />
      <GrowLight />
      <Glass />
      <Plant />
      <Deck />
      <Reservoir />
      <Base />
    </Spinner>
  )
}

/** Swaps Blender's placeholder materials for the live, mood-reactive ones. */
const MATERIAL_OVERRIDES: Record<string, () => THREE.Material> = {
  SP_RingGlow: ringGlow,
  SP_Halo: halo,
  SP_Glass: clearGlass,
}

function partOf(obj: THREE.Object3D | null): PartId | null {
  while (obj) {
    if ((PART_IDS as string[]).includes(obj.name)) return obj.name as PartId
    obj = obj.parent
  }
  return null
}

function GlbSproutly() {
  const { scene, animations } = useGLTF(GLB_URL)
  const s = useExplode()
  const root = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const name = (mesh.material as THREE.Material)?.name
      const override = name && MATERIAL_OVERRIDES[name]
      if (override) mesh.material = override()
    })
    return clone
  }, [scene])
  const mixer = useMemo(() => new THREE.AnimationMixer(root), [root])
  const duration = useMemo(() => {
    let d = 0
    for (const clip of animations) {
      mixer.clipAction(clip).play()
      d = Math.max(d, clip.duration)
    }
    return d
  }, [animations, mixer])
  useEffect(
    () => () => {
      mixer.stopAllAction()
    },
    [mixer],
  )

  useFrame(() => {
    mixer.setTime(easeExplode(s.current) * duration * 0.9999)
  })

  const handlers = s.interactive
    ? {
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          const id = partOf(e.object)
          if (id) s.onSelect?.(id)
        },
        onPointerOver: () => (document.body.style.cursor = 'pointer'),
        onPointerOut: () => (document.body.style.cursor = ''),
      }
    : {}

  return (
    <Spinner>
      <primitive object={root} {...handlers} />
      <MoodLight position={[0, DIMS.ring.y0 - 0.25, 0]} />
    </Spinner>
  )
}

export default function Sproutly() {
  const glb = useGlbAvailable()
  return (
    <>
      <GlowController />
      {glb === true && <GlbSproutly />}
      {glb === false && <ProceduralSproutly />}
    </>
  )
}
