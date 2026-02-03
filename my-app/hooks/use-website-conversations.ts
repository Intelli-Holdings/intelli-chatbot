import { useState, useEffect } from "react";
import { toast } from 'sonner';
import useActiveOrganizationId from "@/hooks/use-organization-id";
import { set } from "mongoose";


  export interface Visitor {
    id: number;
    visitor_id: string;
    visitor_email: string | null;
    visitor_name: string | null;
    visitor_phone: string | null;
    ip_address: string;
    created_at: string;
    last_seen: string;
    messages: Array<{
      id: number;
      content: string;
      answer: string;
      timestamp: string;
    }>;
  }

interface Message {
    type: 'chat_message';
    widget_key: string;
    visitor_id: string;
    message: string;
    sender_message: string;
    is_human: boolean;
}

interface HandleTakeoverProps {
        onMessage?: (data: any) => void;
        selectedWidgetKey?: string;
}

export function useTakeoverToggle({ onMessage, selectedWidgetKey }: HandleTakeoverProps = {}) {
        const [socket, setSocket] = useState<WebSocket | null>(null);
        const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
        const [replyMessage, setReplyMessage] = useState('');
        const [isTakenOver, setIsTakenOver] = useState(false);
        const [reminderTimeout, setReminderTimeout] = useState<NodeJS.Timeout | null>(null);
        const [searchTerm, setSearchTerm] = useState('');
        const [visitors, setVisitors] = useState<Visitor[]>([]);

        
        const activeOrganizationId = useActiveOrganizationId();


        const filteredVisitors = visitors.filter((visitor) =>
            visitor.visitor_id.toLowerCase().includes(searchTerm.toLowerCase())
          );


        const handleSendReply = async () => {
                if (!selectedVisitor || !replyMessage.trim() || !socket) return;
            
                try {
                    const message: Message = {
                        type: 'chat_message',
                        widget_key: selectedWidgetKey || '',
                        visitor_id: selectedVisitor.visitor_id,
                        message: selectedVisitor.messages[selectedVisitor.messages.length - 1]?.content,
                        sender_message: replyMessage,
                        is_human: isTakenOver,
                    };
            
                    socket.send(JSON.stringify(message));
            
                    setSelectedVisitor((prev) => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            messages: [
                                ...prev.messages,
                                {
                                    id: Date.now(),
                                    content: selectedVisitor.messages[selectedVisitor.messages.length - 1]?.content,
                                    answer: replyMessage,
                                    timestamp: new Date().toISOString(),
                                },
                            ],
                        };
                    });
            
                    setReplyMessage('');
                    toast.success('Message sent successfully');
                } catch (error) {
                    console.error('Error sending message:', error);
                    toast.error('Failed to send message. Please try again.');
                }
        };

        useEffect(() => {
                if (!activeOrganizationId) return;

                const socketUrl = `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}business/chat/${activeOrganizationId}/`;
                const ws = new WebSocket(socketUrl);

                ws.onopen = () => {
                        console.log('WebSocket Connected');
                        toast.success('WebSocket is connected');
                };

                ws.onmessage = (event) => {
                        const data = JSON.parse(event.data);
                        if (onMessage) {
                                onMessage(data);
                        }
                };

                ws.onerror = (error) => {
                        console.error('WebSocket error:', error);
                        toast.info('WebSocket is not connected');
                };

                ws.onclose = () => {
                        console.log('WebSocket Disconnected');
                        toast.info('WebSocket is disconnected');
                };

                setSocket(ws);

                return () => {
                        if (ws.readyState === WebSocket.OPEN) {
                                ws.close();
                        }
                };
        }, [activeOrganizationId, onMessage]);

        useEffect(() => {
                return () => {
                    if (reminderTimeout) {
                        clearTimeout(reminderTimeout);
                    }
                };
        }, [reminderTimeout]);

    

        return { 
                socket, 
                handleSendReply, 
                selectedVisitor, 
                setSelectedVisitor,
                replyMessage,
                setReplyMessage,
                filteredVisitors,
                searchTerm,
                setSearchTerm,
                visitors,
                setVisitors,
        };
}
