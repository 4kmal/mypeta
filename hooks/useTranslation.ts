import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateText } from '@/lib/translation';

/**
 * Custom hook for translating text in components
 * 
 * @param text - The text to translate (or object with en/ms keys)
 * @param autoTranslate - Whether to automatically translate when language changes
 * @returns The translated text
 * 
 * @example
 * // Simple usage with auto-translation
 * const title = useTranslation('Welcome to My Peta');
 * 
 * @example
 * // Pre-defined translations (recommended for common strings)
 * const title = useTranslation({ en: 'Welcome', ms: 'Selamat Datang' });
 * 
 * @example
 * // Manual translation control
 * const { translatedText, translate, isTranslating } = useTranslation(
 *   'Some dynamic text',
 *   { autoTranslate: false, returnObject: true }
 * );
 */
export function useTranslation(
  text: string | { en: string; ms: string },
  options?: {
    autoTranslate?: boolean;
    returnObject?: boolean;
  }
): any {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const autoTranslate = options?.autoTranslate !== false;
  const returnObject = options?.returnObject || false;

  useEffect(() => {
    // If text is an object with pre-defined translations, use them directly
    if (typeof text === 'object' && text !== null && 'en' in text && 'ms' in text) {
      setTranslatedText(text[language]);
      return;
    }

    // If language is English or auto-translate is off, return original text
    if (language === 'en' || !autoTranslate) {
      setTranslatedText(text as string);
      return;
    }

    // Translate the text
    const performTranslation = async () => {
      setIsTranslating(true);
      try {
        const result = await translateText(text as string, {
          source: 'en',
          target: language,
        });
        setTranslatedText(result as string);
      } catch (error) {
        console.error('Translation error in useTranslation:', error);
        setTranslatedText(text as string);
      } finally {
        setIsTranslating(false);
      }
    };

    performTranslation();
  }, [text, language, autoTranslate]);

  // Manual translate function
  const translate = async (newText?: string) => {
    const textToTranslate = newText || text;
    
    if (typeof textToTranslate === 'object') {
      setTranslatedText(textToTranslate[language]);
      return;
    }

    if (language === 'en') {
      setTranslatedText(textToTranslate);
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateText(textToTranslate, {
        source: 'en',
        target: language,
      });
      setTranslatedText(result as string);
    } catch (error) {
      console.error('Manual translation error:', error);
      setTranslatedText(textToTranslate);
    } finally {
      setIsTranslating(false);
    }
  };

  if (returnObject) {
    return {
      translatedText,
      isTranslating,
      translate,
    };
  }

  return translatedText;
}

/**
 * Hook for translating multiple texts at once
 * More efficient than calling useTranslation multiple times
 */
export function useTranslations(
  texts: Record<string, string | { en: string; ms: string }>
): Record<string, string> {
  const { language } = useLanguage();
  
  // Create stable initial translations from pre-defined texts
  const initialTranslations = useMemo(() => {
    const initial: Record<string, string> = {};
    Object.entries(texts).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null && 'en' in value && 'ms' in value) {
        initial[key] = value[language];
      } else {
        initial[key] = value as string;
      }
    });
    return initial;
  }, [language]); // Only depend on language
  
  const [translations, setTranslations] = useState<Record<string, string>>(initialTranslations);

  useEffect(() => {
    const translateAll = async () => {
      const newTranslations: Record<string, string> = {};
      const textsToTranslate: string[] = [];
      const keys: string[] = [];

      // Separate pre-defined translations from texts that need API translation
      Object.entries(texts).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'en' in value && 'ms' in value) {
          newTranslations[key] = value[language];
        } else if (language === 'en') {
          newTranslations[key] = value as string;
        } else {
          textsToTranslate.push(value as string);
          keys.push(key);
        }
      });

      // Translate remaining texts in batch
      if (textsToTranslate.length > 0) {
        try {
          const results = await translateText(textsToTranslate, {
            source: 'en',
            target: language,
          });

          if (Array.isArray(results)) {
            results.forEach((result, index) => {
              newTranslations[keys[index]] = result;
            });
          }
        } catch (error) {
          console.error('Batch translation error:', error);
          // Fall back to original texts
          keys.forEach((key, index) => {
            newTranslations[key] = textsToTranslate[index];
          });
        }
      }

      setTranslations(newTranslations);
    };

    translateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]); // Only depend on language, not texts object

  return translations;
}

