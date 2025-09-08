import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../../../services/socket';
import { toast } from 'react-hot-toast';

export interface CallUserInfo {
  id: number;
  name?: string;
  avatar?: string | null;
}

interface IncomingCallPayload {
  callId: string;
  from: CallUserInfo;
}

type SignalPayload = { sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };

export function useVoiceCall(currentUserId: number | null) {
  // Version marker to verify latest code is loaded in browser
  const VERSION = 'voicecall-rtc-2025-09-08-23:04';
  if (typeof window !== 'undefined') {
    // Log once per hook mount
    // eslint-disable-next-line no-console
    console.log('[voicecall] hook version:', VERSION);
  }
  const [incomingCall, setIncomingCall] = useState<IncomingCallPayload | null>(null);
  const [inCall, setInCall] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [peerUser, setPeerUser] = useState<CallUserInfo | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const incomingIceQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callStartedAtRef = useRef<number | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);

  // Prepare audio elements lazily
  useEffect(() => {
    if (!localAudioRef.current) {
      const a = document.createElement('audio');
      a.autoplay = true;
      a.muted = true; // avoid echo for local
      a.style.display = 'none';
      document.body.appendChild(a);
      localAudioRef.current = a;
    }
    if (!remoteAudioRef.current) {
      const a = document.createElement('audio');
      a.autoplay = true;
      a.style.display = 'none';
      document.body.appendChild(a);
      remoteAudioRef.current = a;
    }
    return () => {
      // Keep them; cleanup on full unmount handled by endCall
    };
  }, []);

  const cleanupMedia = () => {
    try {
      pcRef.current?.getSenders?.().forEach(s => { try { s.track && s.track.stop(); } catch {} });
      pcRef.current?.close?.();
    } catch {}
    pcRef.current = null;
    if (connectTimeoutRef.current) { try { clearTimeout(connectTimeoutRef.current); } catch {} connectTimeoutRef.current = null; }
    if (callTimerRef.current) { try { clearInterval(callTimerRef.current); } catch {} callTimerRef.current = null; }
    callStartedAtRef.current = null;
    setCallSeconds(0);
    try {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    } catch {}
    localStreamRef.current = null;
    if (localAudioRef.current) localAudioRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  };

  const endCall = useCallback((notifyPeer: boolean = true) => {
    const socket = getSocket();
    const to = peerUser?.id;
    const callId = activeCallId;
    cleanupMedia();
    setInCall(false);
    setConnecting(false);
    setActiveCallId(null);
    setPeerUser(null);
    setIncomingCall(null);
    if (notifyPeer && socket && to && callId) {
      try { socket.emit('call_end', { to, callId }); } catch {}
    }
  }, [peerUser?.id, activeCallId]);

  // Cancel outgoing call while ringing (before connected)
  const cancelOutgoing = useCallback(() => {
    const socket = getSocket();
    const to = peerUser?.id;
    const callId = activeCallId;
    setConnecting(false);
    if (socket && to && callId) {
      try { socket.emit('call_cancel', { to, callId }); } catch {}
    }
    setActiveCallId(null);
    setPeerUser(null);
  }, [peerUser?.id, activeCallId]);

  const startPeer = async (initiator: boolean, other: CallUserInfo, callId: string) => {
    try {
      // Cross-browser getUserMedia with fallback
      const nav: any = navigator;
      const constraints = { audio: { echoCancellation: true, noiseSuppression: true }, video: false } as any;
      let stream: MediaStream;
      if (nav?.mediaDevices && typeof nav.mediaDevices.getUserMedia === 'function') {
        stream = await nav.mediaDevices.getUserMedia(constraints);
      } else if (typeof nav?.getUserMedia === 'function') {
        stream = await new Promise<MediaStream>((resolve, reject) => nav.getUserMedia(constraints, resolve, reject));
      } else if (typeof nav?.webkitGetUserMedia === 'function') {
        stream = await new Promise<MediaStream>((resolve, reject) => nav.webkitGetUserMedia(constraints, resolve, reject));
      } else if (typeof nav?.mozGetUserMedia === 'function') {
        stream = await new Promise<MediaStream>((resolve, reject) => nav.mozGetUserMedia(constraints, resolve, reject));
      } else {
        const insecure = typeof window !== 'undefined' && (window as any).isSecureContext === false;
        toast.error(insecure
          ? 'Không thể truy cập micro vì trang không ở chế độ bảo mật (https hoặc localhost)'
          : 'Trình duyệt không hỗ trợ gọi thoại (legacy gUM không khả dụng)'
        );
        endCall(false);
        return;
      }
      localStreamRef.current = stream;
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      // Create RTCPeerConnection
      const iceServers: RTCIceServer[] = [
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
            'stun:stun3.l.google.com:19302',
            'stun:stun4.l.google.com:19302',
            'stun:stun.cloudflare.com:3478',
          ],
        },
      ];
      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;

      // Attach local tracks
      for (const track of stream.getTracks()) {
        try { pc.addTrack(track, stream); } catch {}
      }

      // Ensure bidirectional audio negotiation
      try { pc.addTransceiver('audio', { direction: 'sendrecv' } as RTCRtpTransceiverInit); } catch {}

      const socket = getSocket();

      pc.onicecandidate = (e) => {
        if (!e.candidate || !socket) return;
        const data: SignalPayload = { candidate: e.candidate.toJSON() };
        try { socket.emit('call_signal', { to: other.id, callId, data }); } catch {}
      };

      pc.onconnectionstatechange = () => {
        // eslint-disable-next-line no-console
        console.log('[voicecall] pc.connectionState:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setInCall(true);
          setConnecting(false);
          if (connectTimeoutRef.current) { try { clearTimeout(connectTimeoutRef.current); } catch {} connectTimeoutRef.current = null; }
          if (!callTimerRef.current) {
            callStartedAtRef.current = Date.now();
            callTimerRef.current = setInterval(() => {
              if (callStartedAtRef.current) {
                const elapsed = Math.floor((Date.now() - callStartedAtRef.current) / 1000);
                setCallSeconds(elapsed);
              }
            }, 1000);
          }
        }
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
          // End silently; remote will receive call_ended or ICE failed
          endCall(false);
        }
      };

      pc.oniceconnectionstatechange = () => {
        // eslint-disable-next-line no-console
        console.log('[voicecall] pc.iceConnectionState:', pc.iceConnectionState);
      };

      pc.ontrack = (e) => {
        const [remoteStream] = e.streams;
        if (remoteStream && remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          setInCall(true);
          setConnecting(false);
        }
      };

      // Start offer/answer based on role
      if (initiator) {
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: false } as any);
        await pc.setLocalDescription(offer);
        const data: SignalPayload = { sdp: offer };
        try { socket?.emit('call_signal', { to: other.id, callId, data }); } catch {}
      }

      // Fallback timeout: if not connected within 20s, cancel
      if (connectTimeoutRef.current) { try { clearTimeout(connectTimeoutRef.current); } catch {} }
      connectTimeoutRef.current = setTimeout(() => {
        if (pcRef.current && pcRef.current.connectionState !== 'connected') {
          toast.error('Không thể kết nối cuộc gọi. Vui lòng thử lại.');
          endCall();
        }
      }, 20000);
    } catch (e) {
      console.error('[call] call setup error', e);
      const msg = (e as any)?.name === 'NotAllowedError' ? 'Bạn đã từ chối truy cập micro' : 'Không truy cập được micro';
      toast.error(msg);
      endCall(false);
    }
  };

  const startCall = useCallback(async (target: CallUserInfo) => {
    if (!currentUserId) return;
    const socket = getSocket();
    if (!socket) { toast.error('Mất kết nối máy chủ'); return; }
    if (inCall || connecting || incomingCall) {
      toast('Bạn đang có cuộc gọi khác');
      return;
    }
    const callId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`);
    setConnecting(true);
    setActiveCallId(callId);
    setPeerUser(target);
    try {
      socket.emit('call_request', { to: target.id, callId, media: 'audio' });
    } catch {}
  }, [currentUserId, inCall, connecting, incomingCall]);

  const acceptCall = useCallback(async () => {
    const socket = getSocket();
    if (!socket || !incomingCall) return;
    setConnecting(true);
    setActiveCallId(incomingCall.callId);
    setPeerUser(incomingCall.from);
    try { socket.emit('call_accept', { to: incomingCall.from.id, callId: incomingCall.callId }); } catch {}
    // Start callee peer (initiator: false)
    await startPeer(false, incomingCall.from, incomingCall.callId);
    setIncomingCall(null);
  }, [incomingCall]);

  const rejectCall = useCallback((reason?: string) => {
    const socket = getSocket();
    if (!socket || !incomingCall) return;
    try { socket.emit('call_reject', { to: incomingCall.from.id, callId: incomingCall.callId, reason: reason || 'rejected' }); } catch {}
    setIncomingCall(null);
    setConnecting(false);
  }, [incomingCall]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onIncoming = (payload: IncomingCallPayload) => {
      if (inCall || connecting) {
        // Auto reject if busy
        try { socket.emit('call_reject', { to: payload.from.id, callId: payload.callId, reason: 'busy' }); } catch {}
        return;
      }
      setIncomingCall(payload);
    };

    const onAccepted = async (payload: { callId: string; by: CallUserInfo }) => {
      // Caller side will start initiator peer
      if (!activeCallId || payload.callId !== activeCallId || !peerUser) return;
      await startPeer(true, peerUser, payload.callId);
    };

    const onRejected = (payload: { callId: string; by: CallUserInfo; reason?: string }) => {
      if (!activeCallId || payload.callId !== activeCallId) return;
      let msg = 'Cuộc gọi bị từ chối';
      if (payload.reason === 'busy') msg = 'Người kia đang bận';
      else if (payload.reason === 'offline') msg = 'Người kia đang ngoại tuyến';
      else if (payload.reason === 'blocked') msg = 'Không thể gọi do hai bên đã chặn nhau';
      toast.error(msg);
      setConnecting(false);
      setActiveCallId(null);
      setPeerUser(null);
    };

    const onSignal = async (payload: { callId: string; from: CallUserInfo; data: SignalPayload }) => {
      if (!activeCallId || payload.callId !== activeCallId) return;
      const pc = pcRef.current;
      if (!pc) return;
      const { sdp, candidate } = payload.data || {} as any;
      try {
        if (sdp) {
          const desc = new RTCSessionDescription(sdp);
          const current = pc.currentRemoteDescription;
          if (!current || (current && current.type !== desc.type)) {
            await pc.setRemoteDescription(desc);
          }
          // If we are callee and received offer, create and send answer
          if (desc.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            const socket = getSocket();
            const data: SignalPayload = { sdp: answer };
            try { socket?.emit('call_signal', { to: payload.from.id, callId: payload.callId, data }); } catch {}
          }
          // Flush any queued ICE candidates
          if (incomingIceQueueRef.current.length) {
            for (const cand of incomingIceQueueRef.current) {
              try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch (err) { console.error('flush ice error', err); }
            }
            incomingIceQueueRef.current = [];
          }
        } else if (candidate) {
          if (!pc.currentRemoteDescription) {
            // Queue until remote SDP is set
            incomingIceQueueRef.current.push(candidate);
          } else {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      } catch (err) {
        console.error('signal error', err);
      }
    };

    const onEnded = (payload: { callId: string; by: CallUserInfo }) => {
      if (!activeCallId || payload.callId !== activeCallId) return;
      toast('Cuộc gọi đã kết thúc');
      endCall(false);
    };

    const onCancelled = (payload: { callId: string; by: CallUserInfo }) => {
      if (incomingCall && payload.callId === incomingCall.callId) {
        setIncomingCall(null);
        toast('Cuộc gọi đã bị hủy');
      }
    };

    socket.on('call_incoming', onIncoming);
    socket.on('call_accepted', onAccepted);
    socket.on('call_rejected', onRejected);
    socket.on('call_signal', onSignal);
    socket.on('call_ended', onEnded);
    socket.on('call_cancelled', onCancelled);

    return () => {
      socket.off('call_incoming', onIncoming);
      socket.off('call_accepted', onAccepted);
      socket.off('call_rejected', onRejected);
      socket.off('call_signal', onSignal);
      socket.off('call_ended', onEnded);
      socket.off('call_cancelled', onCancelled);
    };
  }, [activeCallId, peerUser, inCall, connecting, incomingCall, endCall]);

  return {
    // state
    incomingCall,
    inCall,
    connecting,
    peerUser,
    callSeconds,
    // controls
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    cancelOutgoing,
  };
}
