import type { RelationshipEntry } from './types'

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export const toCsv = (rows: RelationshipEntry[]): string => {
  const header = ['username', 'full_name', 'user_id', 'relationship', 'followed_date']
  const lines = rows.map((row) => [
    row.username,
    row.fullName ?? '',
    row.userId ?? '',
    row.relationship,
    row.followedDate ?? '',
  ])
  return [header, ...lines]
    .map((cols) => cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

export const downloadCsv = (rows: RelationshipEntry[], filename: string) => {
  const csv = toCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv' })
  downloadBlob(blob, filename)
}

export const downloadJson = (rows: RelationshipEntry[], filename: string) => {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export const copyUsernames = async (rows: RelationshipEntry[]) => {
  const payload = rows.map((r) => r.username).join('\n')
  await navigator.clipboard.writeText(payload)
}
