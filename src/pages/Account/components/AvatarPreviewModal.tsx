import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Image as ImageIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './AvatarPreviewModal.scss';

interface AvatarPreviewModalProps {
  isOpen: boolean;
  imageUrl?: string | null;
  onClose: () => void;
}

export default function AvatarPreviewModal({
  isOpen,
  imageUrl,
  onClose,
}: AvatarPreviewModalProps) {
  const { t } = useTranslation('account');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      // Keep keyboard focus inside the modal.
      if (event.key === 'Tab') {
        const dialog = closeButtonRef.current?.closest('[role="dialog"]');
        const controls = dialog?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, imageUrl, onClose]);

  if (!isOpen || !imageUrl) return null;

  return createPortal(
    <div className="avatar-lightbox-overlay">
      <section
        className="avatar-lightbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-lightbox-title"
        aria-describedby="avatar-lightbox-description"
      >
        <header className="avatar-lightbox-header">
          <div className="avatar-lightbox-heading">
            <div className="avatar-lightbox-header-icon" aria-hidden="true">
              <ImageIcon size={19} />
            </div>
            <div className="avatar-lightbox-heading-text">
              <h2 id="avatar-lightbox-title">{t('avatar.preview')}</h2>
              <p id="avatar-lightbox-description">{t('avatar.previewSubtitle')}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="avatar-lightbox-close"
            onClick={onClose}
            aria-label={t('avatar.closePreview')}
            title={t('avatar.closePreview')}
          >
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="avatar-lightbox-body">
          <div className="avatar-lightbox-image-frame">
            <img src={imageUrl} alt={t('avatar.label')} draggable={false} />
          </div>
        </div>

        <footer className="avatar-lightbox-footer">
          <span className="avatar-lightbox-caption">{t('avatar.previewHint')}</span>
          <button type="button" className="avatar-lightbox-done" onClick={onClose}>
            {t('avatar.closePreview')}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}
