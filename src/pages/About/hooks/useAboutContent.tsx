import { useTranslation } from 'react-i18next';
import { BookOpen, Users, Shield, Zap, Heart, Target, Globe } from 'lucide-react';

export function useAboutContent() {
  const { t } = useTranslation('about');
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: t('features.notes.title'),
      description: t('features.notes.description'),
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('features.collaboration.title'),
      description: t('features.collaboration.description'),
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('features.security.title'),
      description: t('features.security.description'),
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('features.performance.title'),
      description: t('features.performance.description'),
    },
  ];

  const stats = [
    { number: '10K+', label: t('stats.users') },
    { number: '50K+', label: t('stats.notes') },
    { number: '99.9%', label: t('stats.uptime') },
    { number: '24/7', label: t('stats.support') },
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: t('values.passion.title'),
      description: t('values.passion.description'),
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: t('values.innovation.title'),
      description: t('values.innovation.description'),
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t('values.accessibility.title'),
      description: t('values.accessibility.description'),
    },
  ];

  return { t, features, stats, values };
}
