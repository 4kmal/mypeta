import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface NewsFiltersProps {
  selectedSources: string[];
  onSourceToggle: (source: string) => void;
}

const NEWS_SOURCES = [
  { id: 'thestar', name: 'The Star', color: 'bg-blue-500', flag: '🇲🇾' },
  { id: 'bernama', name: 'Bernama', color: 'bg-green-500', flag: '🇲🇾' },
  { id: 'malaysiakini', name: 'Malaysiakini', color: 'bg-yellow-500', flag: '🇲🇾' },
  { id: 'nst', name: 'NST', color: 'bg-purple-500', flag: '🇲🇾' },
  { id: 'malay_mail', name: 'Malay Mail', color: 'bg-red-500', flag: '🇲🇾' },
  { id: 'bbc', name: 'BBC', color: 'bg-black dark:bg-zinc-800', flag: '🌍' },
  { id: 'reuters', name: 'Reuters', color: 'bg-orange-500', flag: '🌍' },
  { id: 'aljazeera', name: 'Al Jazeera', color: 'bg-teal-500', flag: '🌍' },
];

const NewsFilters = ({ selectedSources, onSourceToggle }: NewsFiltersProps) => {
  const filterSourcesText = useTranslation({ 
    en: 'Filter News Sources', 
    ms: 'Tapis Sumber Berita' 
  });
  
  const malaysianText = useTranslation({ 
    en: 'Malaysian News', 
    ms: 'Berita Malaysia' 
  });
  
  const internationalText = useTranslation({ 
    en: 'International News', 
    ms: 'Berita Antarabangsa' 
  });

  const malaysianSources = NEWS_SOURCES.filter(s => s.flag === '🇲🇾');
  const internationalSources = NEWS_SOURCES.filter(s => s.flag === '🌍');

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {filterSourcesText}
        </h3>
        
        {/* Malaysian Sources */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <span className="text-xl">🇲🇾</span>
            {malaysianText}
          </h4>
          <div className="flex flex-wrap gap-2">
            {malaysianSources.map((source) => (
              <motion.button
                key={source.id}
                onClick={() => onSourceToggle(source.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${selectedSources.includes(source.id)
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {source.name}
                  {selectedSources.includes(source.id) && (
                    <Check className="w-4 h-4" />
                  )}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* International Sources */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
            <span className="text-xl">🌍</span>
            {internationalText}
          </h4>
          <div className="flex flex-wrap gap-2">
            {internationalSources.map((source) => (
              <motion.button
                key={source.id}
                onClick={() => onSourceToggle(source.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${selectedSources.includes(source.id)
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {source.name}
                  {selectedSources.includes(source.id) && (
                    <Check className="w-4 h-4" />
                  )}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsFilters;

