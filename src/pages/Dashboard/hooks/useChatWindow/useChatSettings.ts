import { useEffect, useState } from 'react';
import { getSocket } from '../../../../services/socket';
import { settingsService } from '../../../../services/settingsService';
import toast from 'react-hot-toast';
import type { TFunction } from 'i18next';

export interface UseChatSettings {
  e2eeEnabled: boolean;
  e2eePinHash: string | null;
  e2eeUnlocked: boolean;
  showSetPin: boolean;
  showEnterPin: boolean;
  readStatusEnabled: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  setShowSetPin: (v: boolean) => void;
  setShowEnterPin: (v: boolean) => void;
  setE2EEUnlocked: (v: boolean) => void;
  handleToggleE2EE: (next: boolean) => void;
  handleToggleReadStatus: (enabled: boolean) => Promise<void>;
  handleToggleHidePhone: (enabled: boolean) => Promise<void>;
  handleToggleHideBirthDate: (enabled: boolean) => Promise<void>;
  handleSetPin: (payload: { pinHash: string; oldPinHash?: string }) => Promise<void>;
  setE2EEEnabled: (v: boolean) => void;
  setE2EEPinHash: (v: string | null) => void;
  setReadStatusEnabled: (v: boolean) => void;
  setHidePhone: (v: boolean) => void;
  setHideBirthDate: (v: boolean) => void;
  showSettings: boolean;
}

