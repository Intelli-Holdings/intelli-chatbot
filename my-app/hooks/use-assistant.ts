import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useOrganizationList } from '@clerk/nextjs';

interface Assistant {
  id: number;
  name: string;
  prompt?: string;
  assistant_id: string;
  organization: string;
}

const useAssistants = () => {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);

  const fetchAssistants = async () => {
    if (!selectedOrganizationId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get/assistants/${selectedOrganizationId}/`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch assistants');
      }
      const data = await response.json();
      setAssistants(data);
    } catch (error) {
      console.error('Error fetching assistants:', error);
      toast.error('Failed to fetch assistants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const handleEditAssistant = async (updatedAssistant: Assistant) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${updatedAssistant.id}/`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: updatedAssistant.id,
            name: updatedAssistant.name,
            prompt: updatedAssistant.prompt || "",
            assistant_id: updatedAssistant.assistant_id,
            organization: updatedAssistant.organization
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to edit assistant');

      toast.success('Assistant updated successfully!');
      setIsEditDialogOpen(false);
      fetchAssistants();
    } catch (error) {
      console.error('Error editing assistant:', error);
      toast.error('There was a problem editing the assistant. Please try again.');
    }
  };

  const handleDeleteAssistant = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${id}/`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: id,
            name: selectedAssistant?.name || "",
            prompt: selectedAssistant?.prompt || "",
            assistant_id: selectedAssistant?.assistant_id || null,
            organization: selectedAssistant?.organization || null
          })
        }
      );

      if (!response.ok) throw new Error('Failed to delete assistant');

      toast.success('Assistant deleted successfully!');
      setIsDeleteDialogOpen(false);
      fetchAssistants();
    } catch (error) {
      console.error('Error deleting assistant:', error);
      toast.error('Failed to delete assistant. Please try again.');
    }
  };

  return {
    assistants,
    isLoading,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedAssistant,
    setSelectedAssistant,
    handleEditAssistant,
    handleDeleteAssistant,
    fetchAssistants
  };
};

export default useAssistants;
