import { states } from '@/data/states';
import type { DataCategory } from '@/types';
import { getCategoryLabel, getDataValue, formatValue } from '@/lib/helpers';
import MapLegend from './MapLegend';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

interface MalaysiaMapProps {
  activeState: string | null;
  selectedCategory: DataCategory;
  onStateChange: (stateId: string | null) => void;
  getStateData: (stateName: string, category: DataCategory) => any;
  showMapLegend: boolean;
}

// Map category to chart colors
const CATEGORY_COLORS: Record<DataCategory, string> = {
  income_median: '#3b82f6',
  population: '#10b981',
  crime: '#ef4444',
  water_consumption: '#06b6d4',
  expenditure: '#f59e0b'
};

const MalaysiaMap = ({ activeState, selectedCategory, onStateChange, getStateData, showMapLegend = false }: MalaysiaMapProps) => {
  const activeColor = CATEGORY_COLORS[selectedCategory];
  const { language } = useLanguage();
  
  const populationText = useTranslation({ en: 'Population:', ms: 'Populasi:' });
  const federalText = useTranslation({ en: '3 Federal', ms: '3 Persekutuan' });
  const statesText = useTranslation({ en: '13 States', ms: '13 Negeri' });
  const loadingText = useTranslation({ en: 'Loading data...', ms: 'Memuatkan data...' });
  const hoverText = useTranslation({ 
    en: 'Hover over a state or select one...', 
    ms: 'Tunjuk negeri atau pilih satu...' 
  });
  
  return (
    <div className="relative rounded-xl px-0 p-8 pt-36 lg:pt-8 flex flex-col justify-center items-center">
      {/* Malaysia Population */}
      <div className='absolute flex flex-col lg:flex-row gap-0 lg:gap-2 top-4 left-0 font-mono text-[10px] lg:text-xs'>
        <p className='text-zinc-500 dark:text-zinc-400'>🇲🇾 {populationText}</p>
        <p className='tracking-widest font-bold text-zinc-700 dark:text-zinc-300'>34,231,700</p>
      </div>
      {/* States */}
      <div className='absolute flex flex-col lg:flex-row gap-0 lg:gap-2 top-4 right-0 font-mono text-[10px] lg:text-xs'>
        <p className='text-end text-zinc-500 dark:text-zinc-400'>{federalText}</p>
        <p className='text-end text-zinc-500 dark:text-zinc-400 hidden lg:block'>|</p>
        <p className='text-end tracking-widest font-bold text-zinc-700 dark:text-zinc-300'>{statesText}</p>
      </div>
      {/* State name and data display */}
      <div className="absolute top-16 lg:top-20 text-center min-h-[100px] flex flex-col items-center justify-center">
        {activeState ? (
          <div key={activeState} className="animate-fade-in">
            <div 
              className="text-xl lg:text-4xl font-bold mb-0 lg:mb-2" 
              style={{ color: activeColor }}
            >
              {states.find(s => s.id === activeState)?.name}
            </div>
            {(() => {
              const stateName = states.find(s => s.id === activeState)?.name || '';
              const data = getStateData(stateName, selectedCategory);
              return data ? (
                <div className="text-xs lg:text-2xl text-zinc-700 dark:text-zinc-300">
                  <div className="font-semibold text-zinc-500 dark:text-zinc-400 text-xs lg:text-base mb-1">
                    {getCategoryLabel(selectedCategory, language)}
                  </div>
                  <div 
                    className="font-bold" 
                    style={{ color: activeColor }}
                  >
                    {formatValue(getDataValue(data, selectedCategory), selectedCategory, language)}
                  </div>
                </div>
              ) : (
                <div className="text-sm lg:text-base text-zinc-500 dark:text-zinc-400">
                  {loadingText}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="tracking-wide font-bold text-zinc-400 dark:text-zinc-500 mb-2">
            {hoverText}
          </div>
        )}
      </div>

      <div className="relative w-full mt-0 lg:mt-12">
        {/* Interactive Map */}
        <svg
          viewBox="0 0 940 400"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="state-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={activeColor} stopOpacity="0.6" />
              <stop offset="100%" stopColor={activeColor} stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {states.map((state) => {
            const isActive = activeState === state.id;

            return (
              <g key={state.id}>
                <path
                  d={state.path}
                  fill={isActive ? 'url(#state-gradient)' : '#e5e7eb'}
                  stroke={isActive ? activeColor : '#374151'}
                  strokeWidth={isActive ? '2' : '1.5'}
                  className={`transition-all duration-200 cursor-pointer hover:opacity-80 ${!isActive && 'dark:fill-zinc-600 dark:stroke-zinc-400'}`}
                  onMouseEnter={() => onStateChange(state.id)}
                  onMouseLeave={() => { }} // Don't clear state on mouse leave
                />
              </g>
            );
          })}
        </svg>
      </div>

      {showMapLegend &&
        <div className='-mb-4 lg:mb-0'>
          <MapLegend activeColor={activeColor} />
        </div>
      }

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MalaysiaMap;

