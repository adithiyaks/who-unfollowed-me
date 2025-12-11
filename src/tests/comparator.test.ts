import { describe, expect, it } from 'vitest'
import { compareRelationships } from '../lib/comparator'
import type { Account } from '../lib/types'

const followers: Account[] = [
  { username: 'alice', userId: '100', followedDate: '2024-01-01T00:00:00.000Z' },
  { username: 'BoB', userId: '200' },
]

const following: Account[] = [
  { username: 'bob', userId: '200' },
  { username: 'carol', userId: '300', followedDate: '2024-02-01T00:00:00.000Z' },
]

describe('compareRelationships', () => {
  it('finds fans, don\'t follow back, and mutuals case-insensitively', () => {
    const result = compareRelationships(followers, following)
    expect(result.mutuals.map((r) => r.username)).toEqual(['bob'])
    expect(result.fans.map((r) => r.username)).toEqual(['alice'])
    expect(result.dontFollowBack.map((r) => r.username)).toEqual(['carol'])
  })

  it('handles empty arrays correctly', () => {
    const result = compareRelationships([], [])
    expect(result.fans).toHaveLength(0)
    expect(result.mutuals).toHaveLength(0)
    expect(result.dontFollowBack).toHaveLength(0)
  })

  it('all followers are fans when following is empty', () => {
    const result = compareRelationships(followers, [])
    expect(result.fans).toHaveLength(2)
    expect(result.mutuals).toHaveLength(0)
    expect(result.dontFollowBack).toHaveLength(0)
  })

  it('all following are dont-follow-back when followers is empty', () => {
    const result = compareRelationships([], following)
    expect(result.fans).toHaveLength(0)
    expect(result.mutuals).toHaveLength(0)
    expect(result.dontFollowBack).toHaveLength(2)
  })
})
