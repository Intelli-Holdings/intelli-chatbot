"use client";

import { useState } from 'react';
import { Trash, Bot } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Assistant } from '@/types/assistant';
import { DeleteAssistantDialog } from '@/components/delete-dialog-assistant';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AssistantsListProps {
  assistants: Assistant[];
  fetchAssistants: () => Promise<void>;
}

export const AssistantsList = ({ assistants, fetchAssistants }: AssistantsListProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assistantToDelete, setAssistantToDelete] = useState<Assistant | null>(null);

  const handleDeleteAssistant = (assistant: Assistant) => {
    setAssistantToDelete(assistant);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteAssistant = async () => {
    if (assistantToDelete) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistants/${assistantToDelete.id}/`,
          { method: 'DELETE' }
        );

        if (!response.ok) throw new Error('Failed to delete assistant');

        toast.success('Assistant deleted successfully!');
        fetchAssistants();
      } catch (error) {
        console.error('Error deleting assistant:', error);
        toast.error('Failed to delete assistant. Please try again.');
      } finally {
        setIsDeleteDialogOpen(false);
        setAssistantToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {assistants.map((assistant) => (
        <Card key={assistant.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <span>{assistant.name}</span>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteAssistant(assistant)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </CardHeader>
        </Card>
      ))}
      <DeleteAssistantDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteAssistant}
        assistantName={assistantToDelete?.name || ''}
      />
    </div>
  );
};

