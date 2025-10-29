# Privy X (Twitter) Login Setup Guide

## ✅ Checklist

### 1. X Developer Portal Configuration

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app
3. Navigate to **User authentication settings**
4. Under **Callback URI / Redirect URL**, add:
   ```
   https://auth.privy.io/api/v1/oauth/callback
   ```
5. **Type of App**: Set to **"Web App, Automated App or Bot"**
6. **App permissions**: Enable at least **Read** (or Read and Write if needed)
7. **Request email from users**: ✅ Enable this
8. Click **Save**

### 2. Privy Dashboard Configuration

1. Go to [Privy Dashboard](https://dashboard.privy.io/apps/cmhbjjwbh00ilk40dbn1zxpmm/settings)
2. Navigate to **Login Methods**
3. Enable **X (Twitter)**
4. Enter your **Client ID** (from X Developer Portal → OAuth 2.0 Client ID)
5. Enter your **Client Secret** (from X Developer Portal → OAuth 2.0 Client Secret)
6. Click **Save**

### 3. Environment Variables

Make sure your `.env.local` has:
```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

## 🔍 Troubleshooting

### Error: "You weren't able to give access to the App"

**Solution**: The callback URL `https://auth.privy.io/api/v1/oauth/callback` must be added to your X Developer Portal's redirect URIs.

### Error: 400 Bad Request from X API

**Possible causes**:
- Client ID/Secret mismatch between X Developer Portal and Privy Dashboard
- Callback URI not added to X Developer Portal
- App type not set to "Web App"
- Required permissions not enabled

### Still not working?

1. Wait 2-3 minutes after making changes (X takes time to propagate)
2. Clear browser cache and cookies
3. Verify credentials are copied correctly (no extra spaces)
4. Try in incognito/private browsing mode
5. Check browser console for specific error messages

## 📚 Resources

- [Privy Documentation](https://privy.io/docs)
- [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [Privy Dashboard](https://dashboard.privy.io)

