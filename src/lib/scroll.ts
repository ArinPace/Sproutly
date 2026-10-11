import type Lenis from 'lenis'

let instance: Lenis | null = null

export function setLenis(l: Lenis | null) {
  instance = l
}

export function scrollToEl(el: HTMLElement | null, offset = -90) {
  if (!el) return
  if (instance) instance.scrollTo(el, { offset, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function scrollToTop() {
  if (instance) instance.scrollTo(0, { duration: 1.2 })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}
