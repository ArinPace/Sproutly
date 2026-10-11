import { useEffect, useState } from 'react'

export const GLB_URL = '/models/sproutly.glb'

let probe: Promise<boolean> | null = null

/** Resolves true only if a real .glb is served (not the SPA html fallback). */
function check() {
  probe ??= fetch(GLB_URL, { method: 'HEAD' })
    .then((r) => r.ok && !(r.headers.get('content-type') ?? '').includes('text/html'))
    .catch(() => false)
  return probe
}

export function useGlbAvailable() {
  const [available, setAvailable] = useState<boolean | null>(null)
  useEffect(() => {
    let alive = true
    check().then((ok) => alive && setAvailable(ok))
    return () => {
      alive = false
    }
  }, [])
  return available
}
