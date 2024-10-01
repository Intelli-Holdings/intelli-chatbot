"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Define the structure of a post
interface MediumPost {
  title: string;
  link: string;
  contentSnippet: string;
  thumbnail?: string; // Optional: Add a thumbnail image property if you have one
}

const MediumBlogComponent: React.FC = () => {
  // Use the MediumPost type for posts state
  const [posts, setPosts] = useState<MediumPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch('/api/medium');
      const data = await response.json();
      setPosts(data.items); // Ensure data.items matches the MediumPost type
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold text-left mb-4"><br /> Blog</h1>
        <p className="text-gray-500 text-lg mb-8">
          Stay up-to-date with the latest news and updates from Intelli.
        </p>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 px-2 py-2">
          {posts.map((post) => (
            <Link href={post.link} key={post.link} target="_blank" rel="noopener noreferrer">
              <div className="relative group">
                {/* Use placeholder images if no thumbnail is available */}
                <Image
                  src={post.thumbnail || "/blogThumbnail.png"} // Default image if no thumbnail
                  alt={post.title}
                  width={600}
                  height={400}
                  className="rounded-lg object-cover"
                />
                <div className="absolute inset-0 rounded-lg  flex items-end p-10">
                  <h2 className="text-white text-3xl font-semibold">{post.title}</h2>
                </div>              
                <div className="relative rounded-md" style={{ backdropFilter: 'none' }} />
                <div className="absolute bottom-4 right-4 bg-white hover:bg-transparent hover-border-black text-black rounded-lg p-2">
                    <span className="text-sm">Read more</span>
                  </div>
              </div>
            </Link>
          ))}

          {/* Optionally include placeholder articles if no posts are available */}
          {posts.length === 0 && (
            <>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <div className="relative group ">
                  <Image
                    src="/blogThumbnail.png"
                    alt="Placeholder Image"
                    width={600}
                    height={400}
                    className="rounded-lg object-cover transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <h2 className="text-white text-xl font-semibold">Placeholder Article 1</h2>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-lg" style={{ backdropFilter: 'blur(4px)' }} />
                  <div className="absolute bottom-4 right-4 bg-white text-black rounded-lg p-2">
                    <span className="text-sm">Read more</span>
                  </div>
                </div>
              </Link>
              <Link href="#" target="_blank" rel="noopener noreferrer">
                <div className="relative group">
                  <Image
                    src="/blogThumbnail.png"
                    alt="Placeholder Image"
                    width={600}
                    height={400}
                    className="rounded-lg object-cover transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <h2 className="text-white text-xl font-semibold">Placeholder Article 2</h2>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-lg" style={{ backdropFilter: 'blur(4px)' }} />
                  <div className="absolute bottom-4 right-4 bg-white text-black rounded-lg p-2">
                    <span className="text-sm">Read more</span>
                  </div>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediumBlogComponent;
