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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-current" />
            ))}
            <span className="ml-2 text-gray-600 dark:text-gray-300 font-medium">
              {t('hero.rating')}
            </span>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission Section */}
        <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 dark:border-gray-700/30 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {t('mission.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              {t('mission.description')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {t('values.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/30 text-center hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('whyChoose.title')}
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t('whyChoose.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              t('whyChoose.items.easy'),
              t('whyChoose.items.fast'),
              t('whyChoose.items.secure'),
              t('whyChoose.items.reliable'),
              t('whyChoose.items.support'),
              t('whyChoose.items.updates'),
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                <span className="text-white/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('team.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            {t('team.description')}
          </p>

          <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/30">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Award className="w-8 h-8 text-yellow-500" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('team.award.title')}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {t('team.award.description')}
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white/70 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 dark:border-gray-700/30 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
            {t('contact.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('contact.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-semibold">
              {t('contact.button.primary')}
            </button>
            <button className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold">
              {t('contact.button.secondary')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
