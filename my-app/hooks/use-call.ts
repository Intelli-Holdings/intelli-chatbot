'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CallState, CallOptions, CallSignal } from '../types/call';
import { WebRTCConnection } from '../lib/webrtc';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useCall() {
  const [callState, setCallState] = useState<CallState>({
    isIncoming: false,
    isOutgoing: false,
    isCalling: false,
    remoteStream: null,
    localStream: null,
    callType: null,
    error: null,
    remoteUser: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const webrtcRef = useRef<WebRTCConnection | null>(null);

  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      path: '/api/socket',
      auth: {
        token: 'your-auth-token', // Add your authentication token here
      },
    });

    socketRef.current.on('call:incoming', handleIncomingCall);
    socketRef.current.on('call:signal', handleCallSignal);
    socketRef.current.on('call:ended', handleCallEnded);

    return () => {
      socketRef.current?.disconnect();
      cleanup();
    };
  }, []);

  const handleIncomingCall = useCallback((data: CallOptions) => {
    setCallState((prev) => ({
      ...prev,
      isIncoming: true,
      callType: data.type,
      remoteUser: {
        id: data.recipientId,
        name: data.recipientName,
      },
    }));
  }, []);

  const handleCallSignal = useCallback(async (signal: CallSignal) => {
    if (!webrtcRef.current) return;

    try {
      switch (signal.type) {
        case 'offer':
          const answer = await webrtcRef.current.handleOffer(signal.payload);
          socketRef.current?.emit('call:signal', {
            type: 'answer',
            payload: answer,
            to: signal.from,
          });
          break;
        case 'answer':
          await webrtcRef.current.handleAnswer(signal.payload);
          break;
        case 'candidate':
          await webrtcRef.current.addIceCandidate(signal.payload);
          break;
      }
    } catch (error) {
      console.error('Error handling call signal:', error);
      setCallState((prev) => ({ ...prev, error: 'Call failed' }));
    }
  }, []);

  const handleCallEnded = useCallback(() => {
    cleanup();
    setCallState((prev) => ({
      ...prev,
      isIncoming: false,
      isOutgoing: false,
      isCalling: false,
      remoteStream: null,
      localStream: null,
      callType: null,
      error: null,
      remoteUser: null,
    }));
  }, []);

  const initiateCall = useCallback(async (options: CallOptions) => {
    try {
      webrtcRef.current = new WebRTCConnection(
        (signal) => {
          socketRef.current?.emit('call:signal', {
            ...signal,
            to: options.recipientId,
          });
        },
        (stream) => {
          setCallState((prev) => ({ ...prev, remoteStream: stream }));
        }
      );

      await webrtcRef.current.startCall(options.type === 'video');
      const offer = await webrtcRef.current.createOffer();

      socketRef.current?.emit('call:initiate', {
        ...options,
        offer,
      });

      setCallState((prev) => ({
        ...prev,
        isOutgoing: true,
        isCalling: true,
        callType: options.type,
        remoteUser: {
          id: options.recipientId,
          name: options.recipientName,
        },
      }));
    } catch (error) {
      console.error('Error initiating call:', error);
      setCallState((prev) => ({ ...prev, error: 'Failed to start call' }));
    }
  }, []);

  const answerCall = useCallback(async () => {
    if (!callState.isIncoming || !callState.remoteUser) return;

    try {
      webrtcRef.current = new WebRTCConnection(
        (signal) => {
          socketRef.current?.emit('call:signal', {
            ...signal,
            to: callState.remoteUser!.id,
          });
        },
        (stream) => {
          setCallState((prev) => ({ ...prev, remoteStream: stream }));
        }
      );

      await webrtcRef.current.startCall(callState.callType === 'video');
      setCallState((prev) => ({ ...prev, isCalling: true }));
    } catch (error) {
      console.error('Error answering call:', error);
      setCallState((prev) => ({ ...prev, error: 'Failed to answer call' }));
    }
  }, [callState.isIncoming, callState.remoteUser, callState.callType]);

  const endCall = useCallback(() => {
    socketRef.current?.emit('call:end', {
      recipientId: callState.remoteUser?.id,
    });
    cleanup();
    handleCallEnded();
  }, [callState.remoteUser, handleCallEnded]);

  const cleanup = useCallback(() => {
    webrtcRef.current?.cleanup();
    webrtcRef.current = null;
  }, []);

  return {
    callState,
    initiateCall,
    answerCall,
    endCall,
  };
}

