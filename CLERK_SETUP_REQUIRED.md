# 🚨 CLERK SETUP REQUIRED - OAuth Configuration

## Critical Issues Found

### Issue 1: X/Twitter OAuth Pointing to Privy
You're seeing this URL:
```
https://x.com/i/oauth2/authorize?redirect_uri=https://auth.privy.io/api/v1/oauth/callback
```

**Problem:** The redirect URI is still pointing to `auth.privy.io` instead of Clerk.

**Why:** Clerk dashboard hasn't been configured with X/Twitter OAuth yet.

### Issue 2: State Not Saving
This is likely related to the OAuth configuration - if the user isn't properly authenticated via Clerk, the database calls will fail.

---

## ✅ STEP-BY-STEP FIX

### Step 1: Go to Clerk Dashboard

1. Visit: https://dashboard.clerk.com
2. Select your application (or create a new one)
3. You should see your app name and project settings

### Step 2: Configure OAuth Providers

#### For X (Twitter):

1. In the Clerk Dashboard, go to: **User & Authentication** → **Social Connections**
2. Find **Twitter / X** in the list
3. Click **Enable** or **Configure**
4. You'll need to:
   - Go to https://developer.x.com/portal/dashboard
   - Create a new app or use existing one
   - Get your **Client ID** and **Client Secret**
   - Set the **Callback URL** in X Developer Portal to:
     ```
     https://YOUR_CLERK_DOMAIN/v1/oauth_callback
     ```
     (Clerk will show you the exact URL in their dashboard)
5. Enter the **Client ID** and **Client Secret** from X into Clerk
6. **Save changes**

#### For Google:

1. Same location: **User & Authentication** → **Social Connections**
2. Find **Google** in the list
3. Click **Enable** or **Configure**
4. You'll need to:
   - Go to https://console.cloud.google.com
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Set **Authorized redirect URIs** to:
     ```
     https://YOUR_CLERK_DOMAIN/v1/oauth_callback
     ```
5. Enter the **Client ID** and **Client Secret** from Google into Clerk
6. **Save changes**

### Step 3: Update Your Environment Variables

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (should already be there)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### Step 4: Update Cloudflare Environment Variables

If you're deploying on Cloudflare, make sure to update:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

### Step 5: Clear Browser Cache

After setting up Clerk:
1. Close your app completely
2. Clear browser cache (Cmd+Shift+Delete / Ctrl+Shift+Delete)
3. Select "Cookies and other site data"
4. Clear it
5. Restart your dev server:
   ```bash
   npm run dev
   ```

---

## 🔍 Detailed OAuth Setup for X (Twitter)

Since X/Twitter OAuth is more complex, here's the detailed process:

### A. Create X Developer Account (if you haven't)

1. Go to https://developer.x.com
2. Sign up for a developer account
3. Create a project and app

### B. Configure Your X App

1. In X Developer Portal, go to your app settings
2. Under **User authentication settings**, click **Set up**
3. Select:
   - ✅ OAuth 2.0
   - ✅ Read permissions (at minimum)
4. **App info:**
   - Type of App: Web App
   - Callback URI: `https://YOUR_CLERK_DOMAIN/v1/oauth_callback`
     (Get this exact URL from Clerk dashboard)
   - Website URL: `https://yourdomain.com` or `http://localhost:3000` for dev
5. Save and get your:
   - **Client ID** (starts with `T...`)
   - **Client Secret**

### C. Add to Clerk

1. Back in Clerk Dashboard → Social Connections → Twitter/X
2. Paste the **Client ID** and **Client Secret**
3. Save

---

## 🚀 Quick Checklist

Before testing again:

- [ ] Created Clerk application (or using existing one)
- [ ] Enabled Google OAuth in Clerk
- [ ] Enabled X/Twitter OAuth in Clerk
- [ ] Got Client ID & Secret from X Developer Portal
- [ ] Got Client ID & Secret from Google Cloud Console
- [ ] Added them to Clerk Dashboard
- [ ] Verified redirect URIs match
- [ ] Updated `.env.local` with Clerk keys
- [ ] Updated Cloudflare env vars (if deploying)
- [ ] Cleared browser cache
- [ ] Restarted dev server

---

## 🧪 Testing After Setup

1. **Go to your app**: `http://localhost:3000`
2. **Click "Sign in"**
3. **Try signing in with Google** - should redirect to Google OAuth (not Privy)
4. **Try signing in with X** - should redirect to X OAuth (not Privy)
5. **After successful login:**
   - Go to `/debug-auth` to verify everything works
   - Select a state
   - Try voting on a poll
   - Refresh and verify state persists

---

## ❓ Common Issues

### Issue: "Invalid redirect URI"
**Fix:** Make sure the redirect URI in X/Twitter Developer Portal exactly matches what Clerk provides.

### Issue: "Client ID not found"
**Fix:** Double-check you copied the correct Client ID and Secret from X/Twitter.

### Issue: Still seeing Privy URLs
**Fix:** 
1. Clear browser cache completely
2. Restart your browser
3. Make sure you're using the correct Clerk keys in `.env.local`
4. Restart dev server

### Issue: OAuth works but state still doesn't save
**Fix:** 
1. Check `/debug-auth` page to see which test fails
2. Verify Supabase connection works
3. Check console logs for `[UserProfile]` messages
4. Make sure database migration was applied (already done ✅)

---

## 📝 What We Fixed Previously

✅ Database migration (privy → clerk columns)
✅ Frontend code (using Clerk hooks)
✅ Supabase functions (accept clerk_user_id)
✅ TypeScript types updated
✅ Debug page created

## 🚨 What Still Needs to Be Done

❌ **Configure Clerk Dashboard with OAuth providers**
❌ **Get X/Twitter Developer credentials**
❌ **Get Google OAuth credentials**
❌ **Test the complete flow**

---

## 🆘 Need Help?

If you're stuck on any step:
1. Take a screenshot of where you're stuck
2. Copy any error messages
3. Let me know which step you're on
4. I'll guide you through it

The OAuth setup is a one-time configuration. Once it's done, everything will work smoothly!

