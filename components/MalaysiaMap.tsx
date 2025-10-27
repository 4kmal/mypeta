import { states } from '@/data/states';
import type { DataCategory } from '@/types';
import { getCategoryLabel, getDataValue, formatValue } from '@/lib/helpers';
import MapLegend from './MapLegend';

interface MalaysiaMapProps {
  activeState: string | null;
  selectedCategory: DataCategory;
  onStateChange: (stateId: string | null) => void;
  getStateData: (stateName: string, category: DataCategory) => any;
  showMapLegend: boolean;
}

const MalaysiaMap = ({ activeState, selectedCategory, onStateChange, getStateData, showMapLegend = false }: MalaysiaMapProps) => {
  return (
    <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 pt-16 lg:pt-8 flex flex-col justify-center items-center">
      {/* State name and data display */}
      <div className="absolute top-0 lg:top-20 text-center min-h-[100px] flex flex-col items-center justify-center">
        {activeState ? (
          <div className="animate-fade-in">
            <div className="text-xl lg:text-4xl font-bold text-sky-600 dark:text-sky-400 mb-0 lg:mb-2">
              {states.find(s => s.id === activeState)?.name}
            </div>
            {(() => {
              const stateName = states.find(s => s.id === activeState)?.name || '';
              const data = getStateData(stateName, selectedCategory);
              return data ? (
                <div className="text-xs lg:text-2xl text-zinc-700 dark:text-zinc-300">
                  <div className="font-semibold text-zinc-500 dark:text-zinc-400 text-xs lg:text-base mb-1">
                    {getCategoryLabel(selectedCategory)}
                  </div>
                  <div className="font-bold text-sky-600 dark:text-sky-400">
                    {formatValue(getDataValue(data, selectedCategory), selectedCategory)}
                  </div>
                </div>
              ) : (
                <div className="text-sm lg:text-base text-zinc-500 dark:text-zinc-400">
                  Loading data...
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="tracking-wide font-bold text-zinc-400 dark:text-zinc-500 mb-2">
            Hover over a state or select one...
          </div>
        )}
      </div>

      <div className="relative w-full">
        {/* Interactive Map */}
        <svg
          viewBox="0 0 940 400"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {states.map((state) => {
            const isActive = activeState === state.id;
            
            return (
              <g key={state.id}>
                <path
                  d={state.path}
                  fill={isActive ? '#0ea5e9' : '#e5e7eb'}
                  stroke="#374151"
                  strokeWidth="1.5"
                  className={`transition-all duration-200 cursor-pointer hover:fill-sky-500 dark:hover:fill-sky-400 ${
                    isActive 
                      ? 'dark:fill-sky-500' 
                      : 'dark:fill-zinc-600'
                  } dark:stroke-zinc-400`}
                  onMouseEnter={() => onStateChange(state.id)}
                  onMouseLeave={() => { }} // Don't clear state on mouse leave
                />
              </g>
            );
          })}
        </svg>
      </div>

      {showMapLegend &&
        <div className='-mb-4'>
          <MapLegend />
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
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MalaysiaMap;

