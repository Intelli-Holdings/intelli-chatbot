import { currentUser, auth } from "@clerk/nextjs/server";

export async function getUserOrganizationMemberships(userId: string) {
  const token = await auth().getToken();
  const response = await fetch(`https://api.clerk.dev/v1/users/${userId}/organization_memberships`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch organization memberships');
  }

  const data = await response.json();
  return data;
}
