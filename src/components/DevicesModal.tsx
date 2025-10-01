import { useState, useEffect } from 'react';
import { X, Smartphone, Monitor, Tablet, MapPin, Clock, Trash2, LogOut } from 'lucide-react';
import { sessionService } from '@/services/sessionService';
import type { UserSession } from '@/services/sessionService';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { socketService } from '@/services/socketService';
import { useDispatch } from 'react-redux';
import { resetAuth } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface DevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevicesModal({ isOpen, onClose }: DevicesModalProps) {
  const { t } = useTranslation('layout');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
      // Disable body scroll when modal opens
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal closes
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Listen for real-time session revoke events
  useEffect(() => {
    if (!isOpen) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // Handle session revoked (current session was deleted from another device)
    const handleSessionRevoked = () => {
      toast.error(t('devices.sessionRevokedMessage'));
      // Refresh sessions list
      fetchSessions();
    };

    // Handle all other sessions revoked
    const handleAllSessionsRevoked = () => {
      toast.success(t('devices.allSessionsRevokedMessage'));
      // Refresh sessions list
      fetchSessions();
    };

    socket.on('session_revoked', handleSessionRevoked);
    socket.on('all_sessions_revoked', handleAllSessionsRevoked);

    return () => {
      socket.off('session_revoked', handleSessionRevoked);
      socket.off('all_sessions_revoked', handleAllSessionsRevoked);
    };
  }, [isOpen, t]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionService.getSessions();
      setSessions(data.sessions);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('devices.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    const isCurrent = session?.isCurrent;
    
    toast.custom((toastData) => (
      <div
        className={`max-w-sm w-full rounded-xl shadow-lg border ${
          toastData.visible ? 'animate-enter' : 'animate-leave'
        } bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold text-red-600 dark:text-red-400">{t('devices.confirmDelete')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {isCurrent 
                ? t('devices.confirmDeleteMessage') + ' ' + t('devices.deleteCurrentWarning')
                : t('devices.confirmDeleteMessage')}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(toastData.id)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            {t('devices.cancel')}
          </button>
          <button
            onClick={async () => {
              toast.dismiss(toastData.id);
              try {
                setDeletingId(sessionId);
                const result = await sessionService.deleteSession(sessionId);
                toast.success(t('devices.deleteSuccess'));
                
                // If deleted current session, logout immediately
                if (result.isCurrentSession) {
                  dispatch(resetAuth());
                  onClose();
                  navigate('/login');
                } else {
                  fetchSessions();
                }
              } catch (error: any) {
                toast.error(error?.response?.data?.message || t('devices.deleteError'));
              } finally {
                setDeletingId(null);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {t('devices.confirm')}
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const handleDeleteAllOthers = async () => {
    toast.custom((toastData) => (
      <div
        className={`max-w-sm w-full rounded-xl shadow-lg border ${
          toastData.visible ? 'animate-enter' : 'animate-leave'
        } bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold text-red-600 dark:text-red-400">{t('devices.confirmDeleteAll')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {t('devices.confirmDeleteAllMessage')}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(toastData.id)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            {t('devices.cancel')}
          </button>
          <button
            onClick={async () => {
              toast.dismiss(toastData.id);
              try {
                setDeletingAll(true);
                await sessionService.deleteAllOtherSessions();
                toast.success(t('devices.deleteAllSuccess'));
                fetchSessions();
              } catch (error: any) {
                toast.error(error?.response?.data?.message || t('devices.deleteAllError'));
              } finally {
                setDeletingAll(false);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {t('devices.confirm')}
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('devices.justNow');
    if (diffMins < 60) return t('devices.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('devices.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('devices.daysAgo', { count: diffDays });

    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('devices.title')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {t('devices.subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300">{t('devices.noSessions')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl border transition-all ${
                    session.isCurrent
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      session.isCurrent
                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {getDeviceIcon(session.deviceType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {session.deviceName}
                        </h3>
                        {session.isCurrent && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
                            {t('devices.current')}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.browser}</span>
                          <span>•</span>
                          <span>{session.os}</span>
                        </div>

                        {session.ipAddress && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs">{session.ipAddress}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t('devices.lastActive')}: {formatDate(session.lastActivityAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deletingId === session.id}
                      className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                      title={session.isCurrent ? t('devices.deleteCurrentWarning') : t('devices.deleteDevice')}
                    >
                      {deletingId === session.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && sessions.length > 1 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleDeleteAllOthers}
              disabled={deletingAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingAll ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{t('devices.deleting')}</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>{t('devices.deleteAllOther')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
