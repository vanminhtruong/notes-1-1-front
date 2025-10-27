import { useState } from 'react';
import type { SharedNote, GroupSharedNote } from '@/services/notesService';

export const useSharedNotesState = () => {
  const [sharedWithMe, setSharedWithMe] = useState<SharedNote[]>([]);
  const [sharedByMe, setSharedByMe] = useState<SharedNote[]>([]);
  const [groupSharedNotes, setGroupSharedNotes] = useState<GroupSharedNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [pageWithMe, setPageWithMe] = useState(1);
  const [pageByMe, setPageByMe] = useState(1);
  const [pageGroups, setPageGroups] = useState(1);
  const [totalPagesWithMe, setTotalPagesWithMe] = useState(1);
  const [totalPagesByMe, setTotalPagesByMe] = useState(1);
  const [totalPagesGroups, setTotalPagesGroups] = useState(1);
  const [totalWithMe, setTotalWithMe] = useState(0);
  const [totalByMe, setTotalByMe] = useState(0);
  const [totalGroups, setTotalGroups] = useState(0);

  return {
    sharedWithMe,
    setSharedWithMe,
    sharedByMe,
    setSharedByMe,
    groupSharedNotes,
    setGroupSharedNotes,
    isLoading,
    setIsLoading,
    error,
    setError,
    pageWithMe,
    setPageWithMe,
    pageByMe,
    setPageByMe,
    pageGroups,
    setPageGroups,
    totalPagesWithMe,
    setTotalPagesWithMe,
    totalPagesByMe,
    setTotalPagesByMe,
    totalPagesGroups,
    setTotalPagesGroups,
    totalWithMe,
    setTotalWithMe,
    totalByMe,
    setTotalByMe,
    totalGroups,
    setTotalGroups,
  };
};
