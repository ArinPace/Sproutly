import type { CSSProperties, ReactNode } from 'react'
import styles from './FeatureCard.module.css'

type Props = {
  index: string
  title: string
  body: string
  stat?: { value: string; label: string }
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export default function FeatureCard({ index, title, body, stat, children, className, style }: Props) {
  return (
    <article className={`${styles.card} ${className ?? ''}`} style={style} data-reveal>
      <div className={styles.glow} aria-hidden />
      <header className={styles.head}>
        <span className={styles.index}>{index}</span>
        {stat && (
          <span className={styles.stat}>
            <b>{stat.value}</b>
            {stat.label}
          </span>
        )}
      </header>
      {children && <div className={styles.visual}>{children}</div>}
      <div className={styles.copy}>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </article>
  )
}
