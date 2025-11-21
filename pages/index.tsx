import Head from 'next/head';
import { useData } from '@/contexts/DataContext';
import CategorySelectorDialog from '@/components/CategorySelectorDialog';
import StateSelectorDialog from '@/components/StateSelector';
import MalaysiaMap from '@/components/MalaysiaMap';
import ChartSection from '@/components/ChartSection';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useState } from 'react';
import { SEO_CONFIG, STRUCTURED_DATA } from '@/lib/seo';
import { useTranslation } from '@/hooks/useTranslation';

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

  const [isProMode, setIsProMode] = useState(true);

  // Translations
  // const basicText = useTranslation({ en: 'Basic', ms: 'Asas' });
  // const proText = useTranslation({ en: 'Pro', ms: 'Pro' });
  const selectCategoryText = useTranslation({ 
    en: 'Select Category', 
    ms: 'Pilih Kategori' 
  });
  const selectStateText = useTranslation({ 
    en: 'Select State', 
    ms: 'Pilih Negeri' 
  });

  // Map category to colors
  const CATEGORY_COLORS: Record<string, string> = {
    income_median: '#3b82f6',
    population: '#10b981',
    crime: '#ef4444',
    water_consumption: '#06b6d4',
    expenditure: '#f59e0b'
  };

  const activeColor = CATEGORY_COLORS[selectedCategory] || '#3b82f6';


  return (
    <>
      <Head>
        <title>{SEO_CONFIG.title}</title>
        <meta name="description" content={SEO_CONFIG.description} />
        <meta name="keywords" content={SEO_CONFIG.keywords} />
        <link rel="canonical" href={SEO_CONFIG.url} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />

        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="content-language" content="en" />
        <meta name="format-detection" content="telephone=no" />
      </Head>

      <div className="min-h-screen bg-zinc-100 dark:bg-[#111114] pb-20 md:pb-12">
        <PageHeader showPollsButton={true} showNewsButton={true} />

        <div className="max-w-6xl mx-auto px-4 pt-0">

          {/* Mode Toggle */}
          {/* <div className="flex justify-center mb-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-1 shadow-md border-0 relative">
              <div className="flex relative">
                <motion.div
                  className="absolute top-0 left-0 bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-zinc-800 dark:to-zinc-700 rounded-md shadow-sm"
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
                  {basicText}
                </button>
                <button
                  onClick={() => setIsProMode(true)}
                  className={`pr-9 text-center relative z-10 cursor-pointer px-8 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isProMode
                    ? 'text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                >
                  {proText}
                </button>
              </div>
            </div>
          </div> */}

          <MalaysiaMap
            activeState={activeState}
            selectedCategory={selectedCategory}
            onStateChange={setActiveState}
            getStateData={getStateData}
            showMapLegend={true}
          />

          <div className="flex justify-center gap-2 mt-2 mb-8">
            <div className="w-full">
              <p className='text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'>{selectCategoryText}</p>
              <CategorySelectorDialog
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            <div className="w-full">
              <p className='text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1'>{selectStateText}</p>
              <StateSelectorDialog
                selectedState={activeState}
                onStateChange={setActiveState}
              />
            </div>
          </div>


          {isProMode && (
            <ChartSection
              selectedState={activeState || 'selangor'}
              selectedChartType={selectedChartType}
              activeColor={activeColor}
              chartData={chartData}
            />
          )}

          <Footer />

        </div>

        <MobileBottomNav />
      </div>
    </>
  );
};

export default Home;