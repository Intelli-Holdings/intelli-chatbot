'use client'

import { useState } from 'react'
import { useOrganizationList, useUser } from '@clerk/nextjs'

export const userMembershipsParams = {
  memberships: {
    pageSize: 5,
    keepPreviousData: true,
  },
}

export const JoinedOrganizations = () => {
  const { user } = useUser()
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: userMembershipsParams,
  })

  const [searchTerm, setSearchTerm] = useState('')

  if (!isLoaded) {
    return <>Loading...</>
  }

  const filteredMemberships = userMemberships?.data?.filter((mem) =>
    mem.organization.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Organizations List</h1>
      <p className="text-gray-500 mb-8">View and manage organizations</p>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search"
          className="border border-gray-300 rounded px-4 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="text-gray-500">Sort by: <span className="font-semibold">Created at</span></div>
      </div>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-2 px-4 text-left font-medium text-gray-600">Owner</th>
              <th className="py-2 px-4 text-left font-medium text-gray-600">Organization</th>
              <th className="py-2 px-4 text-left font-medium text-gray-600">Joined</th>
              <th className="py-2 px-4 text-left font-medium text-gray-600">Role</th>
            </tr>
          </thead>
          <tbody>
            {filteredMemberships?.map((mem) => (
              <tr key={mem.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{mem.publicUserData.identifier}</td>
                <td className="py-2 px-4">{mem.organization.name}</td>
                <td className="py-2 px-4">{new Date(mem.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4">{mem.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <button
          className="bg-purple-500 text-white rounded px-4 py-2 disabled:bg-gray-300"
          disabled={!userMemberships?.hasPreviousPage || userMemberships?.isFetching}
          onClick={() => userMemberships?.fetchPrevious?.()}
        >
          Previous
        </button>

        <button
          className="bg-purple-500 text-white rounded px-4 py-2 disabled:bg-gray-300"
          disabled={!userMemberships?.hasNextPage || userMemberships?.isFetching}
          onClick={() => userMemberships?.fetchNext?.()}
        >
          Next
        </button>
      </div>
    </div>
  )
}
