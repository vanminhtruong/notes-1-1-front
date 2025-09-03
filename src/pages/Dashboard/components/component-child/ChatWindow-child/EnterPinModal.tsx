import React, { useState } from 'react';
import type { EnterPinModalProps } from '../../interface/ChatUI.interface';

async function hashPIN(pin: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(pin);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const EnterPinModal: React.FC<EnterPinModalProps> = ({ isOpen, onClose, onUnlock, expectedHash }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const onSubmit = async () => {
    setError('');
    if (!expectedHash) {
      setError('No PIN is set. Please set a PIN first.');
      return;
    }
    const hash = await hashPIN(pin);
    if (hash !== expectedHash) {
      setError('Incorrect PIN');
      return;
    }
    setPin('');
    onUnlock();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="w-[360px] rounded-lg bg-white dark:bg-gray-900 p-4 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Enter PIN to Unlock</h3>
        <div className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            pattern="\\d*"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter your PIN"
            className="w-full px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">Cancel</button>
            <button onClick={onSubmit} className="px-3 py-1.5 rounded-md bg-blue-600 text-white">Unlock</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterPinModal;
