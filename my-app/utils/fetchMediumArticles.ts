// src/helpers/fetchMediumArticles.ts

import RSSParser from "rss-parser";

interface Article {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  categories: string[];
}

export async function fetchMediumArticles(): Promise<Article[]> {
  const parser = new RSSParser();
  const feed = await parser.parseURL("https://intelli.medium.com/feed");
  
  return feed.items.map((item) => ({
    title: item.title || "",
    link: item.link || "",
    pubDate: item.pubDate || "",
    contentSnippet: item.contentSnippet || "",
    categories: item.categories || [],
  }));
}
