import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './LightRingButton.module.css'

type Props = {
  children: ReactNode
  to?: string
  href?: string
  variant?: 'solid' | 'ghost'
  onClick?: () => void
  type?: 'button' | 'submit'
}

export default function LightRingButton({ children, to, href, variant = 'solid', onClick, type = 'button' }: Props) {
  const cls = `${styles.btn} ${variant === 'ghost' ? styles.ghost : ''}`
  const inner = (
    <>
      <span className={styles.ring} aria-hidden />
      <span className={styles.label}>{children}</span>
      <span className={styles.arrow} aria-hidden>
        →
      </span>
    </>
  )
  if (to)
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {inner}
      </Link>
    )
  if (href)
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer">
        {inner}
      </a>
    )
  return (
    <button type={type} className={cls} onClick={onClick}>
      {inner}
    </button>
  )
}
