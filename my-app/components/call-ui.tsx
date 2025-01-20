'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, MoreHorizontal, Users } from 'lucide-react';
import { CallState } from '../types/call';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CallUIProps {
  callState: CallState;
  onAnswer: () => void;
  onEnd: () => void;
}

export function CallUI({ callState, onAnswer, onEnd }: CallUIProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showEndCallDialog, setShowEndCallDialog] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (videoRef.current && callState.remoteStream) {
      videoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  if (!callState.isIncoming && !callState.isOutgoing) return null;

  const handleEndCall = () => {
    setShowEndCallDialog(false);
    onEnd();
  };

  return (
    <div className="fixed inset-0 bg-[#0c1317] flex items-center justify-center z-50">
      <div className="w-full max-w-md flex flex-col items-center justify-between h-full py-8">
        {/* Top Section */}
        <div className="flex flex-col items-center gap-4 w-full px-4">
          <Avatar className="w-32 h-32 border-2 border-green-500">
            <AvatarImage
              src={`https://avatar.vercel.sh/${callState.remoteUser?.name}.png`}
              alt={callState.remoteUser?.name}
            />
            <AvatarFallback className="text-2xl">
              {callState.remoteUser?.name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {callState.remoteUser?.name}
            </h2>
            <p className="text-gray-400">
              {callState.isIncoming
                ? 'Incoming call...'
                : callState.isOutgoing
                ? 'Ringing...'
                : 'On call'}
            </p>
          </div>
        </div>

        {/* Video Section (only shown for video calls) */}
        {callState.callType === 'video' && (
          <div className="flex-1 w-full max-w-md px-4 my-8">
            <div className="relative w-full aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
              {!isVideoOff && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="w-full px-4">
          <div className="flex justify-center items-center gap-4">
            {callState.isCalling && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full w-12 h-12 bg-gray-800 hover:bg-gray-700"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <MicOff className="h-6 w-6 text-red-500" />
                  ) : (
                    <Mic className="h-6 w-6 text-white" />
                  )}
                </Button>
                {callState.callType === 'video' && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full w-12 h-12 bg-gray-800 hover:bg-gray-700"
                    onClick={() => setIsVideoOff(!isVideoOff)}
                  >
                    {isVideoOff ? (
                      <VideoOff className="h-6 w-6 text-red-500" />
                    ) : (
                      <Video className="h-6 w-6 text-white" />
                    )}
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full w-12 h-12 bg-gray-800 hover:bg-gray-700"
                >
                  <Users className="h-6 w-6 text-white" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full w-12 h-12 bg-gray-800 hover:bg-gray-700"
                >
                  <MoreHorizontal className="h-6 w-6 text-white" />
                </Button>
              </>
            )}
            {callState.isIncoming && !callState.isCalling ? (
              <>
                <Button
                  size="icon"
                  variant="destructive"
                  className="rounded-full w-16 h-16"
                  onClick={() => setShowEndCallDialog(true)}
                >
                  <PhoneOff className="h-8 w-8" />
                </Button>
                <Button
                  size="icon"
                  className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                  onClick={onAnswer}
                >
                  {callState.callType === 'video' ? (
                    <Video className="h-8 w-8" />
                  ) : (
                    <Phone className="h-8 w-8" />
                  )}
                </Button>
              </>
            ) : (
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full w-16 h-16"
                onClick={() => setShowEndCallDialog(true)}
              >
                <PhoneOff className="h-8 w-8" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* End Call Confirmation Dialog */}
      <AlertDialog open={showEndCallDialog} onOpenChange={setShowEndCallDialog}>
        <AlertDialogContent className="bg-white text-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle>Intelli</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to end the current call?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-800 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleEndCall}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

