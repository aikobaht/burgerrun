# 🚀 BurgerRun Deployment Guide

## Quick Deploy to Vercel

### Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready (~2 minutes)
3. Go to **SQL Editor** in the left sidebar
4. Copy the entire contents of `supabase-migration.sql` from this repo
5. Paste and click **Run**
6. Go to **Settings > API** and copy:
   - Project URL
   - `anon` `public` API key

### Step 2: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aikobaht/burgerrun)

1. Click the button above or go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository: `https://github.com/aikobaht/burgerrun`
3. Configure environment variables:
   - `VITE_SUPABASE_URL` → Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` → Your Supabase anon/public key
4. Click **Deploy**
5. Wait ~2 minutes for deployment to complete
6. Visit your app! 🎉

### Step 3: Test the App

1. Create a new group order
2. Copy the share link
3. Open in a new incognito/private window and join
4. Add items to both orders
5. Check the Review and Print views

## Alternative: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **New site from Git**
3. Connect to GitHub and select `burgerrun`
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables (same as above)
6. Deploy!

## Environment Variables Reference

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Post-Deployment Checklist

- [ ] Test creating a group order
- [ ] Test joining via share link
- [ ] Test adding menu items
- [ ] Test customizations
- [ ] Test real-time updates (open two browsers)
- [ ] Test organizer review view
- [ ] Test print view
- [ ] Test on mobile device

## Troubleshooting

### "Failed to create group"
- Check Supabase credentials are correct
- Verify SQL migration was run successfully
- Check browser console for errors

### Real-time updates not working
- Verify Realtime is enabled in Supabase (Project Settings > API > Realtime)
- Check that tables are published: `ALTER PUBLICATION supabase_realtime ADD TABLE groups;`

### Build fails on Vercel
- Ensure all environment variables are set
- Check build logs for specific errors
- Verify `package.json` has correct dependencies

## Custom Domain (Optional)

### On Vercel:
1. Go to project Settings > Domains
2. Add your domain
3. Follow DNS configuration instructions

### On Netlify:
1. Go to Domain settings
2. Add custom domain
3. Configure DNS with your registrar

## Database Maintenance

### Clean up old groups (optional)
Run this SQL in Supabase to delete groups older than 7 days:

```sql
DELETE FROM groups 
WHERE created_at < NOW() - INTERVAL '7 days';
```

You can set this up as a cron job using Supabase Edge Functions.

## Monitoring

- **Supabase Dashboard:** Monitor database usage and API calls
- **Vercel Dashboard:** Check deployment status and analytics
- **Browser DevTools:** Debug real-time sync issues

## Support

For issues, check the GitHub repository:
https://github.com/aikobaht/burgerrun

---

Made with ❤️ for In-N-Out fans
