import React from 'react';

/**
 * Professional skeleton loader for Website conversations page
 * Mimics the actual structure of the page while loading
 */
export function WebsiteSkeletonLoader() {
  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-[#e9edef] bg-white shadow-lg">
      {/* Left Sidebar Skeleton */}
      <div className="w-full md:w-96 bg-white border-r border-[#e9edef] flex flex-col">
        {/* Header Skeleton */}
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
          </div>

          {/* Widget Selector Skeleton */}
          <div className="h-10 w-full bg-white border border-gray-200 rounded-md mb-2 flex items-center px-3">
            <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="relative">
            <div className="h-10 w-full bg-white border border-gray-200 rounded-md flex items-center px-10">
              <div className="h-3 w-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            </div>
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          </div>
        </div>

        {/* Visitors List Skeleton */}
        <div className="flex-1 overflow-hidden">
          {[...Array(7)].map((_, index) => (
            <div
              key={index}
              className="w-full p-4 flex items-start gap-3 border-b border-gray-100"
            >
              {/* Avatar Skeleton */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full border-2 border-white animate-shimmer" />
              </div>

              {/* Content Skeleton */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="h-4 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
                  <div className="h-3 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
                </div>
                <div className="h-3 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel Skeleton */}
      <div className="flex-1 flex flex-col bg-[#efeae2]">
        {/* Empty State Placeholder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <div className="h-16 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-48 mx-auto bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              <div className="h-4 w-64 mx-auto bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for when a conversation is selected
 */
export function WebsiteChatSkeletonLoader() {
  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-[#e9edef] bg-white shadow-lg">
      {/* Left Sidebar with Visitors - Same as above */}
      <div className="w-full md:w-96 bg-white border-r border-[#e9edef] flex flex-col">
        <div className="bg-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
          </div>
          <div className="h-10 w-full bg-white border border-gray-200 rounded-md mb-2" />
          <div className="h-10 w-full bg-white border border-gray-200 rounded-md" />
        </div>
        <div className="flex-1 overflow-hidden">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-4 flex items-start gap-3 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
                <div className="h-3 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel with Chat Skeleton */}
      <div className="flex-1 flex flex-col bg-[#efeae2]">
        {/* Chat Header Skeleton */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              <div className="h-3 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            </div>
          </div>
          <div className="h-9 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-md animate-shimmer" />
        </div>

        {/* Messages Area Skeleton */}
        <div className="flex-1 p-4 overflow-hidden" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}>
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Message bubbles skeleton - alternating left and right */}
            {[...Array(5)].map((_, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                      isLeft ? 'bg-white' : 'bg-[#d9fdd3]'
                    }`}
                  >
                    <div className="space-y-2">
                      <div
                        className={`h-3 ${
                          index % 2 === 0 ? 'w-48' : 'w-40'
                        } bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer`}
                      />
                      {index % 3 === 0 && (
                        <div className="h-3 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
                      )}
                      <div className="flex items-center justify-end gap-1">
                        <div className="h-2 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Input Skeleton */}
        <div className="bg-gray-100 border-t border-gray-200 p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 h-12 bg-white rounded-full border border-gray-200 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact skeleton loader for visitor list only
 */
export function VisitorListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-0">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className="p-4 flex items-start gap-3 border-b border-gray-100"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              <div className="h-3 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            </div>
            <div className="h-3 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
