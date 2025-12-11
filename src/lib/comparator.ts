import type { Account, RelationshipEntry } from './types'

export const canonicalKey = (acct: Account) =>
  (acct.userId && acct.userId.trim()) || acct.username.toLowerCase()

const mergeAccount = (a: Account, b: Account): Account => ({
  username: a.username || b.username,
  fullName: a.fullName || b.fullName,
  userId: a.userId || b.userId,
  profilePictureUrl: a.profilePictureUrl || b.profilePictureUrl,
  followedDate: a.followedDate || b.followedDate,
  isPrivate: a.isPrivate ?? b.isPrivate,
  isVerified: a.isVerified ?? b.isVerified,
  source: a.source || b.source,
})

const dedupe = (list: Account[]) => {
  const map = new Map<string, Account>()
  for (const acct of list) {
    const key = canonicalKey(acct)
    if (!key) continue
    const existing = map.get(key)
    map.set(key, existing ? mergeAccount(existing, acct) : acct)
  }
  return map
}

const sortByUsername = (a: Account, b: Account) =>
  a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })

export const compareRelationships = (followers: Account[], following: Account[]) => {
  const followersMap = dedupe(followers)
  const followingMap = dedupe(following)

  const fans: RelationshipEntry[] = []
  const dontFollowBack: RelationshipEntry[] = []
  const mutuals: RelationshipEntry[] = []

  for (const [key, acct] of followingMap.entries()) {
    const follower = followersMap.get(key)
    if (follower) {
      mutuals.push({ ...mergeAccount(acct, follower), relationship: 'mutuals' })
    } else {
      dontFollowBack.push({ ...acct, relationship: 'dontFollowBack' })
    }
  }

  for (const [key, acct] of followersMap.entries()) {
    if (followingMap.has(key)) continue
    fans.push({ ...acct, relationship: 'fans' })
  }

  mutuals.sort(sortByUsername)
  fans.sort(sortByUsername)
  dontFollowBack.sort(sortByUsername)

  return { fans, dontFollowBack, mutuals }
}
