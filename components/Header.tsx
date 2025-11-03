import { motion } from 'framer-motion';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const { language } = useLanguage();
  const title = useTranslation({ en: 'My Peta', ms: 'Peta Saya' });
  const visualizingText = useTranslation({ 
    en: 'Visualizing data in a', 
    ms: 'Memvisualisasikan data dengan cara yang' 
  });

  // Translated words for the flip effect
  const words = language === 'en' 
    ? ["Better", "Easier", "Faster", "Smarter"]
    : ["Lebih Baik", "Lebih Mudah", "Lebih Pantas", "Lebih Bijak"];

  return (
    <>
      <h1 className='text-4xl lg:text-8xl font-bold text-center mb-4 text-zinc-800'>
        {title}
      </h1>
      <div className='mb-12'>
        <motion.div className="relative mx-4 my-4 flex items-center justify-center gap-4 text-center sm:mx-0 sm:mb-0">
          <LayoutTextFlip
            text={visualizingText}
            words={words}
          />
        </motion.div>
      </div>
    </>
  );
};

export default Header;


