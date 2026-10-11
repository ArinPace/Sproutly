export function SproutGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="14.5" stroke="var(--ring)" strokeWidth="1.5" opacity="0.9" />
      <path d="M16 24V14.5" stroke="var(--sprout)" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 16c0-4.2 2.8-7 7-7 0 4.2-2.8 7-7 7Z" fill="var(--sprout)" />
      <path d="M16 18.5c0-3.5-2.4-6-6-6 0 3.5 2.4 6 6 6Z" fill="var(--sprout)" opacity="0.7" />
    </svg>
  )
}

export default function Logo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <SproutGlyph />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 21,
          letterSpacing: '-0.04em',
        }}
      >
        sproutly
      </span>
    </span>
  )
}
