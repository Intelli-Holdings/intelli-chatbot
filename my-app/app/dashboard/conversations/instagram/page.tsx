"use client"

import Image from "next/image"
import { Heart, MessageCircle, Compass, Search, MoreHorizontal, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const mockThreads = [
  { id: "ig-1", name: "Luna Street", preview: "That reel is stunning!", time: "5m", unread: true },
  { id: "ig-2", name: "Studio 48", preview: "Can we collab next week?", time: "22m", unread: false },
  { id: "ig-3", name: "Nico K", preview: "Sent the lookbook link.", time: "1h", unread: false },
  { id: "ig-4", name: "Raya", preview: "Need product details.", time: "4h", unread: false },
]

const InstagramPage = () => {
  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border border-[#f3e8ff] bg-[#fff8f4] shadow-lg">
      <aside className="hidden w-[260px] flex-col border-r border-[#f2d9ff] bg-white/70 p-5 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white font-semibold">
            IG
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">Instagram Inbox</p>
            <p className="text-xs text-[#6b7280]">@intelli_concierge</p>
          </div>
        </div>
        <div className="mt-6 space-y-2 text-sm text-[#6b7280]">
          <button className="flex w-full items-center justify-between rounded-lg bg-[#fde7f3] px-3 py-2 text-[#c026d3]">
            Primary
            <span className="text-xs font-semibold text-[#c026d3]">9</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#fef3f8]">
            Requests
            <span className="text-xs font-semibold text-[#6b7280]">3</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-[#fef3f8]">
            Collaborations
            <span className="text-xs font-semibold text-[#6b7280]">2</span>
          </button>
        </div>
        <div className="mt-auto rounded-xl border border-[#f2d9ff] bg-white p-4">
          <p className="text-xs font-semibold text-[#111827]">Creator Notes</p>
          <p className="mt-2 text-xs text-[#6b7280]">
            Stay within the 24-hour window for Instagram replies.
          </p>
        </div>
      </aside>

      <section className="flex w-[320px] flex-col border-r border-[#f2d9ff] bg-white">
        <div className="border-b border-[#f2d9ff] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#fff007] to-[#fff] text-white">
              <Image src="/instagram.png" alt="Instagram" width={18} height={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111827]">Instagram DMs</h2>
              <p className="text-xs text-[#6b7280]">Creator inbox</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#9ca3af]" />
              <Input className="pl-9" placeholder="Search inbox" />
            </div>
            <Button size="icon" variant="outline">
              <Compass className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockThreads.map((thread) => (
            <button
              key={thread.id}
              className={`flex w-full items-start gap-3 border-b border-[#fef3f8] px-4 py-3 text-left hover:bg-[#fff4fb] ${
                thread.unread ? "bg-[#fde7f3]" : ""
              }`}
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#fde7f3] text-[#c026d3] flex items-center justify-center text-sm font-semibold">
                {thread.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#111827]">{thread.name}</p>
                  <span className="text-xs text-[#6b7280]">{thread.time}</span>
                </div>
                <p className="text-xs text-[#6b7280]">{thread.preview}</p>
              </div>
              {thread.unread && <span className="mt-1 h-2 w-2 rounded-full bg-[#ec4899]" />}
            </button>
          ))}
        </div>
      </section>

      <main className="flex flex-1 flex-col bg-white">
        <div className="flex items-center justify-between border-b border-[#f2d9ff] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#fde7f3] text-[#c026d3] flex items-center justify-center text-sm font-semibold">
              L
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">Luna Street</p>
              <p className="text-xs text-[#6b7280]">Story reply · 5 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-[#fff8f4] px-6 py-6">
          <div className="max-w-[60%] rounded-2xl bg-white p-4 text-sm text-[#111827] shadow-sm">
            That studio tour reel looked incredible. Can you share the behind the scenes?
            <p className="mt-2 text-[11px] text-[#6b7280]">1:20 PM</p>
          </div>
          <div className="ml-auto max-w-[60%] rounded-2xl bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] p-4 text-sm text-white shadow-sm">
            Absolutely! I can send a short recap and the highlight clips.
            <p className="mt-2 text-[11px] text-white/70">1:22 PM</p>
          </div>
          <div className="max-w-[60%] rounded-2xl bg-white p-4 text-sm text-[#111827] shadow-sm">
            Love that. Also, can we pin a partnership offer?
            <div className="mt-3 flex items-center gap-2 text-xs text-[#c026d3]">
              <Sparkles className="h-3 w-3" />
              IG highlight: Potential collab
            </div>
            <p className="mt-2 text-[11px] text-[#6b7280]">1:24 PM</p>
          </div>
        </div>

        <div className="border-t border-[#f2d9ff] px-6 py-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#f2d9ff] bg-white px-4 py-3">
            <input className="w-full text-sm text-[#111827] outline-none" placeholder="Send a reply..." />
            <Button size="icon" variant="outline">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#6b7280]">
            <Sparkles className="h-4 w-4 text-[#c026d3]" />
            Messages appear in your connected Instagram Business inbox.
          </div>
        </div>
      </main>
    </div>
  )
}

export default InstagramPage
