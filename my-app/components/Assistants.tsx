'use client'

import {useState} from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { useOrganizationList } from '@clerk/nextjs';
import { CreateAssistantDialog } from '@/components/create-assistant-dialog';
import { Bot, MoreVertical, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeleteAssistantDialog } from '@/components/delete-dialog-assistant';
import useAssistants from '@/hooks/use-assistants';
import { Textarea } from '@/components/ui/textarea';

export default function Assistants() {
  const { userMemberships, isLoaded } = useOrganizationList({
    userMemberships: { infinite: true },
  });

  const {
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
  } = useAssistants();

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');

  const handleOrganizationChange = (orgId: string) => {
    setSelectedOrganizationId(orgId);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Organization
        </label>
        <Select value={selectedOrganizationId} onValueChange={handleOrganizationChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {userMemberships?.data?.map((membership) => (
                <SelectItem
                  key={membership.organization.id}
                  value={membership.organization.id}
                >
                  {membership.organization.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-[240px] animate-pulse bg-muted" />
          ))}
        </div>
      ) : assistants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assistants.map((assistant) => (
            <Card key={assistant.id} className="h-[240px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{assistant.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        ID: {assistant.assistant_id?.slice(12)}...
                      </p>
                      <CardContent className="text-sm text-muted-foreground">
                        Organization: {assistant.organization}
                      </CardContent>


  
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAssistant(assistant);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAssistant(assistant);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="text-red-500"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertTitle>No Assistants Found</AlertTitle>
          <AlertDescription>
            This organization doesn&apos;t have any assistants. Please create one to get started.
          </AlertDescription>
        </Alert>
      )}

      {selectedAssistant && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="h-200">
            <DialogHeader>
              <DialogTitle>Edit Assistant</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditAssistant(selectedAssistant);
              }}
              className="space-y-4"
            >
              <Input
                value={selectedAssistant.name}
                onChange={(e) =>
                  setSelectedAssistant((prev) => prev && { ...prev, name: e.target.value })
                }
                placeholder="Assistant Name"
                required
              />
              <Textarea
                value={selectedAssistant.prompt}
                onChange={(e) =>
                  setSelectedAssistant((prev) => prev && { ...prev, prompt: e.target.value })
                }
                placeholder="Assistant Prompt"
              />
              
              <Button type="submit">Save Changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <DeleteAssistantDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => selectedAssistant && handleDeleteAssistant(selectedAssistant.id)}
        assistantName={selectedAssistant?.name || ''}
      />
    </div>
  );
}

