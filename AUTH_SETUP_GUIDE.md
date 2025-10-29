# Twitter/X Authentication Setup Guide

## ✅ What's Been Created

Your Twitter/X authentication is now set up! Here's what was added:

### 1. **NextAuth.js Configuration** (`pages/api/auth/[...nextauth].ts`)
   - Handles OAuth authentication flow
   - Configured for Twitter API v2
   - JWT session strategy

### 2. **Callback Redirect** (`pages/api/callback/twitter.ts`)
   - Redirects from `/api/callback/twitter` to NextAuth's internal callback
   - Allows you to use the URL you specified in X Developer Portal

### 3. **Authentication Button** (`components/AuthButton.tsx`)
   - "Sign In" button when not authenticated
   - Shows user profile with avatar when authenticated
   - Profile dialog with sign out option
   - Fully responsive with loading states

### 4. **Session Provider** (Updated `pages/_app.tsx`)
   - Wraps entire app with NextAuth session management
   - Makes authentication state available throughout the app

### 5. **Type Definitions** (`types/next-auth.d.ts`)
   - TypeScript types for session with user ID

---

## 🔧 Setup Instructions

### Step 1: Create Environment Variables File

Create a file named `.env.local` in your project root (same level as `package.json`):

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-this-with-command-below

# Twitter / X OAuth Credentials
TWITTER_CLIENT_ID=your-client-id-from-x-developer-portal
TWITTER_CLIENT_SECRET=your-client-secret-from-x-developer-portal
```

### Step 2: Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

### Step 3: Get Twitter OAuth Credentials

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Select your app or create a new one
3. Go to "Keys and tokens" section
4. Find or generate your:
   - **Client ID** (OAuth 2.0 Client ID)
   - **Client Secret** (OAuth 2.0 Client Secret)
5. Copy these values into your `.env.local` file

### Step 4: Configure X Developer Portal Settings

Use these exact values in your X Developer Portal app settings:

```
Callback URI / Redirect URL:
https://mypeta.ai/api/callback/twitter

(For local development, add):
http://localhost:3000/api/callback/twitter

Website URL:
https://mypeta.ai

Organization name:
My Peta

Terms of service:
https://mypeta.ai/terms

Privacy policy:
https://mypeta.ai/privacy
```

### Step 5: Enable OAuth 2.0

In X Developer Portal:
1. Go to your app settings
2. Under "User authentication settings", click "Set up"
3. Enable **OAuth 2.0**
4. Set permissions:
   - ✅ Read (at minimum)
   - Optional: Tweet, Follow users, etc. (based on your needs)
5. Set "Type of App": **Web App**
6. Save settings

---

## 🚀 Testing Locally

1. Make sure `.env.local` is created with all values
2. Start your development server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000
4. Click "Sign In" button in the header
5. You'll be redirected to X for authorization
6. After approving, you'll be redirected back and logged in

---

## 🌐 Production Deployment

When deploying to production:

1. **Set Environment Variables** on your hosting platform (Vercel, Netlify, etc.):
   ```
   NEXTAUTH_URL=https://mypeta.ai
   NEXTAUTH_SECRET=your-generated-secret
   TWITTER_CLIENT_ID=your-client-id
   TWITTER_CLIENT_SECRET=your-client-secret
   ```

2. **Verify URLs** in X Developer Portal match production URLs

3. **Test** authentication on production before launching

---

## 🎨 How It Works

### User Flow:
1. User clicks "Sign In" button
2. Redirected to X (Twitter) authorization page
3. User approves the app
4. X redirects to: `https://mypeta.ai/api/callback/twitter?code=...`
5. Our redirect endpoint forwards to: `/api/auth/callback/twitter`
6. NextAuth validates and creates session
7. User is redirected back to homepage, now authenticated
8. Session persists across page refreshes

### Using Auth in Your Components:

```tsx
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (session) {
    return <p>Signed in as {session.user.name}</p>;
  }

  return <p>Not signed in</p>;
}
```

### Protecting API Routes:

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // User is authenticated
  res.json({ data: "Protected data" });
}
```

### Protecting Pages (Server-side):

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
```

---

## 📝 Files Created/Modified

### Created:
- ✅ `pages/api/auth/[...nextauth].ts` - NextAuth configuration
- ✅ `pages/api/callback/twitter.ts` - Callback redirect handler
- ✅ `components/AuthButton.tsx` - Sign in/out UI component
- ✅ `types/next-auth.d.ts` - TypeScript definitions

### Modified:
- ✅ `pages/_app.tsx` - Added SessionProvider
- ✅ `pages/index.tsx` - Added AuthButton to header
- ✅ `package.json` - Added next-auth dependency

---

## 🔍 Troubleshooting

### "Sign in failed" error
- Check that `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` are correct
- Verify OAuth 2.0 is enabled in X Developer Portal
- Ensure callback URL matches exactly

### "Redirect URI mismatch" error
- Callback URL in X Developer Portal must exactly match
- Remember to add both production and localhost URLs

### Session not persisting
- Check that `NEXTAUTH_SECRET` is set
- Clear browser cookies and try again
- Check browser console for errors

### Can't access user data
- Verify the permissions you requested in X Developer Portal
- Some data requires additional scopes

---

## 🎉 You're All Set!

Your Twitter/X authentication is ready to go. Just add your credentials to `.env.local` and you're good to test!

Need help? Check the [NextAuth.js docs](https://next-auth.js.org/) or [X OAuth 2.0 docs](https://developer.twitter.com/en/docs/authentication/oauth-2-0).

