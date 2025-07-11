import { Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}


export type Folder = "inbox" | "starred" | "sent" | "drafts" | "spam" | "archive" | "trash"

export interface Email {
  id: string
  from: {
    name: string
    email: string
    avatar?: string
  }
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  date: Date
  read: boolean
  folder: Folder
  labels?: string[]
  attachments?: {
    name: string
    type: string
    size: string
  }[]
}

