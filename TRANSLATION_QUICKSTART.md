# Quick Start Guide - BM/EN Translation Toggle

## Setup

1. **Add your Google Translate API key to `.env.local`**:
```bash
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_api_key_here
```

2. **Restart your development server**:
```bash
npm run dev
```

## Where is the Toggle Button?

The language toggle button (BM/EN) is now located in the **PageHeader** component, positioned **NEXT TO** the theme toggle button (dark/light mode).

### Visual Layout:
```
┌─────────────────────────────────────────────────────┐
│  My Peta                  [Auth] [BM/EN] [🌙/☀️]   │
└─────────────────────────────────────────────────────┘
```

- **Desktop**: Shows icons only
- **Mobile**: Opens in mobile navigation with text labels

## How It Works

1. **Click the BM/EN toggle** → Switches language
2. **Language is saved** → Persists on page reload (localStorage)
3. **Instant translations** → Pre-defined texts change immediately
4. **API translations** → Dynamic content translates via Google API

## What's Translated

### Currently Implemented:
- ✅ Header title ("My Peta" → "Peta Saya")
- ✅ Header subtitle and rotating words
- ✅ Footer text (states info, data source, links)
- ✅ Button labels in navigation

### Easy to Add More:
Just use the `useTranslation` hook in any component:

```tsx
import { useTranslation } from '@/hooks/useTranslation';

const text = useTranslation({
  en: 'English text',
  ms: 'Teks Bahasa Malaysia'
});
```

## Testing the Feature

1. Open your app in the browser
2. Look at the top right corner of the page
3. You should see: `[Auth Button] [Language Toggle] [Theme Toggle]`
4. Click the language toggle to switch between EN ↔ BM
5. Watch the page content update instantly

## Files Modified

- ✅ `pages/_app.tsx` - Added LanguageProvider
- ✅ `components/PageHeader.tsx` - Added LanguageToggleButton
- ✅ `components/Header.tsx` - Added translations
- ✅ `components/Footer.tsx` - Added translations

## Files Created

- ✅ `contexts/LanguageContext.tsx` - Language state management
- ✅ `components/LanguageToggleButton.tsx` - Toggle button UI
- ✅ `lib/translation.ts` - Google Translate API utilities
- ✅ `hooks/useTranslation.ts` - Translation hooks
- ✅ `TRANSLATION_GUIDE.md` - Full documentation
- ✅ `TRANSLATION_IMPLEMENTATION.md` - Implementation details
- ✅ `components/TranslationDemo.tsx` - Demo component (optional)

## Next Steps

### To add translations to more components:

1. **Import the hook**:
```tsx
import { useTranslation } from '@/hooks/useTranslation';
```

2. **Use in your component**:
```tsx
const MyComponent = () => {
  const title = useTranslation({
    en: 'My Title',
    ms: 'Tajuk Saya'
  });

  return <h1>{title}</h1>;
};
```

### For the whole app:
See `TRANSLATION_GUIDE.md` for complete documentation including:
- API translation for dynamic content
- Batch translations
- Language detection
- Common translations
- Best practices

## Troubleshooting

### Toggle button not showing?
- Make sure you restarted the dev server after adding LanguageProvider
- Check browser console for errors

### Translations not working?
- Verify `NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY` is set in `.env.local`
- Check that Google Translate API is enabled in your Google Cloud project
- Look in browser console for API errors

### Need more help?
- See `TRANSLATION_GUIDE.md` for detailed documentation
- Check `TRANSLATION_IMPLEMENTATION.md` for technical details
- Try the demo: Import `<TranslationDemo />` component to test

## Complete! 🎉

Your BM/EN language toggle is ready to use. The button is placed next to the theme toggle as requested, and you can easily add translations to any component using the `useTranslation` hook.

