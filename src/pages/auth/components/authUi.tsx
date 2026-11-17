import { AlertCircle } from 'lucide-react';

/**
 * Shared class names / small pieces for the auth pages (login, forgot password).
 * Same look as the register page so the three pages feel like one product.
 * The `reg-*` class names hook into register.css (short desktop windows).
 */
export const labelClass = 'reg-label mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200';
export const iconWrapClass = 'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5';
export const iconClass =
  'h-[18px] w-[18px] text-gray-400 transition-colors duration-200 group-focus-within:text-purple-500 dark:text-gray-500 dark:group-focus-within:text-purple-400';
export const eyeButtonClass =
  'absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-200';

export const inputClass = (invalid: boolean, paddingRight = 'pr-3.5') =>
  [
    'reg-input block w-full rounded-xl border bg-white/80 py-2.5 pl-11 text-sm text-gray-900 shadow-sm outline-none',
    'transition-all duration-200 placeholder:text-gray-400 focus:ring-2 lg:text-[15px]',
    'dark:bg-gray-900/50 dark:text-white dark:placeholder:text-gray-500',
    invalid
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/30 dark:border-red-500/70'
      : 'border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:ring-purple-500/30 dark:border-gray-700 dark:hover:border-gray-600',
    paddingRight,
  ].join(' ');

export const primaryButtonClass =
  'reg-submit group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-500/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-gray-900 md-down:text-sm';

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white/70 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:scale-[0.98] dark:border-gray-700 dark:bg-white/5 dark:text-gray-200 dark:hover:border-purple-500/60 dark:hover:bg-white/10 dark:hover:text-white';

export const linkClass =
  'font-semibold text-purple-600 transition-colors duration-200 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300';

/** Absolutely positioned inside the row gap, so showing an error never changes the page height. */
export const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="absolute left-0 top-full flex items-center gap-1 pt-0.5 text-[11px] leading-4 text-red-600 dark:text-red-400">
      <AlertCircle className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </p>
  ) : null;

/** Server / request level error banner. */
export const ErrorBanner = ({ message }: { message: string }) => (
  <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 dark:border-red-800/60 dark:bg-red-950/40">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
    <p className="text-sm text-red-700 dark:text-red-300 md-down:text-xs">{message}</p>
  </div>
);
