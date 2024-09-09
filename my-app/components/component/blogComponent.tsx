"use client";
import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CardContent, Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  date: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  postsPerPage: number;
}

export function DynamicBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByDate, setFilterByDate] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Articles');
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    postsPerPage: 9,
  });

  useEffect(() => {
    fetchPosts();
  }, [paginationInfo.currentPage, activeCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Replace this URL with your actual API endpoint
      const response = await fetch(`https://api.example.com/posts`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data.posts);
      setPaginationInfo(prevState => ({
        ...prevState,
        totalPages: data.totalPages,
      }));
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPaginationInfo(prevState => ({
      ...prevState,
      currentPage: newPage,
    }));
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setPaginationInfo(prevState => ({
      ...prevState,
      currentPage: 1, // Reset to first page when changing category
    }));
  };

  const filteredPosts = posts
    .filter(post => post.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => filterByDate ? new Date(b.date).getTime() - new Date(a.date).getTime() : 0);

  return (
    <div className="bg-white min-h-screen relative py-14">
      <div className="container mx-auto px-4">
        <header className="container mx-auto my-12 text-center">
          <h1 className="text-5xl text-center font-bold text-blue-600 mb-20">
            Enhance the growth of your business
          </h1>
          <div className="flex justify-center space-x-8 mb-12">
            {['Articles', 'Videos', 'Courses'].map((category) => (
              <Link
                key={category}
                className={`pb-2 ${activeCategory === category ? 'border-b-2 border-blue-500' : 'hover:text-blue-500'}`}
                href="#"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </Link>
            ))}
          </div>
          <div className="flex justify-center space-x-4">
            <div className="relative">
              <Input
                className="pl-10"
                placeholder="Search for article"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex items-center">
              <Checkbox
                id="date-filter"
                checked={filterByDate}
                onCheckedChange={(checked) => setFilterByDate(checked as boolean)}
              />
              <label className="text-sm font-medium leading-none ml-2" htmlFor="date-filter">
                Filter by Date
              </label>
            </div>
          </div>
        </header>
        {loading && <p className="text-center">Loading posts...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <>
            <section className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
              {filteredPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <Image
                      alt={post.title}
                      className="object-cover rounded-lg w-full h-48"
                      height={200}
                      src={post.imageUrl}
                      width={300}
                    />
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{post.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
            <div className="flex justify-center space-x-2 mt-8">
              <Button
                onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
                disabled={paginationInfo.currentPage === 1}
              >
                Previous
              </Button>
              <span className="py-2 px-4 bg-gray-200 rounded">
                Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                disabled={paginationInfo.currentPage === paginationInfo.totalPages}
              >
                Next
              </Button>
            </div>
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