import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, ExternalLink } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { createSlug, formatDate } from "@/lib/blog-utils"
import { sanitizeHtml } from "@/lib/sanitize"
import { fetchMediumPosts } from "@/lib/medium-feed"
import { RelatedArticleCard } from "./article-content"

export const revalidate = 300 // revalidate every 5 minutes (ISR)

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params
  const feedResult = await fetchMediumPosts()

  if (!feedResult.success) {
    return { title: "Article – Intelli Blog" }
  }

  const article = feedResult.items.find((post) => createSlug(post.title) === slug)

  if (!article) {
    return { title: "Article Not Found – Intelli Blog" }
  }

  return {
    title: `${article.title} – Intelli Blog`,
    description: article.contentSnippet,
    openGraph: {
      title: article.title,
      description: article.contentSnippet,
      url: `https://intelliconcierge.com/blog/${slug}`,
      type: "article",
      ...(article.thumbnail && { images: [{ url: article.thumbnail }] }),
      ...(article.pubDate && { publishedTime: article.pubDate }),
      ...(article.author && { authors: [article.author] }),
    },
  }
}

export async function generateStaticParams() {
  const feedResult = await fetchMediumPosts()

  if (!feedResult.success) {
    return []
  }

  return feedResult.items.map((post) => ({
    slug: createSlug(post.title),
  }))
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = params
  const feedResult = await fetchMediumPosts()

  if (!feedResult.success) {
    notFound()
  }

  const article = feedResult.items.find((post) => createSlug(post.title) === slug)

  if (!article) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/blog">
              <Button variant="ghost" className="mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <div className="text-center py-20">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h1>
              <p className="text-gray-600 mb-8">
                The article you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
              <Link href="/blog">
                <Button>Return to Blog</Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const relatedArticles = feedResult.items
    .filter((post) => createSlug(post.title) !== slug)
    .slice(0, 3)

  return (
    <>
      <style>{`
        .article-content {
          line-height: 1.8;
          font-size: 18px;
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
          margin-top: 2.5rem;
          margin-bottom: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .article-content h1 { font-size: 2.25rem; }
        .article-content h2 { font-size: 1.875rem; }
        .article-content h3 { font-size: 1.5rem; }

        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 2rem 0;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .article-content figure {
          margin: 2rem 0;
          text-align: center;
        }

        .article-content figcaption {
          margin-top: 0.75rem;
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
        }

        .article-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
          font-size: 1.125rem;
        }

        .article-content ul,
        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .article-content li {
          margin-bottom: 0.75rem;
        }

        .article-content a {
          color: #2563eb;
          text-decoration: underline;
          font-weight: 500;
        }

        .article-content a:hover {
          color: #1d4ed8;
        }

        .article-content strong {
          font-weight: 600;
          color: #111827;
        }

        .article-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-family: ui-monospace, SFMono-Regular, monospace;
          font-size: 0.875rem;
          color: #dc2626;
        }

        .article-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1.5rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 2rem 0;
        }

        .article-content pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
        }

        .article-content iframe {
          width: 100%;
          max-width: 600px;
          margin: 2rem auto;
          display: block;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-8 hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Article Content */}
          <article className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              <div className="flex flex-wrap gap-2 mb-6">
                {article.categories?.map((category, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {category}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{article.title}</h1>

              <div className="flex items-center gap-6 text-gray-600 border-b border-gray-200 pb-6">
                {article.author && <span className="font-medium">by {article.author}</span>}
                {article.pubDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.pubDate, "long")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{article.readTime || "5 min read"}</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {article.thumbnail && (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-12 shadow-2xl">
                <Image src={article.thumbnail} alt={article.title} fill className="object-cover" priority />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-gray max-w-none prose-lg">
              <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
            </div>

            {/* Original Article Link */}
            {article.link !== "#" && (
              <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-800 mb-4 font-medium">Want to engage with this article on Medium?</p>
                <Link href={article.link} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View on Medium
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">More Articles</h2>
                <p className="text-gray-600">Continue reading with these related articles</p>
              </div>

              <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {relatedArticles.map((post, index) => (
                  <RelatedArticleCard key={`${post.link}-${index}`} post={post} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/blog">
                  <Button variant="outline" size="lg">
                    View All Articles
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
