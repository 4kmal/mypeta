import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const LanguageToggleButton = () => {
  const { language, toggleLanguage, isTranslating } = useLanguage();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClick = () => {
    console.log('Language toggle clicked. Current:', language);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    toggleLanguage();
    setShowConfirmDialog(false);
    console.log('Language toggled to:', language === 'en' ? 'ms' : 'en');
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isTranslating}
        className="cursor-pointer flex items-center gap-2 px-3 py-3 md:p-2 rounded-lg shadow-md bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`Switch to ${language === 'en' ? 'Bahasa Malaysia' : 'English'}`}
      >
        <div className="relative w-6 h-6 flex-shrink-0">
          {/* English (EN) */}
          <motion.div
            className="absolute inset-0 w-6 h-6 flex items-center justify-center"
            initial={false}
            animate={{
              opacity: language === 'ms' ? 1 : 0,
              rotate: language === 'ms' ? 0 : 180,
              scale: language === 'ms' ? 1 : 0.8
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            <span className="absolute font-mono font-bold text-zinc-500 dark:text-zinc-400">
              EN
            </span>
          </motion.div>

          {/* Malay (BM) */}
          <motion.div
            className="absolute inset-0 w-6 h-6 flex items-center justify-center"
            initial={false}
            animate={{
              opacity: language === 'en' ? 1 : 0,
              rotate: language === 'en' ? 0 : -180,
              scale: language === 'en' ? 1 : 0.8
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            <span className="absolute font-mono font-bold text-zinc-500 dark:text-zinc-400">
              BM
            </span>
          </motion.div>
        </div>
        <span className="md:hidden font-semibold text-zinc-500 dark:text-zinc-300">
          {language === 'en' ? 'Bahasa Malaysia' : 'English'}
        </span>
        {isTranslating && (
          <motion.div
            className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
              {language === 'en' ? 'Switch to Bahasa Malaysia?' : 'Tukar ke English?'}
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">
              {language === 'en' 
                ? 'The entire website will be translated to Bahasa Malaysia. You can switch back anytime.'
                : 'Keseluruhan laman web akan ditukar ke English. Anda boleh tukar balik pada bila-bila masa.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <button
              onClick={handleCancel}
              className="cursor-pointer flex-1 px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 rounded-lg font-medium transition-colors"
            >
              {language === 'en' ? 'Cancel' : 'Batal'}
            </button>
            <button
              onClick={handleConfirm}
              className="cursor-pointer flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {language === 'en' ? 'Switch Language' : 'Tukar Bahasa'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LanguageToggleButton;
