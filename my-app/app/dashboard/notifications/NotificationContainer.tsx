import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";
import NotificationCard from '@/components/notification-card';
import { NotificationMessage, TeamMember } from '@/types/notification';

interface NotificationContainerProps {
  notifications: NotificationMessage[];
  teamMembers: TeamMember[];
  onAssign: (notificationId: string, userId: string) => Promise<void>;
  onResolve: (notificationId: string) => Promise<void>;
  onDelete: (notificationId: string) => Promise<void>;
}

export const NotificationContainer = ({
  notifications,
  teamMembers,
  onAssign,
  onResolve,
  onDelete,
}: NotificationContainerProps) => {
  return (
    <Card className="w-full">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <span>Notification History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[auto] pr-4 p-2">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">No notifications yet</p>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationCard
                    message={notification}
                    onAssign={(userId) => onAssign(notification.id, userId)}
                    onResolve={() => onResolve(notification.id)}
                    onDelete={() => onDelete(notification.id)} 
                    teamMembers={teamMembers}
                  />
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};