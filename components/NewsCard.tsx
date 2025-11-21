import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { NewsItem } from '@/pages/api/news/fetch';

interface NewsCardProps {
  news: NewsItem;
  index: number;
}

const NewsCard = ({ news, index }: NewsCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins} minutes ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
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
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full">
        <a 
          href={news.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block h-full"
        >
          <CardContent className="p-0 h-full flex flex-col">
            {/* Image */}
            {news.imageUrl ? (
              <div className="relative w-full h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={news.imageUrl}
                  alt={news.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className={`${getSourceColor(news.source)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                    {getSourceName(news.source)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                <div className="text-6xl text-zinc-300 dark:text-zinc-700">📰</div>
                <div className="absolute top-3 left-3">
                  <span className={`${getSourceColor(news.source)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                    {getSourceName(news.source)}
                  </span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
              {/* Title */}
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {news.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3 flex-grow">
                {news.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(news.pubDate)}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                  <span className="font-medium">Read more</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </CardContent>
        </a>
      </Card>
    </motion.div>
  );
};

export default NewsCard;

