import { useEffect } from 'react';

export function usePreviewEscape(previewImage: string | null, setPreviewImage: (v: string | null) => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewImage(null);
    };
    if (previewImage) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewImage, setPreviewImage]);
}
