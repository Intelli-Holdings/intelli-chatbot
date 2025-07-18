import { NextRequest, NextResponse } from 'next/server';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  views: string;
  uploadDate: string;
  author: string;
  videoUrl: string;
}

// Helper function to format ISO 8601 duration to readable format
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Helper function to format view count
function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount);
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const maxResults = searchParams.get('maxResults') || '12';
  const channelHandle = searchParams.get('channelHandle') || 'Intelli-Concierge';

  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YouTube API key not configured' },
      { status: 500 }
    );
  }

  try {
    const baseUrl = 'https://www.googleapis.com/youtube/v3';

    // First, get the channel ID from the handle
    const channelResponse = await fetch(
      `${baseUrl}/channels?part=id&forHandle=${channelHandle}&key=${apiKey}`
    );

    if (!channelResponse.ok) {
      throw new Error(`Failed to fetch channel: ${channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      // Try searching by channel name if handle doesn't work
      const searchChannelResponse = await fetch(
        `${baseUrl}/search?part=snippet&q=${channelHandle}&type=channel&maxResults=1&key=${apiKey}`
      );

      if (!searchChannelResponse.ok) {
        throw new Error(`Failed to search for channel: ${searchChannelResponse.statusText}`);
      }

      const searchChannelData = await searchChannelResponse.json();
      
      if (!searchChannelData.items || searchChannelData.items.length === 0) {
        return NextResponse.json(
          { error: 'Channel not found' },
          { status: 404 }
        );
      }

      // Use the channel ID from search results
      const channelId = searchChannelData.items[0].snippet.channelId;

      // Search for videos from this channel
      const searchResponse = await fetch(
        `${baseUrl}/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`
      );

      if (!searchResponse.ok) {
        throw new Error(`Failed to fetch videos: ${searchResponse.statusText}`);
      }

      const searchData = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return NextResponse.json({ videos: [] });
      }

      // Get video IDs for fetching additional details
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      // Fetch video details (duration, view count)
      const detailsResponse = await fetch(
        `${baseUrl}/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
      );

      if (!detailsResponse.ok) {
        throw new Error(`Failed to fetch video details: ${detailsResponse.statusText}`);
      }

      const detailsData = await detailsResponse.json();

      // Combine search results with details
      const videos: YouTubeVideo[] = searchData.items.map((item: any) => {
        const details = detailsData.items.find((detail: any) => detail.id === item.id.videoId);
        
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
          duration: details ? formatDuration(details.contentDetails.duration) : '0:00',
          views: details ? formatViewCount(details.statistics.viewCount) : '0',
          uploadDate: item.snippet.publishedAt,
          author: item.snippet.channelTitle,
          videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
        };
      });

      return NextResponse.json({ videos });
    }

    const channelId = channelData.items[0].id;

    // Search for videos from this channel
    const searchResponse = await fetch(
      `${baseUrl}/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${apiKey}`
    );

    if (!searchResponse.ok) {
      throw new Error(`Failed to fetch videos: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    // Get video IDs for fetching additional details
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // Fetch video details (duration, view count)
    const detailsResponse = await fetch(
      `${baseUrl}/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
    );

    if (!detailsResponse.ok) {
      throw new Error(`Failed to fetch video details: ${detailsResponse.statusText}`);
    }

    const detailsData = await detailsResponse.json();

    // Combine search results with details
    const videos: YouTubeVideo[] = searchData.items.map((item: any) => {
      const details = detailsData.items.find((detail: any) => detail.id === item.id.videoId);
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
        duration: details ? formatDuration(details.contentDetails.duration) : '0:00',
        views: details ? formatViewCount(details.statistics.viewCount) : '0',
        uploadDate: item.snippet.publishedAt,
        author: item.snippet.channelTitle,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      };
    });

    return NextResponse.json({ videos });

  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos from YouTube' },
      { status: 500 }
    );
  }
}
