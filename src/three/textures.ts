import * as THREE from 'three'

const cache = new Map<string, THREE.Texture>()

function cached<T extends THREE.Texture>(key: string, make: () => T): T {
  let t = cache.get(key) as T | undefined
  if (!t) {
    t = make()
    cache.set(key, t)
  }
  return t
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** Value noise that tiles horizontally every `period` lattice cells. */
function noise(x: number, y: number, period: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const x0 = ((xi % period) + period) % period
  const x1 = (x0 + 1) % period
  const a = hash(x0, yi)
  const b = hash(x1, yi)
  const c = hash(x0, yi + 1)
  const d = hash(x1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function fbm(x: number, y: number, period: number) {
  let sum = 0
  let amp = 0.5
  let p = period
  for (let i = 0; i < 4; i++) {
    sum += noise(x, y, p) * amp
    x *= 2
    y *= 2
    p *= 2
    amp *= 0.5
  }
  return sum
}

type Rgb = [number, number, number]
const hex = (h: string): Rgb => {
  const c = new THREE.Color(h)
  return [c.r * 255, c.g * 255, c.b * 255]
}
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
]

export type WoodTone = 'walnut' | 'deck'

const TONES: Record<WoodTone, { dark: string; mid: string; light: string }> = {
  walnut: { dark: '#3b1c10', mid: '#6b3520', light: '#9a5634' },
  deck: { dark: '#3d3024', mid: '#665140', light: '#94795f' },
}

function paintWood(ctx: CanvasRenderingContext2D, w: number, h: number, tone: WoodTone, seed: number) {
  const { dark, mid, light } = TONES[tone]
  const cd = hex(dark)
  const cm = hex(mid)
  const cl = hex(light)
  const img = ctx.createImageData(w, h)
  const period = 6
  for (let y = 0; y < h; y++) {
    const vy = y / h
    for (let x = 0; x < w; x++) {
      const ux = (x / w) * period
      const warp = fbm(ux, vy * 3 + seed, period) * 2.2
      const t = vy * 26 + warp * 3.5
      const ring = Math.pow(Math.abs(Math.sin(t * Math.PI)), 0.45)
      const streak = noise(ux * 40, vy * 900 + seed * 7, period * 40)
      const blot = fbm(ux * 2, vy * 6 + seed * 3, period * 2)
      let c = mix(cd, cm, ring)
      c = mix(c, cl, Math.max(0, blot - 0.45) * 1.4)
      const k = 0.82 + streak * 0.3
      const i = (y * w + x) * 4
      img.data[i] = Math.min(255, c[0] * k)
      img.data[i + 1] = Math.min(255, c[1] * k)
      img.data[i + 2] = Math.min(255, c[2] * k)
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function finish(tex: THREE.Texture, color = true) {
  if (color) tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

export function woodTexture(tone: WoodTone = 'walnut', seed = 1) {
  return cached(`wood-${tone}-${seed}`, () => {
    const [c, ctx] = canvas(512, 512)
    paintWood(ctx, 512, 512, tone, seed)
    return finish(new THREE.CanvasTexture(c))
  })
}

const GRILLE_W = 1024
const GRILLE_H = 128
const GRILLE_STEP = 4

/** Walnut with a perforated speaker pattern (colour) plus its bump map. */
export function grilleTextures() {
  const map = cached('grille-map', () => {
    const [c, ctx] = canvas(GRILLE_W, GRILLE_H)
    paintWood(ctx, GRILLE_W, GRILLE_H, 'walnut', 4)
    ctx.fillStyle = 'rgba(14, 6, 3, 0.7)'
    for (let y = GRILLE_STEP; y < GRILLE_H - GRILLE_STEP; y += GRILLE_STEP) {
      const off = (y / GRILLE_STEP) % 2 ? GRILLE_STEP / 2 : 0
      for (let x = off; x < GRILLE_W; x += GRILLE_STEP) {
        ctx.beginPath()
        ctx.arc(x, y, 1.05, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    return finish(new THREE.CanvasTexture(c))
  })
  const bump = cached('grille-bump', () => {
    const [c, ctx] = canvas(GRILLE_W, GRILLE_H)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, GRILLE_W, GRILLE_H)
    ctx.fillStyle = '#000'
    for (let y = GRILLE_STEP; y < GRILLE_H - GRILLE_STEP; y += GRILLE_STEP) {
      const off = (y / GRILLE_STEP) % 2 ? GRILLE_STEP / 2 : 0
      for (let x = off; x < GRILLE_W; x += GRILLE_STEP) {
        ctx.beginPath()
        ctx.arc(x, y, 1.1, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    return finish(new THREE.CanvasTexture(c), false)
  })
  return { map, bump }
}

/** Soft vertical falloff used for additive glow halos. */
export function haloTexture() {
  return cached('halo', () => {
    const [c, ctx] = canvas(4, 256)
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(0.42, 'rgba(90,90,90,1)')
    g.addColorStop(0.5, 'rgba(255,255,255,1)')
    g.addColorStop(0.58, 'rgba(90,90,90,1)')
    g.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 256)
    return finish(new THREE.CanvasTexture(c), false)
  })
}

/** Radial glow for floor light pools. */
export function radialTexture() {
  return cached('radial', () => {
    const [c, ctx] = canvas(256, 256)
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.3, 'rgba(110,110,110,1)')
    g.addColorStop(0.8, 'rgba(0,0,0,1)')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return finish(new THREE.CanvasTexture(c), false)
  })
}

/** Vertical falloff for the grow-light beam: bright at the panel, gone by the soil. */
export function beamTexture() {
  return cached('beam', () => {
    const [c, ctx] = canvas(8, 256)
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.35, 'rgba(120,120,120,1)')
    g.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 8, 256)
    return finish(new THREE.CanvasTexture(c), false)
  })
}

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const SOIL = 512

/** Potting soil: crumbly dark loam with perlite and bark flecks (colour + bump). */
export function soilTextures() {
  const map = cached('soil-map', () => {
    const [c, ctx] = canvas(SOIL, SOIL)
    const img = ctx.createImageData(SOIL, SOIL)
    const dark: Rgb = [22, 14, 9]
    const mid: Rgb = [52, 34, 22]
    const light: Rgb = [84, 58, 38]
    for (let y = 0; y < SOIL; y++) {
      for (let x = 0; x < SOIL; x++) {
        const u = (x / SOIL) * 16
        const v = (y / SOIL) * 16
        const clump = fbm(u, v, 16)
        const grain = noise(u * 9, v * 9, 144)
        let col = mix(dark, mid, Math.min(1, clump * 1.4))
        col = mix(col, light, Math.max(0, grain - 0.62) * 2)
        const k = 0.75 + grain * 0.45
        const i = (y * SOIL + x) * 4
        img.data[i] = col[0] * k
        img.data[i + 1] = col[1] * k
        img.data[i + 2] = col[2] * k
        img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    const r = rng(7)
    for (let n = 0; n < 900; n++) {
      ctx.fillStyle = `rgba(${150 + r() * 40}, ${100 + r() * 30}, ${60 + r() * 20}, ${0.5 + r() * 0.4})`
      ctx.save()
      ctx.translate(r() * SOIL, r() * SOIL)
      ctx.rotate(r() * Math.PI)
      ctx.fillRect(0, 0, 2 + r() * 6, 1 + r() * 1.5)
      ctx.restore()
    }
    for (let n = 0; n < 420; n++) {
      ctx.fillStyle = `rgba(232, 228, 214, ${0.55 + r() * 0.4})`
      ctx.beginPath()
      ctx.arc(r() * SOIL, r() * SOIL, 0.8 + r() * 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
    const t = finish(new THREE.CanvasTexture(c))
    t.repeat.set(2, 2)
    return t
  })
  const bump = cached('soil-bump', () => {
    const [c, ctx] = canvas(SOIL, SOIL)
    const img = ctx.createImageData(SOIL, SOIL)
    for (let y = 0; y < SOIL; y++) {
      for (let x = 0; x < SOIL; x++) {
        const u = (x / SOIL) * 16
        const v = (y / SOIL) * 16
        const h = fbm(u * 3, v * 3, 48) * 0.6 + noise(u * 12, v * 12, 192) * 0.4
        const i = (y * SOIL + x) * 4
        img.data[i] = img.data[i + 1] = img.data[i + 2] = h * 255
        img.data[i + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    const t = finish(new THREE.CanvasTexture(c), false)
    t.repeat.set(2, 2)
    return t
  })
  return { map, bump }
}

/** Touch control panel printed under the crown's smoked glass (emissive). */
export function controlPanelTexture() {
  return cached('control-panel', () => {
    const S = 1024
    const C = S / 2
    const [c, ctx] = canvas(S, S)
    const GLOW = '#ffe9c7'
    const DIM = 'rgba(255, 233, 199, 0.38)'
    const FAINT = 'rgba(255, 233, 199, 0.14)'
    const GREEN = '#7cffb2'
    const mono = (w: number, px: number) => `${w} ${px}px "JetBrains Mono", ui-monospace, monospace`
    const paint = () => {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, S, S)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Volume arc
      const R = 420
      const a0 = Math.PI * 0.75
      const a1 = Math.PI * 2.25
      const vol = 0.62
      ctx.lineWidth = 10
      ctx.strokeStyle = FAINT
      ctx.beginPath()
      ctx.arc(C, C, R, a0, a1)
      ctx.stroke()
      ctx.strokeStyle = GLOW
      ctx.beginPath()
      ctx.arc(C, C, R, a0, a0 + (a1 - a0) * vol)
      ctx.stroke()
      const ak = a0 + (a1 - a0) * vol
      ctx.fillStyle = GLOW
      ctx.beginPath()
      ctx.arc(C + Math.cos(ak) * R, C + Math.sin(ak) * R, 18, 0, Math.PI * 2)
      ctx.fill()
      for (let i = 0; i <= 20; i++) {
        const a = a0 + ((a1 - a0) * i) / 20
        ctx.strokeStyle = i / 20 <= vol ? DIM : FAINT
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(C + Math.cos(a) * (R - 34), C + Math.sin(a) * (R - 34))
        ctx.lineTo(C + Math.cos(a) * (R - 50), C + Math.sin(a) * (R - 50))
        ctx.stroke()
      }
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = DIM
      ctx.font = mono(400, 26)
      ctx.fillText('VOL 62', C, C + R - 6)

      // Now playing + transport
      ctx.font = mono(400, 24)
      ctx.fillText('NOW PLAYING', C, C - 150)
      ctx.fillStyle = GLOW
      ctx.font = mono(500, 34)
      ctx.fillText('Rain on glass', C, C - 108)

      ctx.strokeStyle = GLOW
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.arc(C, C, 72, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = GLOW
      ctx.fillRect(C - 24, C - 30, 15, 60)
      ctx.fillRect(C + 9, C - 30, 15, 60)

      const skip = (x: number, dir: 1 | -1) => {
        ctx.beginPath()
        ctx.moveTo(x - 18 * dir, C - 22)
        ctx.lineTo(x + 12 * dir, C)
        ctx.lineTo(x - 18 * dir, C + 22)
        ctx.closePath()
        ctx.fill()
        ctx.fillRect(dir > 0 ? x + 14 : x - 20, C - 22, 6, 44)
      }
      skip(C + 160, 1)
      skip(C - 160, -1)

      // Corner controls: alarm, mood light, plant, water
      const icon = (a: number, label: string, value: string, color: string, drawIcon: (x: number, y: number) => void) => {
        const x = C + Math.cos(a) * 250
        const y = C + Math.sin(a) * 250
        ctx.strokeStyle = color
        ctx.fillStyle = color
        ctx.lineWidth = 5
        drawIcon(x, y - 26)
        ctx.fillStyle = DIM
        ctx.font = mono(400, 20)
        ctx.fillText(label, x, y + 24)
        ctx.fillStyle = color
        ctx.font = mono(500, 26)
        ctx.fillText(value, x, y + 54)
      }
      icon(Math.PI * 1.25, 'ALARM', '07:30', GLOW, (x, y) => {
        ctx.beginPath()
        ctx.arc(x, y, 24, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y - 13)
        ctx.lineTo(x, y)
        ctx.lineTo(x + 10, y + 6)
        ctx.stroke()
      })
      icon(Math.PI * 1.75, 'LIGHT', 'HEARTH', GLOW, (x, y) => {
        ctx.beginPath()
        ctx.arc(x, y, 12, 0, Math.PI * 2)
        ctx.fill()
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2
          ctx.beginPath()
          ctx.moveTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20)
          ctx.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30)
          ctx.stroke()
        }
      })
      icon(Math.PI * 0.25, 'WATER', '72%', GREEN, (x, y) => {
        ctx.beginPath()
        ctx.moveTo(x, y - 28)
        ctx.bezierCurveTo(x + 22, y - 2, x + 22, y + 24, x, y + 24)
        ctx.bezierCurveTo(x - 22, y + 24, x - 22, y - 2, x, y - 28)
        ctx.stroke()
      })
      icon(Math.PI * 0.75, 'PLANT', 'HEALTHY', GREEN, (x, y) => {
        ctx.beginPath()
        ctx.moveTo(x, y + 26)
        ctx.lineTo(x, y - 4)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y - 2)
        ctx.quadraticCurveTo(x + 2, y - 28, x + 26, y - 28)
        ctx.quadraticCurveTo(x + 24, y - 4, x, y - 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(x, y + 6)
        ctx.quadraticCurveTo(x - 2, y - 14, x - 22, y - 14)
        ctx.quadraticCurveTo(x - 20, y + 6, x, y + 6)
        ctx.stroke()
      })

      // Ambient light sensor window
      ctx.strokeStyle = FAINT
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(C, C - 330, 12, 0, Math.PI * 2)
      ctx.stroke()
    }

    paint()
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    document.fonts?.ready.then(() => {
      paint()
      t.needsUpdate = true
    })
    return t
  })
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export type DisplayStats = {
  temp: string
  alarm: string
  soil: string
  ph: string
  water: string
  light: string
}

export const DISPLAY_STATS: DisplayStats = {
  temp: '22°C',
  alarm: '07:30',
  soil: '68%',
  ph: '6.4',
  water: '72%',
  light: '410 lx',
}

/** Curved base screen: live time + date, plus room and plant readings. */
export function createDisplayTexture(stats: DisplayStats = DISPLAY_STATS) {
  const W = 1300
  const H = 270
  const [c, ctx] = canvas(W, H)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const mono = (w: number, px: number) => `${w} ${px}px "JetBrains Mono", ui-monospace, monospace`
  const GLOW = '#ffe9c7'
  const DIM = 'rgba(255, 233, 199, 0.42)'
  const GREEN = '#7cffb2'

  const draw = () => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)
    ctx.textBaseline = 'alphabetic'

    ctx.textAlign = 'left'
    ctx.fillStyle = GLOW
    ctx.font = mono(500, 118)
    ctx.fillText(`${hh}${now.getSeconds() % 2 ? ' ' : ':'}${mm}`, 56, 150)
    ctx.fillStyle = DIM
    ctx.font = mono(400, 30)
    ctx.fillText(`${DAYS[now.getDay()]} · ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`, 60, 212)

    ctx.fillStyle = 'rgba(255, 233, 199, 0.18)'
    ctx.fillRect(470, 46, 2, H - 92)

    const cells: [string, string, string?][] = [
      ['TEMP', stats.temp],
      ['ALARM', stats.alarm],
      ['LIGHT', stats.light],
      ['SOIL', stats.soil, GREEN],
      ['PH', stats.ph, GREEN],
      ['WATER', stats.water, GREEN],
    ]
    cells.forEach(([label, value, color], i) => {
      const x = 520 + (i % 3) * 255
      const y = i < 3 ? 100 : 196
      ctx.fillStyle = DIM
      ctx.font = mono(400, 22)
      ctx.fillText(label, x, y - 44)
      ctx.fillStyle = color ?? GLOW
      ctx.font = mono(500, 44)
      ctx.fillText(value, x, y)
    })
    tex.needsUpdate = true
  }
  draw()
  document.fonts?.ready.then(draw)
  return { tex, draw }
}
