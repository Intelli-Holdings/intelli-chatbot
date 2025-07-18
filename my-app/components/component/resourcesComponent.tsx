"use client";
import React, { useState, useEffect, useCallback } from 'react'
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CardContent, Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Play, BookOpen, Users } from "lucide-react"

interface BlogPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
  readTime?: string;
  author?: string;
}

interface VideoContent {
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

interface CourseContent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  instructor: string;
  duration: string;
  lessons: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  students: number;
  price: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export function ResourcesComponent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [courses, setCourses] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByDate, setFilterByDate] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Articles');
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 9,
  });

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Mock data for demonstration - replace with actual API calls
      if (activeCategory === 'Articles') {
        const mockPosts: BlogPost[] = [
          {
            id: '1',
            title: 'Getting Started with AI Customer Support',
            description: 'Learn how to implement AI-powered customer support solutions for your business.',
            imageUrl: '/blogThumbnail.png',
            category: 'AI',
            date: '2024-01-15',
            readTime: '5 min read',
            author: 'Intelli Team'
          },
          {
            id: '2',
            title: 'WhatsApp Business API Integration Guide',
            description: 'Complete guide to integrating WhatsApp Business API with your customer support system.',
            imageUrl: '/blogThumbnail.png',
            category: 'Integration',
            date: '2024-01-10',
            readTime: '8 min read',
            author: 'Tech Team'
          },
          {
            id: '3',
            title: 'Maximizing Customer Satisfaction with AI',
            description: 'Strategies to improve customer satisfaction using artificial intelligence.',
            imageUrl: '/blogThumbnail.png',
            category: 'Strategy',
            date: '2024-01-05',
            readTime: '6 min read',
            author: 'Customer Success'
          }
        ];
        setPosts(mockPosts);
      } else if (activeCategory === 'Videos') {
        try {
          // Fetch real YouTube videos from our API
          const response = await fetch('/api/youtube/videos?maxResults=12&channelHandle=Intelli-Concierge');
          
          if (!response.ok) {
            throw new Error('Failed to fetch YouTube videos');
          }
          
          const data = await response.json();
          
          if (data.videos && data.videos.length > 0) {
            setVideos(data.videos);
          } else {
            // Fallback to mock data if no videos found
            const mockVideos: VideoContent[] = [
              {
                id: '1',
                title: 'Intelli Platform Demo - Complete Walkthrough',
                description: 'See how Intelli transforms customer support with AI-powered automation.',
                thumbnailUrl: '/blogThumbnail.png',
                duration: '12:34',
                views: '1.2K',
                uploadDate: '2024-01-15',
                author: 'Intelli Official',
                videoUrl: 'https://www.youtube.com/@Intelli-Concierge'
              },
              {
                id: '2',
                title: 'Setting Up Your First AI Assistant',
                description: 'Step-by-step tutorial on creating and configuring your AI customer support assistant.',
                thumbnailUrl: '/blogThumbnail.png',
                duration: '8:45',
                views: '856',
                uploadDate: '2024-01-12',
                author: 'Intelli Tutorials',
                videoUrl: 'https://www.youtube.com/@Intelli-Concierge'
              },
              {
                id: '3',
                title: 'WhatsApp Integration Best Practices',
                description: 'Learn the best practices for integrating WhatsApp with your business.',
                thumbnailUrl: '/blogThumbnail.png',
                duration: '15:20',
                views: '2.1K',
                uploadDate: '2024-01-08',
                author: 'Intelli Tutorials',
                videoUrl: 'https://www.youtube.com/@Intelli-Concierge'
              }
            ];
            setVideos(mockVideos);
          }
        } catch (videoError) {
          console.error('Error fetching YouTube videos:', videoError);
          // Fallback to mock data on error
          const mockVideos: VideoContent[] = [
            {
              id: '1',
              title: 'Intelli Platform Demo - Complete Walkthrough',
              description: 'See how Intelli transforms customer support with AI-powered automation.',
              thumbnailUrl: '/blogThumbnail.png',
              duration: '12:34',
              views: '1.2K',
              uploadDate: '2024-01-15',
              author: 'Intelli Official',
              videoUrl: 'https://www.youtube.com/@Intelli-Concierge'
            },
            {
              id: '2',
              title: 'Setting Up Your First AI Assistant',
              description: 'Step-by-step tutorial on creating and configuring your AI customer support assistant.',
              thumbnailUrl: '/blogThumbnail.png',
              duration: '8:45',
              views: '856',
              uploadDate: '2024-01-12',
              author: 'Intelli Tutorials',
              videoUrl: 'https://www.youtube.com/@Intelli-Concierge'
            },
            {
              id: '3',
              title: 'WhatsApp Integration Best Practices',
              description: 'Learn the best practices for integrating WhatsApp with your business.',
              thumbnailUrl: '/blogThumbnail.png',
              duration: '15:20',
              views: '2.1K',
              uploadDate: '2024-01-08',
              author: 'Intelli Tutorials',
              videoUrl: 'https://www.youtube.com/@Intelli-Concierge'
            }
          ];
          setVideos(mockVideos);
        }
      } else if (activeCategory === 'Courses') {
        const mockCourses: CourseContent[] = [
          {
            id: '1',
            title: 'Complete AI Customer Support Mastery',
            description: 'Master the art of AI-powered customer support from beginner to advanced level.',
            imageUrl: '/blogThumbnail.png',
            instructor: 'Sila Kironji',
            duration: '8 hours',
            lessons: 24,
            level: 'Intermediate',
            rating: 4.8,
            students: 1243,
            price: '$99'
          },
          {
            id: '2',
            title: 'WhatsApp Business API Development',
            description: 'Learn to build and integrate WhatsApp solutions for business communications.',
            imageUrl: '/blogThumbnail.png',
            instructor: 'Sila Kironji',
            duration: '6 hours',
            lessons: 18,
            level: 'Advanced',
            rating: 4.9,
            students: 892,
            price: '$149'
          },
          {
            id: '3',
            title: 'Customer Experience Design with AI',
            description: 'Design exceptional customer experiences using artificial intelligence.',
            imageUrl: '/blogThumbnail.png',
            instructor: 'Sika Antwi',
            duration: '4 hours',
            lessons: 12,
            level: 'Beginner',
            rating: 4.7,
            students: 2156,
            price: '$79'
          }
        ];
        setCourses(mockCourses);
      }

      setPaginationInfo(prevState => ({
        ...prevState,
        totalPages: 2, // Mock pagination
      }));
    } catch (err) {
      setError('Failed to load content. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent, paginationInfo.currentPage, activeCategory]);

  const handlePageChange = (newPage: number) => {
    setPaginationInfo(prevState => ({
      ...prevState,
      currentPage: newPage,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSearchTerm(''); // Clear search when switching categories
    setPaginationInfo(prevState => ({
      ...prevState,
      currentPage: 1, // Reset to first page when changing category
    }));
  };

  const getFilteredContent = () => {
    if (activeCategory === 'Articles') {
      return posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase())
      ).sort((a, b) => filterByDate ? new Date(b.date).getTime() - new Date(a.date).getTime() : 0);
    } else if (activeCategory === 'Videos') {
      return videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      ).sort((a, b) => filterByDate ? new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime() : 0);
    } else if (activeCategory === 'Courses') {
      return courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return [];
  };

  const renderArticles = (articles: BlogPost[]) => (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-12">
      {articles.map((post) => (
        <Card key={post.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                alt={post.title}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
                src={post.imageUrl}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="text-xs bg-white/90 text-gray-800">
                  {post.category}
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                {post.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                {post.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  {post.readTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  Read More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );

  const renderVideos = (videos: VideoContent[]) => (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
      {videos.map((video) => (
        <Card 
          key={video.id} 
          className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm cursor-pointer"
          onClick={() => window.open(video.videoUrl, '_blank')}
        >
          <CardContent className="p-0">
            <div className="relative aspect-video overflow-hidden">
              <Image
                alt={video.title}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
                src={video.thumbnailUrl}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Play className="w-6 h-6 text-white ml-1" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4">
                <Badge className="bg-black/80 text-white text-xs">
                  {video.duration}
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {video.description}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="font-medium">{video.author}</span>
                  <span>•</span>
                  <span>{video.views} views</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(video.uploadDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );

  const renderCourses = (courses: CourseContent[]) => (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
      {courses.map((course) => (
        <Card key={course.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
          <CardContent className="p-0">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                alt={course.title}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
                src={course.imageUrl}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute top-4 left-4">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {course.level}
                </Badge>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-blue-600 text-white text-sm font-bold">
                  {course.price}
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                {course.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {course.description}
              </p>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{course.instructor}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{course.lessons} lessons</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{course.students.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <div className="flex text-yellow-400">
                    {'★'.repeat(Math.floor(course.rating))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{course.rating}</span>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Enroll Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header Section */}
        <div className="text-center lg:text-center mb-12 lg:mb-16 space-y-4">
          <div className="inline-block">
            <Badge variant="outline" className="mb-4 text-green-600 border-green-200">
              Resources
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent leading-tight py-2">
            Enhance the Growth of Your Business
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover valuable resources to help you grow and succeed with AI-powered solutions.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-center space-x-8 mb-12">
          {['Articles', 'Videos', 'Courses'].map((category) => (
            <Link
              key={category}
              className={`pb-2 text-lg font-medium transition-colors duration-200 ${
                activeCategory === category 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-500'
              }`}
              href="#"
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </Link>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
          <div className="relative">
            <Input
              className="pl-10 w-80 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
              placeholder="Search for articles, videos, and courses..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="date-filter"
              checked={filterByDate}
              onCheckedChange={(checked) => setFilterByDate(checked as boolean)}
            />
            <label className="text-sm font-medium text-gray-600" htmlFor="date-filter">
              Sort by Date
            </label>
          </div>
        </div>
        {/* Loading, Error, and Content States */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800 font-medium">Oops! Something went wrong</p>
              <p className="text-red-600 text-sm mt-2">{error}</p>
            </div>
          </div>
        )}
        
        {!loading && !error && (
          <>
            {/* Content Display */}
            <div className="mb-12">
              {activeCategory === 'Articles' && renderArticles(getFilteredContent() as BlogPost[])}
              {activeCategory === 'Videos' && renderVideos(getFilteredContent() as VideoContent[])}
              {activeCategory === 'Courses' && renderCourses(getFilteredContent() as CourseContent[])}
            </div>

            {/* Pagination */}
            {getFilteredContent().length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((paginationInfo.currentPage - 1) * paginationInfo.itemsPerPage) + 1} to{' '}
                  {Math.min(paginationInfo.currentPage * paginationInfo.itemsPerPage, getFilteredContent().length)} of{' '}
                  {getFilteredContent().length} {activeCategory.toLowerCase()}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginationInfo(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={paginationInfo.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {paginationInfo.currentPage} of {Math.ceil(getFilteredContent().length / paginationInfo.itemsPerPage)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginationInfo(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={paginationInfo.currentPage >= Math.ceil(getFilteredContent().length / paginationInfo.itemsPerPage)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {/* No Results */}
            {getFilteredContent().length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No {activeCategory.toLowerCase()} found matching your search.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function SearchIcon(props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}