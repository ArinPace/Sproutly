import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import Part from './Part'
import { DIMS } from '../parts'
import { petalGeometry } from '../geometry'
import { clearGlass, leaf, petal, pod, soil, stem } from '../materials'
import { useExplode } from '../useExplode'
import { isCoarseOrSmall } from '../../lib/store'

const BG = new THREE.Color('#0b0d0c')

export function Glass() {
  const { y0, y1, r } = DIMS.glass
  const h = y1 - y0
  const s = useExplode()
  const low = useMemo(isCoarseOrSmall, [])
  return (
    <Part id="glass">
      <mesh position-y={y0 + h / 2} {...(s.transmission ? {} : { material: clearGlass() })} renderOrder={2}>
        <cylinderGeometry args={[r, r, h, 128, 1, true]} />
        {s.transmission && (
          <MeshTransmissionMaterial
            backside
            backsideThickness={0.05}
            thickness={0.06}
            samples={low ? 3 : 8}
            resolution={low ? 256 : 768}
            roughness={0.03}
            ior={1.3}
            chromaticAberration={0.035}
            anisotropicBlur={0.08}
            distortion={0}
            transmission={1}
            background={BG}
            color="#f7fcff"
          />
        )}
      </mesh>
    </Part>
  )
}

type Ring = { count: number; length: number; width: number; tilt: number; offset: number; r: number; tip: string }

const RINGS: Ring[] = [
  { count: 8, length: 0.56, width: 0.3, tilt: 1.12, offset: 0, r: 0.07, tip: '#a8231f' },
  { count: 8, length: 0.48, width: 0.28, tilt: 0.72, offset: Math.PI / 8, r: 0.06, tip: '#c4302a' },
  { count: 6, length: 0.34, width: 0.22, tilt: 0.34, offset: 0.2, r: 0.04, tip: '#d8463b' },
]

function Bloom() {
  const geos = useMemo(
    () =>
      RINGS.map((ring) =>
        petalGeometry({ length: ring.length, width: ring.width, cup: 0.4, bend: 0.14, base: '#e86a5c', tip: ring.tip }),
      ),
    [],
  )
  const sepal = useMemo(
    () => petalGeometry({ length: 0.22, width: 0.16, cup: 0.3, bend: 0.1, base: '#2f8f4c', tip: '#a8483a' }),
    [],
  )
  return (
    <group>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={`s${i}`} rotation-y={(i / 5) * Math.PI * 2 + 0.3}>
          <mesh geometry={sepal} material={petal()} position-z={0.05} rotation-x={1.75} />
        </group>
      ))}
      {RINGS.map((ring, ri) =>
        Array.from({ length: ring.count }, (_, i) => (
          <group key={`${ri}-${i}`} rotation-y={(i / ring.count) * Math.PI * 2 + ring.offset}>
            <mesh
              geometry={geos[ri]}
              material={petal()}
              position={[0, 0.02 * ri, ring.r]}
              rotation-x={ring.tilt + Math.sin(i * 12.9898 + ri) * 0.06}
            />
          </group>
        )),
      )}
      <mesh position-y={0.09} material={pod()}>
        <cylinderGeometry args={[0.1, 0.075, 0.09, 32]} />
      </mesh>
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2
        return (
          <mesh
            key={`st${i}`}
            position={[Math.sin(a) * 0.115, 0.09, Math.cos(a) * 0.115]}
            rotation={[Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35]}
            material={pod()}
          >
            <cylinderGeometry args={[0.006, 0.006, 0.12, 6]} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Plant() {
  const { y0, bloom } = DIMS.plant
  const sway = useRef<THREE.Group>(null!)
  const stemGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.06, 0.28, 0.02),
      new THREE.Vector3(-0.05, 0.58, -0.02),
      new THREE.Vector3(0.02, bloom - y0 - 0.02, 0),
    ])
    return new THREE.TubeGeometry(curve, 48, 0.026, 12, false)
  }, [bloom, y0])
  const leafGeo = useMemo(
    () => petalGeometry({ length: 0.36, width: 0.16, cup: 0.25, bend: 0.2, base: '#2c7d43', tip: '#4fc46e' }),
    [],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    sway.current.rotation.z = Math.sin(t * 0.6) * 0.025
    sway.current.rotation.x = Math.sin(t * 0.43 + 1) * 0.02
  })

  return (
    <Part id="plant">
      <group position-y={y0}>
        <mesh position-y={0.01} scale={[1, 0.32, 1]} material={soil()}>
          <sphereGeometry args={[0.27, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <group ref={sway}>
          <mesh geometry={stemGeo} material={stem()} />
          <group position={[0.05, 0.26, 0.02]} rotation-y={0.4}>
            <mesh geometry={leafGeo} material={leaf()} rotation-x={1.05} />
          </group>
          <group position={[-0.04, 0.48, -0.01]} rotation-y={Math.PI + 0.2}>
            <mesh geometry={leafGeo} material={leaf()} rotation-x={1.15} scale={0.85} />
          </group>
          <group position-y={bloom - y0}>
            <Bloom />
          </group>
        </group>
      </group>
    </Part>
  )
}
