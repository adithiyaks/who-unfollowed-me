import { useMemo, useState } from 'react'
import type { RelationshipEntry } from '../lib/types'

export type SortField = 'username' | 'fullName' | 'followedDate'
export type SortDirection = 'asc' | 'desc'

export type SearchState = {
  query: string
  sortField: SortField
  sortDirection: SortDirection
  recentOnly: boolean
}

const defaultState: SearchState = {
  query: '',
  sortField: 'username',
  sortDirection: 'asc',
  recentOnly: false,
}

const recentCutoff = () => {
  const now = Date.now()
  const ninetyDays = 90 * 24 * 60 * 60 * 1000
  return now - ninetyDays
}

const normalize = (text: string) => text.toLowerCase()

export const useSearch = (rows: RelationshipEntry[] = []) => {
  const [state, setState] = useState<SearchState>(defaultState)

  const filtered = useMemo(() => {
    const query = normalize(state.query)
    const cutoff = recentCutoff()

    const matchesQuery = (row: RelationshipEntry) => {
      if (!query) return true
      return (
        normalize(row.username).includes(query) ||
        normalize(row.fullName ?? '').includes(query) ||
        normalize(row.relationship).includes(query)
      )
    }

    const matchesRecent = (row: RelationshipEntry) => {
      if (!state.recentOnly) return true
      if (!row.followedDate) return false
      const time = new Date(row.followedDate).getTime()
      return time >= cutoff
    }

    const sorted = [...rows]
      .filter(matchesQuery)
      .filter(matchesRecent)
      .sort((a, b) => {
        const dir = state.sortDirection === 'asc' ? 1 : -1
        if (state.sortField === 'followedDate') {
          const aTime = a.followedDate ? new Date(a.followedDate).getTime() : 0
          const bTime = b.followedDate ? new Date(b.followedDate).getTime() : 0
          return (aTime - bTime) * dir
        }
        const aVal = state.sortField === 'username' ? a.username : a.fullName ?? ''
        const bVal = state.sortField === 'username' ? b.username : b.fullName ?? ''
        return aVal.localeCompare(bVal, undefined, { sensitivity: 'base' }) * dir
      })

    return sorted
  }, [rows, state])

  return {
    state,
    setState,
    results: filtered,
  }
}
