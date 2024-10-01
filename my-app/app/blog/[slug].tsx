import { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from 'next'
import { ParsedUrlQuery } from 'querystring'

interface BlogPost {
  id: number;
  title: string;
  content: string;
  image: string;
  category?: string;
  slug: string;
}

interface Params extends ParsedUrlQuery {
  slug: string;
}

// This function gets called at build time
export async function generateStaticParams() {
  // In a real application, you would fetch this data from an API or database
  const posts = [
    { slug: 'top-film-grants-2024' },
    { slug: 'client-focused-design-process' },
    { slug: 'film-crew-day-rates-2024' },
    { slug: 'client-focused-design-process-extended' },
  ]

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

// This function gets called at build time
export const getStaticProps: GetStaticProps<{ post: BlogPost }, Params> = async (context) => {
  const { slug } = context.params as Params

  // In a real application, you would fetch this data from an API or database
  const post: BlogPost = {
    id: 1,
    title: `Blog Post: ${slug}`,
    content: "This is the content of the blog post.",
    image: "/images/sample-image.jpg",
    slug: slug,
  }

  return { props: { post } }
}

export default function Page({
  post,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <img src={post.image} alt={post.title} className="w-full h-64 object-cover mb-4" />
      <p>{post.content}</p>
    </div>
  )
}