import { useSyncExternalStore } from 'react'

export type Mood = { id: string; name: string; color: string; note: string }

export const MOODS: Mood[] = [
  { id: 'hearth', name: 'Hearth', color: '#FFE9C7', note: 'Warm white for slow evenings' },
  { id: 'canopy', name: 'Canopy', color: '#7CFFB2', note: 'Forest green for deep focus' },
  { id: 'tide', name: 'Tide', color: '#6FC3FF', note: 'Cool blue to wind down' },
  { id: 'ember', name: 'Ember', color: '#FF7A4D', note: 'Sunset amber before sleep' },
  { id: 'dusk', name: 'Dusk', color: '#B69CFF', note: 'Lavender for late-night playlists' },
]

let ringColor = MOODS[0].color
const listeners = new Set<() => void>()

export function getRingColor() {
  return ringColor
}

export function setRingColor(color: string) {
  ringColor = color
  document.documentElement.style.setProperty('--ring', color)
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useRingColor() {
  return useSyncExternalStore(subscribe, getRingColor)
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isCoarseOrSmall = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760)
