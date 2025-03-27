import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

// This would normally be initialized with your actual Liveblocks public key
const client = createClient({
  publicApiKey: "pk_live_mock_key_for_demo",
})

// Types for our Liveblocks room
type Presence = {
  // User's cursor position, avatar, name, etc.
  name: string
  isTyping: boolean
}

type Storage = {
  // Persistent data
}

type UserMeta = {
  id: string
  info: {
    name: string
    avatar?: string
  }
}

type RoomEvent = {
  type: "chat_message"
  user: string
  message: string
  timestamp: string
}

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client)

