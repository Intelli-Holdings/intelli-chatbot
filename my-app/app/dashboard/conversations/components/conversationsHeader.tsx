"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Conversation } from "./types";
import { takeoverConversation, handoverConversation } from "@/app/actions";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO } from "date-fns";
import { ChevronDown, Phone, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useCall } from "@/hooks/use-call";
import { CallUI } from "@/components/call-ui";

interface ConversationHeaderProps {
  conversation: Conversation | null;
  phoneNumber: string;
  onAiSupportChange?: (isActive: boolean) => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  phoneNumber,
  onAiSupportChange,
}) => {
  const [error, setError] = useState<string | null>(null);
  // Initialize based on conversation's is_handle_by_human field
  // isAiSupport = true means AI is handling, is_handle_by_human = false
  const [isAiSupport, setIsAiSupport] = useState<boolean>(
    !conversation?.is_handle_by_human
  );
  const { callState, initiateCall, answerCall, endCall } = useCall();

  // Sync state when conversation changes
  useEffect(() => {
    if (conversation) {
      setIsAiSupport(!conversation.is_handle_by_human);
    }
  }, [conversation?.id, conversation?.is_handle_by_human]);

  const handleToggleAISupport = async () => {
    if (!conversation || !phoneNumber) return;

    try {
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("customerNumber", conversation.customer_number || conversation.recipient_id);

      if (isAiSupport) {
        const result = await takeoverConversation(formData);
        console.log("Takeover result:", result);
        
        // Dispatch WebSocket control event here on client-side
        window.dispatchEvent(
          new CustomEvent("websocketControl", {
            detail: { 
              action: "start", 
              customerNumber: conversation.customer_number || conversation.recipient_id,
              phoneNumber: phoneNumber 
            },
          })
        );
      } else {
        const result = await handoverConversation(formData);
        console.log("Handover result:", result);
        
        // Optionally trigger WebSocket disconnect
        window.dispatchEvent(
          new CustomEvent("websocketControl", {
            detail: { action: "stop" },
          })
        );
      }

      const newIsAiSupport = !isAiSupport;
      setIsAiSupport(newIsAiSupport);

      if (onAiSupportChange) {
        onAiSupportChange(newIsAiSupport);
      }

      window.dispatchEvent(
        new CustomEvent("aiSupportChanged", {
          detail: {
            isAiSupport: newIsAiSupport,
            customerNumber: conversation.customer_number || conversation.recipient_id,
            phoneNumber: phoneNumber,
          },
        })
      );
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleCallInitiate = (type: "audio" | "video") => {
    initiateCall({
      type,
      recipientId:
        conversation?.customer_number || conversation?.recipient_id || "",
      recipientName: conversation?.customer_name || "Unknown",
    });
  };

  if (!conversation) return null;

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 px-0 hover:bg-transparent h-auto"
            >
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${
                      conversation.customer_name || conversation.customer_number
                    }.png`}
                  />
                  <AvatarFallback className="bg-[#6b7c85] text-white text-sm">
                    {(
                      conversation.customer_name || conversation.phone_number
                    ).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-[15px] font-normal text-[#111b21]">
                  {conversation.customer_name || conversation.recipient_id}
                </h2>
                <p className="text-[12px] text-[#667781] flex items-center gap-1">
                  click for more info
                  <ChevronDown className="h-3 w-3" />
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 p-0">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="flex flex-col items-center pt-8 pb-6 bg-[#f0f2f5]">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${
                        conversation.customer_name ||
                        conversation.customer_number
                      }.png`}
                    />
                    <AvatarFallback className="bg-[#6b7c85] text-white text-2xl">
                      {(
                        conversation.customer_name || conversation.phone_number
                      ).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-normal text-[#111b21] mb-1">
                    {conversation.customer_name || conversation.recipient_id}
                  </h3>
                  <p className="text-[13px] text-[#667781]">
                    Last active{" "}
                    {format(parseISO(conversation.updated_at), "MMM d, h:mm a")}
                  </p>
                </div>
                <div className="p-4 border-t border-[#e9edef]">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12px] text-[#667781]">
                        Phone number
                      </label>
                      <p className="text-[14px] font-normal text-[#111b21]">
                        +
                        {conversation.customer_number ||
                          conversation.recipient_id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Button
            className={`h-9 px-3 text-xs text-white rounded-md shadow-sm transition-colors ${
              isAiSupport
                ? "bg-[#007fff] hover:bg-[#0066cc] border-[#007fff]"
                : "bg-green-600 hover:bg-green-700 border-green-600"
            }`}
            onClick={handleToggleAISupport}
          >
            {isAiSupport ? "Take Over" : "Hand to AI"}
          </Button>
        </div>
      </div>
      {!isAiSupport && (
        <div className="w-full mt-2 rounded-lg bg-[#fef4e6] border border-[#f9e6c4] text-[#54656f] px-3 py-2 text-center">
          <p className="text-xs">
            Remember to hand over to AI when you&apos;re done sending messages.
          </p>
        </div>
      )}
      {error && (
        <div className="w-full mt-2 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-center">
          <p className="text-xs">{error}</p>
        </div>
      )}
      <CallUI callState={callState} onAnswer={answerCall} onEnd={endCall} />
    </div>
  );
};

export default ConversationHeader;
