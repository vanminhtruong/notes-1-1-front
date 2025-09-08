import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useVoiceCall, type CallUserInfo } from '@/pages/Dashboard/hooks/useChatWindow/useVoiceCall';
import CallModal from '@/pages/Dashboard/components/component-child/ChatWindow-child/CallModal';

export interface CallContextValue {
  // state
  incomingCall: { callId: string; from: CallUserInfo } | null;
  inCall: boolean;
  connecting: boolean;
  peerUser: CallUserInfo | null;
  callSeconds: number;
  // controls
  startCall: (target: CallUserInfo) => Promise<void> | void;
  acceptCall: () => Promise<void> | void;
  rejectCall: (reason?: string) => void;
  endCall: () => void;
  cancelOutgoing: () => void;
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

// Global call UI that listens to context and renders modal regardless of ChatWindow visibility
export function GlobalCallUI() {
  const { incomingCall, inCall, connecting, peerUser, callSeconds, acceptCall, rejectCall, endCall, cancelOutgoing } = useCall();

  const mode: 'incoming' | 'outgoing' | 'active' | 'hidden' = incomingCall
    ? 'incoming'
    : (connecting && !inCall)
      ? 'outgoing'
      : inCall
        ? 'active'
        : 'hidden';

  const targetUser = incomingCall?.from || peerUser;

  return (
    <CallModal
      open={mode !== 'hidden'}
      mode={mode}
      user={targetUser as any}
      elapsedSeconds={callSeconds}
      onAccept={mode === 'incoming' ? () => acceptCall() : undefined}
      onReject={mode === 'incoming' ? () => rejectCall() : undefined}
      onCancel={mode === 'outgoing' ? () => cancelOutgoing() : undefined}
      onEnd={mode === 'active' ? () => endCall() : undefined}
    />
  );
}
