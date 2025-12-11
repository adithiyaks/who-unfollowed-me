import { describe, expect, it } from 'vitest'
import { inferKindFromFileName, parseInstagramJson, parseFollowersJson, parseFollowingJson } from '../lib/parsers'

// Real Instagram export format: followers_1.json is a top-level array
const followersJson = JSON.stringify([
  {
    title: '',
    media_list_data: [],
    string_list_data: [
      {
        href: 'https://www.instagram.com/alice',
        value: 'alice',
        timestamp: 1700000000,
      },
    ],
  },
  {
    title: '',
    media_list_data: [],
    string_list_data: [
      {
        href: 'https://www.instagram.com/Bob',
        value: 'Bob',
        timestamp: 1700000100,
      },
    ],
  },
])

// Real Instagram export format: following.json has relationships_following key
const followingJson = JSON.stringify({
  relationships_following: [
    {
      title: 'bob',
      string_list_data: [
        {
          href: 'https://www.instagram.com/_u/bob',
          timestamp: 1700000200,
        },
      ],
    },
    {
      title: 'carol',
      string_list_data: [
        {
          href: 'https://www.instagram.com/_u/carol',
          timestamp: 1700000300,
        },
      ],
    },
  ],
})

describe('parseFollowersJson', () => {
  it('parses followers array format with usernames from string_list_data', () => {
    const parsed = parseFollowersJson(followersJson, 'followers_1.json')
    expect(parsed).toHaveLength(2)
    expect(parsed.map((p) => p.username)).toContain('alice')
    expect(parsed.map((p) => p.username.toLowerCase())).toContain('bob')
  })

  it('extracts timestamps as followedDate', () => {
    const parsed = parseFollowersJson(followersJson, 'followers_1.json')
    const alice = parsed.find((p) => p.username === 'alice')
    expect(alice?.followedDate).toBeDefined()
  })
})

describe('parseFollowingJson', () => {
  it('parses following object format with usernames from title field', () => {
    const parsed = parseFollowingJson(followingJson, 'following.json')
    expect(parsed).toHaveLength(2)
    expect(parsed.map((p) => p.username)).toEqual(['bob', 'carol'])
  })
})

describe('parseInstagramJson (auto-detect)', () => {
  it('auto-detects followers format', () => {
    const result = parseInstagramJson(followersJson, 'test.json')
    expect(result.kind).toBe('followers')
    expect(result.accounts).toHaveLength(2)
  })

  it('auto-detects following format', () => {
    const result = parseInstagramJson(followingJson, 'test.json')
    expect(result.kind).toBe('following')
    expect(result.accounts).toHaveLength(2)
  })
})

describe('inferKindFromFileName', () => {
  it('infers kind from filename', () => {
    expect(inferKindFromFileName('followers_1.json')).toBe('followers')
    expect(inferKindFromFileName('following.json')).toBe('following')
    expect(inferKindFromFileName('notes.txt')).toBe('unknown')
  })
})
