import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import Part from './Part'
import { DIMS } from '../parts'
import { coneGeometry, footGeometry } from '../geometry'
import { createDisplayTexture } from '../textures'
import {
  blackGloss,
  chip,
  claySide,
  grille,
  metal,
  perlite,
  ringGlow,
  soil,
  soilSide,
  statusLed,
  tank,
  walnut,
  walnutInner,
  water,
} from '../materials'

function soilSurface(r: number) {
  const g = new THREE.RingGeometry(0.001, r, 96, 24)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const d = Math.hypot(x, y) / r
    const lumps = Math.sin(x * 23.1 + y * 7.3) * Math.cos(y * 19.7 - x * 5.1) * 0.006
    const grain = (Math.sin(x * 97.3) * Math.sin(y * 89.1)) * 0.0025
    pos.setZ(i, 0.028 * (1 - d * d) + (lumps + grain) * (1 - d * 0.6))
  }
  g.computeVertexNormals()
  return g
}

export function Deck() {
  const { y0, y1, r, soilR, floorH, drainH, soilH } = DIMS.deck
  const h = y1 - y0
  const top = floorH + drainH + soilH
  const surface = useMemo(() => soilSurface(soilR), [soilR])
  const pebbles = useMemo(() => {
    const out: [number, number, number, number][] = []
    let s = 11
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    while (out.length < 46) {
      const a = rand() * Math.PI * 2
      const d = Math.sqrt(rand()) * (soilR - 0.06)
      if (d < 0.2) continue
      const t = d / soilR
      out.push([Math.cos(a) * d, 0.028 * (1 - t * t), Math.sin(a) * d, 0.008 + rand() * 0.012])
    }
    return out
  }, [soilR])

  return (
    <Part id="deck">
      <group position-y={y0}>
        <mesh position-y={h / 2} material={walnut()}>
          <cylinderGeometry args={[r, r, h, 128, 1, true]} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} material={walnut()}>
          <circleGeometry args={[r, 96]} />
        </mesh>
        <mesh position-y={h} rotation-x={-Math.PI / 2} material={walnut()}>
          <ringGeometry args={[soilR, r, 128]} />
        </mesh>
        <mesh position-y={(top + h) / 2} material={walnutInner()}>
          <cylinderGeometry args={[soilR, soilR, h - top, 128, 1, true]} />
        </mesh>
        <mesh position-y={floorH + drainH / 2} material={claySide()}>
          <cylinderGeometry args={[soilR - 0.001, soilR - 0.001, drainH, 128, 1, true]} />
        </mesh>
        <mesh position-y={floorH + drainH + soilH / 2} material={soilSide()}>
          <cylinderGeometry args={[soilR - 0.001, soilR - 0.001, soilH, 128, 1, true]} />
        </mesh>
        <mesh position-y={top} rotation-x={-Math.PI / 2} geometry={surface} material={soil()} />
        {pebbles.map(([x, y, z, s], i) => (
          <mesh key={i} position={[x, top + y, z]} scale={[s, s * 0.7, s]} material={perlite()}>
            <icosahedronGeometry args={[1, 0]} />
          </mesh>
        ))}
        <mesh position={[0, h - 0.07, r + 0.002]} material={statusLed()}>
          <boxGeometry args={[0.06, 0.012, 0.004]} />
        </mesh>
        {[
          [0.42, 0.18],
          [-0.36, -0.3],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position-y={-0.05} material={metal()}>
              <cylinderGeometry args={[0.012, 0.006, 0.1, 10]} />
            </mesh>
            <mesh position-y={-0.004} material={chip()}>
              <boxGeometry args={[0.07, 0.008, 0.04]} />
            </mesh>
          </group>
        ))}
      </group>
    </Part>
  )
}

