type Props = {
  compact?: boolean
}

export const PrivacyBadge = ({ compact = false }: Props) => (
  <div className={`privacy-badge ${compact ? 'compact' : ''}`} role="status" aria-live="polite">
    <span className="dot" aria-hidden="true" />
    <div>
      <strong>Processed locally</strong>
      <div className="sub">Your data never leaves this browser.</div>
    </div>
  </div>
)
