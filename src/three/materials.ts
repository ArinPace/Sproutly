import * as THREE from 'three'
import { beamTexture, controlPanelTexture, grilleTextures, haloTexture, soilTextures, woodTexture } from './textures'

const cache = new Map<string, THREE.Material>()

function cached<T extends THREE.Material>(key: string, make: () => T): T {
  let m = cache.get(key) as T | undefined
  if (!m) {
    m = make()
    cache.set(key, m)
  }
  return m
}

export const walnut = () =>
  cached(
    'walnut',
    () =>
      new THREE.MeshPhysicalMaterial({
        map: woodTexture('walnut', 1),
        roughness: 0.48,
        envMapIntensity: 1.5,
        clearcoat: 0.55,
        clearcoatRoughness: 0.35,
        sheen: 0.25,
        sheenColor: new THREE.Color('#a8664a'),
      }),
  )

export const walnutInner = () =>
  cached('walnutInner', () => {
    const m = walnut().clone()
    m.side = THREE.BackSide
    return m
  })

export const deckWood = () =>
  cached(
    'deck',
    () =>
      new THREE.MeshPhysicalMaterial({
        map: woodTexture('deck', 2),
        roughness: 0.7,
        clearcoat: 0.15,
      }),
  )

export const grille = () =>
  cached('grille', () => {
    const { map, bump } = grilleTextures()
    return new THREE.MeshPhysicalMaterial({
      map,
      bumpMap: bump,
      bumpScale: 1.2,
      roughness: 0.62,
      envMapIntensity: 1.6,
      clearcoat: 0.25,
      clearcoatRoughness: 0.5,
    })
  })

export const blackGloss = () =>
  cached(
    'blackGloss',
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#060707',
        roughness: 0.18,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      }),
  )

export const smokedGlass = () =>
  cached(
    'smoked',
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#17130f',
        roughness: 0.08,
        metalness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        reflectivity: 0.8,
      }),
  )

export const clearGlass = () =>
  cached(
    'clearGlass',
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#f4fbff',
        roughness: 0.04,
        metalness: 0,
        transparent: true,
        opacity: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 2.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
  )

export const pcb = () =>
  cached('pcb', () => new THREE.MeshStandardMaterial({ color: '#0d2219', roughness: 0.55, metalness: 0.2 }))

export const chip = () =>
  cached('chip', () => new THREE.MeshStandardMaterial({ color: '#0a0b0b', roughness: 0.35, metalness: 0.4 }))

export const metal = () =>
  cached('metal', () => new THREE.MeshStandardMaterial({ color: '#b9b4ab', roughness: 0.25, metalness: 1 }))

export const soil = () =>
  cached('soil', () => {
    const { map, bump } = soilTextures()
    return new THREE.MeshStandardMaterial({ color: '#8f7462', map, bumpMap: bump, bumpScale: 3, roughness: 0.95 })
  })

/** Same soil textures, re-tiled for the long, short wrap around a cylinder side. */
function sideTiled<T extends THREE.MeshStandardMaterial>(m: T, rx: number, ry: number) {
  const out = m.clone() as T
  for (const key of ['map', 'bumpMap'] as const) {
    const t = m[key]
    if (!t) continue
    const c = t.clone()
    c.repeat.set(rx, ry)
    c.needsUpdate = true
    out[key] = c
  }
  return out
}

export const soilSide = () => cached('soilSide', () => sideTiled(soil(), 9, 0.45))

export const claySide = () => cached('claySide', () => sideTiled(clayPebbles(), 14, 0.2))

export const clayPebbles = () =>
  cached('clayPebbles', () => {
    const { map, bump } = soilTextures()
    return new THREE.MeshStandardMaterial({
      color: '#c8835a',
      map,
      bumpMap: bump,
      bumpScale: 6,
      roughness: 0.9,
    })
  })

export const growPanel = () =>
  cached(
    'growPanel',
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff6ea').multiplyScalar(1.6), toneMapped: false }),
  )

export const growBeam = () =>
  cached(
    'growBeam',
    () =>
      new THREE.MeshBasicMaterial({
        color: '#fff3e2',
        alphaMap: beamTexture(),
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
  )

export const growLed = () =>
  cached(
    'growLed',
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(3), toneMapped: false }),
  )

export const perlite = () =>
  cached('perlite', () => new THREE.MeshStandardMaterial({ color: '#e9e5d8', roughness: 0.85 }))

export const controlPanel = () =>
  cached(
    'controlPanel',
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#120f0c',
        roughness: 0.08,
        metalness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        emissive: new THREE.Color('#ffffff'),
        emissiveMap: controlPanelTexture(),
        emissiveIntensity: 1.1,
      }),
  )

export const water = () =>
  cached(
    'water',
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#7fd7ff',
        roughness: 0.05,
        transparent: true,
        opacity: 0.35,
        clearcoat: 1,
        depthWrite: false,
      }),
  )

export const tank = () =>
  cached(
    'tank',
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#dfeee9',
        roughness: 0.2,
        transparent: true,
        opacity: 0.22,
        clearcoat: 1,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
  )

export const stem = () =>
  cached('stem', () => new THREE.MeshPhysicalMaterial({ color: '#3fae5c', roughness: 0.45, sheen: 0.6, sheenColor: new THREE.Color('#9dffb8') }))

export const leaf = () =>
  cached(
    'leaf',
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#2f8f4c',
        roughness: 0.5,
        sheen: 0.8,
        sheenColor: new THREE.Color('#aaffc4'),
        side: THREE.DoubleSide,
      }),
  )

export const petal = () =>
  cached(
    'petal',
    () =>
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.55,
        sheen: 0.3,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color('#ff6e5e'),
        envMapIntensity: 0.6,
        side: THREE.DoubleSide,
      }),
  )

export const pod = () =>
  cached('pod', () => new THREE.MeshStandardMaterial({ color: '#d9c45a', roughness: 0.6 }))

/** Emissive material that the light ring + LEDs recolour every frame. */
export const ringGlow = () =>
  cached(
    'ringGlow',
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: new THREE.Color('#ffe9c7'),
        emissiveIntensity: 2.2,
        roughness: 0.4,
        toneMapped: false,
      }),
  )

export const halo = () =>
  cached(
    'halo',
    () =>
      new THREE.MeshBasicMaterial({
        alphaMap: haloTexture(),
        color: new THREE.Color('#ffe9c7'),
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        opacity: 0.4,
      }),
  )

export const statusLed = () =>
  cached(
    'statusLed',
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff').multiplyScalar(2.5), toneMapped: false }),
  )
