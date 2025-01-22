const ICE_SERVERS = [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
    // In production, you would add your TURN servers here
    // {
    //   urls: process.env.TURN_SERVER_URL,
    //   username: process.env.TURN_SERVER_USERNAME,
    //   credential: process.env.TURN_SERVER_CREDENTIAL,
    // }
  ];
  
  export class WebRTCConnection {
    private peerConnection: RTCPeerConnection;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private onSignal: (signal: any) => void;
    private onStream: (stream: MediaStream) => void;
  
    constructor(
      onSignal: (signal: any) => void,
      onStream: (stream: MediaStream) => void
    ) {
      this.peerConnection = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      this.onSignal = onSignal;
      this.onStream = onStream;
      this.setupPeerConnectionHandlers();
    }
  
    private setupPeerConnectionHandlers() {
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.onSignal({
            type: 'candidate',
            payload: event.candidate,
          });
        }
      };
  
      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        this.onStream(event.streams[0]);
      };
    }
  
    async startCall(isVideo: boolean): Promise<void> {
      try {
        const constraints = {
          audio: true,
          video: isVideo,
        };
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        this.localStream.getTracks().forEach((track) => {
          if (this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      } catch (error) {
        console.error('Error accessing media devices:', error);
        throw error;
      }
    }
  
    async createOffer(): Promise<RTCSessionDescriptionInit> {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    }
  
    async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  
    async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    }
  
    async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  
    cleanup(): void {
      this.localStream?.getTracks().forEach((track) => track.stop());
      this.peerConnection.close();
    }
  }
  
  