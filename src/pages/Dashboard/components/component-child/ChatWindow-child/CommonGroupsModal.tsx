import { useEffect, useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pin, Users } from 'lucide-react';
import { groupService, type GroupSummary } from '@/services/groupService';

interface CommonGroupsModalProps {
  open: boolean;
  onClose: () => void;
  userId: number | null;
}

const CommonGroupsModal = memo(function CommonGroupsModal({ open, onClose, userId }: CommonGroupsModalProps) {
  const { t } = useTranslation('dashboard');
  const [activeTab, setActiveTab] = useState<'all'|'mine'>('all');
  const [loading, setLoading] = useState(false);
  const [allGroups, setAllGroups] = useState<GroupSummary[]>([]);
  const [myGroups, setMyGroups] = useState<GroupSummary[]>([]);

  useEffect(() => {
    let canceled = false;
    const run = async () => {
      if (!open || !userId) return;
      setLoading(true);
      try {
        const [allRes, commonRes] = await Promise.allSettled([
          groupService.getUserGroups(userId),
          groupService.getCommonGroups(userId),
        ]);
        if (canceled) return;
        setAllGroups(allRes.status === 'fulfilled' && allRes.value?.success ? allRes.value.data : []);
        setMyGroups(commonRes.status === 'fulfilled' && commonRes.value?.success ? commonRes.value.data : []);
      } finally {
        if (!canceled) setLoading(false);
      }
    };
    run();
    return () => { canceled = true; };
  }, [open, userId]);

  if (!open) return null;

  const renderList = (list: GroupSummary[], emptyKey: string, emptyDefault: string) => {
    if (loading) {
      // Animated skeletons for a premium feel
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`sk-${i}`} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 overflow-hidden shadow-sm">
              <div className="p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
                  <div className="flex-1 min-w-0">
                    <div className="h-3.5 w-3/5 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
                    <div className="h-2.5 w-2/5 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (!list || list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{String(t(emptyKey as any, { defaultValue: emptyDefault } as any))}</div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map((g) => (
          <div
            key={g.id}
            className="group relative rounded-2xl border border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Decorative gradient bar */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-600" />
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold ring-2 ring-white dark:ring-gray-800 shadow">
                    {g.avatar ? (
                      <img src={g.avatar} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      (g.name || '').charAt(0)
                    )}
                  </div>
                  {g.isPinned && (
                    <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-400 text-yellow-900 shadow ring-1 ring-white dark:ring-gray-800">
                      <Pin className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {g.name}
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <Users className="w-3.5 h-3.5" />
                    {String(t('chat.groups.status.membersCount', { count: (g.members || []).length }))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center px-2" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/20 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-[0_10px_40px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="relative px-6 py-5">
          {/* Gradient header accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-600" />
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              {String(t('chat.commonGroups.title', { defaultValue: 'Nhóm chung' } as any))}
            </h4>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100/70 dark:hover:bg-gray-800/70" aria-label={String(t('actions.close', { defaultValue: 'Close' } as any))}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div className="px-6 pt-2">
          <div className="inline-flex rounded-xl bg-gray-100/60 dark:bg-gray-800/60 p-1 border border-gray-200/80 dark:border-gray-700/60">
            <button className={`px-3.5 py-1.5 text-sm rounded-lg transition-all ${activeTab==='all' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setActiveTab('all')}>
              {String(t('chat.commonGroups.tabs.all', { defaultValue: 'Tất cả' } as any))}
            </button>
            <button className={`ml-1 px-3.5 py-1.5 text-sm rounded-lg transition-all ${activeTab==='mine' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow' : 'text-gray-700 dark:text-gray-300'}`} onClick={() => setActiveTab('mine')}>
              {String(t('chat.commonGroups.tabs.my', { defaultValue: 'Nhóm của tôi' } as any))}
            </button>
          </div>
        </div>
        <div className="px-6 pb-6 pt-4 max-h-[65vh] overflow-y-auto">
          {activeTab === 'all'
            ? renderList(allGroups, 'chat.commonGroups.empty.all', 'Người này chưa tham gia nhóm nào')
            : renderList(myGroups, 'chat.commonGroups.empty.my', 'Chưa có nhóm chung nào')}
        </div>
      </div>
    </div>
  </div>
  );
});

CommonGroupsModal.displayName = 'CommonGroupsModal';

export default CommonGroupsModal;

