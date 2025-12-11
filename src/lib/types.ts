export type Account = {
  username: string
  fullName?: string
  userId?: string
  profilePictureUrl?: string
  followedDate?: string
  isVerified?: boolean
  isPrivate?: boolean
  source?: string
}

export type RelationshipKind = 'fans' | 'dontFollowBack' | 'mutuals'

export type RelationshipEntry = Account & {
  relationship: RelationshipKind
}

export type ParsedFileKind = 'followers' | 'following' | 'unknown'

export type ParsedFile = {
  name: string
  kind: ParsedFileKind
  accounts: Account[]
}

export type ParseSummary = {
  followers: Account[]
  following: Account[]
  warnings: string[]
}
