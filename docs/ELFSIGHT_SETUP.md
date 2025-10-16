# Elfsight Social Wall Widget Setup

This document provides instructions for configuring the Elfsight Social Wall widget on the /news page.

## Overview

The SocialWall component (`src/components/SocialWall.tsx`) has been created to embed an Elfsight social media feed widget on the /news page. This allows the site to display aggregated social media content from various platforms.

## Prerequisites

- Elfsight account (free or paid plan)
- Social media accounts to connect (Twitter, Instagram, Facebook, etc.)

## Setup Instructions

### 1. Create Elfsight Account

1. Visit [Elfsight.com](https://elfsight.com/)
2. Sign up for an account or log in
3. Navigate to the **Apps** section

### 2. Create Social Media Feed Widget

1. In Elfsight dashboard, click **"Add New Widget"**
2. Search for and select **"Social Media Feed"** or **"Social Feed"**
3. Click **"Create Widget"**

### 3. Configure Widget

#### Connect Social Accounts
1. Click **"Add Source"**
2. Select the social media platforms you want to display:
   - Twitter/X
   - Instagram
   - Facebook
   - YouTube
   - LinkedIn
   - etc.
3. Authenticate each account and grant permissions
4. Select specific accounts, hashtags, or pages to display

#### Customize Appearance
1. **Layout**: Choose grid, masonry, or carousel layout
2. **Theme**: Select light or dark theme
3. **Colors**: Customize to match LGFC branding
4. **Number of posts**: Set how many posts to display
5. **Auto-update**: Enable automatic refresh for new content

#### Configure Settings
1. **Filter content**: Set filters for inappropriate content
2. **Moderation**: Enable manual approval if needed
3. **Load more button**: Configure pagination
4. **Opening links**: Choose to open in new tab or same window

### 4. Get Widget ID

1. Click **"Publish"** or **"Save"**
2. Copy the **Widget ID** from the installation code
   - The code will look like: `<div class="elfsight-app-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"></div>`
   - Your Widget ID is the alphanumeric string: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`

### 5. Update the Application

There are two ways to add the Widget ID to your application:

#### Option A: Environment Variable (Recommended)

1. Add the Widget ID to your environment variables:
   ```bash
   # .env.local or Cloudflare Pages environment variables
   NEXT_PUBLIC_ELFSIGHT_WIDGET_ID=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```

2. Update `src/app/news/page.tsx`:
   ```tsx
   import SocialWall from "@/components/SocialWall";

   export default function News() {
     const widgetId = process.env.NEXT_PUBLIC_ELFSIGHT_WIDGET_ID;
     
     return (
       <div className="min-h-screen flex flex-col items-center justify-center p-8">
         <div className="max-w-4xl w-full space-y-8">
           <div className="text-center">
             <h1 className="text-4xl font-bold mb-4">News &amp; Q&amp;A</h1>
             <p className="text-lg text-foreground/80">
               Stay updated with the latest news and community discussions.
             </p>
           </div>
           <div className="mt-8">
             {widgetId ? (
               <SocialWall widgetId={widgetId} />
             ) : (
               <p className="text-center text-foreground/60">
                 Social feed configuration pending.
               </p>
             )}
           </div>
         </div>
       </div>
     );
   }
   ```

#### Option B: Direct Configuration

Update `src/app/news/page.tsx` to pass the Widget ID directly:
```tsx
<SocialWall widgetId="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX" />
```

### 6. Add to Cloudflare Pages Environment

If using environment variables:

1. Go to Cloudflare Dashboard > Pages > Your Project
2. Navigate to **Settings** > **Environment Variables**
3. Add a new variable:
   - **Variable name**: `NEXT_PUBLIC_ELFSIGHT_WIDGET_ID`
   - **Value**: Your Widget ID
4. Click **"Save"**
5. Redeploy your site for changes to take effect

### 7. Test the Widget

1. Build and run the site locally:
   ```bash
   npm run dev
   ```
2. Navigate to http://localhost:3000/news
3. Verify that the social media feed loads correctly
4. Check for any console errors in browser DevTools

### 8. Deploy

After testing locally:
1. Commit your changes
2. Push to the main branch
3. Cloudflare Pages will automatically deploy
4. Verify the widget works on production at https://www.lougehrigfanclub.com/news

## Component Details

### SocialWall Component

The `SocialWall.tsx` component:
- Dynamically loads the Elfsight platform script
- Prevents duplicate script loading
- Cleans up on component unmount
- Responsive design (max-width: 1200px)
- Uses lazy loading for better performance

### Props

```tsx
interface SocialWallProps {
  widgetId?: string; // Elfsight Widget ID (defaults to placeholder)
}
```

## Customization

### Styling

To customize the widget container, modify the inline styles in `SocialWall.tsx`:

```tsx
<div 
  className="elfsight-app-container" 
  style={{ 
    width: "100%", 
    maxWidth: "1200px", 
    margin: "0 auto",
    padding: "20px" // Add padding
  }}
>
```

Or add a CSS module for more advanced styling.

### Multiple Feeds

To display multiple social feeds (e.g., separate feeds for different platforms):

```tsx
<SocialWall widgetId="TWITTER_WIDGET_ID" />
<SocialWall widgetId="INSTAGRAM_WIDGET_ID" />
```

## Elfsight Plans

### Free Plan
- 200 widget views/month
- Elfsight branding visible
- Basic features

### Premium Plans
- Unlimited views
- Remove Elfsight branding
- Advanced features:
  - Custom CSS
  - Priority support
  - Multiple sources
  - Content moderation

Choose a plan based on expected traffic and requirements.

## Troubleshooting

### Widget Not Loading

1. **Check Widget ID**: Ensure the ID is correct and matches the Elfsight dashboard
2. **Check console errors**: Open DevTools and look for JavaScript errors
3. **Verify script loading**: Check Network tab for `platform.js`
4. **Clear cache**: Hard refresh the page (Ctrl+Shift+R)

### Widget Shows Error

1. **Check Elfsight account**: Ensure the widget is published and active
2. **Verify social connections**: Ensure connected accounts are still authorized
3. **Check plan limits**: Free plans have view limits
4. **Review widget settings**: Check for any configuration issues in Elfsight dashboard

### Content Not Updating

1. **Check auto-refresh settings**: Ensure auto-update is enabled in widget settings
2. **Manual refresh**: Some plans require manual refresh in dashboard
3. **Social API limits**: Platform APIs may have rate limits
4. **Wait time**: New posts may take a few minutes to appear

### Performance Issues

1. **Enable lazy loading**: The component uses `data-elfsight-app-lazy` by default
2. **Limit post count**: Reduce number of posts in widget settings
3. **Optimize images**: Enable image optimization in Elfsight settings
4. **Use CDN**: Elfsight uses CDN by default for assets

## Security Considerations

- The Elfsight script loads from `https://static.elfsight.com/` (secure CDN)
- Content is displayed in an iframe for security isolation
- No direct access to social media account credentials
- Widget operates within Elfsight's security framework

## Additional Resources

- [Elfsight Documentation](https://elfsight.com/help/)
- [Social Media Feed Widget Guide](https://elfsight.com/social-media-feed-widget/)
- [Elfsight Support](https://elfsight.com/support/)
- [Widget Customization Examples](https://elfsight.com/templates/)

## Alternative Solutions

If Elfsight doesn't meet your needs, consider:
- **Flockler**: Social media aggregator
- **Taggbox**: Social wall platform
- **Walls.io**: Social media walls
- **Custom implementation**: Using platform APIs directly (more complex)
