import { memo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import type { RefObject, UIEvent } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { backgroundApi } from '../../../services/api';
import { getSocket } from '../../../services/socket';

interface BackgroundPickerProps {
  currentBackgroundColor?: string | null;
  currentBackgroundImage?: string | null;
  onBackgroundChange: (backgroundColor: string | null, backgroundImage: string | null) => void;
  onClose?: () => void;
  anchorRef?: RefObject<HTMLButtonElement | null>;
}

const BackgroundPicker = memo(({
  currentBackgroundColor,
  currentBackgroundImage,
  onBackgroundChange,
  onClose,
  anchorRef,
}: BackgroundPickerProps) => {
  const { t } = useTranslation('dashboard');
  const [activeTab, setActiveTab] = useState<'color' | 'image'>('color');
  const [searchQuery, setSearchQuery] = useState('');
  const [colors, setColors] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [colorPage, setColorPage] = useState(1);
  const [imagePage, setImagePage] = useState(1);
  const [colorHasMore, setColorHasMore] = useState(true);
  const [imageHasMore, setImageHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const [ready, setReady] = useState(false);
  const PAGE_SIZE = 10;
  const MIN_SPINNER_MS = 400;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Socket listeners for real-time background updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleBackgroundEvent = async () => {
      // Tránh fetch nhiều lần cùng lúc
      if (isFetchingRef.current) return;
      
      isFetchingRef.current = true;
      try {
        // Fetch nhẹ nhàng, không hiển loading spinner
        const [colorsResponse, imagesResponse] = await Promise.all([
          backgroundApi.getColors(searchQuery, 1, PAGE_SIZE),
          backgroundApi.getImages(searchQuery, 1, PAGE_SIZE)
        ]);

        setColors(colorsResponse.data?.items || []);
        setImages(imagesResponse.data?.items || []);
        setColorHasMore(!!colorsResponse.data?.hasMore);
        setImageHasMore(!!imagesResponse.data?.hasMore);
        setColorPage(1);
        setImagePage(1);
      } catch (error) {
        console.error('Error fetching backgrounds:', error);
      } finally {
        isFetchingRef.current = false;
      }
    };

    socket.on('background_created', handleBackgroundEvent);
    socket.on('background_updated', handleBackgroundEvent);
    socket.on('background_deleted', handleBackgroundEvent);

    return () => {
      socket.off('background_created', handleBackgroundEvent);
      socket.off('background_updated', handleBackgroundEvent);
      socket.off('background_deleted', handleBackgroundEvent);
    };
  }, [searchQuery]);

  // Tính vị trí theo anchor, thực hiện trước paint để tránh nhấp nháy tại (0,0)
  useLayoutEffect(() => {
    if (!anchorRef?.current) return;
    const updatePos = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const estimatedHeight = 320; // ước lượng chiều cao dropdown
      const spaceBelow = viewportH - rect.bottom;
      const spaceAbove = rect.top;

      // Auto placement: ưu tiên bên dưới, nếu không đủ thì đặt lên trên
      const placeBelow = spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove;
      const top = placeBelow ? rect.bottom + 8 : Math.max(8, rect.top - estimatedHeight - 8);

      // Giữ trong khung nhìn theo chiều ngang
      const dropdownWidth = 280; // khớp với w-[280px]
      let left = rect.left;
      if (left + dropdownWidth > viewportW - 8) {
        left = Math.max(8, viewportW - dropdownWidth - 8);
      }

      setCoords({ top, left, width: rect.width });
      setReady(true);
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [anchorRef]);

  const handleColorSelect = (color: string | null) => {
    onBackgroundChange(color, null);
    onClose?.();
  };

  const handleImageSelect = (imageUrl: string | null) => {
    onBackgroundChange(null, imageUrl);
    onClose?.();
  };

  // Fetch backgrounds from API (initial, page=1)
  const fetchBackgrounds = async (search?: string) => {
    try {
      setIsInitialLoading(true);
      setColors([]);
      setImages([]);
      setColorPage(1);
      setImagePage(1);
      setColorHasMore(true);
      setImageHasMore(true);
      const [colorsResponse, imagesResponse] = await Promise.all([
        backgroundApi.getColors(search, 1, PAGE_SIZE),
        backgroundApi.getImages(search, 1, PAGE_SIZE)
      ]);

      setColors(colorsResponse.data?.items || []);
      setImages(imagesResponse.data?.items || []);
      setColorHasMore(!!colorsResponse.data?.hasMore);
      setImageHasMore(!!imagesResponse.data?.hasMore);
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadMoreColors = async () => {
    if (!colorHasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    const start = Date.now();
    try {
      const next = colorPage + 1;
      const res = await backgroundApi.getColors(searchQuery, next, PAGE_SIZE);
      const newItems: any[] = res.data?.items || [];
      const newHasMore: boolean = !!res.data?.hasMore;
      // Wait for spinner min time, then append and update paging info
      const elapsed = Date.now() - start;
      if (elapsed < MIN_SPINNER_MS) {
        await new Promise((r) => setTimeout(r, MIN_SPINNER_MS - elapsed));
      }
      if (newItems.length) {
        setColors((prev) => [...prev, ...newItems]);
      }
      setColorPage(next);
      setColorHasMore(newHasMore);
    } catch (error) {
      console.error('Error loading more colors:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadMoreImages = async () => {
    if (!imageHasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    const start = Date.now();
    try {
      const next = imagePage + 1;
      const res = await backgroundApi.getImages(searchQuery, next, PAGE_SIZE);
      const newItems: any[] = res.data?.items || [];
      const newHasMore: boolean = !!res.data?.hasMore;
      // Wait for spinner min time, then append and update paging info
      const elapsed = Date.now() - start;
      if (elapsed < MIN_SPINNER_MS) {
        await new Promise((r) => setTimeout(r, MIN_SPINNER_MS - elapsed));
      }
      if (newItems.length) {
        setImages((prev) => [...prev, ...newItems]);
      }
      setImagePage(next);
      setImageHasMore(newHasMore);
    } catch (error) {
      console.error('Error loading more images:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Initial fetch and search
  useEffect(() => {
    fetchBackgrounds(searchQuery);
  }, [searchQuery]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (!nearBottom) return;
    if (activeTab === 'color') {
      loadMoreColors();
    } else {
      loadMoreImages();
    }
  };

  const content = (
    <div
      ref={pickerRef}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[10050] w-[280px] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      style={anchorRef?.current ? { position: 'fixed', top: coords.top, left: coords.left } : { position: 'absolute', top: '100%', left: 0, marginTop: 8 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('notes.background.title')}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label={t('actions.close')}
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('notes.background.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('color')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'color'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {t('notes.background.colors')}
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'image'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {t('notes.background.images')}
        </button>
      </div>

      {/* Content */}
      <div className="p-3 max-h-[240px] overflow-y-auto" onScroll={handleScroll}>
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : activeTab === 'color' ? (
          <div className="grid grid-cols-4 gap-2">
            {colors.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleColorSelect(bg.color)}
                className={`relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                  currentBackgroundColor === bg.color && !currentBackgroundImage
                    ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-600/20 dark:ring-blue-400/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                style={{
                  backgroundColor: bg.color || '#ffffff',
                }}
                title={bg.label}
                aria-label={bg.label}
              >
                {!bg.color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-red-500 rotate-45 absolute"></div>
                  </div>
                )}
              </button>
            ))}
            {colors.length === 0 && (
              <div className="col-span-4 text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                {t('notes.background.noColorsFound')}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {images.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleImageSelect(bg.url)}
                className={`relative w-full aspect-video rounded-lg border-2 transition-all hover:scale-105 overflow-hidden ${
                  currentBackgroundImage === bg.url && !currentBackgroundColor
                    ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-600/20 dark:ring-blue-400/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                title={bg.label}
                aria-label={bg.label}
              >
                {bg.url ? (
                  <img
                    src={bg.url}
                    alt={bg.label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-700">
                    <div className="w-8 h-0.5 bg-red-500 rotate-45 absolute"></div>
                  </div>
                )}
              </button>
            ))}
            {images.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                {t('notes.background.noImagesFound')}
              </div>
            )}
          </div>
        )}
        {isLoadingMore && (
          <div className="sticky bottom-0 left-0 right-0 mt-2 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        )}
      </div>
    </div>
  );

  // Nếu có anchorRef thì render qua portal (tránh bị ancestor với overflow che); nếu không thì render bình thường
  if (anchorRef?.current) {
    if (!ready) return null; // chưa tính xong vị trí, không render để tránh hiện ở (0,0)
    return createPortal(content, document.body);
  }
  return content;
});

BackgroundPicker.displayName = 'BackgroundPicker';

export default BackgroundPicker;
