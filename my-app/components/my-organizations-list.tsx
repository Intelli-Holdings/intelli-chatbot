"use client"

import Image from "next/image"

/**
 * Example component showing how to fetch and display user's organizations
 * from Django backend with Clerk authentication
 */

import { useEffect, useState } from 'react';
import { useAuthApi, type MyOrganizationsResponse, type Organization } from '@/lib/auth-api-client';
import { useUser } from '@clerk/nextjs';

import { logger } from "@/lib/logger";
export function MyOrganizationsList() {
  const { isSignedIn } = useUser();
  const { get } = useAuthApi();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    async function fetchOrganizations() {
      try {
        setLoading(true);
        setError(null);

        // Fetch organizations from Django backend
        const data = await get<MyOrganizationsResponse>('/auth/my-organizations/');
        setOrganizations(data.organizations);
      } catch (err) {
        logger.error('Failed to fetch organizations:', { error: err instanceof Error ? err.message : String(err) });
        setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, [get, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p className="text-gray-600">Please sign in to view your organizations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="p-4 border rounded bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
        <div className="p-4 border rounded bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 rounded bg-red-50">
        <p className="text-red-600 font-semibold">Error</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="p-8 border rounded bg-gray-50 text-center">
        <p className="text-gray-600">You are not a member of any organizations yet.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create Organization
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">My Organizations ({organizations.length})</h2>

      {organizations.map((org) => (
        <div
          key={org.organization_id}
          className="p-4 border rounded bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            {org.logo_url && (
              <Image
                src={org.logo_url}
                alt={org.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{org.name}</h3>
                  <p className="text-sm text-gray-500">@{org.slug}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {org.membership.role_name}
                </span>
              </div>

              <div className="mt-3 flex gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">{org.members_count}</span>{' '}
                  {org.members_count === 1 ? 'member' : 'members'}
                </div>
                <div>
                  Joined: {new Date(org.membership.joined_at).toLocaleDateString()}
                </div>
              </div>

              {org.membership.permissions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {org.membership.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
