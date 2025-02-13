"use client"
import React from 'react'
import { useEffect, useState } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

const TableOfContents = () => {
  const [activeId, setActiveId] = useState("")

  const headings = [
    { id: "whats-new", title: "What's New" },
    { id: "live-chat", title: "Live Chat for Website Widgets" },
    { id: "analytics", title: "Enhanced Stats & Analytics" },
    { id: "phone-management", title: "Phone Number Management" },
    { id: "demo-video", title: "New Demo Video & Docs" },
    { id: "improvements", title: "Improvements & Fixes" },
    { id: "under-the-hood", title: "Under the Hood" },
  ]

  useEffect(() => {
    const observers = headings.map((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(heading.id)
            }
          })
        })
        observer.observe(element)
        return observer
      }
      return null
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [])

  return (
    <nav className="">
      <h3 className="mb-3 text-sm font-medium">Contents</h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block py-1 transition-colors duration-200 ${
                activeId === heading.id ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
                })
              }}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents

