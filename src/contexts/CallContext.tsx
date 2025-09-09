import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useVoiceCall, type CallUserInfo } from '@/pages/Dashboard/hooks/useChatWindow/useVoiceCall';
import CallModal from '@/pages/Dashboard/components/component-child/ChatWindow-child/CallModal';

export interface CallContextValue {
  // state
  incomingCall: { callId: string; from: CallUserInfo; media?: 'audio' | 'video' } | null;
  inCall: boolean;
  connecting: boolean;
  peerUser: CallUserInfo | null;
  callSeconds: number;
  dialProgress: number;
  mediaType?: 'audio' | 'video';
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  cameraOn?: boolean;
  micOn?: boolean;
  // controls
  startCall: (target: CallUserInfo) => Promise<void> | void;
  startVideoCall?: (target: CallUserInfo) => Promise<void> | void;
  acceptCall: () => Promise<void> | void;
  rejectCall: (reason?: string) => void;
  endCall: () => void;
  cancelOutgoing: (reason?: 'user' | 'timeout') => void;
  toggleCamera?: () => Promise<void> | void;
  toggleMic?: () => Promise<void> | void;
}

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ currentUserId, children }: { currentUserId: number | null; children: ReactNode }) {
  const value = useVoiceCall(currentUserId);
  return (
    <CallContext.Provider value={value as unknown as CallContextValue}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
}

// Optional accessor: returns null if CallProvider is not present
export function useOptionalCall() {
  return useContext(CallContext);
}

// Global call UI that listens to context and renders modal regardless of ChatWindow visibility
export function GlobalCallUI() {
  const { incomingCall, inCall, connecting, peerUser, callSeconds, dialProgress, mediaType, localStream, remoteStream, cameraOn, micOn, toggleCamera, toggleMic, acceptCall, rejectCall, endCall, cancelOutgoing } = useCall();

  const mode: 'incoming' | 'outgoing' | 'active' | 'hidden' = incomingCall
    ? 'incoming'
    : (connecting && !inCall)
      ? 'outgoing'
      : inCall
        ? 'active'
        : 'hidden';

  const targetUser = incomingCall?.from || peerUser;

  // Safety: auto-cancel when progress reaches 100% but still in outgoing mode
  useEffect(() => {
    if (mode === 'outgoing' && (dialProgress ?? 0) >= 1) {
      try { cancelOutgoing('timeout'); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, dialProgress]);

  return (
    <CallModal
      open={mode !== 'hidden'}
      mode={mode}
      user={targetUser as any}
      elapsedSeconds={callSeconds}
      dialProgress={dialProgress}
      mediaType={mediaType}
      localStream={localStream || null}
      remoteStream={remoteStream || null}
      cameraOn={!!cameraOn}
      micOn={!!micOn}
      onToggleCamera={toggleCamera}
      onToggleMic={toggleMic}
      onAccept={mode === 'incoming' ? () => acceptCall() : undefined}
      onReject={mode === 'incoming' ? () => rejectCall() : undefined}
      onCancel={mode === 'outgoing' ? () => cancelOutgoing() : undefined}
      onEnd={mode === 'active' ? () => endCall() : undefined}
    />
  );
}
