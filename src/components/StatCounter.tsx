import { useEffect, useRef, useState } from 'react'
import { useInView } from '../lib/hooks'
import { prefersReducedMotion } from '../lib/store'
import styles from './StatCounter.module.css'

type Props = { value: number; label: string; detail?: string; delay?: number }

export default function StatCounter({ value, label, detail, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, '0px 0px -15% 0px')
  const [n, setN] = useState(0)
  const done = useRef(false)

  useEffect(() => {
    if (!inView || done.current) return
    done.current = true
    if (prefersReducedMotion()) {
      setN(value)
      return
    }
    let raf = 0
    const start = performance.now() + delay
    const dur = 2200
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / dur))
      setN(Math.round(value * (1 - Math.pow(1 - p, 4))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, delay])

  const r = 46
  const c = 2 * Math.PI * r
  return (
    <div ref={ref} className={styles.stat}>
      <div className={styles.dial}>
        <svg viewBox="0 0 100 100" className={styles.svg} aria-hidden>
          <circle cx="50" cy="50" r={r} className={styles.track} />
          <circle
            cx="50"
            cy="50"
            r={r}
            className={styles.arc}
            strokeDasharray={c}
            strokeDashoffset={c * (1 - n / 100)}
          />
        </svg>
        <span className={styles.value}>
          {n}
          <small>%</small>
        </span>
      </div>
      <p className={styles.label}>{label}</p>
      {detail && <p className={styles.detail}>{detail}</p>}
    </div>
  )
}
