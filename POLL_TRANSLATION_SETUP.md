# Poll Content Translation - Setup Guide

## ✅ What's Been Added

I've added automatic translation for all poll content (questions, descriptions, and option labels) using Google Translate API.

## 🔧 Setup Required

### 1. Add Your Google Translate API Key

Make sure your `.env.local` file has the API key:

```bash
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY=your_actual_api_key_here
```

**Important**: Without the API key, polls will stay in English (but the UI will still translate).

### 2. Get a Google Translate API Key (if you don't have one)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Cloud Translation API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **API Key**
6. Copy the API key
7. Paste it in your `.env.local` file

### 3. Restart Your Dev Server

After adding the API key:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🎯 How It Works

When you switch to Bahasa Malaysia (BM):

1. **UI elements** translate instantly (no API calls)
2. **Poll content** translates using Google Translate API:
   - Poll questions
   - Poll descriptions  
   - Option labels (like "Yes", "No", "AI Hub", etc.)

### Translation Flow:

```
English (EN):
- Question: "Should we start to Boycott the UAE?"
- Options: "Yes" | "No"

Bahasa Malaysia (BM):
- Question: "Haruskah kita mula Memboikot UAE?"
- Options: "Ya" | "Tidak"
```

---

## 💰 API Costs

**Google Translate API Pricing:**
- First 500,000 characters per month: **FREE**
- After that: $20 per 1 million characters

**Your Usage:**
- ~25 polls × ~50 characters each = ~1,250 characters per page load
- You'd need to load the page 400+ times to use up the free tier
- **Verdict**: Very affordable for typical usage

### Cost Optimization:

The implementation includes caching:
- Translations are cached in memory during the session
- Only translates when language changes
- Batch translates all polls in one API call (cheaper than individual calls)

---

## 🧪 Testing

1. **Open** http://localhost:3000/polls
2. **Click** the language toggle (BM/EN)
3. **Wait** a moment for translations to load
4. **See** all poll content translate to Bahasa Malaysia

### What to Expect:

**First time switching to BM:**
- Small delay (~1-2 seconds) while translating
- All poll questions and options appear in Malay

**Switching back to EN:**
- Instant (no API call needed)

**Switching to BM again:**
- Instant (uses cached translations)

---

## ⚠️ Troubleshooting

### Polls Not Translating?

1. **Check API Key**:
   - Make sure it's in `.env.local`
   - Make sure it starts with `NEXT_PUBLIC_` (required for browser access)
   - Restart dev server after adding it

2. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for errors mentioning "Translation" or "API"
   - If you see 403/401 errors, your API key may be invalid

3. **Check API Quota**:
   - Go to Google Cloud Console
   - Check if Translation API is enabled
   - Check if you've exceeded quota

### Translations Look Wrong?

Google Translate isn't perfect. For better quality:
- Store bilingual versions in your database (recommended for important content)
- Use the API only for user-generated content
- Manually review and fix common phrases

---

## 📊 Performance

**Before Translation:**
- Page loads instantly
- Shows English content

**After Translation:**
- ~1-2 second delay for API call (first time only)
- Subsequent switches use cache (instant)
- 25 polls = ~1 API request

**Optimizations Built-in:**
✅ Batch translation (all polls in one API call)
✅ In-memory caching
✅ Only translates when language changes
✅ Graceful fallback to English on errors

---

## 🎉 Ready to Go!

Once you add the API key and restart the dev server, all poll content will automatically translate when you switch to Bahasa Malaysia!

The translation system is production-ready and optimized for performance and cost.

