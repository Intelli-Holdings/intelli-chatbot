import React from 'react';
import Recent from '@/components/sections/articles/recent';
import settings from '@/content/_settings.json';
import {Navbar} from '@/components/navbar';
import Blog from '@/components/sections/blog/blog-layout';
import BlogPage from '@/components/sections/blog/blog-page';
import { ChatWidget } from "@/components/ChatWidget";

interface Article {
  id: string;
  pubDate: string;
  thumbnail: string;
  link: string;
  title: string;
  author: string;
}

interface MediumArticles {
  items: Article[];
}

async function getMediumArticles(): Promise<MediumArticles> {
  const response = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/${settings.username.medium}`,
    { next: { revalidate: 600 } } // Revalidate every 10 minutes
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch Medium articles');
  }

  return response.json();
}

export default async function Page() {
  const mediumArticles = await getMediumArticles();

  return (
    <>
    <Navbar />  
      <BlogPage />
      <ChatWidget />
    </>
  );
}