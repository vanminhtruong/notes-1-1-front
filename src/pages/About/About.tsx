import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  Users, 
  Shield, 
  Zap, 
  Heart, 
  Star,
  CheckCircle,
  Target,
  Globe,
  Award
} from 'lucide-react';
import LazyLoad from '@/components/LazyLoad';

const About = () => {
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

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-black dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md-down:py-10 sm-down:py-8 xs-down:py-6">
        {/* Hero Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={0}>
          <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl sm-down:text-3xl xs-down:text-2xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-xl sm-down:text-lg xs-down:text-base text-gray-600 dark:text-gray-300 mb-8 xs-down:mb-6 max-w-3xl mx-auto px-2">
            {t('hero.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 dark:text-gray-300 font-medium xs-down:text-sm">
              {t('hero.rating')}
            </span>
          </div>
          </div>
        </LazyLoad>

        {/* Stats Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm-down:gap-4 xs-down:gap-3 mb-16 xs-down:mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 sm-down:p-5 xs-down:p-4 border border-white/20 dark:border-gray-700/30 text-center">
              <div className="text-3xl xs-down:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm xs-down:text-xs text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </div>
          ))}
          </div>
        </LazyLoad>

        {/* Mission Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={200}>
          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30 mb-16 xs-down:mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
              {t('mission.title')}
            </h2>
            <p className="text-lg sm-down:text-base xs-down:text-sm text-gray-600 dark:text-gray-300 max-w-4xl mx-auto px-2">
              {t('mission.description')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm-down:gap-6 xs-down:gap-5">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg xs-down:text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 xs-down:text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </LazyLoad>

        {/* Values Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={300}>
          <div className="mb-16 xs-down:mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
              {t('values.title')}
            </h2>
            <p className="text-lg sm-down:text-base xs-down:text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-2">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm-down:gap-6 xs-down:gap-5">
            {values.map((value, index) => (
              <div key={index} className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30 text-center hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl xs-down:text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 xs-down:text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
          </div>
        </LazyLoad>

        {/* Why Choose Us Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={400}>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 sm-down:p-6 xs-down:p-5 text-white mb-16 xs-down:mb-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold mb-6 xs-down:mb-4">
              {t('whyChoose.title')}
            </h2>
            <p className="text-xl sm-down:text-lg xs-down:text-base opacity-90 max-w-3xl mx-auto px-2">
              {t('whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm-down:gap-5 xs-down:gap-4">
            {[
              t('whyChoose.items.easy'),
              t('whyChoose.items.fast'),
              t('whyChoose.items.secure'),
              t('whyChoose.items.reliable'),
              t('whyChoose.items.support'),
              t('whyChoose.items.updates'),
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 xs-down:gap-2">
                <CheckCircle className="w-6 h-6 xs-down:w-5 xs-down:h-5 text-green-300 flex-shrink-0" />
                <span className="text-white/90 xs-down:text-sm">{item}</span>
              </div>
            ))}
          </div>
          </div>
        </LazyLoad>

        {/* Team Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={500}>
          <div className="text-center mb-16 xs-down:mb-10">
          <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
            {t('team.title')}
          </h2>
          <p className="text-lg sm-down:text-base xs-down:text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 xs-down:mb-8 px-2">
            {t('team.description')}
          </p>

          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-center gap-4 xs-down:gap-3 mb-6 xs-down:mb-4">
              <Award className="w-8 h-8 xs-down:w-7 xs-down:h-7 text-yellow-500" />
              <h3 className="text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white">
                {t('team.award.title')}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg xs-down:text-base">
              {t('team.award.description')}
            </p>
          </div>
          </div>
        </LazyLoad>

        {/* Contact Section */}
        <LazyLoad threshold={0.1} rootMargin="50px" animationDuration={500} delay={600}>
          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 sm-down:p-6 xs-down:p-5 border border-white/20 dark:border-gray-700/30 text-center">
          <h2 className="text-3xl md:text-4xl sm-down:text-2xl xs-down:text-xl font-bold text-gray-900 dark:text-white mb-6 xs-down:mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-lg sm-down:text-base xs-down:text-sm text-gray-600 dark:text-gray-300 mb-8 xs-down:mb-6 max-w-2xl mx-auto px-2">
            {t('contact.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 xs-down:gap-3 justify-center">
            <button className="px-8 xs-down:px-6 py-3 xs-down:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-semibold">
              {t('contact.button.primary')}
            </button>
            <button className="px-8 xs-down:px-6 py-3 xs-down:py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold">
              {t('contact.button.secondary')}
            </button>
          </div>
          </div>
        </LazyLoad>
      </div>
    </div>
  );
};

export default About;
