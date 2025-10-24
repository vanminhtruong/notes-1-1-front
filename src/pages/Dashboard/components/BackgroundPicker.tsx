import { memo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackgroundPickerProps {
  currentBackgroundColor?: string | null;
  currentBackgroundImage?: string | null;
  onBackgroundChange: (backgroundColor: string | null, backgroundImage: string | null) => void;
  onClose?: () => void;
  anchorRef?: RefObject<HTMLButtonElement | null>;
}

// Danh sách màu nền
const BACKGROUND_COLORS = [
  { id: 'default', color: null, label: 'Default' },
  { id: 'coral', color: '#f28b82', label: 'Coral' },
  { id: 'peach', color: '#fbbc04', label: 'Peach' },
  { id: 'sand', color: '#fff475', label: 'Sand' },
  { id: 'mint', color: '#ccff90', label: 'Mint' },
  { id: 'sage', color: '#a7ffeb', label: 'Sage' },
  { id: 'fog', color: '#cbf0f8', label: 'Fog' },
  { id: 'storm', color: '#aecbfa', label: 'Storm' },
  { id: 'dusk', color: '#d7aefb', label: 'Dusk' },
  { id: 'blossom', color: '#fdcfe8', label: 'Blossom' },
  { id: 'clay', color: '#e6c9a8', label: 'Clay' },
  { id: 'chalk', color: '#e8eaed', label: 'Chalk' },
];

// Danh sách ảnh nền (patterns + ảnh sống động)
const BACKGROUND_IMAGES = [
  { id: 'default', url: null, label: 'None' },
  // Patterns từ Google Keep
  { id: 'celebration', url: 'https://www.gstatic.com/keep/backgrounds/celebration_light_0609.svg', label: 'Celebration' },
  { id: 'notes', url: 'https://www.gstatic.com/keep/backgrounds/notes_light_0609.svg', label: 'Notes' },
  { id: 'places', url: 'https://www.gstatic.com/keep/backgrounds/places_light_0609.svg', label: 'Places' },
  { id: 'travel', url: 'https://www.gstatic.com/keep/backgrounds/travel_light_0609.svg', label: 'Travel' },
  { id: 'video', url: 'https://www.gstatic.com/keep/backgrounds/video_light_0609.svg', label: 'Video' },
  { id: 'recipe', url: 'https://www.gstatic.com/keep/backgrounds/recipe_light_0609.svg', label: 'Recipe' },
  { id: 'music', url: 'https://www.gstatic.com/keep/backgrounds/music_light_0609.svg', label: 'Music' },
  { id: 'food', url: 'https://www.gstatic.com/keep/backgrounds/food_light_0609.svg', label: 'Food' },
  // Ảnh sống động từ Unsplash (optimized)
  // Thiên nhiên
  { id: 'nature1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', label: 'Mountain' },
  { id: 'nature2', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', label: 'Forest' },
  { id: 'ocean', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80', label: 'Ocean' },
  { id: 'sunset', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=800&q=80', label: 'Sunset' },
  { id: 'lake', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80', label: 'Lake' },
  { id: 'waterfall', url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80', label: 'Waterfall' },
  { id: 'desert', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80', label: 'Desert' },
  { id: 'northern', url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&q=80', label: 'Northern Lights' },
  // Thành phố
  { id: 'newyork1', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80', label: 'New York Skyline' },
  { id: 'newyork2', url: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800&q=80', label: 'Brooklyn Bridge' },
  { id: 'newyork3', url: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&q=80', label: 'Times Square' },
  { id: 'losangeles1', url: 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=800&q=80', label: 'Los Angeles' },
  { id: 'losangeles2', url: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800&q=80', label: 'LA Downtown' },
  { id: 'losangeles3', url: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=800&q=80', label: 'Hollywood' },
  { id: 'tokyo', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', label: 'Tokyo' },
  { id: 'paris', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', label: 'Paris' },
  { id: 'london', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', label: 'London' },
  { id: 'dubai', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80', label: 'Dubai' },
  // Không gian & Nghệ thuật
  { id: 'space', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80', label: 'Space' },
  { id: 'galaxy', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80', label: 'Galaxy' },
  { id: 'abstract1', url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80', label: 'Abstract' },
  { id: 'gradient1', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80', label: 'Gradient' },
  { id: 'neon', url: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?w=800&q=80', label: 'Neon Lights' },
  // Hoa & Thiên nhiên đẹp
  { id: 'flowers', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80', label: 'Flowers' },
  { id: 'cherry', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=80', label: 'Cherry Blossom' },
  { id: 'lavender', url: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800&q=80', label: 'Lavender Field' },
  { id: 'tulips', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80', label: 'Tulips' },
  // Biển & Bãi biển
  { id: 'beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', label: 'Beach' },
  { id: 'maldives', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80', label: 'Maldives' },
  { id: 'tropical', url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', label: 'Tropical' },
  // Mùa & Thời tiết
  { id: 'autumn', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', label: 'Autumn' },
  { id: 'winter', url: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80', label: 'Winter' },
  { id: 'spring', url: 'https://images.unsplash.com/photo-1465146633011-14f8e0781093?w=800&q=80', label: 'Spring' },
  // Sự kiện - Giáng sinh
  { id: 'christmas1', url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&q=80', label: 'Christmas Tree' },
  { id: 'christmas2', url: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800&q=80', label: 'Christmas Lights' },
  { id: 'christmas3', url: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800&q=80', label: 'Christmas Gifts' },
  { id: 'christmas4', url: 'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=800&q=80', label: 'Christmas Decor' },
  { id: 'christmas5', url: 'https://images.unsplash.com/photo-1483086431886-3590a88317fe?w=800&q=80', label: 'Christmas Snow' },
  { id: 'christmas6', url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80', label: 'Santa' },
  { id: 'christmas7', url: 'https://images.unsplash.com/photo-1545048702-79362596cdc9?w=800&q=80', label: 'Christmas Ornaments' },
  { id: 'christmas8', url: 'https://images.unsplash.com/photo-1511268559489-34b624fbfcf5?w=800&q=80', label: 'Christmas Cookies' },
  // Sự kiện - Phục sinh
  { id: 'easter1', url: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=800&q=80', label: 'Easter Eggs' },
  { id: 'easter2', url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80', label: 'Easter Bunny' },
  { id: 'easter3', url: 'https://images.unsplash.com/photo-1553531889-56cc480ac5cb?w=800&q=80', label: 'Easter Basket' },
  { id: 'easter4', url: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=800&q=80', label: 'Easter Spring' },
  { id: 'easter5', url: 'https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=800&q=80', label: 'Easter Flowers' },
  // Sự kiện - Tết Nguyên đán
  { id: 'tet1', url: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&q=80', label: 'Lunar New Year' },
  { id: 'tet2', url: 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800&q=80', label: 'Red Lanterns' },
  { id: 'tet3', url: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=800&q=80', label: 'Cherry Blossom Festival' },
  { id: 'tet4', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80', label: 'Dragon Dance' },
  { id: 'tet5', url: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=80', label: 'Lucky Money' },
  { id: 'tet6', url: 'https://images.unsplash.com/photo-1611605645802-c21be743c321?w=800&q=80', label: 'Peach Blossom' },
  // Động vật
  { id: 'animal1', url: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&q=80', label: 'Dog' },
  { id: 'animal2', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80', label: 'Cat' },
  { id: 'animal3', url: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=800&q=80', label: 'Panda' },
  { id: 'animal4', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&q=80', label: 'Elephant' },
  { id: 'animal5', url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800&q=80', label: 'Lion' },
  { id: 'animal6', url: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&q=80', label: 'Butterfly' },
  { id: 'animal7', url: 'https://images.unsplash.com/photo-1607153333879-c174d265f1d2?w=800&q=80', label: 'Dolphin' },
  { id: 'animal8', url: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&q=80', label: 'Bird' },
  // Đồ ăn & Đồ uống
  { id: 'food1', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', label: 'Food' },
  { id: 'food2', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', label: 'Pizza' },
  { id: 'food3', url: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=80', label: 'Burger' },
  { id: 'food4', url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80', label: 'Sushi' },
  { id: 'food5', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', label: 'Breakfast' },
  { id: 'drink1', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', label: 'Coffee' },
  { id: 'drink2', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', label: 'Tea' },
  { id: 'drink3', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80', label: 'Cocktail' },
  // Thể thao
  { id: 'sport1', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80', label: 'Running' },
  { id: 'sport2', url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', label: 'Basketball' },
  { id: 'sport3', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', label: 'Football' },
  { id: 'sport4', url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80', label: 'Yoga' },
  { id: 'sport5', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', label: 'Gym' },
  // Công nghệ
  { id: 'tech1', url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80', label: 'Laptop' },
  { id: 'tech2', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', label: 'Workspace' },
  { id: 'tech3', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80', label: 'Code' },
  { id: 'tech4', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', label: 'Technology' },
  { id: 'tech5', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', label: 'Data' },
  // Âm nhạc & Nghệ thuật
  { id: 'music1', url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80', label: 'Music Studio' },
  { id: 'music2', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80', label: 'Concert' },
  { id: 'music3', url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=80', label: 'Guitar' },
  { id: 'art1', url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80', label: 'Art Gallery' },
  { id: 'art2', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', label: 'Painting' },
  { id: 'art3', url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80', label: 'Street Art' },
  // Du lịch & Địa danh
  { id: 'landmark1', url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&q=80', label: 'Pyramids' },
  { id: 'landmark2', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80', label: 'Rome' },
  { id: 'landmark3', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80', label: 'Santorini' },
  { id: 'landmark4', url: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800&q=80', label: 'Bali' },
  { id: 'landmark5', url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80', label: 'Iceland' },
  // Kiến trúc
  { id: 'architecture1', url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80', label: 'Modern Building' },
  { id: 'architecture2', url: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80', label: 'Skyscraper' },
  { id: 'architecture3', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', label: 'City Architecture' },
  { id: 'architecture4', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80', label: 'Night City' },
  // Thiên nhiên thêm
  { id: 'nature10', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', label: 'Fog Mountain' },
  { id: 'nature11', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80', label: 'Green Forest' },
  { id: 'nature12', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', label: 'Valley' },
  { id: 'nature13', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', label: 'Lake View' },
  { id: 'nature14', url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', label: 'Seascape' },
  // Thời tiết & Bầu trời
  { id: 'sky1', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&q=80', label: 'Clouds' },
  { id: 'sky2', url: 'https://images.unsplash.com/photo-1419833173245-f59e1b93f9ee?w=800&q=80', label: 'Storm' },
  { id: 'sky3', url: 'https://images.unsplash.com/photo-1500740516770-92bd004b996e?w=800&q=80', label: 'Sunrise' },
  { id: 'sky4', url: 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=800&q=80', label: 'Blue Sky' },
  { id: 'sky5', url: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=800&q=80', label: 'Rainbow' },
  // Hoa thêm
  { id: 'flower5', url: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=800&q=80', label: 'Rose Garden' },
  { id: 'flower6', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', label: 'Sunflower' },
  { id: 'flower7', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80', label: 'Lotus' },
  { id: 'flower8', url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80', label: 'Daisy' },
  // Thành phố thêm
  { id: 'city10', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', label: 'Singapore' },
  { id: 'city11', url: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80', label: 'Hong Kong' },
  { id: 'city12', url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80', label: 'Seoul' },
  { id: 'city13', url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80', label: 'Bangkok' },
  // Abstract & Pattern thêm
  { id: 'abstract5', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80', label: 'Colorful Abstract' },
  { id: 'abstract6', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80', label: 'Geometric' },
  { id: 'abstract7', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80', label: 'Pastel' },
  { id: 'abstract8', url: 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&q=80', label: 'Marble' },
  { id: 'abstract9', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80', label: 'Gradient Blue' },
  { id: 'abstract10', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', label: 'Vibrant' },
];

const BackgroundPicker = memo(({
  currentBackgroundColor,
  currentBackgroundImage,
  onBackgroundChange,
  onClose,
  anchorRef,
}: BackgroundPickerProps) => {
  const { t } = useTranslation('dashboard');
  const [activeTab, setActiveTab] = useState<'color' | 'image'>('color');
  const pickerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

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
      <div className="p-3 max-h-[240px] overflow-y-auto">
        {activeTab === 'color' ? (
          <div className="grid grid-cols-4 gap-2">
            {BACKGROUND_COLORS.map((bg) => (
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
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {BACKGROUND_IMAGES.map((bg) => (
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
