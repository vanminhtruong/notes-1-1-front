import { useEffect } from 'react';

interface UseSearchTermEffectsProps {
  isOpen: boolean;
  showEnterPin: boolean;
  currentUserId?: number;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export const useSearchTermEffects = ({
  isOpen,
  showEnterPin,
  currentUserId,
  setSearchTerm,
}: UseSearchTermEffectsProps) => {
  useEffect(() => {
    if (isOpen) setSearchTerm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (showEnterPin) setSearchTerm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEnterPin]);

  useEffect(() => {
    setSearchTerm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);
};
