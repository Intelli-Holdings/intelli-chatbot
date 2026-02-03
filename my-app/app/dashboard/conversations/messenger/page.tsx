"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"

const MessengerPage = () => {
  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#f7f8fb] shadow-lg">
      <aside className="hidden w-[280px] border-r border-[#e5e7eb] bg-white p-5 lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877f2] text-white font-semibold">
            M
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">Messenger Inbox</p>
            <p className="text-xs text-[#6b7280]">Your Page</p>
          </div>
        </div>
        <div className="mt-6 space-y-2 text-sm text-[#6b7280]">
          <button className="flex w-full items-center justify-between rounded-lg bg-[#eef2ff] px-3 py-2 text-[#1d4ed8]">
            Inbox
            <span className="text-xs font-semibold text-[#1d4ed8]">12</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#f3f4f6]">
            Assigned
            <span className="text-xs font-semibold text-[#6b7280]">5</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#f3f4f6]">
            Starred
            <span className="text-xs font-semibold text-[#6b7280]">2</span>
          </button>
        </div>
        <div className="mt-auto rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <p className="text-xs font-semibold text-[#111827]">Tips</p>
          <p className="mt-2 text-xs text-[#6b7280]">
            Messenger conversations show live read receipts and typing indicators.
          </p>
        </div>
      </aside>

      <section className="flex w-[320px] flex-col border-r border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f4f6] text-white">
              <Image src="/messenger.png" alt="Facebook" width={18} height={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111827]">Messenger</h2>
              <p className="text-xs text-[#6b7280]">Live customer chats</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
              <Input className="pl-9" placeholder="Search conversations" />
            </div>
            <Button size="icon" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockThreads.map((thread) => (
            <button
              key={thread.id}
              className={`flex w-full items-start gap-3 border-b border-[#f3f4f6] px-4 py-3 text-left hover:bg-[#f8fafc] ${
                thread.unread ? "bg-[#eef2ff]" : ""
              }`}
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center text-sm font-semibold">
                {thread.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#111827]">{thread.name}</p>
                  <span className="text-xs text-[#6b7280]">{thread.time}</span>
                </div>
                <p className="text-xs text-[#6b7280]">{thread.preview}</p>
              </div>
              {thread.unread && <span className="mt-1 h-2 w-2 rounded-full bg-[#2563eb]" />}
            </button>
          ))}
        </div>
      </section>

      <main className="flex flex-1 flex-col bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center text-sm font-semibold">
              A
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">Avery Ross</p>
              <p className="text-xs text-[#6b7280]">Active 2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8fafc] px-6 py-6">
          <div className="max-w-[60%] rounded-2xl bg-white p-4 text-sm text-[#111827] shadow-sm">
            Hey there! I saw your new product launch and wanted to learn more.
            <p className="mt-2 text-[11px] text-[#6b7280]">2:45 PM</p>
          </div>
          <div className="ml-auto max-w-[60%] rounded-2xl bg-[#1877f2] p-4 text-sm text-white shadow-sm">
            Thanks for reaching out! I can walk you through pricing and setup options.
            <p className="mt-2 text-[11px] text-white/70">2:46 PM</p>
          </div>
          <div className="max-w-[60%] rounded-2xl bg-white p-4 text-sm text-[#111827] shadow-sm">
            Perfect. Also, can I integrate with my existing CRM?
            <div className="mt-3 flex items-center gap-2 text-xs text-[#2563eb]">
              <Star className="h-3 w-3" />
              Messenger tagged: Priority lead
            </div>
            <p className="mt-2 text-[11px] text-[#6b7280]">2:49 PM</p>
          </div>
        </div>

        <div className="border-t border-[#e5e7eb] px-6 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3">
            <Sparkles className="h-4 w-4 text-[#2563eb]" />
            <input
              className="w-full text-sm text-[#111827] outline-none"
              placeholder="Reply on Messenger..."
            />
            <Button size="sm" className="bg-[#1877f2] hover:bg-[#166fe5]">
              Send
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#6b7280]">
            <BadgeCheck className="h-4 w-4 text-[#2563eb]" />
            Replies are sent via your connected Facebook Page.
          </div>
        </div>
      </main>
    </div>
  )
}

export default MessengerPage
