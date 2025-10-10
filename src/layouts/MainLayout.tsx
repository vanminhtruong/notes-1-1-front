import { Link, Outlet } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { logoutUser, getProfile, resetAuth } from '@/store/slices/authSlice'
import { User, LogOut, ChevronDown, Mail, MessageCircle, Key, UserX, Menu, X, Smartphone, Tag } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ChatWindow from '../pages/Dashboard/components/ChatWindow'
import BackToTop from '@/components/BackToTop'
import HeaderScrollProgress from '@/components/HeaderScrollProgress'
import RotatingCube from '@/components/RotatingCube'
import DevicesModal from '@/components/DevicesModal'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scrollLock'

export default function MainLayout() {
  const { t } = useTranslation('layout');
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [devicesOpen, setDevicesOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Hide desktop scroll when chat or mobile nav is open (reference-counted)
  useEffect(() => {
    const shouldLock = chatOpen || mobileNavOpen;
    if (shouldLock) {
      lockBodyScroll('MainLayout');
      return () => {
        unlockBodyScroll('MainLayout');
      };
    }
    return;
  }, [chatOpen, mobileNavOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl-down:px-3 md-down:px-2">
          <div className="flex justify-between items-center h-16 lg-down:h-14 md-down:h-12">
            <div className="flex items-center space-x-4 lg-down:space-x-3 md-down:space-x-2">
              <div className="flex items-center space-x-2 md-down:space-x-1.5">
                <RotatingCube size={32} className="transition-transform duration-300 hover:scale-110 lg-down:w-7 lg-down:h-7 md-down:w-6 md-down:h-6" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white lg-down:text-lg md-down:text-base sm-down:text-sm xs-down:hidden">{t('appName')}</h1>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-6 xl-down:gap-5 lg-down:gap-4">
              <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 lg-down:text-sm">{t('nav.dashboard')}</Link>
              <Link to="/categories" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 lg-down:text-sm">{t('nav.categories')}</Link>
              <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 lg-down:text-sm">{t('nav.about')}</Link>
              <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 lg-down:text-sm">{t('nav.contact')}</Link>
            </nav>

            <div className="flex items-center space-x-4 lg-down:space-x-3 md-down:space-x-2">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              <ThemeToggle />
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="group flex items-center gap-2 px-2 py-1.5 rounded-lg border border-white/20 dark:border-gray-700/40 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-md transition-colors md-down:px-1.5 md-down:py-1 md-down:gap-1.5"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-sm md-down:w-7 md-down:h-7">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-tight text-left xl-down:hidden">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || t('user.account')}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform md-down:w-3.5 md-down:h-3.5 ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-72 rounded-xl border border-white/20 dark:border-gray-700/40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl overflow-hidden lg-down:w-64 md-down:w-56 sm-down:w-48"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50/80 to-white/60 dark:from-gray-800/60 dark:to-gray-900/60 border-b border-white/20 dark:border-gray-700/40 md-down:px-3 md-down:py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-white/30 dark:border-gray-700/40 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-sm md-down:w-8 md-down:h-8">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate md-down:text-xs">{user?.name || t('user.account')}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 md-down:text-[11px]">
                            <Mail className="w-3.5 h-3.5 md-down:w-3 md-down:h-3" />
                            <span className="truncate">{user?.email || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 md-down:p-1.5">
                      <Link
                        to="/account"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors md-down:px-2.5 md-down:py-1.5 md-down:text-xs"
                      >
                        <User className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                        <span>{t('user.accountDetails')}</span>
                      </Link>

                      <Link
                        to="/categories"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors md-down:px-2.5 md-down:py-1.5 md-down:text-xs"
                      >
                        <Tag className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                        <span>{t('user.categories')}</span>
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setChatOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors md-down:px-2.5 md-down:py-1.5 md-down:text-xs"
                      >
                        <MessageCircle className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                        <span>{t('user.chat')}</span>
                      </button>

                      <Link
                        to="/change-password"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors md-down:px-2.5 md-down:py-1.5 md-down:text-xs"
                      >
                        <Key className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                        <span>{t('user.changePassword')}</span>
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setDevicesOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors md-down:px-2.5 md-down:py-1.5 md-down:text-xs"
                      >
                        <Smartphone className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                        <span>{t('user.devices')}</span>
                      </button>

                      <div className="my-2 h-px bg-white/30 dark:bg-gray-700/50" />

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          confirmDeleteAccount();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors md-down:px-2.5 md-down:py-1.5 md-down:text-xs"
                      >
                        <UserX className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                        <span>{t('user.deleteAccount')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          confirmLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors md-down:px-2.5 md-down:py-1.5 md-down:text-xs"
                      >
                        <LogOut className="w-4 h-4 md-down:w-3.5 md-down:h-3.5" />
                        <span>{t('user.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setMobileNavOpen((v) => !v)}
                aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileNavOpen}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 dark:border-gray-700/40 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-md transition-colors shadow-sm"
              >
                {mobileNavOpen ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Scroll progress bar at bottom of header */}
        <HeaderScrollProgress />
      </header>

      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="absolute top-0 right-0 h-full w-80 max-w-[85%] bg-white/95 dark:bg-gray-900/95 border-l border-white/20 dark:border-gray-700/40 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/20 dark:border-gray-700/40 bg-gradient-to-r from-gray-50/90 to-white/70 dark:from-gray-800/70 dark:to-gray-900/70">
              <div className="flex items-center gap-3">
                <RotatingCube size={28} className="text-blue-600 dark:text-blue-400" />
                <span className="text-base font-semibold text-gray-900 dark:text-white truncate">{t('appName')}</span>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/20 dark:border-gray-700/40 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
              <Link
                to="/dashboard"
                onClick={() => setMobileNavOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-800 dark:text-gray-100 bg-white/80 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all"
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                to="/categories"
                onClick={() => setMobileNavOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-800 dark:text-gray-100 bg-white/80 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all"
              >
                {t('nav.categories')}
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileNavOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-800 dark:text-gray-100 bg-white/80 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all"
              >
                {t('nav.about')}
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileNavOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-medium text-gray-800 dark:text-gray-100 bg-white/80 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all"
              >
                {t('nav.contact')}
              </Link>
            </nav>
            <div className="px-5 py-4 border-t border-white/20 dark:border-gray-700/40 bg-gradient-to-r from-gray-50/80 to-white/70 dark:from-gray-800/70 dark:to-gray-900/70">
              <div className="block sm:hidden">
                <LanguageSwitcher direction="up" />
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Devices Modal */}
      <DevicesModal 
        isOpen={devicesOpen} 
        onClose={() => setDevicesOpen(false)} 
      />

      {/* Global Back To Top for all tabs/pages */}
      <BackToTop threshold={300} bottomOffset="1.25rem" rightOffset="1.25rem" hideWhenChatOpen={chatOpen} />

      <footer className="border-t border-white/20 dark:border-gray-700/30 bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between xl-down:px-3 md-down:px-2 md-down:py-4 sm-down:flex-col sm-down:gap-3 sm-down:text-center">
          <p className="md-down:text-xs">© {new Date().getFullYear()} {t('appName')}. {t('footer.copyright')}.</p>
          <div className="flex items-center gap-4 md-down:gap-3 sm-down:gap-2">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 md-down:text-xs">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 md-down:text-xs">{t('footer.terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
