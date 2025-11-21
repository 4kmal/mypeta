import { useRouter } from 'next/router';
import { BarChart3, TrendingUp, User, Newspaper } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const MobileBottomNav = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  const chartsText = useTranslation({ en: 'Charts', ms: 'Carta' });
  const pollsText = useTranslation({ en: 'Polls', ms: 'Undian' });
  const newsText = useTranslation({ en: 'News', ms: 'Berita' });
  const profileText = useTranslation({ en: 'Profile', ms: 'Profil' });

  const navItems = [
    {
      name: chartsText,
      icon: BarChart3,
      path: '/',
      active: currentPath === '/'
    },
    {
      name: pollsText,
      icon: TrendingUp,
      path: '/polls',
      active: currentPath === '/polls'
    },
    {
      name: newsText,
      icon: Newspaper,
      path: '/news',
      active: currentPath === '/news'
    },
    {
      name: profileText,
      icon: User,
      path: '/profile',
      active: currentPath === '/profile'
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all ${
                item.active
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <div className={`relative ${item.active ? 'scale-110' : ''} transition-transform`}>
                <Icon className="h-6 w-6" strokeWidth={item.active ? 2.5 : 2} />
                {item.active && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${item.active ? 'font-semibold' : ''}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;


