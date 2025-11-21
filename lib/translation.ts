/**
 * Translation utilities using Google Translate API
 * 
 * API Reference: https://cloud.google.com/translate/docs/reference/rest
 * Endpoint: https://translation.googleapis.com/language/translate/v2
 */

export interface TranslationOptions {
  source?: string;
  target: string;
  format?: 'text' | 'html';
}

export interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

/**
 * Translate text using Google Translate API
 */
export async function translateText(
  text: string | string[],
  options: TranslationOptions
): Promise<string | string[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Translate API key not found');
    return text;
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: options.source || 'en',
          target: options.target,
          format: options.format || 'text',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Translation API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: TranslationResponse = await response.json();
    
    // If input was an array, return array of translations
    if (Array.isArray(text)) {
      return data.data.translations.map(t => t.translatedText);
    }
    
    // If input was a string, return single translation
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text on error
  }
}

/**
 * Detect the language of text
 */
export async function detectLanguage(text: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Translate API key not found');
    return null;
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Language detection error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.detections[0][0].language;
  } catch (error) {
    console.error('Language detection error:', error);
    return null;
  }
}

/**
 * Get list of supported languages
 */
export async function getSupportedLanguages(target?: string): Promise<any[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  
  if (!apiKey) {
    console.warn('Google Translate API key not found');
    return [];
  }

  try {
    let url = `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}`;
    if (target) {
      url += `&target=${target}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch languages: ${response.status}`);
    }

    const data = await response.json();
    return data.data.languages;
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return [];
  }
}

/**
 * Common translations for Bahasa Malaysia
 */
export const commonTranslations: Record<string, { en: string; ms: string }> = {
  // Navigation
  home: { en: 'Home', ms: 'Laman Utama' },
  polls: { en: 'Polls', ms: 'Tinjauan Pendapat' },
  news: { en: 'News', ms: 'Berita' },
  data: { en: 'Data', ms: 'Data' },
  about: { en: 'About', ms: 'Tentang' },
  contact: { en: 'Contact', ms: 'Hubungi' },
  
  // Common actions
  login: { en: 'Login', ms: 'Log Masuk' },
  logout: { en: 'Logout', ms: 'Log Keluar' },
  signup: { en: 'Sign Up', ms: 'Daftar' },
  submit: { en: 'Submit', ms: 'Hantar' },
  cancel: { en: 'Cancel', ms: 'Batal' },
  save: { en: 'Save', ms: 'Simpan' },
  edit: { en: 'Edit', ms: 'Edit' },
  delete: { en: 'Delete', ms: 'Padam' },
  search: { en: 'Search', ms: 'Cari' },
  
  // States
  loading: { en: 'Loading...', ms: 'Memuatkan...' },
  error: { en: 'Error', ms: 'Ralat' },
  success: { en: 'Success', ms: 'Berjaya' },
  
  // Theme
  darkMode: { en: 'Dark Mode', ms: 'Mod Gelap' },
  lightMode: { en: 'Light Mode', ms: 'Mod Terang' },
  
  // Language
  language: { en: 'Language', ms: 'Bahasa' },
  english: { en: 'English', ms: 'Bahasa Inggeris' },
  bahasaMalaysia: { en: 'Bahasa Malaysia', ms: 'Bahasa Malaysia' },
};

/**
 * Get a common translation without API call
 */
export function getCommonTranslation(key: string, language: 'en' | 'ms'): string {
  return commonTranslations[key]?.[language] || key;
}

