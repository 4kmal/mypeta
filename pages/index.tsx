import { useData } from '@/contexts/DataContext';
import CategorySelectorDialog from '@/components/CategorySelectorDialog';
import StateSelectorDialog from '@/components/StateSelector';
import MalaysiaMap from '@/components/MalaysiaMap';
import ChartSection from '@/components/ChartSection';
import Footer from '@/components/Footer';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { motion } from 'framer-motion';
import { useState } from 'react';

const Home = () => {
  const {
    activeState,
    selectedCategory,
    selectedChartType,
    setActiveState,
    setSelectedCategory,
    setSelectedChartType,
    getStateData,
    chartData
  } = useData();

  const [isProMode, setIsProMode] = useState(false);

  const darkColor = 'oklch(18.1% 0.005 285.823)';

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[${darkColor}] pb-12"
      style={{ backgroundColor: darkColor }}>

      <div className='bg-white dark:bg-zinc-900 mx-auto'>
        <div className='flex items-center justify-between max-w-6xl mx-auto p-4'>
          <h1 className='text-xl tracking-widest uppercase font-bold text-center text-zinc-800 dark:text-zinc-200'>
            Data Malaysia
          </h1>
          <ThemeToggleButton />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-12">

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-1 shadow-md border-0 relative">
            <div className="flex relative">
              {/* Sliding Background */}
              <motion.div
                className="absolute top-0 left-0 bg-sky-500 dark:bg-zinc-950 rounded-md shadow-sm"
                initial={false}
                animate={{
                  x: isProMode ? '100%' : '0%',
                  width: '50%'
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30
                }}
                style={{
                  height: '100%'
                }}
              />

              <button
                onClick={() => setIsProMode(false)}
                className={`relative z-10 cursor-pointer px-8 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${!isProMode
                  ? 'text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
              >
                Basic
              </button>
              <button
                onClick={() => setIsProMode(true)}
                className={`pr-9 text-center relative z-10 cursor-pointer px-8 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isProMode
                  ? 'text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
              >
                Pro
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <div className="w-80">
            <CategorySelectorDialog
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
          <div className="w-80">
            <StateSelectorDialog
              selectedState={activeState}
              onStateChange={setActiveState}
            />
          </div>
        </div>

        <MalaysiaMap
          activeState={activeState}
          selectedCategory={selectedCategory}
          onStateChange={setActiveState}
          getStateData={getStateData}
          showMapLegend={true}
        />


        {isProMode && (
          <ChartSection
            selectedState={activeState || 'selangor'}
            selectedChartType={selectedChartType}
            chartData={chartData}
          />
        )}

        <Footer />

        {/* Footer Branding */}
        <div className="flex lg:justify-end justify-center mt-8 lg:-mt-12">
          <div className="border-2 border-x-0 border-white/10 rounded-full p-2 px-6 bg-white/5">
            <p className="text-xs text-white font-bold tracking-wide">
              POWERED BY <span className="text-orange-400 italic">RAPID</span>SCREEN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;