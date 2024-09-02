"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import xml2js from 'xml2js';
import Link from 'next/link';

interface Article {
  title: string;
  link: string;
  snippet: string;
}

const BlogPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('https://intelli.medium.com/feed', {
          headers: { 'Content-Type': 'application/rss+xml' },
        });
        
        const result = await xml2js.parseStringPromise(response.data, { trim: true, explicitArray: false });
        const items = result.rss.channel.item;

        const parsedArticles: Article[] = items.map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.description.replace(/<\/?[^>]+(>|$)/g, '').substring(0, 100) + '...', // Remove HTML tags and limit to 100 chars
        }));

        setArticles(parsedArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <div key={index} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
            <p className="text-gray-700">{article.snippet}</p>
            <Link href={article.link}>
              <a className="text-blue-500 hover:underline mt-4 block">Read more</a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