export function useChatSettings(t: TFunction<'dashboard'>): UseChatSettings {
  const [showSettings, setShowSettings] = useState(false);
  const [e2eeEnabled, setE2EEEnabled] = useState<boolean>(() => localStorage.getItem('e2ee_enabled') === '1');
  const [e2eePinHash, setE2EEPinHash] = useState<string | null>(null);
  const [e2eeUnlocked, setE2EEUnlocked] = useState<boolean>(() => sessionStorage.getItem('e2ee_unlocked') === '1');
  const [showSetPin, setShowSetPin] = useState(false);
  const [showEnterPin, setShowEnterPin] = useState(false);
  const [readStatusEnabled, setReadStatusEnabled] = useState<boolean>(true);
  const [hidePhone, setHidePhone] = useState<boolean>(false);
  const [hideBirthDate, setHideBirthDate] = useState<boolean>(false);

  const openSettings = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);

  const handleToggleE2EE = (next: boolean) => {
    setE2EEEnabled(next);
    localStorage.setItem('e2ee_enabled', next ? '1' : '0');
    if (!next) {
      setE2EEUnlocked(false);
      sessionStorage.removeItem('e2ee_unlocked');
    }
    settingsService.setE2EE(next).catch(() => {
      const reverted = !next;
      setE2EEEnabled(reverted);
      localStorage.setItem('e2ee_enabled', reverted ? '1' : '0');
      toast.error(t('chat.errors.settingsUpdateFailed'));
    });
  };

  const handleToggleReadStatus = async (enabled: boolean) => {
    try {
      setReadStatusEnabled(enabled);
      await settingsService.setReadStatus(enabled);
      toast.success(t('chat.success.settingsUpdated', 'Settings updated successfully'));
    } catch (error: any) {
      setReadStatusEnabled(!enabled);
      toast.error(error?.response?.data?.message || t('chat.errors.settingsUpdateFailed', 'Failed to update settings'));
    }
  };

  const handleToggleHidePhone = async (enabled: boolean) => {
    try {
      setHidePhone(enabled);
      const res = await settingsService.setPrivacy({ hidePhone: enabled });
      setHidePhone(res.hidePhone);
      toast.success(t('chat.success.settingsUpdated', 'Settings updated successfully'));
    } catch (error: any) {
      setHidePhone(!enabled);
      toast.error(error?.response?.data?.message || t('chat.errors.settingsUpdateFailed', 'Failed to update settings'));
    }
  };

  const handleToggleHideBirthDate = async (enabled: boolean) => {
    try {
      setHideBirthDate(enabled);
      const res = await settingsService.setPrivacy({ hideBirthDate: enabled });
      setHideBirthDate(res.hideBirthDate);
      toast.success(t('chat.success.settingsUpdated', 'Settings updated successfully'));
    } catch (error: any) {
      setHideBirthDate(!enabled);
      toast.error(error?.response?.data?.message || t('chat.errors.settingsUpdateFailed', 'Failed to update settings'));
    }
  };

  const handleSetPin = async (payload: { pinHash: string; oldPinHash?: string }) => {
    try {
      const res = await settingsService.setE2EEPin({ pinHash: payload.pinHash, oldPinHash: payload.oldPinHash });
      const saved = res.pinHash || null;
      setE2EEPinHash(saved);
      if (saved && !e2eeEnabled) {
        setE2EEEnabled(true);
        localStorage.setItem('e2ee_enabled', '1');
        setE2EEUnlocked(false);
        sessionStorage.removeItem('e2ee_unlocked');
        sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
        const socket = getSocket();
        if (socket) socket.emit('e2ee_status', { enabled: true });
        settingsService.setE2EE(true).catch(() => {
          setE2EEEnabled(false);
          localStorage.setItem('e2ee_enabled', '0');
          toast.error(t('chat.errors.encryptionEnableFailed'));
        });
      }
      setShowSetPin(false);
      toast.success(t('chat.success.pinUpdated'));
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('chat.errors.pinUpdateFailed');
      toast.error(msg);
    }
  };

  // Cross-tab + socket sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'e2ee_enabled' && e.newValue != null) {
        const enabled = e.newValue === '1';
        setE2EEEnabled(enabled);
        setE2EEUnlocked(false);
        if (enabled) {
          sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
        } else {
          sessionStorage.removeItem('e2ee_lock_started_at');
        }
      }
    };
    window.addEventListener('storage', onStorage);
    const socket = getSocket();
    const onStatus = (payload: any) => {
      if (typeof payload?.enabled === 'boolean') {
        setE2EEEnabled(payload.enabled);
        setE2EEUnlocked(false);
        localStorage.setItem('e2ee_enabled', payload.enabled ? '1' : '0');
        if (payload.enabled) {
          sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
        } else {
          sessionStorage.removeItem('e2ee_lock_started_at');
        }
      }
    };
    const onPinUpdated = ({ pinHash }: any) => setE2EEPinHash(pinHash);
    const onReadStatusUpdated = ({ enabled }: any) => setReadStatusEnabled(enabled);
    const onPrivacyUpdated = ({ hidePhone, hideBirthDate }: any) => {
      if (typeof hidePhone === 'boolean') setHidePhone(hidePhone);
      if (typeof hideBirthDate === 'boolean') setHideBirthDate(hideBirthDate);
    };

    if (socket) socket.on('e2ee_status', onStatus);
    if (socket) socket.on('e2ee_pin_updated', onPinUpdated);
    if (socket) socket.on('read_status_updated', onReadStatusUpdated);
    if (socket) socket.on('privacy_updated', onPrivacyUpdated);

    return () => {
      window.removeEventListener('storage', onStorage);
      if (socket) {
        socket.off('e2ee_status', onStatus);
        socket.off('e2ee_pin_updated', onPinUpdated);
        socket.off('read_status_updated', onReadStatusUpdated);
        socket.off('privacy_updated', onPrivacyUpdated);
      }
    };
  }, []);

  // Initial load
  useEffect(() => {
    settingsService
      .getE2EE()
      .then(({ enabled }) => {
        setE2EEEnabled(enabled);
        localStorage.setItem('e2ee_enabled', enabled ? '1' : '0');
        if (enabled && !e2eeUnlocked) {
          if (!sessionStorage.getItem('e2ee_lock_started_at')) {
            sessionStorage.setItem('e2ee_lock_started_at', String(Date.now()));
          }
          const prompted = sessionStorage.getItem('e2ee_pin_prompt_shown') === '1';
          if (!prompted) {
            setShowEnterPin(true);
            sessionStorage.setItem('e2ee_pin_prompt_shown', '1');
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    settingsService
      .getE2EEPin()
      .then(({ pinHash }) => setE2EEPinHash(pinHash || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [e2eeRes, pinRes, readStatusRes, privacyRes] = await Promise.all([
          settingsService.getE2EE(),
          settingsService.getE2EEPin(),
          settingsService.getReadStatus(),
          settingsService.getPrivacy(),
        ]);
        setE2EEEnabled(e2eeRes.enabled);
        localStorage.setItem('e2ee_enabled', e2eeRes.enabled ? '1' : '0');
        setE2EEPinHash(pinRes.pinHash);
        setReadStatusEnabled(readStatusRes.enabled);
        setHidePhone(privacyRes.hidePhone);
        setHideBirthDate(privacyRes.hideBirthDate);
      } catch {
        // noop
      }
    };
    load();
  }, []);

  return {
    e2eeEnabled,
    e2eePinHash,
    e2eeUnlocked,
    showSetPin,
    showEnterPin,
    readStatusEnabled,
    hidePhone,
    hideBirthDate,
    openSettings,
    closeSettings,
    setShowSetPin,
    setShowEnterPin,
    setE2EEUnlocked,
    handleToggleE2EE,
    handleToggleReadStatus,
    handleToggleHidePhone,
    handleToggleHideBirthDate,
    handleSetPin,
    setE2EEEnabled,
    setE2EEPinHash,
    setReadStatusEnabled,
    setHidePhone,
    setHideBirthDate,
    showSettings,
  };
}
