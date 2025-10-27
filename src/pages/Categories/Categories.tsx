import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Plus } from 'lucide-react';
import LazyLoad from '@/components/LazyLoad';
import * as CategoriesHooks from '@/pages/Categories/hooks';
import CategoriesGrid from '@/pages/Categories/components/CategoriesGrid';
import CreateCategoryModal from '@/pages/Categories/components/CreateCategoryModal';
import EditCategoryModal from '@/pages/Categories/components/EditCategoryModal';
import DeleteCategoryModal from '@/pages/Categories/components/DeleteCategoryModal';
import CategoryNotesModal from '@/pages/Categories/components/CategoryNotesModal';

export default function Categories() {
  const { t } = useTranslation('categories');
  const navigate = useNavigate();

  // State management
  const state = CategoriesHooks.useCategoriesState();
  const { categories, isLoading } = state;

  const modalsState = CategoriesHooks.useCategoriesModalsState();

  // Handlers
  const handlers = CategoriesHooks.useCategoriesHandler({
    setCategories: state.setCategories,
    setIsLoading: state.setIsLoading,
    categories: state.categories,
  });
  const { createCategory, updateCategory, deleteCategory } = handlers;

  const modalsHandler = CategoriesHooks.useCategoriesModalsHandler({
    setCreateModalOpen: modalsState.setCreateModalOpen,
    setEditModalOpen: modalsState.setEditModalOpen,
    setDeleteModalOpen: modalsState.setDeleteModalOpen,
    setViewNotesModalOpen: modalsState.setViewNotesModalOpen,
    setSelectedCategory: modalsState.setSelectedCategory,
  });

  // Effects
  CategoriesHooks.useCategoriesEffects({
    fetchCategories: handlers.fetchCategories,
    setCategories: state.setCategories,
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900/60 dark:to-gray-800 min-h-screen">
      <section className="max-w-7xl mx-auto px-4 py-10 xl-down:py-9 lg-down:py-8 md-down:py-7 sm-down:py-6 xs-down:py-5 xl-down:px-3.5 lg-down:px-3 md-down:px-2.5 sm-down:px-2">
        <div className="rounded-2xl border border-white/20 dark:border-gray-700/30 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl overflow-hidden lg-down:rounded-xl md-down:rounded-lg">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-gray-50/70 to-white/50 dark:from-gray-800/60 dark:to-gray-800/40 lg-down:px-5 lg-down:py-4 md-down:px-4 md-down:py-3.5 sm-down:px-3.5 sm-down:py-3 xs-down:px-3 xs-down:py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm-down:gap-2.5 xs-down:gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 lg-down:p-1.5 sm-down:p-1"
                  aria-label={t('back')}
                  title={t('backToDashboard')}
                >
                  <ArrowLeft className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 lg-down:text-base md-down:text-sm sm-down:gap-1.5">
                  <Tag className="w-5 h-5 lg-down:w-4 lg-down:h-4 sm-down:w-3.5 sm-down:h-3.5" />
                  {t('title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={modalsHandler.handleCreateCategory}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm lg-down:px-3 lg-down:py-1.5 lg-down:text-sm md-down:px-2.5 md-down:py-1.5 md-down:text-xs sm-down:gap-1.5"
              >
                <Plus className="w-4 h-4 lg-down:w-3.5 lg-down:h-3.5 sm-down:w-3 sm-down:h-3" />
                {t('createCategory')}
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 lg-down:text-xs sm-down:text-xs">{t('description')}</p>
          </div>

          {/* Content */}
          <div className="p-6 lg-down:p-5 md-down:p-4 sm-down:p-3.5 xs-down:p-3">
            <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0} reAnimate={true}>
              <CategoriesGrid
                categories={categories}
                isLoading={isLoading}
                onEdit={modalsHandler.handleEditCategory}
                onDelete={modalsHandler.handleDeleteCategory}
                onView={modalsHandler.handleViewNotes}
              />
            </LazyLoad>
          </div>
        </div>
      </section>

      {/* Modals */}
      <CreateCategoryModal
        isOpen={modalsState.createModalOpen}
        onClose={modalsHandler.handleCloseModals}
        onSubmit={createCategory}
      />

      {modalsState.selectedCategory && (
        <>
          <EditCategoryModal
            isOpen={modalsState.editModalOpen}
            onClose={modalsHandler.handleCloseModals}
            onSubmit={updateCategory}
            category={modalsState.selectedCategory}
          />
          <DeleteCategoryModal
            isOpen={modalsState.deleteModalOpen}
            onClose={modalsHandler.handleCloseModals}
            onConfirm={deleteCategory}
            category={modalsState.selectedCategory}
          />
          <CategoryNotesModal
            isOpen={modalsState.viewNotesModalOpen}
            onClose={modalsHandler.handleCloseModals}
            category={modalsState.selectedCategory}
          />
        </>
      )}
    </div>
  );
}
