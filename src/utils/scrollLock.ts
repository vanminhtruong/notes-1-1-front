// A simple reference-counted body scroll lock utility to avoid conflicts between multiple overlays/drawers
// Usage:
//  - lockBodyScroll('chat') when an overlay opens
//  - unlockBodyScroll('chat') when it closes
// It ensures the body overflow is only restored when the last locker releases.
//
// Layout shift: hiding the body overflow removes the vertical scrollbar and the page widens.
// Modern browsers are covered by `html { scrollbar-gutter: stable }` (see global.scss).
// For browsers without it we compensate with padding-right equal to the scrollbar width.

let lockCount = 0;
let originalOverflow: string | null = null;
let originalPaddingRight: string | null = null;

const supportsScrollbarGutter = () =>
  typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('scrollbar-gutter', 'stable');

export function lockBodyScroll(_source?: string) {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    // Store current inline style to restore later
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    if (!supportsScrollbarGutter()) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        const currentPadding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
        document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
      }
    }
    document.body.style.overflow = 'hidden';
  }
  lockCount++;
}

export function unlockBodyScroll(_source?: string) {
  if (typeof document === 'undefined') return;
  if (lockCount > 0) lockCount--;
  if (lockCount === 0) {
    // Restore to the previous inline style (empty string by default)
    document.body.style.overflow = originalOverflow ?? '';
    document.body.style.paddingRight = originalPaddingRight ?? '';
    originalOverflow = null;
    originalPaddingRight = null;
  }
}

export function getBodyScrollLockCount() {
  return lockCount;
}
