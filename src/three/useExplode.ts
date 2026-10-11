import { createContext, useContext } from 'react'
import type { PartId } from './parts'

export type ExplodeState = {
  /** Where the explode is heading (0 assembled, 1 exploded). */
  target: number
  /** Damped value actually rendered. */
  current: number
  spin: number
  spinSpeed: number
  autoSpin: boolean
  interactive: boolean
  hovered: PartId | null
  onSelect?: (id: PartId) => void
  lastTime: number
  /** True while the visitor is dragging the model. */
  dragging: boolean
  /** Leftover drag momentum, radians per second. */
  spinVel: number
  /** Extra camera elevation from vertical dragging, radians. */
  tilt: number
  /** 0 = model centred, 1 = model framed to one side so copy can sit beside it. */
  frame: number
}

export const TILT_MIN = -0.3
export const TILT_MAX = 1.05

export function createExplode(init = 0, opts: Partial<ExplodeState> = {}): ExplodeState {
  return {
    target: init,
    current: init,
    spin: 0,
    spinSpeed: 0.16,
    autoSpin: true,
    interactive: false,
    hovered: null,
    lastTime: -1,
    dragging: false,
    spinVel: 0,
    tilt: 0,
    frame: 0,
    ...opts,
  }
}

export const ExplodeContext = createContext<ExplodeState>(createExplode())

export const useExplode = () => useContext(ExplodeContext)

/** Advances the shared state once per frame, however many components call it. */
export function stepExplode(s: ExplodeState, time: number, delta: number) {
  if (s.lastTime === time) return
  s.lastTime = time
  const dt = Math.min(delta, 0.1)
  s.current += (s.target - s.current) * (1 - Math.exp(-dt * 5))
  if (Math.abs(s.target - s.current) < 1e-4) s.current = s.target
  if (s.dragging) return
  s.spin += s.spinVel * dt
  s.spinVel *= Math.exp(-dt * 2.2)
  if (Math.abs(s.spinVel) < 0.01) s.spinVel = 0
  if (s.autoSpin) s.spin += dt * s.spinSpeed
}

export const easeExplode = (x: number) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}
