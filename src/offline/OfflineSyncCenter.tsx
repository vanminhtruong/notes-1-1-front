import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Cloud, CloudOff, RefreshCw, RotateCcw, ShieldAlert, Trash2, X } from 'lucide-react';
import { store, useAppDispatch, useAppSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import { fetchNoteStats, fetchNotes } from '@/store/slices/notesSlice';
import {
  checkConnection, currentStatus, onOfflineNotesChange, operationsForUser,
  resolveOperation, syncPending, warmOfflineCache,
  type OfflineMutation, type OfflineStatus,
} from './offlineNotes';
import './OfflineSyncCenter.scss';

const wording = {
  vi: {
    ready: 'Sẵn sàng ngoại tuyến', offline: 'Đang ngoại tuyến', syncing: 'Đang đồng bộ',
    pending: 'Chờ đồng bộ', title: 'Đồng bộ ghi chú', sync: 'Đồng bộ ngay',
    download: 'Lưu ghi chú để dùng offline', close: 'Đóng',
    noQueue: 'Mọi thay đổi đã được đồng bộ.', pendingInfo: 'Các thao tác được lưu an toàn trên thiết bị và sẽ gửi khi có mạng.',
    failed: 'Cần xử lý', conflict: 'Xung đột', review: 'Cần kiểm tra',
    create: 'Tạo ghi chú', update: 'Sửa ghi chú', delete: 'Xóa ghi chú',
    retry: 'Thử lại', discard: 'Bỏ thay đổi trên máy', overwrite: 'Dùng bản trên máy',
    confirmDiscard: 'Bỏ thay đổi ngoại tuyến này? Dữ liệu trên thiết bị có thể mất.',
    confirmOverwrite: 'Ghi đè bản trên server bằng thay đổi offline? Thao tác này có thể làm mất chỉnh sửa mới.',
    confirmRetryCreate: 'Lưu ý: Nếu máy chủ đã tạo ghi chú nhưng phản hồi bị mất, gửi lại có thể tạo bản trùng. Bạn đã kiểm tra trên máy chủ chưa?',
    issue: 'Không thể xử lý thao tác', last: 'Đồng bộ gần nhất',
    security: 'Ghi chú được lưu cục bộ trên trình duyệt của thiết bị này. Không dùng trên máy tính công cộng.',
    limited: 'Chat, chia sẻ, đăng nhập và thay đổi quyền vẫn cần Internet.',
    done: 'Đã cập nhật trạng thái', downloadDone: 'Đã lưu dữ liệu hiện có để đọc offline',
    downloadFail: 'Không thể tải dữ liệu offline', help: 'Xem hàng đợi và trạng thái đồng bộ',
  },
  en: {
    ready:'Offline ready',offline:'You are offline',syncing:'Syncing',pending:'Pending changes',title:'Note synchronization',sync:'Sync now',
    download:'Save notes for offline use',close:'Close',noQueue:'All changes are synchronized.',
    pendingInfo:'Changes are stored locally and sent when connectivity returns.',failed:'Action required',
    conflict:'Conflict',review:'Review required',create:'Create note',update:'Update note',delete:'Delete note',
    retry:'Retry',discard:'Discard local change',overwrite:'Keep local version',
    confirmDiscard:'Discard this offline change? Locally saved data may be lost.',
    confirmOverwrite:'Overwrite the server version with your offline changes? This can erase newer edits.',
    confirmRetryCreate:'The server may already have created this note. Retrying could create a duplicate. Have you checked first?',
    issue:'Unable to process change',last:'Last sync',security:'Notes are stored on this device in the browser. Avoid public computers.',
    limited:'Chat, sharing, sign-in and permission changes still require Internet.',done:'Status updated',
    downloadDone:'Current notes saved for offline reading',downloadFail:'Could not save offline content',
    help:'View synchronization queue',
  },
  ko: {
    ready:'오프라인 준비 완료',offline:'오프라인 상태',syncing:'동기화 중',pending:'동기화 대기',title:'메모 동기화',sync:'지금 동기화',download:'오프라인용 메모 저장',close:'닫기',noQueue:'모두 동기화되었습니다.',pendingInfo:'변경 사항은 기기에 저장되며 연결 시 전송됩니다.',failed:'확인 필요',conflict:'충돌',review:'검토 필요',create:'메모 생성',update:'메모 수정',delete:'메모 삭제',retry:'재시도',discard:'기기 변경 취소',overwrite:'기기 버전 사용',confirmDiscard:'오프라인 변경 사항을 삭제하시겠습니까?',confirmOverwrite:'서버의 최신 변경 사항을 덮어쓸 수 있습니다. 계속하시겠습니까?',confirmRetryCreate:'중복 메모가 만들어질 수 있습니다. 서버에서 먼저 확인하셨나요?',issue:'처리 실패',last:'마지막 동기화',security:'메모는 이 기기의 브라우저에 저장됩니다. 공용 기기를 피하세요.',limited:'채팅, 공유, 로그인, 권한 변경에는 인터넷이 필요합니다.',done:'업데이트 완료',downloadDone:'오프라인 읽기 저장 완료',downloadFail:'오프라인 저장 실패',help:'동기화 대기열 보기',
  },
  'zh-CN': {
    ready:'离线就绪',offline:'离线状态',syncing:'正在同步',pending:'待同步',title:'笔记同步',sync:'立即同步',download:'保存笔记供离线使用',close:'关闭',noQueue:'所有更改已同步。',pendingInfo:'更改保存在本机，联网后自动发送。',failed:'需要处理',conflict:'冲突',review:'需要核对',create:'创建笔记',update:'编辑笔记',delete:'删除笔记',retry:'重试',discard:'舍弃本地更改',overwrite:'保留本地版本',confirmDiscard:'舍弃此离线更改？本地数据可能丢失。',confirmOverwrite:'用本地内容覆盖服务器的更新？',confirmRetryCreate:'重试可能创建重复笔记。已先检查服务器吗？',issue:'无法处理',last:'最近同步',security:'笔记保存在此设备的浏览器中。请勿使用公共电脑。',limited:'聊天、分享、登录与权限变更仍需网络。',done:'已更新',downloadDone:'已保存离线笔记',downloadFail:'离线保存失败',help:'查看同步队列',
  },
  'zh-TW': {
    ready:'離線就緒',offline:'離線狀態',syncing:'正在同步',pending:'待同步',title:'筆記同步',sync:'立即同步',download:'儲存筆記供離線使用',close:'關閉',noQueue:'所有變更已同步。',pendingInfo:'變更會儲存在裝置，連線後自動傳送。',failed:'需要處理',conflict:'衝突',review:'需要核對',create:'新增筆記',update:'編輯筆記',delete:'刪除筆記',retry:'重試',discard:'捨棄本機變更',overwrite:'保留本機版本',confirmDiscard:'捨棄此離線變更？本機資料可能遺失。',confirmOverwrite:'使用本機內容覆蓋伺服器最新內容？',confirmRetryCreate:'重試可能產生重複筆記。已先檢查伺服器嗎？',issue:'無法處理',last:'最近同步',security:'筆記儲存於此裝置的瀏覽器中。請勿使用公共電腦。',limited:'聊天、分享、登入與權限變更仍需網路。',done:'已更新',downloadDone:'已儲存離線筆記',downloadFail:'離線儲存失敗',help:'查看同步佇列',
  },
} as const;
type Dictionary = typeof wording.vi;
const blank: OfflineStatus = { online: true, syncing: false, pending: 0, conflicts: 0, review: 0, failed: 0, lastSync: null, cachedNotes: 0 };
const OPEN_EVENT = 'plant:open-offline-sync';

export default function OfflineSyncCenter() {
  const dispatch = useAppDispatch();
  const authenticated = useAppSelector(state => state.auth.isAuthenticated);
  const { i18n } = useTranslation();
  const key = (i18n.resolvedLanguage || i18n.language || 'en') as keyof typeof wording;
  const text = (wording[key] || (key.startsWith('zh') ? wording['zh-CN'] : wording.en)) as Dictionary;
  const [status, setStatus] = useState<OfflineStatus>(blank);
  const [queue, setQueue] = useState<OfflineMutation[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [open, busy]);

  const refresh = useCallback(() => {
    if (!authenticated) return;
    void Promise.all([currentStatus(), operationsForUser()])
      .then(([result, operations]) => { setStatus(result); setQueue(operations); })
      .catch(error => setNotice((error as Error).message));
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) { setQueue([]); setStatus(blank); return; }
    refresh();
    const remove = onOfflineNotesChange(refresh);
    const onSynced = () => {
      const { filters, pagination } = store.getState().notes;
      void dispatch(fetchNotes({
        page: pagination.page, limit: 9,
        search: filters.search || undefined,
        category: filters.category || undefined,
        priority: filters.priority || undefined,
        isArchived: filters.isArchived,
      }));
      void dispatch(fetchNoteStats());
      refresh();
    };
    window.addEventListener('plant:offline-notes-synced', onSynced);
    const onNetwork = () => {
      if (navigator.onLine) {
        void checkConnection(true).then(ok => { if (ok) return syncPending(); }).finally(refresh);
      } else { void checkConnection(true).finally(refresh); }
    };
    window.addEventListener('online', onNetwork);
    window.addEventListener('offline', onNetwork);
    const interval = window.setInterval(() => {
      if (navigator.onLine) void checkConnection(true).then(ok => {
        if (ok) return syncPending();
      }).finally(refresh);
    }, 30000);
    void checkConnection(true)
      .then(ok => { if (ok) return syncPending(); })
      .then(() => warmOfflineCache())
      .finally(refresh).catch(console.warn);
    return () => {
      remove();
      window.removeEventListener('plant:offline-notes-synced', onSynced);
      window.removeEventListener('online', onNetwork);
      window.removeEventListener('offline', onNetwork);
      window.clearInterval(interval);
    };
  }, [authenticated, refresh]);

  const action = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true); setNotice('');
    try { await fn(); refresh(); }
    catch (error) { setNotice((error as Error).message || text.issue); }
    finally { setBusy(false); }
  };

  const queued = status.pending > 0;
  const problems = status.conflicts + status.review + status.failed;
  const title = status.syncing ? text.syncing : !status.online ? text.offline : queued ? text.pending : text.ready;
  if (!authenticated) return null;

  return <>
    {open && createPortal(<div className="offline-dialog-backdrop" role="presentation">
      <section className="offline-dialog" role="dialog" aria-modal="true" aria-labelledby="offline-dialog-title" aria-describedby="offline-dialog-description">
        <header className="offline-dialog-header">
          <div><h2 id="offline-dialog-title">{text.title}</h2><p>{title}{queued && ' · '+status.pending+' '+text.pending.toLocaleLowerCase()}</p></div>
          <button type="button" className="offline-icon-button" onClick={() => setOpen(false)}
            aria-label={text.close} title={text.close} disabled={busy}>
            <X size={20} strokeWidth={2} aria-hidden="true"/>
          </button>
        </header>
        <div className="offline-dialog-content">
          <div className="offline-dialog-summary">
            <div className="offline-mini-stat"><span>{text.pending}</span><strong>{status.pending}</strong></div>
            <div className="offline-mini-stat"><span>{text.failed}</span><strong>{problems}</strong></div>
            <div className="offline-mini-stat"><span>{text.last}</span><strong>{status.lastSync ? new Date(status.lastSync).toLocaleTimeString() : '—'}</strong></div>
          </div>
          <p id="offline-dialog-description" className="offline-description">{text.pendingInfo}</p>
          {notice && <p role="alert" className="offline-alert"><AlertCircle size={17}/>{notice}</p>}
          <div className="offline-actions">
            <button type="button" disabled={busy || !status.online || status.syncing}
              onClick={() => void action(async () => { await syncPending(); await warmOfflineCache(); dispatch(fetchNoteStats()); setNotice(text.done); })}
              className="offline-action-primary"><RefreshCw size={16}/>{text.sync}</button>
            <button type="button" disabled={busy || !status.online}
              onClick={() => void action(async () => { await warmOfflineCache(); setNotice(text.downloadDone); })}
              className="offline-action-secondary"><Cloud size={16}/>{text.download}</button>
          </div>
          <div className="offline-queue">
            {queue.length===0 ? <div className="offline-empty"><CheckCircle2 size={23}/>{text.noQueue}</div> : queue.map(op=><article key={op.id} className="offline-queue-row">
              <div className="offline-queue-details">
                <strong>{text[op.type]}</strong>
                <small>{new Date(op.queuedAt).toLocaleString()}</small>
                <small className="offline-queue-state">{op.mode === 'conflict' ? text.conflict : op.mode==='review' ? text.review : op.mode==='failed' ? text.failed : text.pending}</small>
                {op.reason && <p>{op.reason}</p>}
              </div>
              {op.mode!=='pending' && <div className="offline-queue-controls">
                <button type="button" disabled={busy || !status.online}
                  onClick={() => { if(op.type==='create' && !window.confirm(text.confirmRetryCreate))return;void action(()=>resolveOperation(op.id,'retry').then(syncPending)); }}
                  title={text.retry}><RotateCcw size={16}/>{text.retry}</button>
                {op.mode==='conflict' && op.type==='update' &&
                  <button type="button" disabled={busy || !status.online}
                    onClick={() => { if(window.confirm(text.confirmOverwrite)) void action(()=>resolveOperation(op.id,'overwrite').then(syncPending)); }}>
                    {text.overwrite}</button>}
                <button type="button" disabled={busy || !status.online && op.type!=='create'}
                  onClick={() => { if(window.confirm(text.confirmDiscard)) void action(()=>resolveOperation(op.id,'discard')); }}>
                  <Trash2 size={15}/>{text.discard}</button>
              </div>}
            </article>)}
          </div>
          <p className="offline-security">{text.security}</p>
          <p className="offline-security">{text.limited}</p>
        </div>
      </section>
    </div>, document.body)}
  </>;
}


