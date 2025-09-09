import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../../../services/socket';
import { toast } from 'react-hot-toast';
import i18n from '@/libs/i18n';

export interface CallUserInfo {
  id: number;
  name?: string;
  avatar?: string | null;
}

interface IncomingCallPayload {
  callId: string;
  from: CallUserInfo;
  media?: 'audio' | 'video';
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
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialCancelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const incomingIceQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callStartedAtRef = useRef<number | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  // Dialing progress (for outgoing while connecting)
  const CONNECT_TIMEOUT_MS = 20000;
  const dialStartAtRef = useRef<number | null>(null);
  const dialTickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [dialProgress, setDialProgress] = useState(0);

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
    if (dialCancelTimeoutRef.current) { try { clearTimeout(dialCancelTimeoutRef.current); } catch {} dialCancelTimeoutRef.current = null; }
    callStartedAtRef.current = null;
    setCallSeconds(0);
    // stop dialing ticker
    if (dialTickerRef.current) { try { clearInterval(dialTickerRef.current); } catch {} dialTickerRef.current = null; }
    dialStartAtRef.current = null;
    setDialProgress(0);
    try {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    } catch {}
    localStreamRef.current = null;
    if (localAudioRef.current) localAudioRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    setLocalStream(null);
    setRemoteStream(null);
    setCameraOn(false);
    setMicOn(false);
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
    setMediaType('audio');
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
    if (dialCancelTimeoutRef.current) { try { clearTimeout(dialCancelTimeoutRef.current); } catch {} dialCancelTimeoutRef.current = null; }
    // reset dialing
    if (dialTickerRef.current) { try { clearInterval(dialTickerRef.current); } catch {} dialTickerRef.current = null; }
    dialStartAtRef.current = null;
    setDialProgress(0);
  }, [peerUser?.id, activeCallId]);

  const startPeer = async (initiator: boolean, other: CallUserInfo, callId: string, withVideo: boolean) => {
    try {
      // Cross-browser getUserMedia with fallback
      const nav: any = navigator;
      const constraints = withVideo
        ? { audio: { echoCancellation: true, noiseSuppression: true }, video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } }
        : { audio: { echoCancellation: true, noiseSuppression: true }, video: false } as any;
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
      setLocalStream(stream);
      setCameraOn(!!(stream.getVideoTracks && stream.getVideoTracks().length));
      setMicOn(!!(stream.getAudioTracks && stream.getAudioTracks().length ? stream.getAudioTracks()[0].enabled !== false : false));
      if (!withVideo && localAudioRef.current) localAudioRef.current.srcObject = stream;
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
      if (withVideo) { try { pc.addTransceiver('video', { direction: 'sendrecv' } as RTCRtpTransceiverInit); } catch {} }

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
          if (dialCancelTimeoutRef.current) { try { clearTimeout(dialCancelTimeoutRef.current); } catch {} dialCancelTimeoutRef.current = null; }
          // stop dialing ring
          if (dialTickerRef.current) { try { clearInterval(dialTickerRef.current); } catch {} dialTickerRef.current = null; }
          dialStartAtRef.current = null;
          setDialProgress(0);
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
        const [rstream] = e.streams;
        if (rstream) {
          setRemoteStream(rstream);
          // Always attach to audio element as well so audio plays even if video is muted for autoplay
          if (remoteAudioRef.current) {
            try { remoteAudioRef.current.srcObject = rstream; } catch {}
          }
          setInCall(true);
          setConnecting(false);
        }
      };

      // Start offer/answer based on role
      if (initiator) {
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: withVideo } as any);
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
      }, CONNECT_TIMEOUT_MS);
    } catch (e) {
      console.error('[call] call setup error', e);
      const msg = (e as any)?.name === 'NotAllowedError' ? 'Bạn đã từ chối truy cập micro' : 'Không truy cập được micro';
      toast.error(msg);
      endCall(false);
    }
  };

  const _startCall = useCallback(async (target: CallUserInfo, media: 'audio' | 'video') => {
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
    setMediaType(media);
    setCameraOn(media === 'video');
    setMicOn(true);
    // start dialing ring progress
    dialStartAtRef.current = Date.now();
    setDialProgress(0);
    if (dialTickerRef.current) { try { clearInterval(dialTickerRef.current); } catch {} }
    dialTickerRef.current = setInterval(() => {
      if (!dialStartAtRef.current) return;
      const elapsed = Date.now() - dialStartAtRef.current;
      const p = Math.min(elapsed / CONNECT_TIMEOUT_MS, 1);
      setDialProgress(p);
      // Safety: if progress reached 100% and still not connected, cancel now
      if (p >= 1 && !inCall && connecting) {
        try { cancelOutgoing(); } catch {}
      }
    }, 100);
    // auto-cancel if peer doesn't accept within timeout
    if (dialCancelTimeoutRef.current) { try { clearTimeout(dialCancelTimeoutRef.current); } catch {} }
    dialCancelTimeoutRef.current = setTimeout(() => {
      if (!inCall && connecting) {
        toast.error('Người nhận không bắt máy');
        cancelOutgoing();
      }
    }, CONNECT_TIMEOUT_MS);
    try {
      socket.emit('call_request', { to: target.id, callId, media });
    } catch {}
  }, [currentUserId, inCall, connecting, incomingCall]);

  const startCall = useCallback((target: CallUserInfo) => _startCall(target, 'audio'), [_startCall]);
  const startVideoCall = useCallback((target: CallUserInfo) => _startCall(target, 'video'), [_startCall]);

  const acceptCall = useCallback(async () => {
    const socket = getSocket();
    if (!socket || !incomingCall) return;
    setConnecting(true);
    setActiveCallId(incomingCall.callId);
    setPeerUser(incomingCall.from);
    setMediaType(incomingCall.media === 'video' ? 'video' : 'audio');
    try { socket.emit('call_accept', { to: incomingCall.from.id, callId: incomingCall.callId }); } catch {}
    // Start callee peer (initiator: false)
    await startPeer(false, incomingCall.from, incomingCall.callId, incomingCall.media === 'video');
    setCameraOn(incomingCall.media === 'video');
    setMicOn(true);
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
      if (dialCancelTimeoutRef.current) { try { clearTimeout(dialCancelTimeoutRef.current); } catch {} dialCancelTimeoutRef.current = null; }
      await startPeer(true, peerUser, payload.callId, mediaType === 'video');
    };

    const onRejected = (payload: { callId: string; by: CallUserInfo; reason?: string }) => {
      if (!activeCallId || payload.callId !== activeCallId) return;
      let msg = 'Cuộc gọi bị từ chối';
      if (payload.reason === 'busy') msg = 'Người kia đang bận';
      else if (payload.reason === 'offline') msg = 'Người kia đang ngoại tuyến';
      else if (payload.reason === 'blocked') msg = 'Không thể gọi do hai bên đã chặn nhau';
      toast.error(msg);
      if (dialCancelTimeoutRef.current) { try { clearTimeout(dialCancelTimeoutRef.current); } catch {} dialCancelTimeoutRef.current = null; }
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
          // If callee receives offer that contains video but we're in audio mode, upgrade to video on-the-fly
          const offerHasVideo = (desc.sdp || '').includes('m=video');
          if (desc.type === 'offer' && offerHasVideo && mediaType !== 'video') {
            try {
              // Grab camera and attach video track
              const nav: any = navigator;
              const vStream: MediaStream = await (nav?.mediaDevices?.getUserMedia
                ? nav.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false })
                : new Promise((resolve, reject) => nav.getUserMedia({ video: true, audio: false }, resolve, reject)));
              const vTrack = vStream.getVideoTracks()[0];
              if (vTrack) {
                // Build a NEW stream instance to ensure React state updates
                const existing = localStreamRef.current ? localStreamRef.current.getTracks() : [];
                const newStream = new MediaStream([...existing, vTrack]);
                localStreamRef.current = newStream;
                setLocalStream(newStream);
                try { pc.addTrack(vTrack, newStream); } catch {}
                try { pc.addTransceiver('video', { direction: 'sendrecv' } as RTCRtpTransceiverInit); } catch {}
                setMediaType('video');
                setCameraOn(true);
                setMicOn(true);
              }
            } catch (err) {
              console.error('[voicecall] upgrade to video failed', err);
            }
          }
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
      toast(i18n.t('dashboard:chat.call.toast.ended'));
      endCall(false);
    };

    const onCancelled = (payload: { callId: string; by: CallUserInfo }) => {
      if (incomingCall && payload.callId === incomingCall.callId) {
        setIncomingCall(null);
        toast(i18n.t('dashboard:chat.call.toast.cancelled'));
      }
      if (dialCancelTimeoutRef.current) { try { clearTimeout(dialCancelTimeoutRef.current); } catch {} dialCancelTimeoutRef.current = null; }
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
    dialProgress,
    mediaType,
    localStream,
    remoteStream,
    cameraOn,
    micOn,
    // controls
    startCall,
    startVideoCall,
    acceptCall,
    rejectCall,
    endCall,
    cancelOutgoing,
    toggleCamera: async () => {
      try {
        const pc = pcRef.current;
        let stream = localStreamRef.current;
        let vTrack = stream?.getVideoTracks?.()[0];
        if (cameraOn) {
          // Turn off: disable track if exists
          if (vTrack) {
            try { vTrack.enabled = false; } catch {}
          }
          setCameraOn(false);
          return;
        }
        // Turn on
        if (!vTrack) {
          const nav: any = navigator;
          const vStream: MediaStream = await (nav?.mediaDevices?.getUserMedia
            ? nav.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false })
            : new Promise((resolve, reject) => nav.getUserMedia({ video: true, audio: false }, resolve, reject)));
          vTrack = vStream.getVideoTracks()[0];
          if (vTrack) {
            // merge into existing stream or create new
            const existingTracks = stream ? stream.getTracks() : [];
            const newStream = new MediaStream([...existingTracks, vTrack]);
            localStreamRef.current = newStream;
            setLocalStream(newStream);
            try { pc?.addTrack?.(vTrack, newStream); } catch {}
            try { pc?.addTransceiver?.('video', { direction: 'sendrecv' } as RTCRtpTransceiverInit); } catch {}
          }
        } else {
          try { vTrack.enabled = true; } catch {}
        }
        setMediaType('video');
        setCameraOn(true);
      } catch (e) {
        console.error('[voicecall] toggleCamera error', e);
        toast.error('Không thể bật/tắt camera');
      }
    }
    ,
    toggleMic: async () => {
      try {
        const pc = pcRef.current;
        let stream = localStreamRef.current;
        let aTrack = stream?.getAudioTracks?.()[0];
        if (micOn) {
          if (aTrack) { try { aTrack.enabled = false; } catch {} }
          setMicOn(false);
          return;
        }
        // turn on
        if (!aTrack) {
          const nav: any = navigator;
          const aStream: MediaStream = await (nav?.mediaDevices?.getUserMedia
            ? nav.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false })
            : new Promise<MediaStream>((resolve, reject) => nav.getUserMedia({ audio: true, video: false }, resolve, reject)));
          aTrack = aStream.getAudioTracks()[0];
          if (aTrack) {
            const existingTracks = stream ? stream.getTracks() : [];
            const newStream = new MediaStream([...existingTracks, aTrack]);
            localStreamRef.current = newStream;
            setLocalStream(newStream);
            try { pc?.addTrack?.(aTrack, newStream); } catch {}
            try { pc?.addTransceiver?.('audio', { direction: 'sendrecv' } as RTCRtpTransceiverInit); } catch {}
          }
        } else {
          try { aTrack.enabled = true; } catch {}
        }
        setMicOn(true);
      } catch (e) {
        console.error('[voicecall] toggleMic error', e);
        toast.error('Không thể bật/tắt micro');
      }
    }
  };
}
