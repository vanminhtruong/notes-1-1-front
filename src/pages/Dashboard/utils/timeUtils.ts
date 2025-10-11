export const getTimeAgo = (date: string, lang: string): string => {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  const timeUnits = {
    vi: {
      justNow: 'vừa xong',
      minutesAgo: (n: number) => `${n} phút trước`,
      hoursAgo: (n: number) => `${n} giờ trước`,
      daysAgo: (n: number) => `${n} ngày trước`,
      monthsAgo: (n: number) => `${n} tháng trước`,
      yearsAgo: (n: number) => `${n} năm trước`,
    },
    en: {
      justNow: 'just now',
      minutesAgo: (n: number) => `${n} minute${n > 1 ? 's' : ''} ago`,
      hoursAgo: (n: number) => `${n} hour${n > 1 ? 's' : ''} ago`,
      daysAgo: (n: number) => `${n} day${n > 1 ? 's' : ''} ago`,
      monthsAgo: (n: number) => `${n} month${n > 1 ? 's' : ''} ago`,
      yearsAgo: (n: number) => `${n} year${n > 1 ? 's' : ''} ago`,
    },
    ko: {
      justNow: '방금 전',
      minutesAgo: (n: number) => `${n}분 전`,
      hoursAgo: (n: number) => `${n}시간 전`,
      daysAgo: (n: number) => `${n}일 전`,
      monthsAgo: (n: number) => `${n}개월 전`,
      yearsAgo: (n: number) => `${n}년 전`,
    },
  };

  const units = timeUnits[lang as keyof typeof timeUnits] || timeUnits.en;
  
  if (seconds < 60) return units.justNow;
  if (seconds < 3600) return units.minutesAgo(Math.floor(seconds / 60));
  if (seconds < 86400) return units.hoursAgo(Math.floor(seconds / 3600));
  if (seconds < 2592000) return units.daysAgo(Math.floor(seconds / 86400));
  if (seconds < 31536000) return units.monthsAgo(Math.floor(seconds / 2592000));
  return units.yearsAgo(Math.floor(seconds / 31536000));
};
