"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useQuery } from "react-query"

export interface PaginatedContactsResponse<T> {
  count?: number
  next?: string | null
  previous?: string | null
  results?: T[]
}

const normalizeContacts = <T,>(data: PaginatedContactsResponse<T> | T[]): T[] => {
  if (Array.isArray(data)) return data
  return data.results || []
}

const getTotalCount = <T,>(data: PaginatedContactsResponse<T> | T[], fallback: T[]): number => {
  if (Array.isArray(data)) return fallback.length
  return data.count ?? fallback.length
}

const fetchContactsPage = async <T,>(organizationId: string, page: number, pageSize: number): Promise<PaginatedContactsResponse<T> | T[]> => {
  const response = await fetch(`/api/contacts/contacts?organization=${organizationId}&page=${page}&page_size=${pageSize}`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Failed to fetch contacts")
  }
  return response.json()
}

export function usePaginatedContacts<T = any>(
  organizationId?: string,
  page: number = 1,
  pageSize: number = 12
) {
  const query = useQuery(
    ["contacts", organizationId, page, pageSize],
    () => fetchContactsPage<T>(organizationId as string, page, pageSize),
    {
      enabled: Boolean(organizationId),
      keepPreviousData: true,
      staleTime: 60 * 1000,
    }
  )

  const contacts = normalizeContacts<T>(query.data || [])
  const totalCount = getTotalCount<T>(query.data || [], contacts)
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1

  return {
    contacts,
    totalCount,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

export function useInfiniteContacts<T = any>(
  organizationId?: string,
  pageSize: number = 100,
  enabled: boolean = true
) {
  const query = useInfiniteQuery(
    ["contacts", organizationId, "infinite", pageSize],
    ({ pageParam = 1 }) => fetchContactsPage<T>(organizationId as string, pageParam, pageSize),
    {
      enabled: Boolean(organizationId) && enabled,
      staleTime: 60 * 1000,
      getNextPageParam: (lastPage, pages) => {
        if (Array.isArray(lastPage)) return undefined
        if (lastPage.next) return pages.length + 1
        if (typeof lastPage.count === "number") {
          const totalPages = Math.ceil(lastPage.count / pageSize)
          return pages.length < totalPages ? pages.length + 1 : undefined
        }
        return undefined
      },
    }
  )

  const contacts = useMemo(() => {
    const seen = new Set<string>()
    const all: T[] = []
    const pages = query.data?.pages || []
    pages.forEach((page) => {
      const items = normalizeContacts<T>(page as PaginatedContactsResponse<T> | T[])
      items.forEach((item: any) => {
        const key = String(item?.id ?? item?.phone ?? item?.email ?? item?.fullname ?? "")
        if (!key || seen.has(key)) return
        seen.add(key)
        all.push(item)
      })
    })
    return all
  }, [query.data])

  const firstPage = query.data?.pages?.[0]
  const totalCount = firstPage ? getTotalCount<T>(firstPage as PaginatedContactsResponse<T> | T[], contacts) : 0
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1

  return {
    contacts,
    totalCount,
    totalPages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
