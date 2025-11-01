# OG Image Setup for Cloudflare

## Current Status

Since you're using **Cloudflare** (not Vercel), the dynamic OG image generation approach needs to be different. Here's what's currently implemented:

### Current Solution: Static OG Image with Dynamic Meta Tags

The polls page now uses:
- **Static OG image**: `/images/og-image.png` (you need to create this)
- **Dynamic meta tags**: Poll title and description change based on the URL

When someone shares: `https://www.mypeta.ai/polls?poll=<POLL_ID>`
- The OG image will be your static branding image
- The title will be: `{Poll Question} - Malaysian Poll`
- The description will be: `{Poll Description}` or default text

## Facebook Share Issue

Facebook **does not allow pre-filled text** in posts (to prevent spam). When users click the Facebook share button:
- It opens Facebook with the URL
- Facebook's crawler reads the OG meta tags from your page
- Facebook shows: OG image + title + description
- The user must write their own text

This is Facebook's policy, not a bug!

## Options for Dynamic Poll Images

### Option 1: Create a Static Default OG Image (Easiest - Current)

Create a branded image at `/public/images/og-image.png` (1200x630px) with:
- Your logo/branding
- "Malaysian Polls" text
- General call-to-action

**Pros:** Simple, fast, works everywhere
**Cons:** Not poll-specific

### Option 2: Use Cloudflare Workers + Canvas API (Advanced)

Create a Cloudflare Worker that generates dynamic OG images using:
- `@cloudflare/workers-og` or
- `canvas` package or
- `puppeteer` for screenshots

**Pros:** Dynamic, poll-specific images
**Cons:** More complex, requires Cloudflare Workers setup

### Option 3: Pre-generate OG Images (Hybrid)

When a poll is created, generate and save an OG image:
1. Use html2canvas to capture the poll preview
2. Upload to Cloudflare R2 or similar storage
3. Reference the saved image in meta tags

**Pros:** Dynamic, performant
**Cons:** Requires storage, more code

### Option 4: Use a Third-Party Service

Use services like:
- https://og-image.vercel.app (but requires API calls)
- https://www.opengraph.xyz
- https://www.bannerbear.com

**Pros:** Easy, dynamic
**Cons:** External dependency, potential costs

## Recommended Next Steps

### For Now (Quick Fix):
1. Create a static OG image at `/public/images/og-image.png`
   - Size: 1200x630px
   - Include: MyPeta branding, Malaysian flag, "Polls" text
   - Make it generic but attractive

2. The dynamic title/description will make each share unique

### For Later (If You Want Dynamic Images):
Implement Option 3 (Pre-generate) or Option 2 (Workers)

## Creating Your Static OG Image

Here's a template you can use (create with design tools like Canva, Figma, or Photoshop):

```
Dimensions: 1200 x 630px
Background: Gradient (Green #10b981 to #059669)
Content:
  - Logo: "MYPETA.AI" (top, large, white)
  - Flag: 🇲🇾 emoji or Malaysian flag graphic
  - Title: "Malaysian Polls"
  - Subtitle: "Your Voice Matters"
  - CTA: "Vote Now! 🗳️"
```

## Testing

1. **Create the OG image**: Save it as `/public/images/og-image.png`

2. **Test locally**: Visit `http://localhost:3000/polls?poll=<POLL_ID>`

3. **View source**: Check for the meta tags with your poll's title

4. **Test on Facebook**:
   - Share a poll link
   - Facebook will show: Your OG image + dynamic poll title + description

5. **Use Facebook Debugger** to verify:
   - https://developers.facebook.com/tools/debug/
   - Enter your poll URL
   - Click "Scrape Again" if changes don't appear

## Why Facebook Share is Empty

Facebook **intentionally** doesn't support pre-filled text because:
- Anti-spam measure (2013 policy change)
- Forces users to write authentic messages
- Prevents automated bulk posting

Your share implementation is correct! Users need to write their own message.

## Alternative: Use Facebook Feed Dialog

If you want better Facebook integration, you can use the Feed Dialog:

```javascript
window.open(
  `https://www.facebook.com/dialog/feed?` +
  `app_id=YOUR_APP_ID&` +
  `link=${encodedUrl}&` +
  `redirect_uri=${encodedUrl}`,
  '_blank'
);
```

But this still won't allow pre-filled text - it's a Facebook limitation, not yours!

