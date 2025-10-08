import React, { memo } from 'react';
import NicknameModal from './NicknameModal';
import { chatService } from '@/services/chatService';
import { toast } from 'react-hot-toast';

type ReactionType = 'like'|'love'|'haha'|'wow'|'sad'|'angry';

export type ReactionEntry = { userId: number; type: ReactionType; count?: number; user?: { id: number; name: string; avatar?: string | null } };

type UserInfo = { id: number; name: string; avatar?: string | null };

type Props = {
  open: boolean;
  onClose: () => void;
  reactions: ReactionEntry[];
  resolveUser: (userId: number) => UserInfo | null;
  t: (k: string, def?: any) => string;
  onOpenProfile?: (user: UserInfo) => void;
  currentUserId?: number;
};

const EMOJI: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😡',
};

const ReactionDetailsModal = memo(function ReactionDetailsModal({ open, onClose, reactions, resolveUser, t, onOpenProfile, currentUserId }: Props) {
  if (!open) return null;

  const list = Array.isArray(reactions) ? reactions : [];

  // Aggregate total counts per type
  const perType: Record<string, number> = {};
  let totalAll = 0;
  for (const r of list) {
    const c = Number(r.count || 1);
    perType[r.type] = (perType[r.type] || 0) + c;
    totalAll += c;
  }

  // Build items: one row per (userId, type)
  const items = list.map((r) => ({ userId: r.userId, type: r.type as ReactionType, count: Number(r.count || 1), user: (r as any).user || null }));

  const [selected, setSelected] = React.useState<'all' | ReactionType>('all');

  const filtered = selected === 'all' ? items : items.filter((it) => it.type === selected);

  const title = t('chat.reactions.modal.title', { defaultValue: 'Reactions' } as any);
  const empty = t('chat.reactions.modal.empty', { defaultValue: 'No reactions yet' } as any);
  const [nicknameTarget, setNicknameTarget] = React.useState<UserInfo | null>(null);
  const [showNickname, setShowNickname] = React.useState(false);
  const [initialNickname, setInitialNickname] = React.useState<string>('');

  return (
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 w-[560px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white text-gray-900 shadow-xl dark:bg-gray-900 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="text-sm font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="flex h-[380px]">
          {/* Left tabs */}
          <div className="w-40 border-r border-gray-200 p-2 dark:border-gray-800">
            <SidebarItem
              active={selected === 'all'}
              icon={null}
              label={t('chat.reactions.modal.tabs.all', { defaultValue: 'All' } as any)}
              count={totalAll}
              onClick={() => setSelected('all')}
            />
            {(['like','love','haha','wow','sad','angry'] as ReactionType[]).map((k) => (
              perType[k] ? (
                <SidebarItem
                  key={k}
                  active={selected === k}
                  icon={EMOJI[k]}
                  label={t(`chat.reactions.types.${k}`, { defaultValue: k } as any)}
                  count={perType[k]}
                  onClick={() => setSelected(k)}
                />
              ) : null
            ))}
          </div>
          {/* Right list */}
          <div className="flex-1 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">{empty}</div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map((it, idx) => {
                  const fallback = resolveUser(it.userId);
                  const u = it.user ? { id: it.user.id, name: it.user.name || fallback?.name || `User ${it.userId}`, avatar: it.user.avatar ?? fallback?.avatar } : fallback;
                  const resolved = u || { id: it.userId, name: fallback?.name || `User ${it.userId}`, avatar: fallback?.avatar ?? null };
                  return (
                    <li key={`${it.userId}-${it.type}-${idx}`} className="flex items-center justify-between gap-3 p-2">
                      <button
                        type="button"
                        className="flex items-center gap-3 hover:opacity-90"
                        onClick={() => {
                          if (!resolved?.id) return;
                          if (currentUserId && resolved.id === currentUserId) {
                            // Do not open profile modal for self from reactions list
                            return;
                          }
                          if (onOpenProfile) {
                            onOpenProfile(resolved as UserInfo);
                            onClose();
                          }
                        }}
                        title={t('chat.chatView.viewProfile', 'Xem thông tin')}
                        aria-label={t('chat.chatView.viewProfile', 'Xem thông tin')}
                      >
                        <Avatar src={resolved?.avatar ?? null} name={resolved?.name || `User ${it.userId}`} />
                        <div className="text-sm font-medium">{resolved?.name || `User ${it.userId}`}</div>
                      </button>
                      <div className="flex items-center gap-3">
                        {currentUserId && resolved?.id !== currentUserId ? (
                          <button
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await chatService.getChatNickname(resolved.id);
                                setInitialNickname(res?.data?.nickname || '');
                              } catch {
                                setInitialNickname('');
                              }
                              setNicknameTarget(resolved as UserInfo);
                              setShowNickname(true);
                            }}
                          >
                            {String(t('chat.nickname.setButton', 'Đặt tên gọi nhớ'))}
                          </button>
                        ) : null}
                        <div className="min-w-[48px] text-sm">
                          <span className="mr-1">{EMOJI[it.type]}</span>
                          <span>{it.count}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        {/* Nickname Modal */}
        <NicknameModal
          open={showNickname}
          onClose={() => setShowNickname(false)}
          user={nicknameTarget}
          initialNickname={initialNickname}
          onConfirm={async (nick) => {
            try {
              if (!nicknameTarget) return;
              await chatService.setChatNickname(nicknameTarget.id, nick);
              toast.success(String(t('chat.nickname.saved', 'Đã lưu tên gọi nhớ')));
            } catch (e: any) {
              toast.error(e?.response?.data?.message || String(t('chat.errors.generic')));
            }
          }}
        />
      </div>
    </div>
  );
});

ReactionDetailsModal.displayName = 'ReactionDetailsModal';

export default ReactionDetailsModal;
function SidebarItem({ active, icon, label, count, onClick }: { active: boolean; icon: string | null; label: string; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm ${active ? 'bg-gray-200 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800/70'}`}
    >
      <span className="flex items-center gap-2">
        {icon ? <span>{icon}</span> : null}
        <span>{label}</span>
      </span>
      <span className="text-xs text-gray-600 dark:text-gray-400">{count}</span>
    </button>
  );
}

function Avatar({ src, name }: { src?: string | null; name: string }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold shadow">
      {src ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-sm">{initial}</span>
      )}
    </div>
  );
}

