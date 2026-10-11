import styles from './Marquee.module.css'

export default function Marquee({ items }: { items: string[] }) {
  const row = (
    <div className={styles.row} aria-hidden>
      {items.map((t, i) => (
        <span key={i} className={styles.item}>
          {t}
          <span className={styles.sep} />
        </span>
      ))}
    </div>
  )
  return (
    <div className={styles.marquee}>
      <span className={styles.sr}>{items.join(', ')}</span>
      {row}
      {row}
    </div>
  )
}
