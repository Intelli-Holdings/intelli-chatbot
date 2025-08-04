// app/api/medium/route.ts
import Parser from 'rss-parser';
import { 
  extractImageFromContent, 
  calculateReadTime, 
  createContentSnippet 
} from '@/lib/blog-utils';

interface MediumItem {
  title: string;
  link: string;
  guid?: string;
  creator?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  categories?: string[];
  'content:encoded'?: string;
  'dc:creator'?: string;
}

interface MediumFeed {
  title?: string;
  description?: string;
  link?: string;
  image?: {
    url?: string;
    title?: string;
    link?: string;
  };
  lastBuildDate?: string;
  items: MediumItem[];
}

interface ProcessedPost {
  title: string;
  link: string;
  contentSnippet: string;
  content: string;
  thumbnail?: string;
  pubDate?: string;
  categories?: string[];
  author?: string;
  readTime?: string;
  guid?: string;
}

export async function GET() {
  try {
    const parser = new Parser({
      customFields: {
        item: [
          ['content:encoded', 'contentEncoded'],
          ['dc:creator', 'creator']
        ]
      }
    });

    // Use the correct RSS feed URL
    const feed = await parser.parseURL('https://medium.com/feed/@intelli') as MediumFeed;

    // Process the feed items to extract all necessary data
    const processedItems: ProcessedPost[] = feed.items.map((item: any) => {
      const fullContent = item.contentEncoded || item.content || '';
      const thumbnail = extractImageFromContent(fullContent);
      const contentSnippet = item.contentSnippet || createContentSnippet(fullContent);
      
      return {
        title: item.title || '',
        link: item.link || '',
        contentSnippet,
        content: fullContent,
        thumbnail,
        pubDate: item.pubDate || item.isoDate,
        categories: item.categories || [],
        author: item.creator || item['dc:creator'] || 'Intelli',
        readTime: calculateReadTime(fullContent),
        guid: item.guid
      };
    });

    const response = {
      success: true,
      feedInfo: {
        title: feed.title,
        description: feed.description,
        link: feed.link,
        image: feed.image,
        lastBuildDate: feed.lastBuildDate
      },
      items: processedItems,
      totalItems: processedItems.length
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('Error fetching Medium feed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Medium feed',
      items: [],
      message: 'Unable to fetch the latest posts from Medium. Please try again later.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
