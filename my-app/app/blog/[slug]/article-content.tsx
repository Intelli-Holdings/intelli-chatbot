"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, ExternalLink } from "lucide-react"
import { createSlug, formatDate } from "@/lib/blog-utils"
import type { MediumPost } from "@/lib/medium-feed"

export function RelatedArticleCard({ post }: { post: MediumPost }) {
  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.thumbnail || "/blogThumbnail.png?height=400&width=600"}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {post.categories?.slice(0, 2).map((category, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-white/90 text-gray-800">
              {category}
            </Badge>
          ))}
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {post.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{post.contentSnippet}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readTime}</span>
            </div>
          </div>

          <Link href={`/blog/${createSlug(post.title)}`}>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Read Article
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
