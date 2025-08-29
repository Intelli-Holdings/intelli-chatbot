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

interface YouTubeAPIResponse {
  items: Array<{
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      thumbnails: {
        medium: {
          url: string;
        };
        high: {
          url: string;
        };
      };
      channelTitle: string;
    };
  }>;
}

interface YouTubeVideoDetailsResponse {
  items: Array<{
    id: string;
    contentDetails: {
      duration: string;
    };
    statistics: {
      viewCount: string;
    };
  }>;
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

export class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YouTube API key not found. Please add YOUTUBE_API_KEY to your environment variables.');
    }
  }

  async getChannelVideos(channelHandle: string, maxResults: number = 12): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      throw new Error('YouTube API key is not configured');
    }

    try {
      // First, get the channel ID from the handle
      const channelResponse = await fetch(
        `${this.baseUrl}/channels?part=id&forHandle=${channelHandle}&key=${this.apiKey}`
      );

      if (!channelResponse.ok) {
        throw new Error(`Failed to fetch channel: ${channelResponse.statusText}`);
      }

      const channelData = await channelResponse.json();
      
      if (!channelData.items || channelData.items.length === 0) {
        throw new Error('Channel not found');
      }

      const channelId = channelData.items[0].id;

      // Search for videos from this channel
      const searchResponse = await fetch(
        `${this.baseUrl}/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${this.apiKey}`
      );

      if (!searchResponse.ok) {
        throw new Error(`Failed to fetch videos: ${searchResponse.statusText}`);
      }

      const searchData: YouTubeAPIResponse = await searchResponse.json();

      if (!searchData.items || searchData.items.length === 0) {
        return [];
      }

      // Get video IDs for fetching additional details
      const videoIds = searchData.items.map(item => item.id.videoId).join(',');

      // Fetch video details (duration, view count)
      const detailsResponse = await fetch(
        `${this.baseUrl}/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
      );

      if (!detailsResponse.ok) {
        throw new Error(`Failed to fetch video details: ${detailsResponse.statusText}`);
      }

      const detailsData: YouTubeVideoDetailsResponse = await detailsResponse.json();

      // Combine search results with details
      const videos: YouTubeVideo[] = searchData.items.map(item => {
        const details = detailsData.items.find(detail => detail.id === item.id.videoId);
        
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

      return videos;
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw error;
    }
  }

  // Get a single video's details
  async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    if (!this.apiKey) {
      throw new Error('YouTube API key is not configured');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch video details: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return null;
      }

      const video = data.items[0];
      
      return {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
        duration: formatDuration(video.contentDetails.duration),
        views: formatViewCount(video.statistics.viewCount),
        uploadDate: video.snippet.publishedAt,
        author: video.snippet.channelTitle,
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`
      };
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();
