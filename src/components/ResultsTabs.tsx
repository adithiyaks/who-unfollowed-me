import { useEffect, useMemo, useState } from 'react'
import { copyUsernames, downloadCsv, downloadJson } from '../lib/exporters'
import { useSearch } from '../hooks/useSearch'
import type { ProcessorStatus } from '../hooks/useFileProcessor'
import type { RelationshipEntry } from '../lib/types'
import { ListItem } from './ListItem'

const TabHeader = ({
  id,
  label,
  count,
  active,
  onSelect,
}: {
  id: string
  label: string
  count: number
  active: boolean
  onSelect: (id: string) => void
}) => (
  <button
    className={`tab ${active ? 'active' : ''}`}
    role="tab"
    aria-selected={active}
    onClick={() => onSelect(id)}
  >
    {label} <span className="pill">{count}</span>
  </button>
)

const FilterBar = ({
  query,
  onQuery,
  sortField,
  sortDirection,
  onSortField,
  onSortDirection,
  recentOnly,
  onRecentOnly,
  onExportCsv,
  onExportJson,
  onCopy,
}: {
  query: string
  onQuery: (val: string) => void
  sortField: 'username' | 'fullName' | 'followedDate'
  sortDirection: 'asc' | 'desc'
  onSortField: (val: 'username' | 'fullName' | 'followedDate') => void
  onSortDirection: (val: 'asc' | 'desc') => void
  recentOnly: boolean
  onRecentOnly: (val: boolean) => void
  onExportCsv: () => void
  onExportJson: () => void
  onCopy: () => void
}) => (
  <div className="filter-bar">
    <label className="field">
      <span className="label">Search</span>
      <input
        type="search"
        placeholder="Username or name"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
      />
    </label>
    <label className="field">
      <span className="label">Sort by</span>
      <select value={sortField} onChange={(e) => onSortField(e.target.value as any)}>
        <option value="username">Username</option>
        <option value="fullName">Name</option>
        <option value="followedDate">Follow date</option>
      </select>
    </label>
    <label className="field">
      <span className="label">Direction</span>
      <select value={sortDirection} onChange={(e) => onSortDirection(e.target.value as any)}>
        <option value="asc">Asc</option>
        <option value="desc">Desc</option>
      </select>
    </label>
    <label className="checkbox">
      <input type="checkbox" checked={recentOnly} onChange={(e) => onRecentOnly(e.target.checked)} />
      <span>Recent (90d)</span>
    </label>
    <div className="actions compact">
      <button type="button" onClick={onExportCsv} aria-label="Download CSV">
        Export CSV
      </button>
      <button type="button" onClick={onExportJson} aria-label="Download JSON">
        Export JSON
      </button>
      <button type="button" onClick={onCopy} aria-label="Copy usernames">
        Bulk copy usernames
      </button>
    </div>
  </div>
)

type Props = {
  data: {
    fans: RelationshipEntry[]
    dontFollowBack: RelationshipEntry[]
    mutuals: RelationshipEntry[]
  } | null
  status: ProcessorStatus
}

export const ResultsTabs = ({ data, status }: Props) => {
  const tabs = useMemo(
    () => [
      { id: 'dontFollowBack', label: "Don't Follow Back", rows: data?.dontFollowBack ?? [] },
      { id: 'fans', label: 'Fans', rows: data?.fans ?? [] },
      { id: 'mutuals', label: 'Mutuals', rows: data?.mutuals ?? [] },
    ],
    [data],
  )

  const firstWithData = tabs.find((t) => t.rows.length > 0)?.id ?? tabs[0]?.id ?? 'dontFollowBack'
  const [active, setActive] = useState(firstWithData)
  const activeRows = tabs.find((t) => t.id === active)?.rows ?? []
  useEffect(() => {
    if (!tabs.some((t) => t.id === active && t.rows.length > 0)) {
      const next = tabs.find((t) => t.rows.length > 0)?.id
      if (next) setActive(next)
    }
  }, [active, tabs])
  const { state, setState, results } = useSearch(activeRows)

  if (status === 'idle') {
    return (
      <div className="card empty">
        <h3>Results will appear here</h3>
        <p className="muted">Upload files to compute who follows you back.</p>
      </div>
    )
  }

  const totalCount = (data?.fans.length ?? 0) + (data?.dontFollowBack.length ?? 0) + (data?.mutuals.length ?? 0)
  if (status === 'ready' && totalCount === 0) {
    return (
      <div className="card empty">
        <h3>No entries found</h3>
        <p className="muted">Follower/following lists appear empty. Double-check you uploaded the JSON files from the Instagram export (not HTML or media files).</p>
      </div>
    )
  }

  if (!data || activeRows.length === 0) {
    return (
      <div className="card empty">
        <h3>No data yet</h3>
        <p className="muted">Ensure you uploaded both followers and following JSON files.</p>
      </div>
    )
  }

  const exportCsv = () => downloadCsv(results, `${active}-who-unfollowed-me.csv`)
  const exportJson = () => downloadJson(results, `${active}-who-unfollowed-me.json`)
  const copy = () => copyUsernames(results)

  return (
    <div className="card results">
      <div className="tabs" role="tablist" aria-label="Relationship tabs">
        {tabs.map((tab) => (
          <TabHeader
            key={tab.id}
            id={tab.id}
            label={tab.label}
            count={tab.rows.length}
            active={tab.id === active}
            onSelect={setActive}
          />
        ))}
      </div>
      <FilterBar
        query={state.query}
        onQuery={(query) => setState((s) => ({ ...s, query }))}
        sortField={state.sortField}
        sortDirection={state.sortDirection}
        onSortField={(sortField) => setState((s) => ({ ...s, sortField }))}
        onSortDirection={(sortDirection) => setState((s) => ({ ...s, sortDirection }))}
        recentOnly={state.recentOnly}
        onRecentOnly={(recentOnly) => setState((s) => ({ ...s, recentOnly }))}
        onExportCsv={exportCsv}
        onExportJson={exportJson}
        onCopy={copy}
      />
      <ul className="list" role="list" aria-label={`${active} results`}>
        {results.map((row) => (
          <ListItem key={`${row.userId ?? row.username}-${row.relationship}`} entry={row} />
        ))}
      </ul>
      <div className="bulk">
        <p className="muted">Bulk unfollow/export produces a username list only.</p>
      </div>
    </div>
  )
}
