/**
 * TranslationDemo Component
 * 
 * This is a demonstration component showing various ways to use the translation system.
 * You can import and use these patterns in your own components.
 * 
 * Usage: Import this component in any page to test translations
 */

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation, useTranslations } from '@/hooks/useTranslation';
import { translateText, detectLanguage, getCommonTranslation } from '@/lib/translation';

const TranslationDemo = () => {
  const { language, toggleLanguage, isTranslating } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLang, setDetectedLang] = useState('');

  // Method 1: Pre-defined translations (Recommended for static text)
  const welcomeText = useTranslation({
    en: 'Welcome to Translation Demo',
    ms: 'Selamat Datang ke Demo Terjemahan'
  });

  const description = useTranslation({
    en: 'This component demonstrates different translation methods',
    ms: 'Komponen ini menunjukkan kaedah terjemahan yang berbeza'
  });

  // Method 2: Batch translations
  const batchTexts = useTranslations({
    button1: { en: 'Translate', ms: 'Terjemah' },
    button2: { en: 'Detect Language', ms: 'Kesan Bahasa' },
    button3: { en: 'Clear', ms: 'Kosongkan' },
    placeholder: { en: 'Enter text here...', ms: 'Masukkan teks di sini...' },
    result: { en: 'Translation Result:', ms: 'Hasil Terjemahan:' },
    detected: { en: 'Detected Language:', ms: 'Bahasa yang Dikesan:' }
  });

  // Method 3: Common translations (No API call)
  const loginText = getCommonTranslation('login', language);
  const logoutText = getCommonTranslation('logout', language);

  // Manual translation using API
  const handleTranslate = async () => {
    if (!inputText) return;
    
    const result = await translateText(inputText, {
      source: 'en',
      target: language
    });
    
    setTranslatedText(result as string);
  };

  // Language detection
  const handleDetect = async () => {
    if (!inputText) return;
    
    const lang = await detectLanguage(inputText);
    setDetectedLang(lang || 'Unknown');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2 text-zinc-800 dark:text-zinc-200">
          {welcomeText}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {/* Current Language Display */}
      <div className="mb-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {language === 'en' ? 'Current Language: English' : 'Bahasa Semasa: Bahasa Malaysia'}
        </p>
        <button
          onClick={toggleLanguage}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {language === 'en' ? 'Switch to Bahasa Malaysia' : 'Tukar ke Bahasa Inggeris'}
        </button>
      </div>

      {/* Interactive Translation */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
          {language === 'en' ? 'Try It Out' : 'Cuba Sekarang'}
        </h3>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={batchTexts.placeholder}
          className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg mb-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
          rows={4}
        />

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !inputText}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {batchTexts.button1}
          </button>
          
          <button
            onClick={handleDetect}
            disabled={!inputText}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {batchTexts.button2}
          </button>
          
          <button
            onClick={() => {
              setInputText('');
              setTranslatedText('');
              setDetectedLang('');
            }}
            className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            {batchTexts.button3}
          </button>
        </div>

        {isTranslating && (
          <div className="text-blue-600 dark:text-blue-400 mb-2">
            {language === 'en' ? 'Translating...' : 'Menterjemah...'}
          </div>
        )}

        {translatedText && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-2">
            <p className="font-semibold text-green-800 dark:text-green-400 mb-1">
              {batchTexts.result}
            </p>
            <p className="text-zinc-700 dark:text-zinc-300">{translatedText}</p>
          </div>
        )}

        {detectedLang && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="font-semibold text-purple-800 dark:text-purple-400 mb-1">
              {batchTexts.detected}
            </p>
            <p className="text-zinc-700 dark:text-zinc-300">{detectedLang}</p>
          </div>
        )}
      </div>

      {/* Common Translations Example */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-200">
          {language === 'en' ? 'Common Translations (No API)' : 'Terjemahan Biasa (Tanpa API)'}
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg">
            {loginText}
          </button>
          <button className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg">
            {logoutText}
          </button>
          <button className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg">
            {getCommonTranslation('save', language)}
          </button>
          <button className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg">
            {getCommonTranslation('cancel', language)}
          </button>
        </div>
      </div>

      {/* Code Examples */}
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-zinc-800 dark:text-zinc-200">
          {language === 'en' ? 'How to Use in Your Component' : 'Cara Menggunakan dalam Komponen Anda'}
        </h3>
        
        <pre className="text-xs bg-zinc-900 text-green-400 p-3 rounded overflow-x-auto">
{`// Method 1: Pre-defined (Recommended)
const text = useTranslation({
  en: 'Hello',
  ms: 'Halo'
});

// Method 2: API Auto-translate
const text = useTranslation('Hello');

// Method 3: Common translations
const text = getCommonTranslation('login', language);`}
        </pre>
      </div>
    </div>
  );
};

export default TranslationDemo;

