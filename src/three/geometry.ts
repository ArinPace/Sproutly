import * as THREE from 'three'

const v2 = (x: number, y: number) => new THREE.Vector2(x, y)

function arc(cx: number, cy: number, r: number, a0: number, a1: number, steps = 8) {
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps
    pts.push(v2(cx + Math.cos(a) * r, cy + Math.sin(a) * r))
  }
  return pts
}

/** Lid: rounded top edge with a raised rim around a recessed glass panel. */
export function lidGeometry(r: number, h: number) {
  const b = 0.07
  const pts = [
    v2(0, 0),
    v2(r - 0.015, 0),
    v2(r, 0.015),
    v2(r, h - b),
    ...arc(r - b, h - b, b, 0, Math.PI / 2, 10).slice(1),
    v2(0.8, h),
    ...arc(0.78, h - 0.02, 0.02, Math.PI / 2, Math.PI, 6).slice(1),
    v2(0.76, h - 0.036),
    v2(0, h - 0.036),
  ]
  return new THREE.LatheGeometry(pts, 128)
}

/** Base foot: rounded bottom edge. */
export function footGeometry(r: number, h: number) {
  const b = 0.06
  const pts = [v2(0, 0), v2(r - b, 0), ...arc(r - b, b, b, -Math.PI / 2, 0, 10).slice(1), v2(r, h)]
  return new THREE.LatheGeometry(pts, 128)
}

/** Speaker cone facing up. */
export function coneGeometry(r: number) {
  const pts = [
    v2(0, 0.05),
    v2(0.12 * r, 0.06),
    v2(0.18 * r, 0.03),
    v2(0.7 * r, -0.08),
    ...arc(0.82 * r, -0.08, 0.12 * r, Math.PI, 0, 8).slice(1),
    v2(r, -0.08),
  ]
  return new THREE.LatheGeometry(pts, 96)
}

type PetalOpts = {
  length: number
  width: number
  cup?: number
  bend?: number
  base: string
  tip: string
  pinch?: number
}

/**
 * A single petal/leaf in the XY plane, growing along +Y. Edges curl toward
 * -Z and the tip bends toward +Z, so tilting it around X opens it outward.
 */
export function petalGeometry({ length, width, cup = 0.35, bend = 0.12, base, tip, pinch = 0.14 }: PetalOpts) {
  const g = new THREE.PlaneGeometry(1, 1, 8, 16)
  const pos = g.attributes.position
  const cBase = new THREE.Color(base)
  const cTip = new THREE.Color(tip)
  const col = new THREE.Color()
  const colors = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) * 2
    const v = pos.getY(i) + 0.5
    const w = width * Math.pow(Math.sin(Math.PI * (pinch + (1 - pinch) * v)), 0.8) * (1 - 0.2 * v)
    const x = (u * w) / 2
    const y = v * length
    const z = -cup * u * u * w + bend * v * v * length
    pos.setXYZ(i, x, y, z)
    col.copy(cBase).lerp(cTip, Math.pow(v, 1.4) * (0.75 + 0.25 * Math.abs(u)))
    colors.set([col.r, col.g, col.b], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}
