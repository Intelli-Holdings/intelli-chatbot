import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPost {
  id: number;
  title: string;
  image: string;
  category?: string;
  slug: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "The Top Film Grants in 2024 That You Need to Know About",
    image: "/images/film-grants.jpg",
    slug: "top-film-grants-2024",
  },
  {
    id: 2,
    title: "Creating a Client Focused Design Process with Mitch Monson, Sibling Rivalary",
    image: "/images/client-focused-design.jpg",
    category: "Read",
    slug: "client-focused-design-process",
  },
  {
    id: 3,
    title: "Day Rates For Film Crew 2024: A Comprehensive Guide",
    image: "/images/film-crew-rates.jpg",
    slug: "film-crew-day-rates-2024",
  },
  {
    id: 4,
    title: "Creating a Client Focused Design Process with Mitch Monson, Sibling Rivalary",
    image: "/images/client-focused-design-large.jpg",
    category: "Read",
    slug: "client-focused-design-process-extended",
  },
];

const BlogPost: React.FC<{ post: BlogPost; featured?: boolean }> = ({ post, featured = false }) => (
  <Link href={`/blog/${post.slug}`} passHref aria-label={`Read article: ${post.title}`}>
    <div className={`block relative overflow-hidden rounded-lg shadow-lg ${featured ? 'aspect-w-16 aspect-h-9' : ''}`}>
      <Image
        src={post.image}
        alt={post.title}
        layout={featured ? "fill" : "responsive"}
        width={featured ? undefined : 500}
        height={featured ? undefined : 300}
        objectFit="cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 md:p-6">
        <h2 className={`text-white font-semibold ${featured ? 'text-xl md:text-2xl' : 'text-lg'}`}>{post.title}</h2>
        {post.category && (
          <span className={`inline-block bg-white text-black rounded-full mt-2 ${featured ? 'text-sm px-3 py-1' : 'text-xs px-2 py-1'}`}>
            {post.category}
          </span>
        )}
      </div>
    </div>
  </Link>
);

const BlogPage: React.FC = () => {
  const [featuredPost, ...otherPosts] = blogPosts;
  const latestPost = otherPosts.pop();

  return (
    <div className="container mx-auto px-4 py-8 pt-16">
      <h1 className="text-4xl font-bold mb-2">Intelli<span className="text-blue-600">.</span>Blog</h1>
      <p className="text-gray-600 mb-8">
        Protect your right to free speech with decentralised messaging, metadata privacy and e2e encryption.
      </p>

      {/* Featured Post */}
      <div className="mb-8">
        <BlogPost post={featuredPost} featured={true} />
      </div>

      {/* Other Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {otherPosts.map((post) => (
          <BlogPost key={post.id} post={post} />
        ))}
      </div>

      {/* Latest Post */}
      {latestPost && (
        <div className="w-full">
          <BlogPost post={latestPost} featured={true} />
        </div>
      )}
    </div>
  );
};

export default BlogPage;