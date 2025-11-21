import Link from 'next/link';
import Lottie from 'lottie-react';
import AuthButton from '@/components/AuthButton';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import LanguageToggleButton from '@/components/LanguageToggleButton';
import { TrendingUp, BarChart3, Newspaper } from 'lucide-react';
import globeAnimationData from '@/public/lottie/globe.json';

interface PageHeaderProps {
  showPollsButton?: boolean;
  showDataButton?: boolean;
  showNewsButton?: boolean;
}

const PageHeader = ({ showPollsButton = false, showDataButton = false, showNewsButton = false }: PageHeaderProps) => {
  return (
    <div className='bg-gradient-to-b from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950 mx-auto'>
      <div className='flex items-center justify-between max-w-6xl mx-auto p-4'>
        <Link href="/" className='relative cursor-pointer hover:opacity-80 transition-opacity'>
          <div className='relative'>
            <div className='w-8 h-8 absolute -left-10 -top-8.5'>
              <Lottie animationData={globeAnimationData} loop={true} style={{ width: '300%', height: '300%' }} />
            </div>
            <h1 className='ml-8 text-xl font-mono uppercase font-bold text-center text-zinc-800 dark:text-zinc-200'>
              My Peta
            </h1>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {showPollsButton && (
            <Link href="/polls">
              <button className="cursor-pointer flex items-center px-4 py-2 rounded-lg gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Polls</span>
              </button>
            </Link>
          )}
          {showDataButton && (
            <Link href="/">
              <button className="cursor-pointer flex items-center px-4 py-2 rounded-lg gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 shadow-md hover:shadow-lg transition-all">
                <BarChart3 className="h-4 w-4" />
                <span className="font-semibold">Data</span>
              </button>
            </Link>
          )}
          {showNewsButton && (
            <Link href="/news">
              <button className="cursor-pointer flex items-center px-4 py-2 rounded-lg gap-2 bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 shadow-md hover:shadow-lg transition-all">
                <Newspaper className="h-4 w-4" />
                <span className="font-semibold">News</span>
              </button>
            </Link>
          )}
          <AuthButton />
          <LanguageToggleButton />
          <ThemeToggleButton />
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

