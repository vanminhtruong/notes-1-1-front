import { useEffect } from 'react';

interface UseFilterEffectsProps {
  searchTerm: string;
  selectedCategory: string;
  selectedPriority: string;
  showArchived: boolean;
  setCurrentPage: (page: number) => void;
}

export const useFilterEffects = ({
  searchTerm,
  selectedCategory,
  selectedPriority,
  showArchived,
  setCurrentPage,
}: UseFilterEffectsProps) => {
  // Reset về trang 1 khi filters thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedPriority, showArchived, setCurrentPage]);
};
