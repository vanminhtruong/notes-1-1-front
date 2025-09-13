import type { GroupSummary } from '../../../../services/groupService';
import type { User } from './ChatTypes.interface';

// Image preview modal
export interface ImagePreviewProps {
  previewImage: string | null;
  onClose: () => void;
}

// PIN modals
export interface EnterPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  expectedHash: string | null;
}

export interface SetPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasExisting: boolean;
  onSet: (payload: { pinHash: string; oldPinHash?: string }) => void;
}

// Remove members modal
export type RemovableMember = { id: number; name: string; avatar?: string };

export interface RemoveMembersModalProps {
  isOpen: boolean;
  members: RemovableMember[];
  onClose: () => void;
  onConfirm: (memberIds: number[]) => Promise<void> | void;
}

// Group editor modal
export type GroupEditorMode = 'create' | 'edit';

export interface GroupEditorModalProps {
  isOpen: boolean;
  mode: GroupEditorMode;
  initial?: Partial<GroupSummary> | null;
  onClose: () => void;
  onSuccess?: (group: GroupSummary) => void;
}

// Groups tab
export type GroupItem = GroupSummary;

export interface GroupsTabProps {
  onSelectGroup?: (group: GroupItem) => void;
}

// Pending group invite
export type PendingInvite = {
  id: number;
  status: 'pending' | 'accepted' | 'declined';
  group: {
    id: number;
    name: string;
    avatar?: string;
    background?: string;
    ownerId: number;
  };
  inviter: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
};

// Users list
export interface UsersListProps {
  friendRequests: User[];
  filteredUsers: User[];
  onAcceptFriendRequest: (userId: number) => void;
  onRejectFriendRequest: (userId: number) => void;
  onSendFriendRequest: (userId: number) => void;
  onStartChat: (user: User) => void;
}
