"use client"
import type React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, Calendar, Clock, ArrowRight, AlertCircle } from "lucide-react"
import { createSlug, formatDate } from "@/lib/blog-utils"

// Define the structure of a post
interface MediumPost {
  title: string
  link: string
  contentSnippet: string
  content: string
  thumbnail?: string
  pubDate?: string
  categories?: string[]
  author?: string
  readTime?: string
  guid?: string
}

interface FeedInfo {
  title?: string
  description?: string
  link?: string
  image?: {
    url?: string
    title?: string
    link?: string
  }
  lastBuildDate?: string
}

interface ApiResponse {
  items: MediumPost[]
  success: boolean
  message?: string
  error?: string
  feedInfo?: FeedInfo
  totalItems?: number
}

const MediumBlogComponent: React.FC = () => {
  const [posts, setPosts] = useState<MediumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/medium", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON")
        }

        const data: ApiResponse = await response.json()

        if (data.success) {
          setPosts(data.items || [])
        } else {
          throw new Error(data.error || "Failed to fetch posts")
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load posts")

        // Fallback to demo data if API fails
        setPosts([
          {
            title: "Welcome to Our Blog",
            link: "#",
            contentSnippet:
              "This is a demo post while we wait for content from Medium.",
            content: "<p>This is a demo post while we set up your Medium integration.</p><p>We shall shortly share the blog content with you. The blog component supports rich content including images, formatted text, and more.</p>",
            thumbnail: "/blogThumbnail.png?height=400&width=600",
            pubDate: new Date().toISOString(),
            categories: ["Demo"],
            author: "Intelli Team",
            readTime: "2 min read"
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const PostCard = ({ post }: { post: MediumPost }) => (
    <Card className="group overflow-hidden border-1 border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.thumbnail || "/blogThumbnail.png?height=400&width=600"}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {post.categories?.slice(0, 2).map((category, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-white/90 text-gray-800">
              {category}
            </Badge>
          ))}
          {post.content && (
            <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
              Full Article
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{post.contentSnippet}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {post.pubDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(post.pubDate)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/blog/${createSlug(post.title)}`}>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {post.content ? "Read Article" : "Read More"}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>

            {post.link !== "#" && (
              <Link href={post.link} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const PostSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <style jsx global>{`
        .article-content {
          line-height: 1.8;
          font-size: 16px;
        }
        
        .article-content p {
          margin-bottom: 1.5rem;
          color: #374151;
        }
        
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: #111827;
        }
        
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        
        .article-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .article-content ul,
        .article-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        
        .article-content li {
          margin-bottom: 0.5rem;
        }
        
        .article-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .article-content a:hover {
          color: #1d4ed8;
        }
        
        .article-content strong {
          font-weight: 600;
        }
        
        .article-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.875rem;
        }
        
        .article-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .article-content pre code {
          background-color: transparent;
          padding: 0;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          {/* Header Section */}
          <div className="text-center lg:text-left mb-12 lg:mb-16 space-y-4">
            <div className="inline-block">
              <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
                Latest Updates
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight py-2">
              Our Blog
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Stay up-to-date with the latest news, insights, and updates from Intelli.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">Unable to load latest posts</p>
                <p className="text-yellow-700 text-sm">
                  Showing demo content. Please check your Medium RSS feed configuration.
                </p>
              </div>
            </div>
          )}

          {/* Posts Grid */}
          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => <PostSkeleton key={index} />)
            ) : posts.length > 0 ? (
              posts.map((post, index) => <PostCard key={`${post.link}-${index}`} post={post} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts available</h3>
                <p className="text-gray-600">Check back later for new content!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default MediumBlogComponent