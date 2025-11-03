import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ms'; // en = English, ms = Malay (Bahasa Malaysia)

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  translate: (text: string) => Promise<string>;
  translateElement: (element: HTMLElement) => Promise<void>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Default to English
  const [language, setLanguageState] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);

  // Initialize language from localStorage, but default to English
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ms')) {
      setLanguageState(savedLanguage);
    } else {
      // If no saved language or invalid, default to English
      setLanguageState('en');
      localStorage.setItem('language', 'en');
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ms' : 'en';
    setLanguage(newLanguage);
  };

  /**
   * Translate a single text string using Google Translate API
   */
  const translate = async (text: string): Promise<string> => {
    // Don't translate if language is English
    if (language === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}_${language}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
      if (!apiKey) {
        console.warn('Google Translate API key not found');
        return text;
      }

      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: 'en',
            target: language,
            format: 'text',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;

      // Cache the translation
      translationCache.set(cacheKey, translatedText);

      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text on error
    }
  };

  /**
   * Translate all text content within an HTML element
   * This is useful for translating entire sections of the page
   */
  const translateElement = async (element: HTMLElement): Promise<void> => {
    if (language === 'en') {
      return; // No translation needed
    }

    setIsTranslating(true);

    try {
      // Get all text nodes
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip empty text nodes and script/style elements
            if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (parent?.tagName === 'SCRIPT' || parent?.tagName === 'STYLE') {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      const textNodes: Node[] = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }

      // Translate each text node
      for (const textNode of textNodes) {
        const originalText = textNode.textContent?.trim();
        if (originalText) {
          const translatedText = await translate(originalText);
          if (textNode.textContent) {
            textNode.textContent = translatedText;
          }
        }
      }
    } catch (error) {
      console.error('Element translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const value = {
    language,
    toggleLanguage,
    setLanguage,
    translate,
    translateElement,
    isTranslating,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

