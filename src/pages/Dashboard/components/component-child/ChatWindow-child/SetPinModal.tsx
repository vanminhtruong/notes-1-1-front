import { useState, memo } from 'react';
import type { SetPinModalProps } from '../../interface/ChatUI.interface';

async function hashPIN(pin: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(pin);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const SetPinModal = memo(({ isOpen, onClose, hasExisting, onSet }: SetPinModalProps) => {
  const [oldPin, setOldPin] = useState('');
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validate = (p: string) => /^\d{4,8}$/.test(p);

  const onSubmit = async () => {
    setError('');
    if (hasExisting) {
      if (!validate(oldPin)) {
        setError('Old PIN must be 4-8 digits');
        return;
      }
    }
    if (!validate(pin)) {
      setError('PIN must be 4-8 digits');
      return;
    }
    if (pin !== confirm) {
      setError('PIN does not match');
      return;
    }
    const newHash = await hashPIN(pin);
    if (hasExisting) {
      const oldHash = await hashPIN(oldPin);
      onSet({ pinHash: newHash, oldPinHash: oldHash });
    } else {
      onSet({ pinHash: newHash });
    }
    setOldPin('');
    setPin('');
    setConfirm('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="w-[360px] rounded-lg bg-white dark:bg-gray-900 p-4 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{hasExisting ? 'Change Encryption PIN' : 'Set Encryption PIN'}</h3>
        <div className="space-y-3">
          {hasExisting && (
            <input
              type="password"
              inputMode="numeric"
              pattern="\\d*"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              placeholder="Enter old PIN"
              className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none"
            />
          )}
          <input
            type="password"
            inputMode="numeric"
            pattern="\\d*"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={hasExisting ? 'Enter new 4-8 digit PIN' : 'Enter 4-8 digit PIN'}
            className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none"
          />
          <input
            type="password"
            inputMode="numeric"
            pattern="\\d*"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={hasExisting ? 'Confirm new PIN' : 'Confirm PIN'}
            className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
            <button onClick={onSubmit} className="px-3 py-1.5 rounded-md bg-blue-600 text-white">{hasExisting ? 'Change PIN' : 'Save PIN'}</button>
          </div>
        </div>
      </div>
    </div>
  );
});

SetPinModal.displayName = 'SetPinModal';

export default SetPinModal;

