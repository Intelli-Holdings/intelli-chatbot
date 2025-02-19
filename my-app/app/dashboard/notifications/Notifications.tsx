import type React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, MessageCircle, User, Calendar, AlertCircle, Globe, Mail, Facebook, MessageSquare, CheckCircle, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NotificationMessage, TeamMember } from "@/types/notification"
import { useOrganization } from "@clerk/nextjs"
import { toast } from "@/components/ui/use-toast"

interface NotificationsProps {
  notifications?: NotificationMessage[]
  members?: TeamMember[]
  onRefresh?: () => void
}

const Notifications: React.FC<NotificationsProps> = ({ notifications = [], members = [], onRefresh }) => {
  const [showAssigneeSelect, setShowAssigneeSelect] = useState<string | null>(null)
  const [organizationUsers, setOrganizationUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [localAssignees, setLocalAssignees] = useState<{ [key: string]: { id: string; name: string } }>({})
  const { organization, membership } = useOrganization()

  useEffect(() => {
    // Fetch organization members when the component mounts
    const fetchOrganizationMembers = async () => {
      if (organization) {
        try {
          const memberList = await organization.getMemberships();
          
          // Map the clerk membership data to our expected format
          const formattedMembers = memberList.data.map((member) => ({
            id: member.publicUserData?.userId || "",
            name: `${member.publicUserData?.firstName || ''} ${member.publicUserData?.lastName || ''}`.trim(),
            email: member.publicUserData?.identifier || '',
          }));
          
          setOrganizationUsers(formattedMembers);
          
          // Initialize local assignees from the notifications
          const initialAssignees: { [key: string]: { id: string; name: string } } = {};
          notifications.forEach(notification => {
            if (notification.assignee) {
              const user = formattedMembers.find(m => m.id === notification.assignee);
              if (user) {
                initialAssignees[notification.id] = { id: user.id, name: user.name };
              }
            }
          });
          setLocalAssignees(initialAssignees);
        } catch (error) {
          console.error("Error fetching organization members:", error);
          toast({
            title: "Error",
            description: "Failed to fetch team members",
            variant: "destructive"
          });
        }
      }
    };

    fetchOrganizationMembers();
  }, [organization, notifications]);

  const getAssigneeName = (notificationId: string, assigneeId: string) => {
    // First check if we have a local override
    if (localAssignees[notificationId]) {
      return localAssignees[notificationId].name;
    }
    
    // Then check in organization users from Clerk
    const orgUser = organizationUsers.find(user => user.id === assigneeId);
    if (orgUser) return orgUser.name;
    
    // Fallback to members prop
    const member = members.find((m) => m.id === assigneeId);
    return member ? member.name : "Unassigned";
  }

  const handleAssigneeChange = async (notificationId: string, assigneeId: string) => {
    setIsLoading(prev => ({ ...prev, [notificationId]: true }));
    
    try {
      // Find user email from the selected assignee ID
      const selectedUser = organizationUsers.find(user => user.id === assigneeId);
      
      if (!selectedUser) {
        throw new Error("Selected user not found");
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_DEV_API_BASE_URL}/notifications/assign/notification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: selectedUser.email,
          notification_id: notificationId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to assign: ${response.statusText}`);
      }
      
      // Update local state to reflect the change immediately
      setLocalAssignees(prev => ({
        ...prev,
        [notificationId]: { id: selectedUser.id, name: selectedUser.name }
      }));
      
      toast({
        title: "Success",
        description: `Assigned to ${selectedUser.name}`,
      });
      
      // Refresh notification list if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error assigning notification:", error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [notificationId]: false }));
      setShowAssigneeSelect(null);
    }
  }
  
  const handleResolveNotification = async (notificationId: string) => {
    setIsLoading(prev => ({ ...prev, [`resolve-${notificationId}`]: true }));
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_DEV_API_BASE_URL}/notifications/resolve/notification/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_id: notificationId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to resolve: ${response.statusText}`);
      }
      
      toast({
        title: "Success",
        description: "Notification resolved successfully",
      });
      
      // Refresh notification list if callback provided
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error resolving notification:", error);
      toast({
        title: "Resolution Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`resolve-${notificationId}`]: false }));
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case "whatsapp":
        return "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
      case "facebook":
        return <Facebook className="h-full w-full" />
      case "messenger":
        return <MessageSquare className="h-full w-full" />
      case "instagram":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        )
      case "email":
        return <Mail className="h-full w-full" />
      case "website":
        return <Globe className="h-full w-full" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="border-b border-gray-200 pb-4">
        <CardTitle className="flex items-center space-x-2 text-2xl font-bold">
          <Bell className="h-6 w-6 text-blue-500" />
          <span>Notification Center</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4 py-4">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500">No notifications to display.</p>
          ) : (
            <div className="space-y-6">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        {(() => {
                          const channelIcon = getChannelIcon(notification.channel);
                          return typeof channelIcon === "string" ? (
                            <AvatarImage src={channelIcon} alt={notification.channel} />
                          ) : (
                            channelIcon || <AvatarFallback>{notification.channel[0].toUpperCase()}</AvatarFallback>
                          );
                        })()}
                        <AvatarFallback>{notification.channel[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                        <div className="flex items-center space-x-2">
                        <span>From:</span>
                        <h3 className="text-lg font-semibold m-0">{notification.customer.customer_name}</h3>
                        <h2 className="text-sm text-gray-500">{notification.customer.customer_number}</h2>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={notification.status === "pending" ? "destructive" : "default"} className="text-xs">
                        {notification.status}
                      </Badge>
                      {notification.status !== "resolved" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center space-x-1 h-8"
                          onClick={() => handleResolveNotification(notification.id)}
                          disabled={isLoading[`resolve-${notification.id}`]}
                        >
                          {isLoading[`resolve-${notification.id}`] ? (
                            <span className="animate-spin mr-1">⏳</span>
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          <span>Resolve</span>
                        </Button>
                      )}
                    </div>
                  </div>
                  <span><strong>Customer&apos;s Message</strong></span>
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4">
                    {notification.message}
                  </blockquote>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Assignment UI */}
                    <div className="flex items-center space-x-2 text-gray-600">
                      {showAssigneeSelect === notification.id ? (
                        <div className="relative flex items-center w-full">
                          <Select
                            value={localAssignees[notification.id]?.id || notification.assignee}
                            onValueChange={(value) => handleAssigneeChange(notification.id, value)}
                            disabled={isLoading[notification.id]}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Assign to..." />
                            </SelectTrigger>
                            <SelectContent>
                              {organizationUsers.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name} ({user.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {isLoading[notification.id] && (
                            <div className="absolute right-2 top-0 h-full flex items-center">
                              <span className="animate-spin">⏳</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto font-normal"
                            onClick={() => setShowAssigneeSelect(notification.id)}
                          >
                            Assign
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Channel Info */}
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MessageCircle className="h-4 w-4" />
                      <span>{notification.channel}</span>
                    </div>

                    {/* Assignee Info */}
                    <div className="flex items-center space-x-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {getAssigneeName(notification.id, notification.assignee) || "Unassigned"}
                      </span>
                    </div>

                    {/* Creation Date */}
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(notification.created_at)}</span>
                    </div>

                    {/* Escalation Info */}
                    <div className="flex items-center space-x-2 text-gray-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{notification.escalation.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default Notifications