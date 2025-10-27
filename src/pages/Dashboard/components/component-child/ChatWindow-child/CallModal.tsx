import { useCallback, useEffect, useRef, memo } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneOff, X, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';

export type CallMode = 'incoming' | 'outgoing' | 'active' | 'hidden';

interface CallUser {
  id: number;
  name?: string;
  avatar?: string | null;
}

interface CallModalProps {
  open: boolean;
  mode: CallMode;
  user: CallUser | null;
  elapsedSeconds?: number;
  dialProgress?: number; // 0..1 while dialing in outgoing mode
  mediaType?: 'audio' | 'video';
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  cameraOn?: boolean;
  micOn?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
  onEnd?: () => void;
  onToggleCamera?: () => void;
  onToggleMic?: () => void;
}

const CallModal = memo(({ open, mode, user, elapsedSeconds = 0, dialProgress = 0, mediaType = 'audio', localStream = null, remoteStream = null, cameraOn = false, micOn = true, onAccept, onReject, onCancel, onEnd, onToggleCamera, onToggleMic }: CallModalProps) => {
  const { t } = useTranslation('dashboard');
  const me = useAppSelector((s) => s.auth.user);
  
  // ALL HOOKS MUST BE DEFINED BEFORE ANY EARLY RETURN
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const bindRemoteVideoRef = useCallback((node: HTMLVideoElement | null) => {
    remoteVideoRef.current = node;
    if (node && remoteStream) {
      try {
        const vt = remoteStream.getVideoTracks && remoteStream.getVideoTracks()[0];
        (node as any).srcObject = vt ? new MediaStream([vt]) : remoteStream;
        node.muted = true; // keep muted to allow autoplay, audio plays via hidden audio element
        const tryPlay = () => node.play?.().catch(() => {});
        node.oncanplay = () => tryPlay();
        tryPlay();
      } catch {}
    }
  }, [remoteStream]);

  const bindLocalVideoRef = useCallback((node: HTMLVideoElement | null) => {
    localVideoRef.current = node;
    if (node && localStream) {
      try {
        const vt = localStream.getVideoTracks && localStream.getVideoTracks()[0];
        (node as any).srcObject = vt ? new MediaStream([vt]) : localStream;
        node.muted = true;
        const tryPlay = () => node.play?.().catch(() => {});
        node.oncanplay = () => tryPlay();
        tryPlay();
      } catch {}
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      try {
        const vt = remoteStream.getVideoTracks && remoteStream.getVideoTracks()[0];
        (remoteVideoRef.current as any).srcObject = vt ? new MediaStream([vt]) : remoteStream;
        remoteVideoRef.current.muted = true; // allow autoplay reliably
        const tryPlay = () => remoteVideoRef.current?.play?.().catch(() => {});
        if (remoteVideoRef.current) remoteVideoRef.current.oncanplay = () => tryPlay();
        tryPlay();
      } catch {}
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      try {
        const vt = localStream.getVideoTracks && localStream.getVideoTracks()[0];
        (localVideoRef.current as any).srcObject = vt ? new MediaStream([vt]) : localStream;
        localVideoRef.current.muted = true;
        const tryPlay = () => localVideoRef.current?.play?.().catch(() => {});
        if (localVideoRef.current) localVideoRef.current.oncanplay = () => tryPlay();
        tryPlay();
      } catch {}
    }
  }, [localStream]);

  // EARLY RETURN AFTER ALL HOOKS
  if (!open || mode === 'hidden') return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeStr = `${pad(mins)}:${pad(secs)}`;
  const title = mode === 'incoming' ? t('chat.call.title.incoming') : mode === 'outgoing' ? t('chat.call.title.outgoing') : t('chat.call.title.active');
  const primaryAction = () => {
    if (mode === 'incoming') return onAccept;
    if (mode === 'outgoing') return onReject;
    return onEnd;
  };
  const primaryText = mode === 'incoming' ? t('chat.call.actions.accept') : mode === 'outgoing' ? t('chat.call.actions.cancel') : t('chat.call.actions.end');
  const secondaryAction = () => {
    if (mode === 'incoming') return onReject;
    return undefined;
  };
  const secondaryText = mode === 'incoming' ? t('chat.call.actions.reject') : '';
  const hasLocalVideo = !!(localStream && localStream.getVideoTracks && localStream.getVideoTracks().length);
  const hasRemoteVideo = !!(remoteStream && remoteStream.getVideoTracks && remoteStream.getVideoTracks().length);
  const hasVideo = mediaType === 'video' || hasLocalVideo || hasRemoteVideo;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-white/20 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-600" />
        <div className="px-6 py-6 text-center">
          <div className="relative w-28 h-28 mx-auto mb-4">
            {/* Avatar */}
            <div className="absolute inset-0 rounded-full overflow-hidden shadow-lg">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || 'user'} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            {/* Soft pulse rings */}
            {mode !== 'active' && (
              <>
                <div className="absolute inset-0 rounded-full ring-8 ring-blue-400/10 animate-ping" />
                <div className="absolute inset-0 rounded-full ring-[14px] ring-purple-400/10 animate-ping [animation-delay:200ms]" />
              </>
            )}
            {/* Dial progress ring (only in outgoing mode) */}
            {mode === 'outgoing' && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 112 112">
                {(() => {
                  const stroke = 6;
                  const size = 112; // matches w-28 h-28 container
                  const cx = size / 2, cy = size / 2; // 56, 56
                  const radius = (size / 2) - (stroke / 2); // 56 - 3 = 53
                  const circumference = 2 * Math.PI * radius;
                  const progress = Math.min(Math.max(dialProgress, 0), 1);
                  const offset = circumference * (1 - progress);
                  return (
                    <>
                      <defs>
                        <linearGradient id="dialGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" />
                          <stop offset="100%" stopColor="#a78bfa" />
                        </linearGradient>
                      </defs>
                      <circle cx={cx} cy={cy} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        stroke="url(#dialGrad)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={offset}
                        transform={`rotate(-90 ${cx} ${cy})`}
                      />
                    </>
                  );
                })()}
              </svg>
            )}
          </div>
          {/* When video call is active, show video canvas below header */}
          {hasVideo && mode === 'active' && (
            <div className="relative w-full max-w-md mx-auto mb-4">
              {/* Main: always prefer REMOTE */}
              {hasRemoteVideo ? (
                <video ref={bindRemoteVideoRef} autoPlay playsInline muted className="w-full h-56 rounded-xl bg-black object-cover" />
              ) : (
                <div className="w-full h-56 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700/80 flex items-center justify-center text-xs text-white/70">
                  {t('chat.call.title.outgoing')}
                </div>
              )}
              {/* PiP: always show LOCAL if available (regardless of remote) */}
              {cameraOn && hasLocalVideo ? (
                <video ref={bindLocalVideoRef} autoPlay muted playsInline className="absolute bottom-2 right-2 w-28 h-20 rounded-lg bg-black object-cover ring-2 ring-white/70" style={{ transform: 'scaleX(-1)' }} />
              ) : (
                <div className="absolute bottom-2 right-2 w-28 h-20 rounded-lg bg-black ring-2 ring-white/70 overflow-hidden flex items-center justify-center">
                  {me?.avatar ? (
                    <img src={me.avatar} alt={me?.name || 'me'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                      {(me?.name?.charAt(0) || 'U')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{user?.name || 'Người dùng'}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center justify-center gap-2">
            {mode === 'incoming' && <PhoneIncoming className="w-4 h-4" />}
            {mode === 'outgoing' && <PhoneOutgoing className="w-4 h-4" />}
            {mode === 'active' && <Phone className="w-4 h-4" />}
            <span>{mode === 'active' ? timeStr : title}</span>
          </div>
          {mode === 'outgoing' && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {t('chat.call.hint.autoCancelIn', { seconds: Math.max(0, Math.ceil((1 - Math.min(Math.max(dialProgress, 0), 1)) * 20)) })}
            </div>
          )}
          <div className="flex items-center justify-center gap-3">
            {secondaryAction() && (
              <button
                onClick={secondaryAction()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50 shadow-sm"
              >
                <X className="w-4 h-4" /> {secondaryText}
              </button>
            )}
            {mediaType === 'video' && mode === 'active' && (
              <button
                onClick={onToggleCamera}
                title={cameraOn ? t('chat.call.actions.turnCameraOff', 'Tắt camera') : t('chat.call.actions.turnCameraOn', 'Bật camera')}
                aria-label={cameraOn ? t('chat.call.actions.turnCameraOff', 'Tắt camera') : t('chat.call.actions.turnCameraOn', 'Bật camera')}
                className={`p-2 rounded-full transition-colors ${cameraOn ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            )}
            {mode === 'active' && (
              <button
                onClick={onToggleMic}
                title={micOn ? t('chat.call.actions.mute', 'Tắt mic') : t('chat.call.actions.unmute', 'Bật mic')}
                aria-label={micOn ? t('chat.call.actions.mute', 'Tắt mic') : t('chat.call.actions.unmute', 'Bật mic')}
                className={`p-2 rounded-full transition-colors ${micOn ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={primaryAction()}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full shadow ${mode === 'incoming' ? 'bg-green-600 hover:bg-green-700' : mode === 'outgoing' ? 'bg-gray-700 hover:bg-gray-800' : 'bg-red-600 hover:bg-red-700'} text-white`}
            >
              {mode === 'incoming' ? <Phone className="w-4 h-4" /> : mode === 'outgoing' ? <PhoneOff className="w-4 h-4" /> : <PhoneOff className="w-4 h-4" />} {primaryText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CallModal.displayName = 'CallModal';

export default CallModal;

