import { useMemo, useState } from 'react'
import { compareRelationships } from '../lib/comparator'
import { parseInstagramJson, inferKindFromFileName } from '../lib/parsers'
import { extractZipJsonEntries } from '../lib/zip-extract'
import type { Account, ParseSummary, ParsedFileKind, RelationshipEntry } from '../lib/types'

export type ProcessorStatus = 'idle' | 'parsing' | 'ready' | 'error'

export type ProcessorProgress = {
  parsedFiles: number
  totalFiles: number
  followersCount: number
  followingCount: number
}

const emptyProgress: ProcessorProgress = {
  parsedFiles: 0,
  totalFiles: 0,
  followersCount: 0,
  followingCount: 0,
}

const mergeLists = (current: Account[], incoming: Account[]) => [...current, ...incoming]

const summarize = (followers: Account[], following: Account[]): ParseSummary => ({
  followers,
  following,
  warnings: [],
})

export const useFileProcessor = () => {
  const [status, setStatus] = useState<ProcessorStatus>('idle')
  const [followers, setFollowers] = useState<Account[]>([])
  const [following, setFollowing] = useState<Account[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [progress, setProgress] = useState<ProcessorProgress>(emptyProgress)
  const [error, setError] = useState<string | null>(null)

  const relationships = useMemo(() => {
    if (followers.length === 0 && following.length === 0) return null
    return compareRelationships(followers, following)
  }, [followers, following])

  const handleParsed = (
    kind: ParsedFileKind,
    accounts: Account[],
    nextProgress: ProcessorProgress,
    sourceLabel?: string,
  ) => {
    if (kind === 'followers') {
      setFollowers((prev) => {
        const merged = mergeLists(prev, accounts)
        setProgress((p) => ({
          ...nextProgress,
          followersCount: merged.length,
          followingCount: p.followingCount,
        }))
        return merged
      })
    } else if (kind === 'following') {
      setFollowing((prev) => {
        const merged = mergeLists(prev, accounts)
        setProgress((p) => ({
          ...nextProgress,
          followersCount: p.followersCount,
          followingCount: merged.length,
        }))
        return merged
      })
    } else {
      setWarnings((prev) => [
        ...prev,
        `Could not infer list type for ${sourceLabel ?? 'a file'}. Name it followers_*.json or following*.json`,
      ])
    }
  }

  const parseJsonFile = async (file: File) => {
    const text = await file.text()
    const result = parseInstagramJson(text, file.name)
    return result
  }

  const parseZipFile = async (file: File) => {
    const entries = await extractZipJsonEntries(file)
    const parsed: Array<{ kind: ParsedFileKind; accounts: Account[] }> = []
    for (const entry of entries) {
      const result = parseInstagramJson(entry.text, entry.name)
      // Use auto-detected kind from parseInstagramJson, fallback to filename inference
      const kind = result.kind !== 'unknown' ? result.kind : inferKindFromFileName(entry.name)
      parsed.push({ kind, accounts: result.accounts })
    }
    return parsed
  }

  const reset = () => {
    setStatus('idle')
    setFollowers([])
    setFollowing([])
    setWarnings([])
    setProgress(emptyProgress)
    setError(null)
  }

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    if (!files.length) return
    reset()
    setStatus('parsing')
    setProgress({ ...emptyProgress, totalFiles: files.length })

    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i]
        const nextProgress = {
          parsedFiles: i + 1,
          totalFiles: files.length,
          followersCount: followers.length,
          followingCount: following.length,
        }

        if (file.name.toLowerCase().endsWith('.zip')) {
          const parsed = await parseZipFile(file)
          for (const item of parsed) {
            handleParsed(item.kind, item.accounts, nextProgress, item.accounts[0]?.source ?? 'zip entry')
          }
        } else if (file.name.toLowerCase().endsWith('.json')) {
          const result = await parseJsonFile(file)
          const kind = result.kind !== 'unknown' ? result.kind : inferKindFromFileName(file.name)
          handleParsed(kind, result.accounts, nextProgress, file.name)
        } else {
          setWarnings((prev) => [...prev, `Skipped unsupported file: ${file.name}`])
        }

        setProgress((p) => ({
          ...p,
          parsedFiles: nextProgress.parsedFiles,
          totalFiles: nextProgress.totalFiles,
        }))
      }
      // Add minimum loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parsing failed')
      setStatus('error')
    }
  }

  const summary: ParseSummary = useMemo(() => summarize(followers, following), [
    followers,
    following,
  ])

  const flatResults: RelationshipEntry[] | null = useMemo(() => {
    if (!relationships) return null
    return [...relationships.dontFollowBack, ...relationships.fans, ...relationships.mutuals]
  }, [relationships])

  return {
    status,
    followers,
    following,
    relationships,
    warnings,
    progress,
    error,
    summary,
    flatResults,
    processFiles,
    reset,
  }
}
