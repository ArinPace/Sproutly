import { useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import { PART_BY_ID, type PartId } from '../parts'
import { easeExplode, stepExplode, useExplode } from '../useExplode'

export default function Part({ id, children }: { id: PartId; children: ReactNode }) {
  const s = useExplode()
  const def = PART_BY_ID[id]
  const ref = useRef<Group>(null!)

  useFrame((state, delta) => {
    stepExplode(s, state.clock.elapsedTime, delta)
    const e = easeExplode(s.current)
    ref.current.position.y = def.offset * e
    ref.current.rotation.y = def.rot * e
  })

  const handlers = s.interactive
    ? {
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          if (e.delta > 6) return
          s.onSelect?.(id)
        },
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation()
          s.hovered = id
          document.body.style.cursor = 'pointer'
        },
        onPointerOut: () => {
          if (s.hovered === id) s.hovered = null
          document.body.style.cursor = ''
        },
      }
    : {}

  return (
    <group ref={ref} name={id} {...handlers}>
      {children}
    </group>
  )
}
