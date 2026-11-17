import { useTranslation } from 'react-i18next';
import { Sparkles, FileText, MessageCircle, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { icon: FileText, title: 'featureNotesTitle', desc: 'featureNotesDesc' },
  { icon: MessageCircle, title: 'featureChatTitle', desc: 'featureChatDesc' },
  { icon: ShieldCheck, title: 'featureSecureTitle', desc: 'featureSecureDesc' },
] as const;

const DOT_PATTERN = {
  backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
  WebkitMaskImage: 'linear-gradient(to bottom, #000, transparent 75%)',
  maskImage: 'linear-gradient(to bottom, #000, transparent 75%)',
} as const;

interface ShowcaseProps {
  /** Translation keys (namespace "auth") for the hero text; default to the register copy. */
  titleKey?: string;
  subtitleKey?: string;
}

/** Brand panel shown beside the form on large screens only. */
export default function RegisterShowcase({ titleKey = 'registerHeroTitle', subtitleKey = 'registerHeroSubtitle' }: ShowcaseProps) {
  const { t } = useTranslation('auth');

  return (
    <aside
      className="relative hidden overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-10 text-white dark:from-purple-800 dark:via-indigo-900 dark:to-blue-900 lg:flex lg:flex-col lg:justify-between [@media(min-width:1024px)_and_(max-height:780px)]:p-8"
    >
      {/* Decorative layers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.14]" style={DOT_PATTERN} />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl dark:bg-blue-500/20" />

      {/* Brand */}
      <div className="relative flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-lg font-bold tracking-tight">PlantHub</p>
          <p className="text-xs text-white/75">{t('registerBrandTag')}</p>
        </div>
      </div>

      {/* Hero + features */}
      <div className="relative mt-8">
        <h2 className="text-3xl font-bold leading-tight tracking-tight xl:text-[2rem] [@media(min-width:1024px)_and_(max-height:780px)]:text-2xl">{t(titleKey)}</h2>
        <p className="reg-hero-sub mt-3 max-w-md text-sm leading-relaxed text-white/80">{t(subtitleKey)}</p>

        <ul className="mt-7 space-y-3 [@media(min-width:1024px)_and_(max-height:780px)]:mt-5 [@media(min-width:1024px)_and_(max-height:780px)]:space-y-2.5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex items-start gap-3.5 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur-sm transition-colors duration-200 hover:bg-white/15"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{t(title)}</span>
                <span className="reg-feature-desc mt-0.5 block text-[13px] leading-snug text-white/75">{t(desc)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
