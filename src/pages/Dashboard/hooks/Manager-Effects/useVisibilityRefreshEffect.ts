import { useEffect } from 'react';

export function useVisibilityRefresh(
  activeTab: 'users' | 'chats' | 'unread' | 'groups' | 'sharedNotes',
  searchTerm: string,
  loadUsers: (term?: string) => any,
  loadFriendRequests: () => any,
) {
  useEffect(() => {
    const refreshIfUsersTab = () => {
      if (activeTab === 'users') {
        loadUsers(searchTerm);
        loadFriendRequests();
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshIfUsersTab();
    };
    window.addEventListener('focus', refreshIfUsersTab);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('focus', refreshIfUsersTab);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [activeTab, searchTerm, loadUsers, loadFriendRequests]);
}
