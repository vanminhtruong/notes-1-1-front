import { useState } from 'react';

export const useGroupModalsState = () => {
  const [showGroupEditor, setShowGroupEditor] = useState(false);
  const [showRemoveMembers, setShowRemoveMembers] = useState(false);

  return {
    showGroupEditor,
    setShowGroupEditor,
    showRemoveMembers,
    setShowRemoveMembers,
  };
};
