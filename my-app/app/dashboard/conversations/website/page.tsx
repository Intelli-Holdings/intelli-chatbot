"use client";
import React, { useEffect, useState } from "react";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Conversation {
    id: number;
    sender: string;
    message: string;
    timestamp: string;
}

export default function WebsiteConvosPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/dashboard/conversations/whatsapp/`
                );
                const data = await response.json();
                setConversations(data);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        };

        fetchConversations();
    }, []);

    return (
        <div className="grid min-h-screen w-full">
            <div className="flex flex-col">
                <div className="border-b">
                    <div className="flex h-16 items-center px-4">
                        <h1 className="text-2xl font-bold">Elli </h1>
                    </div>
                </div>
                <div className="grid gap-4 p-4 md:gap-8 md:p-6">
                    <div className="grid gap-4">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                className="p-4 border rounded-lg shadow-md"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500">
                                        {conversation.sender}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {conversation.timestamp}
                                    </span>
                                </div>
                                <p>{conversation.message}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}