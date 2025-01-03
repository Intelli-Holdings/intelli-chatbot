'use client';

import { useEffect, useState } from 'react';
import { useOrganizationList } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Assistant {
  id: number;
  name: string;
  prompt: string;
  assistant_id: string;
  organization: string | null;
}

export function AssistantsList() {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [filteredAssistants, setFilteredAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch assistants from backend
    const fetchAssistants = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/`);
        if (!response.ok) {
          throw new Error("Failed to fetch assistants");
        }
        const data: Assistant[] = await response.json();
        setAssistants(data);
      } catch (error) {
        console.error("Error fetching assistants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssistants();
  }, []);

  useEffect(() => {
    if (isLoaded && userMemberships?.data) {
      // Get organizations where the user is admin or owner
      const adminOrganizations = userMemberships.data
        .filter((membership) => ["admin", "owner"].includes(membership.role))
        .map((membership) => membership.organization.id);

      // Filter assistants by organization
      const filtered = assistants.filter((assistant) =>
        assistant.organization && adminOrganizations.includes(assistant.organization)
      );

      setFilteredAssistants(filtered);
    }
  }, [isLoaded, userMemberships, assistants]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!filteredAssistants.length) {
    return <p>No assistants available for your organizations.</p>;
  }

  return (
    <div className="space-y-4">
      {filteredAssistants.map((assistant) => (
        <div key={assistant.id} className="p-4 border rounded-md shadow">
          <h2 className="text-lg font-semibold">{assistant.name}</h2>
          <p className="text-sm text-muted-foreground">{assistant.prompt}</p>
          <p className="text-xs text-muted-foreground">ID: {assistant.assistant_id}</p>
        </div>
      ))}
    </div>
  );
}
