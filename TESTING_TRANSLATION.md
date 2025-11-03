# Testing the BM/EN Language Toggle

## ✅ What Should Change When You Click the Toggle

After clicking the language toggle button, you should see these text changes **INSTANTLY**:

### 1. Mode Toggle (Basic/Pro buttons)
- **English**: `Basic` and `Pro`
- **Bahasa Malaysia**: `Asas` and `Pro`

### 2. Category/State Labels
- **English**: `Select Category` and `Select State`
- **Bahasa Malaysia**: `Pilih Kategori` and `Pilih Negeri`

### 3. Footer (at the bottom of the page)
- **English**: "Malaysia consists of 13 states and 3 federal territories"
- **Bahasa Malaysia**: "Malaysia terdiri daripada 13 negeri dan 3 wilayah persekutuan"

- **English**: "Follow on X" | "Privacy Policy" | "Terms of Service"
- **Bahasa Malaysia**: "Ikuti di X" | "Dasar Privasi" | "Terma Perkhidmatan"

### 4. Language Toggle Button Icon
- When **English** is active: Shows "EN" text overlay with BLUE icon
- When **BM** is active: Shows "BM" text overlay with RED icon
- The icon should animate/rotate when switching

---

## 🐛 Troubleshooting Steps

### Step 1: Check Browser Console
1. Open your browser's Developer Tools (F12 or Cmd+Option+I on Mac)
2. Go to the **Console** tab
3. Click the language toggle button
4. You should see:
   ```
   Language toggle clicked. Current: en
   Language toggled to: ms
   ```

### Step 2: Check localStorage
1. In Developer Tools, go to **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Look at **Local Storage** → `http://localhost:3000`
3. You should see a key called `language` with value `en` or `ms`
4. Click the toggle and see this value change

### Step 3: Verify React Context is Working
Add this temporary component to test:

```tsx
// Add to pages/index.tsx at the top after imports
import { useLanguage } from '@/contexts/LanguageContext';

// Inside the Home component, before the return statement:
const { language } = useLanguage();
console.log('Current language in Home:', language);
```

### Step 4: Check Environment Variable
1. Make sure `.env.local` exists and contains:
   ```
   NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_api_key
   ```
2. Note: The API key is only needed for dynamic API translations, not for the pre-defined translations we added
3. Restart your dev server after adding the API key

### Step 5: Clear Cache and Reload
1. Hard refresh the page: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
2. Or clear browser cache and reload

---

## 🔍 What to Look For

### The Toggle Button Should Show:
- Desktop: Just an icon with "EN" or "BM" overlay
- Mobile: Icon + text label ("English" or "Bahasa Malaysia")
- Located in the header next to the theme (sun/moon) toggle

### Visual Confirmation:
```
Before clicking (English):
┌────────────────────────────────────────────────┐
│                                 [🔵 EN] [🌙]   │
│                                                │
│              [Basic] [Pro]                     │
│                                                │
│  Select Category    |    Select State         │
└────────────────────────────────────────────────┘

After clicking (Bahasa Malaysia):
┌────────────────────────────────────────────────┐
│                                 [🔴 BM] [🌙]   │
│                                                │
│              [Asas] [Pro]                      │
│                                                │
│  Pilih Kategori     |    Pilih Negeri         │
└────────────────────────────────────────────────┘
```

---

## ❓ Common Issues

### Issue: Nothing changes when I click
**Solution**: 
- Check browser console for errors
- Make sure you restarted the dev server after adding LanguageProvider
- Try clearing localStorage and refreshing

### Issue: Button doesn't exist
**Solution**:
- Make sure `_app.tsx` includes `<LanguageProvider>`
- Make sure `PageHeader.tsx` includes `<LanguageToggleButton />`
- Restart dev server

### Issue: Page shows error
**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Check for any TypeScript or linting errors
- Look at the terminal where dev server is running for errors

---

## 📝 Testing Checklist

- [ ] I can see the language toggle button in the header
- [ ] Clicking it shows console logs
- [ ] "Basic"/"Pro" changes to "Asas"/"Pro"
- [ ] "Select Category" changes to "Pilih Kategori"
- [ ] "Select State" changes to "Pilih Negeri"  
- [ ] Footer text changes to Bahasa Malaysia
- [ ] Language preference persists after page reload
- [ ] Button icon changes color (blue EN → red BM)
- [ ] Button shows animation when switching

---

## 🎯 If Still Not Working

1. **Check the terminal** where `npm run dev` is running for any errors
2. **Take a screenshot** of your browser showing:
   - The header with buttons
   - The console with any errors
   - The Network tab showing any failed requests
3. **Verify files were saved** - sometimes IDEs don't auto-save
4. **Try a clean restart**:
   ```bash
   # Stop the dev server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

The feature works locally - it doesn't require a live site. All translations we added are pre-defined (no API calls), so they should work instantly without needing the Google Translate API key.

