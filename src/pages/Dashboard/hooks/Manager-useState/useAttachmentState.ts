import { useState } from 'react';

export const useAttachmentState = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [pendingImages, setPendingImages] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [pendingFiles, setPendingFiles] = useState<Array<{ id: string; file: File }>>([]);
  const [menuOpenKey, setMenuOpenKey] = useState<string | null>(null);

  return {
    previewImage,
    setPreviewImage,
    pendingImages,
    setPendingImages,
    pendingFiles,
    setPendingFiles,
    menuOpenKey,
    setMenuOpenKey,
  };
};
