import type { Account, ParsedFileKind } from './types'

/**
 * Instagram export JSON structures:
 *
 * followers_1.json (top-level array):
 * [
 *   {
 *     "title": "",
 *     "media_list_data": [],
 *     "string_list_data": [
 *       { "href": "https://www.instagram.com/username", "value": "username", "timestamp": 1234567890 }
 *     ]
 *   }
 * ]
 *
 * following.json (object with relationships_following key):
 * {
 *   "relationships_following": [
 *     {
 *       "title": "username",
 *       "string_list_data": [
 *         { "href": "https://www.instagram.com/_u/username", "timestamp": 1234567890 }
 *       ]
 *     }
 *   ]
 * }
 */

const toIsoDate = (timestamp?: number | string): string | undefined => {
  if (!timestamp) return undefined
  const n = typeof timestamp === 'string' ? Number(timestamp) : timestamp
  if (Number.isNaN(n)) return undefined
  // Instagram uses seconds; convert to ms if needed
  const ms = n > 1e12 ? n : n * 1000
  const date = new Date(ms)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

/**
 * Parse a single entry from followers array format.
 * Username is in string_list_data[0].value
 */
const parseFollowerEntry = (entry: any, source?: string): Account | null => {
  if (!entry || typeof entry !== 'object') return null

  const stringListData = entry.string_list_data
  if (!Array.isArray(stringListData) || stringListData.length === 0) return null

  const data = stringListData[0]
  if (!data) return null

  const username = (data.value || '').trim()
  if (!username) return null

  return {
    username,
    fullName: entry.title && entry.title.trim() ? entry.title.trim() : undefined,
    profilePictureUrl: undefined,
    userId: undefined,
    followedDate: toIsoDate(data.timestamp),
    source,
  }
}

/**
 * Parse a single entry from following array format.
 * Username is in title field
 */
const parseFollowingEntry = (entry: any, source?: string): Account | null => {
  if (!entry || typeof entry !== 'object') return null

  const username = (entry.title || '').trim()
  if (!username) return null

  let followedDate: string | undefined
  const stringListData = entry.string_list_data
  if (Array.isArray(stringListData) && stringListData.length > 0) {
    followedDate = toIsoDate(stringListData[0]?.timestamp)
  }

  return {
    username,
    fullName: undefined,
    profilePictureUrl: undefined,
    userId: undefined,
    followedDate,
    source,
  }
}

/**
 * Deduplicate accounts by lowercase username
 */
const dedupeAccounts = (accounts: Account[]): Account[] => {
  const map = new Map<string, Account>()
  for (const acct of accounts) {
    const key = acct.username.toLowerCase()
    if (!key) continue
    const existing = map.get(key)
    if (existing) {
      map.set(key, {
        ...existing,
        fullName: existing.fullName || acct.fullName,
        userId: existing.userId || acct.userId,
        profilePictureUrl: existing.profilePictureUrl || acct.profilePictureUrl,
        followedDate: existing.followedDate || acct.followedDate,
      })
    } else {
      map.set(key, acct)
    }
  }
  return [...map.values()]
}

/**
 * Parse followers_1.json format (top-level array)
 */
export const parseFollowersJson = (text: string, sourceName = 'followers'): Account[] => {
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    return []
  }

  if (!Array.isArray(data)) return []

  const accounts: Account[] = []
  for (const entry of data) {
    const account = parseFollowerEntry(entry, sourceName)
    if (account) accounts.push(account)
  }

  return dedupeAccounts(accounts)
}

/**
 * Parse following.json format (object with relationships_following key)
 */
export const parseFollowingJson = (text: string, sourceName = 'following'): Account[] => {
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    return []
  }

  const list = data?.relationships_following
  if (!Array.isArray(list)) return []

  const accounts: Account[] = []
  for (const entry of list) {
    const account = parseFollowingEntry(entry, sourceName)
    if (account) accounts.push(account)
  }

  return dedupeAccounts(accounts)
}

/**
 * Infer file kind from filename
 */
export const inferKindFromFileName = (name: string): ParsedFileKind => {
  const lower = name.toLowerCase()
  if (lower.includes('followers')) return 'followers'
  if (lower.includes('following')) return 'following'
  return 'unknown'
}

/**
 * Auto-detect and parse Instagram JSON based on content structure
 */
export const parseInstagramJson = (
  text: string,
  sourceName = 'file'
): { kind: ParsedFileKind; accounts: Account[] } => {
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    return { kind: 'unknown', accounts: [] }
  }

  // Check if it's following format (has relationships_following key)
  if (
    data &&
    typeof data === 'object' &&
    !Array.isArray(data) &&
    Array.isArray(data.relationships_following)
  ) {
    const accounts = parseFollowingJson(text, sourceName)
    return { kind: 'following', accounts }
  }

  // Check if it's followers format (top-level array with string_list_data)
  if (Array.isArray(data) && data.length > 0) {
    const firstEntry = data[0]
    if (firstEntry && Array.isArray(firstEntry.string_list_data)) {
      const accounts = parseFollowersJson(text, sourceName)
      return { kind: 'followers', accounts }
    }
  }

  return { kind: 'unknown', accounts: [] }
}
