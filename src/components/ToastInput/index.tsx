import { useEffect, useRef, type FormEvent } from 'react';

interface ToastInputProps {
  label: string;
  confirmText: string;
  cancelText: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export default function ToastInput({ label, confirmText, cancelText, onSubmit, onCancel }: ToastInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(inputRef.current?.value.trim() || '');
  };

  return (
    <form onSubmit={submit} onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); onCancel(); }
    }} className="w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-xl">
      <label className="block text-sm font-medium text-gray-900 dark:text-neutral-100">
        {label}
        <input ref={inputRef} type="text" inputMode="url" placeholder="https://..." required
          className="mt-2 w-full rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-gray-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400" />
      </label>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800">{cancelText}</button>
        <button type="submit" className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900">{confirmText}</button>
      </div>
    </form>
  );
}
