export interface CannedResponse {
  id: number
  title: string
  content: string
  shortcut?: string | null
  category?: string | null
  is_active: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

export interface CannedResponseCreateInput {
  title: string
  content: string
  shortcut?: string
  category?: string
  is_active?: boolean
}

export interface CannedResponseUpdateInput {
  title?: string
  content?: string
  shortcut?: string
  category?: string
  is_active?: boolean
}
