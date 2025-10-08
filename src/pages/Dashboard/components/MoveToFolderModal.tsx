import { useState, memo } from 'react';
import { X, Folder, FolderOpen, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NoteFolder } from '@/services/notesService';

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: NoteFolder[];
  onSelectFolder: (folderId: number) => void;
  noteTitle: string;
}

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
  green: 'bg-gradient-to-br from-green-500 to-green-600',
  red: 'bg-gradient-to-br from-red-500 to-red-600',
  yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
  pink: 'bg-gradient-to-br from-pink-500 to-pink-600',
  orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
  gray: 'bg-gradient-to-br from-gray-500 to-gray-600',
};

const MoveToFolderModal = memo(({ isOpen, onClose, folders, onSelectFolder, noteTitle }: MoveToFolderModalProps) => {
  const { t } = useTranslation('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  if (!isOpen) return null;

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (folderId: number) => {
    setSelectedFolderId(folderId);
  };

  const handleConfirm = () => {
    if (selectedFolderId) {
      onSelectFolder(selectedFolderId);
      setSelectedFolderId(null);
      setSearchTerm('');
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedFolderId(null);
    setSearchTerm('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              {t('folders.moveToFolder')}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {noteTitle}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('actions.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('folders.searchPlaceholder') || 'Tìm thư mục...'}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Folders List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Folder className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? t('folders.noFoldersFound') || 'Không tìm thấy thư mục' : t('folders.noFolder')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleSelect(folder.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    selectedFolderId === folder.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400 shadow-md'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                  }`}
                >
                  <div className={`${COLOR_CLASSES[folder.color] || COLOR_CLASSES.blue} p-2.5 rounded-lg flex-shrink-0`}>
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`font-medium truncate ${
                      selectedFolderId === folder.id
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {folder.notesCount || 0} {t('folders.notes')}
                    </p>
                  </div>
                  {selectedFolderId === folder.id && (
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedFolderId}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {t('folders.moveButton') || 'Di chuyển'}
          </button>
        </div>
      </div>
    </div>
  );
});

MoveToFolderModal.displayName = 'MoveToFolderModal';

export default MoveToFolderModal;
