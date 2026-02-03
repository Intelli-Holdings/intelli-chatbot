"use client";

import { useState } from "react";
import { useOrganizationList, useUser } from "@clerk/nextjs";
import { CreateOrganization } from "@clerk/nextjs";

export const userMembershipsParams = {
  memberships: {
    pageSize: 5,
    keepPreviousData: true,
  },
};

export const JoinedOrganizations = () => {
  const { user } = useUser();
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: userMembershipsParams,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false); // State to control the modal

  if (!isLoaded) {
    return <>Loading...</>;
  }

  const filteredMemberships = userMemberships?.data?.filter((mem) =>
    mem.organization.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2">
      <p className="text-gray-500 mb-8">View and manage organizations</p>
      <button
        className="bg-blue-500 text-white rounded-lg shadow-md px-4 py-2 mb-4"
        onClick={() => setShowModal(true)}
      >
        Create Organization
      </button>

      <div className="overflow-x-auto rounded-xl border border-gray-300">
        <table className="min-w-full bg-white-100">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-2 px-4 text-left font-medium text-gray-600">
                Owner
              </th>
              <th className="py-2 px-4 text-left font-medium text-gray-600">
                Organization
              </th>
              <th className="py-2 px-4 text-left font-medium text-gray-600">
                Joined
              </th>
              <th className="py-2 px-4 text-left font-medium text-gray-600">
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMemberships?.map((mem) => (
              <tr key={mem.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{mem.publicUserData.identifier}</td>
                <td className="py-2 px-4">{mem.organization.name}</td>
                <td className="py-2 px-4">
                  {new Date(mem.createdAt).toLocaleDateString()}
                </td>
                <td className="py-2 px-4">{mem.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <button
          className="bg-purple-500 text-white rounded-lg px-4 py-2 disabled:bg-gray-300"
          disabled={
            !userMemberships?.hasPreviousPage || userMemberships?.isFetching
          }
          onClick={() => userMemberships?.fetchPrevious?.()}
        >
          Previous
        </button>

        <button
          className="bg-purple-500 text-white rounded-lg px-4 py-2 disabled:bg-gray-300"
          disabled={
            !userMemberships?.hasNextPage || userMemberships?.isFetching
          }
          onClick={() => userMemberships?.fetchNext?.()}
        >
          Next
        </button>
      </div>

      {/* Modal for creating organization */}
{showModal && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    onClick={() => setShowModal(false)} // Close modal when clicking on the background
  >
    <div
      className="shadow-lg" // Only apply a shadow if needed, no additional border styling
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      <CreateOrganization
        afterCreateOrganizationUrl="/dashboard"
        skipInvitationScreen={false}
        hideSlug={true}
      />
    </div>
  </div>
)}

    </div>
  );
};
