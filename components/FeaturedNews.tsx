import { motion } from 'framer-motion';
import { ExternalLink, Clock, TrendingUp } from 'lucide-react';
import type { NewsItem } from '@/pages/api/news/fetch';

interface FeaturedNewsProps {
  news: NewsItem;
}

const FeaturedNews = ({ news }: FeaturedNewsProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 60) {
        return `${diffMins} minutes ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return dateString;
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      malaysiakini: 'bg-yellow-500',
      thestar: 'bg-blue-500',
      bernama: 'bg-green-500',
      nst: 'bg-purple-500',
      malay_mail: 'bg-red-500',
      bbc: 'bg-black dark:bg-zinc-800',
      reuters: 'bg-orange-500',
      aljazeera: 'bg-teal-500',
    };
    return colors[source] || 'bg-zinc-500';
  };

  const getSourceName = (source: string) => {
    const names: Record<string, string> = {
      malaysiakini: 'Malaysiakini',
      thestar: 'The Star',
      bernama: 'Bernama',
      nst: 'NST',
      malay_mail: 'Malay Mail',
      bbc: 'BBC',
      reuters: 'Reuters',
      aljazeera: 'Al Jazeera',
    };
    return names[source] || source;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Breaking News
        </h2>
      </div>

      <a 
        href={news.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block group"
      >
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 hover:shadow-3xl transition-shadow duration-300">
          {/* Featured Image/Gradient */}
          <div className="relative h-80 md:h-96 overflow-hidden">
            {news.imageUrl ? (
              <>
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <div className="text-8xl text-white/20">📰</div>
              </div>
            )}

            {/* Badge */}
            <div className="absolute top-4 left-4">
              <span className={`${getSourceColor(news.source)} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2`}>
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                {getSourceName(news.source)}
              </span>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 line-clamp-3 group-hover:text-blue-300 transition-colors">
                {news.title}
              </h1>
              
              <p className="text-lg text-zinc-200 mb-4 line-clamp-2">
                {news.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(news.pubDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                  <span className="font-semibold">Read Full Story</span>
                  <ExternalLink className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
};

export default FeaturedNews;

