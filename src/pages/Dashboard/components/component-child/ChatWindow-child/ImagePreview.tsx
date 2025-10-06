import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ImagePreviewProps } from '../../interface/ChatUI.interface';

const ImagePreview = memo(({ previewImage, onClose }: ImagePreviewProps) => {
  const { t } = useTranslation('dashboard');
  if (!previewImage) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute -top-3 -right-3 bg-white text-gray-700 rounded-full p-1 shadow hover:bg-gray-100"
          aria-label={t('chat.imagePreview.close')}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <img
          src={previewImage}
          alt={t('chat.imagePreview.imageAlt')}
          onClick={(e) => e.stopPropagation()}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
});

ImagePreview.displayName = 'ImagePreview';

export default ImagePreview;