/** Menu entry lives inside the Account dropdown, while the dialog remains
 * mounted at layout root, avoiding header stacking/overflow issues. */
export function OfflineSyncMenuItem({ onOpen }: { onOpen: () => void }) {
  const authenticated = useAppSelector(state => state.auth.isAuthenticated);
  const { i18n } = useTranslation();
  const key = (i18n.resolvedLanguage || i18n.language || 'en') as keyof typeof wording;
  const text = (wording[key] || (key.startsWith('zh') ? wording['zh-CN'] : wording.en)) as Dictionary;
  const [status, setStatus] = useState<OfflineStatus>(blank);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    const refresh = () => {
      void currentStatus().then(value => { if (active) setStatus(value); }).catch(console.warn);
    };
    refresh();
    const unsubscribe = onOfflineNotesChange(refresh);
    return () => { active = false; unsubscribe(); };
  }, [authenticated]);
  if (!authenticated) return null;
  const problems = status.conflicts + status.review + status.failed;
  return (
    <button type="button" role="menuitem" onClick={() => {
      onOpen();
      window.dispatchEvent(new Event(OPEN_EVENT));
    }}
      className="offline-account-menu-item w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors md-down:px-2.5 md-down:py-1.5 md-down:text-xs"
    >
      {status.syncing ? <RefreshCw className="offline-spin" size={16} aria-hidden="true" />
        : !status.online ? <CloudOff size={16} aria-hidden="true" />
          : problems ? <ShieldAlert size={16} aria-hidden="true" />
            : status.pending ? <Cloud size={16} aria-hidden="true" />
              : <CheckCircle2 size={16} aria-hidden="true" />}
      <span className="offline-menu-content min-w-0 flex-1">
        <span className="offline-menu-title">{text.title}</span>
        <span className="offline-menu-subtitle">{status.syncing ? text.syncing
          : !status.online ? text.offline
          : problems ? text.failed
          : status.pending ? text.pending : text.ready}</span>
      </span>
      {status.pending > 0 && <span className="offline-menu-count" aria-label={String(status.pending)}>{status.pending}</span>}
    </button>
  );
}
