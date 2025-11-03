# Language Translation Feature

This document explains how to use the Google Translate integration for BM (Bahasa Malaysia) / EN (English) translation.

## Setup

1. **Environment Variable**: Make sure you have the Google Translate API key in your `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
   ```

2. **API References**:
   - [Google Translate API Documentation](https://cloud.google.com/translate/docs/reference/rest)
   - [API Endpoint](https://translation.googleapis.com/language/translate/v2)

## Components

### LanguageToggleButton
A button component that switches between English (EN) and Bahasa Malaysia (BM).

**Location**: `components/LanguageToggleButton.tsx`

**Usage**: Already integrated in `PageHeader.tsx`, appears next to the theme toggle button.

## Contexts

### LanguageContext
Provides language state management and translation functions.

**Location**: `contexts/LanguageContext.tsx`

**Features**:
- `language`: Current language ('en' or 'ms')
- `toggleLanguage()`: Switch between EN and BM
- `setLanguage(lang)`: Set specific language
- `translate(text)`: Translate a single text string
- `translateElement(element)`: Translate all text within an HTML element
- `isTranslating`: Loading state for translations

## Hooks

### useTranslation
The recommended way to add translations to your components.

**Location**: `hooks/useTranslation.ts`

**Method 1: Pre-defined translations (Recommended)**
```tsx
import { useTranslation } from '@/hooks/useTranslation';

const MyComponent = () => {
  const title = useTranslation({ 
    en: 'Welcome to My Peta', 
    ms: 'Selamat Datang ke Peta Saya' 
  });

  return <h1>{title}</h1>;
};
```

**Method 2: Auto-translate with API**
```tsx
const MyComponent = () => {
  const dynamicText = useTranslation('This will be auto-translated');
  
  return <p>{dynamicText}</p>;
};
```

**Method 3: Manual control**
```tsx
const MyComponent = () => {
  const { translatedText, isTranslating, translate } = useTranslation(
    'Some text',
    { autoTranslate: false, returnObject: true }
  );

  const handleClick = () => {
    translate('New text to translate');
  };

  return (
    <div>
      <p>{translatedText}</p>
      {isTranslating && <span>Translating...</span>}
      <button onClick={handleClick}>Translate</button>
    </div>
  );
};
```

### useTranslations (Batch)
Translate multiple texts at once - more efficient than multiple `useTranslation` calls.

```tsx
import { useTranslations } from '@/hooks/useTranslation';

const MyComponent = () => {
  const t = useTranslations({
    title: { en: 'Home', ms: 'Laman Utama' },
    subtitle: 'This is a subtitle',
    description: 'Some description text'
  });

  return (
    <div>
      <h1>{t.title}</h1>
      <h2>{t.subtitle}</h2>
      <p>{t.description}</p>
    </div>
  );
};
```

## Utilities

### Translation Functions

**Location**: `lib/translation.ts`

#### `translateText(text, options)`
Low-level API translation function.

```typescript
import { translateText } from '@/lib/translation';

// Single text
const translated = await translateText('Hello', {
  source: 'en',
  target: 'ms'
});

// Batch translation
const translated = await translateText(
  ['Hello', 'World', 'Welcome'], 
  { source: 'en', target: 'ms' }
);
```

#### `detectLanguage(text)`
Detect the language of a text string.

```typescript
import { detectLanguage } from '@/lib/translation';

const lang = await detectLanguage('Selamat pagi');
console.log(lang); // 'ms'
```

#### `getSupportedLanguages(target?)`
Get list of all supported languages by Google Translate.

```typescript
import { getSupportedLanguages } from '@/lib/translation';

const languages = await getSupportedLanguages('en');
// Returns array of language codes with names in English
```

#### Common Translations
Pre-defined translations for common UI text to avoid API calls.

```typescript
import { getCommonTranslation, commonTranslations } from '@/lib/translation';

// Get a single translation
const login = getCommonTranslation('login', 'ms'); // 'Log Masuk'

// Access all common translations
console.log(commonTranslations.home); // { en: 'Home', ms: 'Laman Utama' }
```

## Best Practices

1. **Use Pre-defined Translations**: For static text that doesn't change, define both EN and MS versions directly in your code. This is instant and doesn't consume API quota.

2. **API Translation for Dynamic Content**: Only use API translation for user-generated content or data that comes from external sources.

3. **Caching**: The `LanguageContext` automatically caches translations to reduce API calls.

4. **Batch Translations**: When translating multiple texts, use `useTranslations` hook or `translateText` with an array to make a single API call.

5. **Common Translations**: For frequently used UI text (buttons, labels, etc.), add them to `commonTranslations` in `lib/translation.ts`.

## Example: Full Component

```tsx
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

const DataVisualization = () => {
  const { language } = useLanguage();
  
  // Pre-defined translations
  const title = useTranslation({ 
    en: 'Data Visualization', 
    ms: 'Visualisasi Data' 
  });
  
  const subtitle = useTranslation({
    en: 'View statistics and trends',
    ms: 'Lihat statistik dan trend'
  });

  // Conditional based on language
  const chartLabel = language === 'en' ? 'Population' : 'Populasi';

  return (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <Chart label={chartLabel} />
    </div>
  );
};
```

## API Rate Limits

Google Translate API has usage limits depending on your plan:
- Free tier: Limited requests per month
- Paid tier: Based on characters translated

To optimize API usage:
- Use pre-defined translations where possible
- Leverage the built-in caching
- Batch translations when possible
- Consider storing commonly translated dynamic content

## Troubleshooting

### Translations not working
1. Check that `NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY` is set in `.env.local`
2. Verify the API key has Google Translate API enabled
3. Check browser console for error messages
4. Ensure you're within API quota limits

### Translations are slow
1. Use pre-defined translations for static text
2. Use `useTranslations` for multiple texts to batch API calls
3. Consider adding frequently used translations to `commonTranslations`

### Language not persisting
- Language preference is stored in `localStorage` and should persist across sessions
- Check browser console for any localStorage errors

