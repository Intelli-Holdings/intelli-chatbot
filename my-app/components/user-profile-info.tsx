"use client"

import Image from "next/image"

/**
 * Example component showing how to use Clerk-authenticated Django API calls
 *
 * This component fetches and displays the authenticated user's information
 * from your Django backend using the Clerk JWT token.
 */

import { useEffect, useState } from 'react';
import { useAuthApi, type UserInfo } from '@/lib/auth-api-client';
import { useUser } from '@clerk/nextjs';

import { logger } from "@/lib/logger";
export function UserProfileInfo() {
  const { isSignedIn } = useUser();
  const { get } = useAuthApi();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    async function fetchUserInfo() {
      try {
        setLoading(true);
        setError(null);

        // Fetch user info from Django backend
        const data = await get<UserInfo>('/auth/whoami/');
        setUserInfo(data);
      } catch (err) {
        logger.error('Failed to fetch user info:', { error: err instanceof Error ? err.message : String(err) });
        setError(err instanceof Error ? err.message : 'Failed to fetch user info');
      } finally {
        setLoading(false);
      }
    }

    fetchUserInfo();
  }, [get, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 border rounded bg-gray-50 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-red-600 font-semibold">Error</p>
        <p className="text-red-500 text-sm">{error}</p>
        <p className="text-xs text-gray-600 mt-2">
          Make sure your Django backend is running and CLERK_FRONTEND_API is set correctly.
        </p>
      </div>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        {userInfo.user.profile_image_url && (
          <Image
            src={userInfo.user.profile_image_url}
            alt={userInfo.user.full_name}
            width={64}
            height={64}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h3 className="text-xl font-bold">{userInfo.user.full_name}</h3>
          <p className="text-gray-600">{userInfo.user.email}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">User ID:</span>
          <span className="font-mono">{userInfo.user.user_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Clerk ID:</span>
          <span className="font-mono text-xs">{userInfo.user.clerk_id}</span>
        </div>
        {userInfo.user.is_staff && (
          <div className="flex justify-between">
            <span className="text-gray-500">Role:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              Staff
            </span>
          </div>
        )}
      </div>

      {userInfo.token_info.org_id && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold mb-2">Current Organization</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Org ID:</span>
              <span className="font-mono text-xs">{userInfo.token_info.org_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                {userInfo.token_info.org_role}
              </span>
            </div>
            {userInfo.token_info.org_slug && (
              <div className="flex justify-between">
                <span className="text-gray-500">Slug:</span>
                <span className="font-mono">{userInfo.token_info.org_slug}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <p>✅ Successfully authenticated with Django backend</p>
        <p className="mt-1">Token expires: {new Date(userInfo.token_info.expires_at * 1000).toLocaleString()}</p>
      </div>
    </div>
  );
}
