import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, MessageSquare, Users } from 'lucide-react';

interface LoadingProgressProps {
  isLoading: boolean;
  loadingType: 'conversations' | 'initial';
  estimatedTime?: number;
  currentProgress?: number;
  message?: string;
}

export default function LoadingProgress({ 
  isLoading, 
  loadingType, 
  estimatedTime = 3000,
  currentProgress = 0,
  message 
}: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [displayMessage, setDisplayMessage] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    // Set appropriate messages based on loading type
    const messages = {
      conversations: [
        'Loading conversations...',
        'Fetching chat history...',
        'Preparing your chats...',
        'Almost ready...'
      ],
      initial: [
        'Initializing chat system...',
        'Connecting to your workspace...',
        'Loading your conversations...',
        'Preparing the interface...',
        'Almost ready...'
      ]
    };

    let messageIndex = 0;
    let progressValue = currentProgress;

    // If no external progress provided, simulate progress
    if (currentProgress === 0) {
      const interval = setInterval(() => {
        progressValue += Math.random() * 15 + 5; // Random increment between 5-20
        if (progressValue > 95) progressValue = 95; // Don't reach 100% until actually done
        
        setProgress(progressValue);
        
        // Update message based on progress
        const newMessageIndex = Math.floor((progressValue / 100) * messages[loadingType].length);
        if (newMessageIndex !== messageIndex && newMessageIndex < messages[loadingType].length) {
          messageIndex = newMessageIndex;
          setDisplayMessage(messages[loadingType][messageIndex]);
        }
      }, 200);

      return () => clearInterval(interval);
    } else {
      // Use external progress
      setProgress(currentProgress);
      if (message) {
        setDisplayMessage(message);
      } else {
        const messageIndex = Math.floor((currentProgress / 100) * messages[loadingType].length);
        setDisplayMessage(messages[loadingType][Math.min(messageIndex, messages[loadingType].length - 1)]);
      }
    }
  }, [isLoading, loadingType, currentProgress, message]);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  const getIcon = () => {
    switch (loadingType) {
      case 'conversations':
        return <Users className="h-5 w-5 animate-pulse" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <div className="flex items-center space-x-3 text-blue-600">
        {getIcon()}
        <span className="text-lg font-medium">{displayMessage}</span>
      </div>
      
      <div className="w-full max-w-md space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{Math.round(progress)}% complete</span>
          <span>
            {progress < 30 ? 'Starting...' : 
             progress < 70 ? 'Loading...' : 
             progress < 95 ? 'Almost done...' : 'Finishing up...'}
          </span>
        </div>
      </div>

      {loadingType === 'initial' && (
        <div className="text-center text-sm text-gray-600 mt-4">
          <p>Setting up your chat environment</p>
          <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
        </div>
      )}
    </div>
  );
}

// Skeleton loader for chat list
export function ChatListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array(count).fill(0).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="flex items-center gap-3 p-3 border-b border-gray-100 animate-pulse"
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-[shimmer_2s_infinite_linear]"></div>
            <div className="h-3 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-[shimmer_2s_infinite_linear]"></div>
          </div>
          <div className="h-3 w-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-[shimmer_2s_infinite_linear]"></div>
        </div>
      ))}
    </div>
  );
}

// Loading indicator for load more
export function LoadMoreIndicator() {
  return (
    <div className="flex items-center justify-center gap-2 p-4 text-blue-600">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Loading more conversations...</span>
    </div>
  );
}
