import type { RelationshipEntry } from '../lib/types'

const formatDate = (value?: string) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString()
}

type Props = {
  entry: RelationshipEntry
}

export const ListItem = ({ entry }: Props) => {
  const label = formatDate(entry.followedDate)
  const instagramUrl = `https://www.instagram.com/${entry.username}`

  return (
    <li className="list-item" tabIndex={0} role="article" aria-label={`${entry.username}`}>
      <div>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="username"
        >
          @{entry.username}
        </a>
        {entry.fullName && <span className="full-name"> ({entry.fullName})</span>}
      </div>
      <div className="meta">
        {label && <span>since {label}</span>}
      </div>
    </li>
  )
}
