import { useEffect } from 'react';

/**
 * While `isActive` is true the page stays scrollable (wheel / touch / keyboard still work)
 * but the page scrollbar is hidden (see `html.chat-open-hide-scrollbar` in _scrollbar.scss).
 *
 * The width of the removed scrollbar is exposed as `--chat-scrollbar-compensation`
 * so the layout does not jump sideways when the scrollbar disappears.
 */
export const useHideScrollbarWhenOpen = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive || typeof document === 'undefined') return;

    const root = document.documentElement;
    const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);

    root.style.setProperty('--chat-scrollbar-compensation', `${scrollbarWidth}px`);
    root.classList.add('chat-open-hide-scrollbar');

    return () => {
      root.classList.remove('chat-open-hide-scrollbar');
      root.style.removeProperty('--chat-scrollbar-compensation');
    };
  }, [isActive]);
};
