import { Link, Outlet } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { logoutUser, getProfile, resetAuth } from '@/store/slices/authSlice'
import { User, LogOut, ChevronDown, Mail, MessageCircle, Key, UserX } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ChatWindow from '../pages/Dashboard/components/ChatWindow'
import BackToTop from '@/components/BackToTop'
import HeaderScrollProgress from '@/components/HeaderScrollProgress'
import RotatingCube from '@/components/RotatingCube'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'

export default function MainLayout() {
  const { t } = useTranslation('layout');
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-fetch user profile if token exists but user data is missing
  useEffect(() => {
    if (isAuthenticated && token && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated, token, user]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const confirmLogout = () => {
    toast.custom((toastData) => (
      <div
        className={`max-w-sm w-full rounded-xl shadow-lg border ${
          toastData.visible ? 'animate-enter' : 'animate-leave'
        } bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold">{t('user.logoutConfirm')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('user.logoutMessage')}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(toastData.id)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            {t('user.cancel')}
          </button>
          <button
            onClick={() => {
              handleLogout();
              toast.dismiss(toastData.id);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {t('user.logout')}
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  const confirmDeleteAccount = () => {
    toast.custom((toastData) => (
      <div
        className={`max-w-sm w-full rounded-xl shadow-lg border ${
          toastData.visible ? 'animate-enter' : 'animate-leave'
        } bg-white/90 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 p-4`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="font-semibold text-red-600 dark:text-red-400">{t('user.deleteConfirm')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('user.deleteMessage')}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(toastData.id)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
          >
            {t('user.cancel')}
          </button>
          <button
            onClick={async () => {
              try {
                await authService.deleteAccount();
                toast.success(String(t('user.deleteSuccess')));
              } catch (e: any) {
                toast.error(e?.response?.data?.message || String(t('user.deleteFailed', { defaultValue: 'Xóa tài khoản thất bại' } as any)));
              } finally {
                dispatch(resetAuth());
                toast.dismiss(toastData.id);
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            {t('user.deleteAccount')}
          </button>
        </div>
      </div>
    ), { duration: 10000 });
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  // Hide desktop scroll when chat is open
  useEffect(() => {
    if (chatOpen) {
      // Add class to hide scrollbar
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrollbar
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [chatOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RotatingCube size={32} className="transition-transform duration-300 hover:scale-110" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('appName')}</h1>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">{t('nav.dashboard')}</Link>
              <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">{t('nav.about')}</Link>
              <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">{t('nav.contact')}</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <ThemeToggle />
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="group flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/20 dark:border-gray-700/40 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-md transition-colors"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-tight text-left">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || t('user.account')}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 rounded-xl border border-white/20 dark:border-gray-700/40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50/80 to-white/60 dark:from-gray-800/60 dark:to-gray-900/60 border-b border-white/20 dark:border-gray-700/40">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-sm">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || t('user.account')}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{user?.email || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/account"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>{t('user.accountDetails')}</span>
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setChatOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{t('user.chat')}</span>
                      </button>

                      <Link
                        to="/change-password"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                      >
                        <Key className="w-4 h-4" />
                        <span>{t('user.changePassword')}</span>
                      </Link>

                      <div className="my-2 h-px bg-white/30 dark:bg-gray-700/50" />

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          confirmDeleteAccount();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        <span>{t('user.deleteAccount')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          confirmLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('user.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Scroll progress bar at bottom of header */}
        <HeaderScrollProgress />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Chat Window */}
      {chatOpen && (
        <ChatWindow 
          isOpen={chatOpen} 
          onClose={() => setChatOpen(false)} 
        />
      )}

      {/* Global Back To Top for all tabs/pages */}
      <BackToTop threshold={300} bottomOffset="1.25rem" rightOffset="1.25rem" />

      <footer className="border-t border-white/20 dark:border-gray-700/30 bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
          <p>© {new Date().getFullYear()} {t('appName')}. {t('footer.copyright')}.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">{t('footer.terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
