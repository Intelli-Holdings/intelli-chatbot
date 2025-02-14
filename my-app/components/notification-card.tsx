import React, { ReactNode, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; // Add this import
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  MessageSquare,
  Globe,
  Mail,
  Phone,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssigneeSelector } from "@/components/notification-assign-selector";
import { useOrganization, useOrganizationList } from "@clerk/nextjs";
import { NotificationMessage } from "@/types/notifications";
import { ClerkMember } from "@/types/notification"; 

interface NotificationCardProps {
  message: NotificationMessage;
  onAssign: (userId: string) => Promise<void>;
  onResolve: (notificationId: string) => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
  teamMembers: Array<{
    initials: ReactNode;
    imageUrl: any;
    id: string;
    name: string;
  }>;
}

const getChannelIcon = (channel: string) => {
  const icons = {
    whatsapp: MessageSquare,
    website: Globe,
    email: Mail,
    call: Phone,
    instagram: Instagram,
    facebook: Facebook,
    default: MessageCircle,
  } as const;

  const IconComponent =
    icons[channel.toLowerCase() as keyof typeof icons] || icons.default;
  return <IconComponent className="h-5 w-5" />;
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  message,
  onAssign,
  onResolve,
  onDelete,
  teamMembers,
}) => {
  const [members, setMembers] = useState<ClerkMember[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { organization } = useOrganization();

  useEffect(() => {
    const loadMembers = async () => {
      if (organization) {
        try {
          const membersList = await organization.getMemberships();
          setMembers(membersList.data);
        } catch (error) {
          console.error("Failed to fetch members:", error);
        }
      }
    };
    loadMembers();
  }, [organization]);

  const handleSelect = async (assigneeId: string) => {
    const newSelection = selectedAssignees.includes(assigneeId)
      ? selectedAssignees.filter((id) => id !== assigneeId)
      : [...selectedAssignees, assigneeId];

    setSelectedAssignees(newSelection);
    const selectedMember = members.find(member => member.id === assigneeId);
    if (selectedMember && selectedMember.publicUserData.identifier) {
      await onAssign(selectedMember.publicUserData.identifier);
    }
  };

  const selectedAssigneesData = teamMembers.filter((member) =>
    selectedAssignees.includes(member.id)
  );

  return (
    <Card className="w-full mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="text-gray-600">{getChannelIcon(message.channel)}</div>
          <span className="font-semibold text-sm capitalize">
            {message.channel}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onResolve(message.id)}>
              Resolve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(message.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{message.message}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-xs">
              #{message.escalation.name.toLowerCase().replace(/\s+/g, "_")}
            </Badge>
            {message.customer.customer_name && (
              <Badge variant="outline" className="text-xs">
                {message.customer.customer_name}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4">
        <div className="relative flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {selectedAssigneesData.map((member) => (
              <Avatar
                key={member.id}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-background"
              >
                <AvatarImage src={member.imageUrl} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary"
          >
            <span>Assign</span>
            {selectedAssignees.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-secondary">
                {selectedAssignees.length}
              </span>
            )}
          </button>
          {isOpen && (
            <div className="absolute left-0 top-full mt-1 z-50">
              <ScrollArea className="h-[200px] rounded-md border">
                <AssigneeSelector
                  assignees={members.map((member) => ({
                    id: member.id,
                    name: `${member.publicUserData.firstName || ""} ${
                      member.publicUserData.lastName || ""
                    }`,
                    initials:
                      (member.publicUserData.firstName?.[0] || "") +
                      (member.publicUserData.lastName?.[0] || ""),
                    imageUrl: member.publicUserData.imageUrl,
                    email: member.publicUserData.identifier,
                  }))}
                  selectedAssignees={selectedAssignees}
                  onSelect={handleSelect}
                  onClose={() => setIsOpen(false)}
                />
              </ScrollArea>
            </div>
          )}
        </div>
        <Badge
          variant="outline"
          className={`
            ${
              message.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : ""
            }
            ${message.status === "assigned" ? "bg-blue-100 text-blue-800" : ""}
            ${
              message.status === "resolved" ? "bg-green-100 text-green-800" : ""
            }
            capitalize
          `}
        >
          {message.status}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default NotificationCard;
