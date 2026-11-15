import { useEffect } from 'react';

interface UseSearchTermEffectsProps {
  isOpen: boolean;
  currentUserId?: number;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

export const useSearchTermEffects = ({
  isOpen,
  currentUserId,
  setSearchTerm,
}: UseSearchTermEffectsProps) => {
  useEffect(() => {
    if (isOpen) setSearchTerm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    setSearchTerm('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);
};