export function Reservoir() {
  const { y0, y1, r } = DIMS.reservoir
  const h = y1 - y0
  const tube = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.3, 0.2, 0.12),
      new THREE.Vector3(0.3, h + 0.08, 0.12),
      new THREE.Vector3(0.12, h + 0.18, 0.05),
      new THREE.Vector3(0, h + 0.24, 0),
    ])
    return new THREE.TubeGeometry(curve, 40, 0.018, 10, false)
  }, [h])
  const waterH = 0.32
  return (
    <Part id="reservoir">
      <group position-y={y0}>
        <mesh position-y={h / 2} material={tank()} renderOrder={3}>
          <cylinderGeometry args={[r, r, h, 96, 1, true]} />
        </mesh>
        <mesh position-y={0.002} rotation-x={-Math.PI / 2} material={tank()}>
          <circleGeometry args={[r, 96]} />
        </mesh>
        <mesh position-y={h} rotation-x={Math.PI / 2} material={metal()}>
          <torusGeometry args={[r, 0.012, 8, 96]} />
        </mesh>
        <mesh position-y={waterH / 2 + 0.01} material={water()} renderOrder={4}>
          <cylinderGeometry args={[r - 0.025, r - 0.025, waterH, 96]} />
        </mesh>
        <mesh position={[0.3, 0.12, 0.12]} material={chip()}>
          <boxGeometry args={[0.18, 0.16, 0.18]} />
        </mesh>
        <mesh position={[0.3, 0.22, 0.12]} material={metal()}>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 20]} />
        </mesh>
        <mesh geometry={tube}>
          <meshPhysicalMaterial color="#e8f4ef" roughness={0.2} transparent opacity={0.75} />
        </mesh>
        <group position={[-0.42, 0, 0.24]}>
          <mesh position-y={h / 2} material={metal()}>
            <cylinderGeometry args={[0.008, 0.008, h, 8]} />
          </mesh>
          <mesh position-y={waterH + 0.01} rotation-x={Math.PI / 2} material={chip()}>
            <torusGeometry args={[0.03, 0.012, 8, 20]} />
          </mesh>
          <mesh position-y={h + 0.01} material={ringGlow()}>
            <sphereGeometry args={[0.014, 12, 8]} />
          </mesh>
        </group>
      </group>
    </Part>
  )
}

export function Base() {
  const { y1, r } = DIMS.base
  const { y: screenY, h: screenH, arc } = DIMS.screen
  const footH = 0.08
  const foot = useMemo(() => footGeometry(r, footH), [r])
  const cone = useMemo(() => coneGeometry(0.52), [])
  const sideH = y1 - footH

  const { mat, draw } = useMemo(() => {
    const display = createDisplayTexture()
    const m = new THREE.MeshPhysicalMaterial({
      color: '#030303',
      roughness: 0.12,
      metalness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: display.tex,
      emissiveIntensity: 1.25,
    })
    return { mat: m, draw: display.draw }
  }, [])
  useEffect(() => {
    const id = window.setInterval(draw, 1000)
    return () => window.clearInterval(id)
  }, [draw])

  return (
    <Part id="base">
      <mesh geometry={foot} material={walnut()} />
      <mesh position-y={footH + sideH / 2} material={grille()}>
        <cylinderGeometry args={[r, r, sideH, 160, 1, true]} />
      </mesh>
      <mesh position-y={screenY} material={blackGloss()}>
        <cylinderGeometry args={[r + 0.003, r + 0.003, screenH + 0.04, 64, 1, true, -(arc + 0.05) / 2, arc + 0.05]} />
      </mesh>
      <mesh position-y={screenY} material={mat}>
        <cylinderGeometry args={[r + 0.005, r + 0.005, screenH, 64, 1, true, -arc / 2, arc]} />
      </mesh>
      <mesh position-y={y1} rotation-x={-Math.PI / 2} material={walnut()}>
        <ringGeometry args={[0.955, r, 128]} />
      </mesh>
      <mesh position-y={y1 - 0.06}>
        <cylinderGeometry args={[0.955, 0.955, 0.12, 128, 1, true]} />
        <meshStandardMaterial color="#120a07" roughness={0.9} side={THREE.BackSide} />
      </mesh>
      <mesh position-y={y1 - 0.12} rotation-x={-Math.PI / 2} material={chip()}>
        <circleGeometry args={[0.955, 96]} />
      </mesh>
      <mesh position-y={y1 - 0.06} geometry={cone}>
        <meshStandardMaterial color="#141414" roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh position-y={y1 - 0.015} material={metal()} scale={[1, 0.45, 1]}>
        <sphereGeometry args={[0.1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </Part>
  )
}
