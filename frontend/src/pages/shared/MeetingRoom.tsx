import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Camera, CameraOff, Mic, MicOff, PhoneOff,
  MessageSquare, Users, Settings as SettingsIcon,
  Send, Loader2, X, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { showToast } from '../../components/Toast';
import axios from 'axios';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// ──────────────────────────────────────────────────────────────────────────────
// ICE Servers
// ──────────────────────────────────────────────────────────────────────────────
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]
};

// ──────────────────────────────────────────────────────────────────────────────
// RemoteVideo tile — attaches stream to <video> imperatively
// ──────────────────────────────────────────────────────────────────────────────
const RemoteVideo: React.FC<{
  stream: MediaStream;
  userName: string;
  socketId: string;
}> = ({ stream, userName, socketId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {/* autoplay policy — fine to ignore */});
    }
  }, [stream]);

  return (
    <motion.div
      layout
      key={socketId}
      className="relative aspect-video bg-zinc-900 rounded-xl md:rounded-2xl overflow-hidden border border-white/5 ring-1 ring-white/10"
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-[10px] md:text-xs font-medium flex items-center gap-2 text-white">
          <span className="w-2 h-2 rounded-full bg-primary" />
          {userName}
        </p>
      </div>
    </motion.div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
interface RemoteParticipant {
  socketId: string;
  userName: string;
  stream: MediaStream | null;
}

interface ChatMessage {
  fromSocketId: string;
  userName: string;
  message: string;
  timestamp: string;
}

const MeetingRoom: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  // ── Media ──
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // ── WebRTC ──
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});

  // ── State ──
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [participantCount, setParticipantCount] = useState(1);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [devices, setDevices] = useState<{
    videoInputs: MediaDeviceInfo[];
    audioInputs: MediaDeviceInfo[];
  }>({ videoInputs: [], audioInputs: [] });
  const [selectedDevices, setSelectedDevices] = useState({ videoInput: '', audioInput: '' });

  // ──────────────────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────────────────

  /** Get the user's full name safely */
  const myName = user?.fullName || 'You';
  const myRole = (user as any)?.role || 'employee';

  /** Role-based redirect path */
  const getRedirectPath = useCallback(() => {
    if (myRole === 'manager') return '/manager/meetings';
    if (myRole === 'company_admin') return '/company/meetings';
    if (myRole === 'client') return '/client/meetings';
    return '/employee/meetings';
  }, [myRole]);

  // ──────────────────────────────────────────────────────────────────────────
  // createPeerConnection — creates a new RTCPeerConnection for a remote peer
  // ──────────────────────────────────────────────────────────────────────────
  const createPeerConnection = useCallback((socketId: string, userName: string): RTCPeerConnection => {
    // If a PC already exists for this peer, close it first
    if (peerConnectionsRef.current[socketId]) {
      peerConnectionsRef.current[socketId].close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current[socketId] = pc;

    // Add all local tracks to the peer connection
    const localStream = localStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Forward ICE candidates to the target peer
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          targetSocketId: socketId,
          candidate: event.candidate
        });
      }
    };

    // When we receive a remote track, update state to render the video
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        setRemoteParticipants(prev => {
          const exists = prev.find(p => p.socketId === socketId);
          if (exists) {
            return prev.map(p => p.socketId === socketId ? { ...p, stream: remoteStream } : p);
          } else {
            return [...prev, { socketId, userName, stream: remoteStream }];
          }
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[PC:${socketId.slice(0, 6)}] state → ${pc.connectionState}`);
      if (pc.connectionState === 'failed') {
        pc.restartIce();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[ICE:${socketId.slice(0, 6)}] → ${pc.iceConnectionState}`);
    };

    return pc;
  }, [socket]);

  // ──────────────────────────────────────────────────────────────────────────
  // Cleanup
  // ──────────────────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    // Stop all local tracks
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current = null;

    // Close all peer connections
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
  }, []);

  const leaveMeeting = useCallback(() => {
    cleanup();
    if (socket && roomId) socket.emit('leave-room', { roomId });
    showToast('You have left the meeting', 'info');
    navigate(getRedirectPath());
  }, [cleanup, socket, roomId, navigate, getRedirectPath]);

  const endMeetingForAll = useCallback(async () => {
    if (!window.confirm('End this meeting for everyone?')) return;
    // API call to mark meeting as ended
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
      await axios.post(`${API_URL}/meetings/${roomId}/end`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
    } catch { /* best-effort */ }
    // Emit socket end-meeting event
    if (socket && roomId) socket.emit('end-meeting', { roomId });
    cleanup();
    navigate(getRedirectPath());
  }, [socket, roomId, cleanup, navigate, getRedirectPath]);

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 1 — Get local media first, then join the signaling room
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !roomId) return;

    let isMounted = true;

    const init = async () => {
      try {
        // Get camera + mic
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isMounted) { stream.getTracks().forEach(t => t.stop()); return; }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (videoErr) {
        console.warn('Camera unavailable, trying audio only:', videoErr);
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          if (!isMounted) { audioStream.getTracks().forEach(t => t.stop()); return; }
          localStreamRef.current = audioStream;
          setIsCamOn(false);
          showToast('Camera access denied — joining with audio only', 'warning');
        } catch (audioErr) {
          console.error('No media at all:', audioErr);
          showToast('Could not access microphone. Please check permissions.', 'error');
        }
      }

      // Check if this user is the meeting host
      try {
        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
        const res = await axios.get(`${API_URL}/meetings/by-room/${roomId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.data?.data?.createdBy) {
          const createdById = res.data.data.createdBy?._id || res.data.data.createdBy;
          if (createdById === (user as any)?._id || createdById === user?.id) {
            setIsHost(true);
          }
        }
      } catch { /* ignore — not critical */ }

      // Enumerate devices for settings panel
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        if (isMounted) {
          setDevices({
            videoInputs: allDevices.filter(d => d.kind === 'videoinput'),
            audioInputs: allDevices.filter(d => d.kind === 'audioinput'),
          });
        }
      } catch { /* ignore */ }

      // NOW join the room after media is ready
      socket.emit('join-room', {
        roomId,
        userId: (user as any)?._id || user?.id,
        userName: myName
      });

      if (isMounted) setIsConnecting(false);
    };

    init();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, roomId]);

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 2 — Socket signaling listeners
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Received when we join a room that already has participants
    // We must send an offer to each of them
    const onExistingParticipants = async (participants: { socketId: string; userName: string }[]) => {
      console.log('[WS] existing-participants:', participants.length);
      for (const p of participants) {
        // Add to list immediately (stream will come after negotiation)
        setRemoteParticipants(prev => {
          if (prev.find(x => x.socketId === p.socketId)) return prev;
          return [...prev, { socketId: p.socketId, userName: p.userName, stream: null }];
        });
        const pc = createPeerConnection(p.socketId, p.userName);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { targetSocketId: p.socketId, offer });
        } catch (err) {
          console.error(`offer error to ${p.socketId}:`, err);
        }
      }
    };

    // A new participant joined after us — they will send us an offer
    const onParticipantJoined = ({ socketId, userName }: { socketId: string; userName: string }) => {
      console.log('[WS] participant-joined:', userName, socketId);
      // Just prepare the PC — wait for their offer
      setRemoteParticipants(prev => {
        if (prev.find(x => x.socketId === socketId)) return prev;
        return [...prev, { socketId, userName, stream: null }];
      });
      createPeerConnection(socketId, userName);
    };

    // Someone sent us an offer — respond with an answer
    const onOffer = async ({ fromSocketId, offer }: { fromSocketId: string; offer: RTCSessionDescriptionInit }) => {
      console.log('[WS] offer from:', fromSocketId);
      let pc = peerConnectionsRef.current[fromSocketId];
      if (!pc) {
        const userName = remoteParticipants.find(p => p.socketId === fromSocketId)?.userName || 'Participant';
        pc = createPeerConnection(fromSocketId, userName);
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { targetSocketId: fromSocketId, answer });
      } catch (err) {
        console.error('answer error:', err);
      }
    };

    // We received an answer to our offer
    const onAnswer = async ({ fromSocketId, answer }: { fromSocketId: string; answer: RTCSessionDescriptionInit }) => {
      console.log('[WS] answer from:', fromSocketId);
      const pc = peerConnectionsRef.current[fromSocketId];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error('setRemoteDescription error:', err);
        }
      }
    };

    // ICE candidate received
    const onIceCandidate = async ({ fromSocketId, candidate }: { fromSocketId: string; candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionsRef.current[fromSocketId];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('addIceCandidate error:', err);
        }
      }
    };

    // A participant left
    const onParticipantLeft = ({ socketId }: { socketId: string }) => {
      console.log('[WS] participant-left:', socketId);
      if (peerConnectionsRef.current[socketId]) {
        peerConnectionsRef.current[socketId].close();
        delete peerConnectionsRef.current[socketId];
      }
      setRemoteParticipants(prev => prev.filter(p => p.socketId !== socketId));
    };

    // Participant count update
    const onParticipantCount = (count: number) => setParticipantCount(count);

    // Host ended the meeting
    const onMeetingEnded = () => {
      showToast('Meeting ended by host', 'info');
      cleanup();
      navigate(getRedirectPath());
    };

    // In-meeting chat
    const onMeetingChat = (data: ChatMessage) => {
      setChatMessages(prev => [...prev, data]);
    };

    socket.on('existing-participants', onExistingParticipants);
    socket.on('participant-joined', onParticipantJoined);
    socket.on('offer', onOffer);
    socket.on('answer', onAnswer);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('participant-left', onParticipantLeft);
    socket.on('participant-count', onParticipantCount);
    socket.on('meeting-ended', onMeetingEnded);
    socket.on('meeting-chat', onMeetingChat);

    return () => {
      socket.off('existing-participants', onExistingParticipants);
      socket.off('participant-joined', onParticipantJoined);
      socket.off('offer', onOffer);
      socket.off('answer', onAnswer);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('participant-left', onParticipantLeft);
      socket.off('participant-count', onParticipantCount);
      socket.off('meeting-ended', onMeetingEnded);
      socket.off('meeting-chat', onMeetingChat);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, createPeerConnection, cleanup, navigate, getRedirectPath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (socket && roomId) socket.emit('leave-room', { roomId });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ──────────────────────────────────────────────────────────────────────────
  // CONTROLS
  // ──────────────────────────────────────────────────────────────────────────

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
      socket?.emit('media-state', { roomId, type: 'audio', enabled: audioTrack.enabled });
    }
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCamOn(videoTrack.enabled);
      socket?.emit('media-state', { roomId, type: 'video', enabled: videoTrack.enabled });
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];

      // Replace video track in all peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        sender?.replaceTrack(screenTrack);
      });

      // Show screen share in local preview
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setIsScreenSharing(true);

      screenTrack.onended = () => stopScreenShare();
    } catch (err) {
      console.error('Screen share error:', err);
      showToast('Screen share cancelled or not supported', 'warning');
    }
  };

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);

    const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
    if (cameraTrack) {
      Object.values(peerConnectionsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        sender?.replaceTrack(cameraTrack);
      });
    }
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socket?.emit('meeting-chat', { roomId, message: newMessage.trim(), userName: myName });
    setNewMessage('');
  };

  const applyDeviceSettings = async () => {
    try {
      const constraints = {
        video: selectedDevices.videoInput ? { deviceId: { exact: selectedDevices.videoInput } } : true,
        audio: selectedDevices.audioInput ? { deviceId: { exact: selectedDevices.audioInput } } : true,
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = newStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = newStream;

      Object.values(peerConnectionsRef.current).forEach(pc => {
        newStream.getTracks().forEach(track => {
          const sender = pc.getSenders().find(s => s.track?.kind === track.kind);
          sender?.replaceTrack(track);
        });
      });
      setIsSettingsOpen(false);
      showToast('Devices switched successfully', 'success');
    } catch {
      showToast('Failed to switch devices', 'error');
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  if (isConnecting) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-white text-lg font-semibold">Joining Meeting Room...</p>
          <p className="text-white/40 text-sm">Setting up audio & video</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0A0A0A] overflow-hidden text-white relative">
      {/* ── Main video area ── */}
      <div className="flex-1 flex flex-col relative h-full min-w-0">

        {/* Header */}
        <div className="p-4 flex items-center justify-between bg-black/40 backdrop-blur-md border-b border-white/10 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">CognifyPM Meeting</h2>
              <p className="text-[10px] text-white/50 uppercase tracking-widest leading-none mt-1">
                ID: {roomId?.slice(0, 12)}...
              </p>
            </div>
          </div>
          <div className="text-xs font-medium text-white/60 bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {participantCount} <span className="hidden sm:inline">participant{participantCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-28 md:pb-28">
          <div className={cn(
            "grid gap-4 h-full content-start",
            remoteParticipants.length === 0 ? "grid-cols-1 max-w-2xl mx-auto" :
            remoteParticipants.length === 1 ? "grid-cols-1 sm:grid-cols-2" :
            remoteParticipants.length <= 3 ? "grid-cols-2" :
            "grid-cols-2 lg:grid-cols-3"
          )}>
            {/* Local Video */}
            <motion.div
              layout
              className="relative aspect-video bg-zinc-900 rounded-xl md:rounded-2xl overflow-hidden border border-white/5 ring-1 ring-white/10"
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={cn(
                  "h-full w-full object-cover",
                  !isScreenSharing && "scale-x-[-1]"
                )}
              />
              {/* Overlay when cam is off */}
              {!isCamOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <div className="h-20 w-20 rounded-full bg-zinc-700 flex items-center justify-center text-3xl font-bold">
                    {myName.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[10px] md:text-xs font-medium flex items-center gap-2 text-white">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {myName} {isHost && <span className="text-primary">(Host)</span>}
                  {isScreenSharing && <span className="text-blue-400 ml-1">• Sharing screen</span>}
                </p>
              </div>
            </motion.div>

            {/* Remote Videos */}
            {remoteParticipants.map((p) =>
              p.stream ? (
                <RemoteVideo key={p.socketId} socketId={p.socketId} stream={p.stream} userName={p.userName} />
              ) : (
                // Placeholder while waiting for stream
                <motion.div
                  layout
                  key={p.socketId}
                  className="relative aspect-video bg-zinc-900 rounded-xl md:rounded-2xl overflow-hidden border border-white/5 ring-1 ring-white/10 flex items-center justify-center"
                >
                  <div className="text-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold mx-auto">
                      {p.userName.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-white/70">{p.userName}</p>
                    <div className="flex items-center gap-1.5 text-white/40 text-xs justify-center">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Connecting...
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-3 z-30">
          <div className="flex items-center gap-1.5 md:gap-3 bg-zinc-900/90 backdrop-blur-xl px-4 py-3 rounded-3xl border border-white/10 shadow-2xl">
            {/* Mic */}
            <button
              id="meeting-toggle-mic"
              onClick={toggleMic}
              title={isMicOn ? 'Mute' : 'Unmute'}
              className={cn(
                "p-3 md:p-4 rounded-2xl transition-all",
                isMicOn ? "hover:bg-white/10 text-white" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              )}
            >
              {isMicOn ? <Mic className="h-5 w-5 md:h-6 md:w-6" /> : <MicOff className="h-5 w-5 md:h-6 md:w-6" />}
            </button>

            {/* Camera */}
            <button
              id="meeting-toggle-cam"
              onClick={toggleCamera}
              title={isCamOn ? 'Stop Video' : 'Start Video'}
              className={cn(
                "p-3 md:p-4 rounded-2xl transition-all",
                isCamOn ? "hover:bg-white/10 text-white" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              )}
            >
              {isCamOn ? <Camera className="h-5 w-5 md:h-6 md:w-6" /> : <CameraOff className="h-5 w-5 md:h-6 md:w-6" />}
            </button>

            {/* Screen Share */}
            <button
              id="meeting-screen-share"
              onClick={toggleScreenShare}
              title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              className={cn(
                "p-3 md:p-4 rounded-2xl transition-all",
                isScreenSharing ? "bg-primary/80 text-white hover:bg-primary" : "hover:bg-white/10 text-white"
              )}
            >
              {isScreenSharing ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Monitor className="h-5 w-5 md:h-6 md:w-6" />}
            </button>

            <div className="w-[1px] h-8 bg-white/10 mx-1" />

            {/* Chat */}
            <button
              id="meeting-toggle-chat"
              onClick={() => setIsChatOpen(!isChatOpen)}
              title="Chat"
              className={cn(
                "p-3 md:p-4 rounded-2xl transition-all relative",
                isChatOpen ? "bg-primary/20 text-primary" : "hover:bg-white/10 text-white"
              )}
            >
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
              {chatMessages.length > 0 && !isChatOpen && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>

            {/* Settings */}
            <button
              id="meeting-settings"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
              className="p-3 md:p-4 rounded-2xl hover:bg-white/10 text-white transition-all"
            >
              <SettingsIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <div className="w-[1px] h-8 bg-white/10 mx-1" />

            {/* Leave */}
            <button
              id="meeting-leave"
              onClick={leaveMeeting}
              title="Leave Meeting"
              className="p-3 md:p-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all"
            >
              <PhoneOff className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* End for all (host only) */}
          {isHost && (
            <button
              id="meeting-end-all"
              onClick={endMeetingForAll}
              className="hidden sm:block px-5 py-3 rounded-full border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest bg-zinc-900/80 backdrop-blur-xl"
            >
              End All
            </button>
          )}
        </div>
      </div>

      {/* ── Chat Sidebar ── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed md:relative inset-y-0 right-0 w-80 bg-zinc-900/95 border-l border-white/10 flex flex-col z-[100] shrink-0"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Meeting Chat
              </h3>
              <button onClick={() => setIsChatOpen(false)}>
                <X className="h-5 w-5 text-white/60 hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40 gap-2">
                  <MessageSquare className="h-8 w-8" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : chatMessages.map((m, i) => {
                const isMe = m.fromSocketId === socket?.id;
                return (
                  <div key={i} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                    <p className="text-[10px] text-white/40 mb-1 font-bold uppercase tracking-wide">
                      {isMe ? 'You' : m.userName}
                    </p>
                    <div className={cn(
                      "px-3 py-2 rounded-2xl text-sm max-w-[85%] break-words",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-white/5 text-white border border-white/10 rounded-tl-sm"
                    )}>
                      {m.message}
                    </div>
                    <p className="text-[9px] text-white/30 mt-1">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="p-3 border-t border-white/10 bg-black/20 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  id="meeting-chat-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-white placeholder-white/30"
                />
                <button
                  id="meeting-chat-send"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Device Settings Dialog ── */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Media Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Camera</Label>
              <Select
                value={selectedDevices.videoInput}
                onValueChange={(v) => setSelectedDevices(p => ({ ...p, videoInput: v }))}
              >
                <SelectTrigger className="bg-zinc-900 border-white/10">
                  <SelectValue placeholder="Default camera" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {devices.videoInputs.map((d) => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Microphone</Label>
              <Select
                value={selectedDevices.audioInput}
                onValueChange={(v) => setSelectedDevices(p => ({ ...p, audioInput: v }))}
              >
                <SelectTrigger className="bg-zinc-900 border-white/10">
                  <SelectValue placeholder="Default microphone" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {devices.audioInputs.map((d) => (
                    <SelectItem key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone ${d.deviceId.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={applyDeviceSettings} className="w-full bg-primary hover:bg-primary/90">
              Apply Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingRoom;
