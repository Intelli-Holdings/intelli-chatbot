export type CallType = 'audio' | 'video';

export interface CallSignal {
  type: 'offer' | 'answer' | 'candidate';
  payload: any;
  from: string;
  to: string;
}

export interface CallState {
  isIncoming: boolean;
  isOutgoing: boolean;
  isCalling: boolean;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  callType: CallType | null;
  error: string | null;
  remoteUser: {
    id: string;
    name: string;
  } | null;
}

export interface CallOptions {
  type: CallType;
  recipientId: string;
  recipientName: string;
}

