import type { RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MODEL_CENTER, PARTS, type PartId } from '../three/parts'
import { easeExplode, stepExplode, useExplode } from '../three/useExplode'
import styles from './Annotation.module.css'

export type LabelRefs = RefObject<(HTMLDivElement | null)[]>

const v = new THREE.Vector3()

/** Lives inside the Canvas: projects each part's anchor to screen space every frame. */
export function LabelProjector({ labels }: { labels: LabelRefs }) {
  const s = useExplode()
  useFrame((state, delta) => {
    stepExplode(s, state.clock.elapsedTime, delta)
    const e = easeExplode(s.current)
    const { width, height } = state.size
    PARTS.forEach((p, i) => {
      const el = labels.current[i]
      if (!el) return
      v.set(p.side * 1.06, p.labelY - MODEL_CENTER + p.offset * e, 0).project(state.camera)
      const x = ((v.x + 1) / 2) * width
      const y = ((1 - v.y) / 2) * height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    })
  })
  return null
}

type LayerProps = {
  labels: LabelRefs
  selected?: PartId | null
  onSelect?: (id: PartId) => void
}

/** Lives in the DOM above the Canvas. */
export function AnnotationLayer({ labels, selected, onSelect }: LayerProps) {
  return (
    <div className={styles.layer} aria-hidden={!onSelect}>
      {PARTS.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => {
            labels.current[i] = el
          }}
          className={styles.anchor}
        >
          <div
            className={styles.anno}
            data-side={p.side > 0 ? 'right' : 'left'}
            data-selected={selected === p.id || undefined}
            data-interactive={onSelect ? true : undefined}
            onClick={() => onSelect?.(p.id)}
          >
            <span className={styles.dot} />
            <span className={styles.line} />
            <span className={styles.text}>
              <span className={styles.index}>{p.index}</span>
              <span className={styles.name}>{p.name}</span>
              <span className={styles.caption}>{p.caption}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
