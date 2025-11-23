import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Newspaper, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import NewsCard from '@/components/NewsCard';
import NewsFilters from '@/components/NewsFilters';
import NewsLoadingSkeleton from '@/components/NewsLoadingSkeleton';
import FeaturedNews from '@/components/FeaturedNews';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useTranslation } from '@/hooks/useTranslation';
import type { NewsItem } from '@/pages/api/news/fetch';

const NewsPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'thestar',
    'bernama',
    'bbc',
  ]);

  // Translations
  const pageTitle = useTranslation({
    en: 'News - My Peta',
    ms: 'Berita - Peta Saya',
  });

  const newsTitle = useTranslation({
    en: 'Latest News',
    ms: 'Berita Terkini',
  });

  const newsSubtitle = useTranslation({
    en: 'Stay updated with the latest news from Malaysia and around the world',
    ms: 'Kekal terkini dengan berita terbaru dari Malaysia dan seluruh dunia',
  });

  const loadingText = useTranslation({
    en: 'Loading news...',
    ms: 'Memuatkan berita...',
  });

  const refreshText = useTranslation({
    en: 'Refresh News',
    ms: 'Muat Semula Berita',
  });

  const noNewsText = useTranslation({
    en: 'No news available. Try selecting different sources.',
    ms: 'Tiada berita tersedia. Cuba pilih sumber yang berbeza.',
  });

  const trendingText = useTranslation({
    en: 'Trending Now',
    ms: 'Trending Sekarang',
  });

  // Fetch news
  const fetchNews = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const sourcesParam = selectedSources.join(',');
      const response = await fetch(`/api/news/fetch?sources=${sourcesParam}`);
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Expected JSON response but received: ' + contentType);
      }
      
      const data = await response.json();

      if (data.success) {
        setNews(data.news);
      } else {
        console.error('API returned error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      // Show empty state instead of crashing
      setNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedSources]);

  const handleSourceToggle = (source: string) => {
    setSelectedSources((prev) => {
      if (prev.includes(source)) {
        // Don't allow removing all sources
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== source);
      } else {
        return [...prev, source];
      }
    });
  };

  const handleRefresh = () => {
    fetchNews(false);
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Stay updated with the latest news from Malaysia and around the world. Read news from The Star, Bernama, BBC, Reuters, and more."
        />
        <meta
          name="keywords"
          content="Malaysia news, latest news, breaking news, world news, local news, berita terkini"
        />
      </Head>

      <div className="min-h-screen bg-zinc-100 dark:bg-[#111114] pb-20 md:pb-12">
        <PageHeader showPollsButton={true} showDataButton={true} />

        <div className="max-w-7xl mx-auto px-4 pt-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="bg-purple-600 p-6 rounded-3xl shadow-2xl"
              >
                <Newspaper className="w-16 h-16 text-white" />
              </motion.div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              {newsTitle}
            </h1>

            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-6">
              {newsSubtitle}
            </p>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center gap-6 flex-wrap"
            >
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-6 py-3 rounded-full shadow-md border border-zinc-200 dark:border-zinc-800">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {news.length} Articles
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-6 py-3 rounded-full shadow-md border border-zinc-200 dark:border-zinc-800">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedSources.length} Sources
                </span>
              </div>

              <motion.button
                onClick={handleRefresh}
                disabled={refreshing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-full shadow-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                />
                {refreshText}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <NewsFilters
            selectedSources={selectedSources}
            onSourceToggle={handleSourceToggle}
          />

          {/* Loading State */}
          {loading && <NewsLoadingSkeleton />}

          {/* News Grid */}
          {!loading && news.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Featured News */}
              {news[0] && <FeaturedNews news={news[0]} />}

              {/* Rest of the news */}
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {trendingText}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {news.slice(1).map((item, index) => (
                  <NewsCard key={`${item.link}-${index}`} news={item} index={index} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && news.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="bg-zinc-200 dark:bg-zinc-800 p-8 rounded-full mb-6">
                <Newspaper className="w-16 h-16 text-zinc-400 dark:text-zinc-600" />
              </div>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 text-center max-w-md">
                {noNewsText}
              </p>
            </motion.div>
          )}

          <Footer />
        </div>

        <MobileBottomNav />
      </div>
    </>
  );
};

export default NewsPage;

