import {
  Folder, DollarSign, Book, GraduationCap, Pencil, Leaf,
  Code, Smile, Music, Popcorn, Wrench, Palette,
  Sprout, Flower, Camera, BarChart, Star, Dumbbell,
  ClipboardList, Scale, Search, Plane, Globe, Settings,
  Footprints, FlaskConical, Trophy, Heart, Coffee, Target,
  type LucideIcon
} from 'lucide-react';

export const FOLDER_ICONS: Record<string, LucideIcon> = {
  folder: Folder,
  dollar: DollarSign,
  book: Book,
  graduation: GraduationCap,
  pencil: Pencil,
  leaf: Leaf,
  code: Code,
  smile: Smile,
  music: Music,
  popcorn: Popcorn,
  wrench: Wrench,
  palette: Palette,
  sprout: Sprout,
  flower: Flower,
  camera: Camera,
  chart: BarChart,
  star: Star,
  dumbbell: Dumbbell,
  clipboard: ClipboardList,
  scale: Scale,
  search: Search,
  plane: Plane,
  globe: Globe,
  settings: Settings,
  footprints: Footprints,
  flask: FlaskConical,
  trophy: Trophy,
  heart: Heart,
  coffee: Coffee,
  target: Target,
};

export const FOLDER_COLORS: Record<string, string> = {
  blue: 'text-blue-500 border-blue-500',
  green: 'text-green-500 border-green-500',
  red: 'text-red-500 border-red-500',
  yellow: 'text-yellow-500 border-yellow-500',
  purple: 'text-purple-500 border-purple-500',
  pink: 'text-pink-500 border-pink-500',
  orange: 'text-orange-500 border-orange-500',
  gray: 'text-gray-500 border-gray-500',
};

export const getFolderIcon = (iconName: string): LucideIcon => {
  return FOLDER_ICONS[iconName] || Folder;
};

export const getFolderColorClass = (color: string): string => {
  return FOLDER_COLORS[color] || FOLDER_COLORS.blue;
};
