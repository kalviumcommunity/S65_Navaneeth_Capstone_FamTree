export type Gender = 'Male' | 'Female' | 'Other'

export type MemberId = string

export type TreeMember = {
  _id: MemberId
  name: string
  gender: Gender
  avatar: string
  dateOfBirth: string | null
  dateOfDeath: string | null
  notes: string
  familyBranch: string
  relationshipTags: string[]
  parents: MemberId[]
  spouses: MemberId[]
  children: MemberId[]
  isPlaceholder: boolean
}

export type MemberPatch = Partial<
  Pick<
    TreeMember,
    | 'name'
    | 'gender'
    | 'avatar'
    | 'dateOfBirth'
    | 'dateOfDeath'
    | 'notes'
    | 'familyBranch'
    | 'relationshipTags'
    | 'parents'
    | 'spouses'
    | 'children'
    | 'isPlaceholder'
  >
>

export type StarterNodeData = {
  kind: 'starter'
}

export type MemberNodeData = {
  kind: 'member'
  memberId: MemberId
  isFocus: boolean
}

export type PlaceholderNodeData = {
  kind: 'placeholder'
  memberId: MemberId
  isFocus: boolean
}

export type TreeNodeData = StarterNodeData | MemberNodeData | PlaceholderNodeData
