// A simple reference-counted body scroll lock utility to avoid conflicts between multiple overlays/drawers
// Usage:
//  - lockBodyScroll('chat') when an overlay opens
//  - unlockBodyScroll('chat') when it closes
// It ensures the body overflow is only restored when the last locker releases.

let lockCount = 0;
let originalOverflow: string | null = null;

export function lockBodyScroll(_source?: string) {
  if (typeof document === 'undefined') return;
  if (lockCount === 0) {
    // Store current inline style to restore later
    originalOverflow = document.body.style.overflow;
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
    originalOverflow = null;
  }
}

export function getBodyScrollLockCount() {
  return lockCount;
}
