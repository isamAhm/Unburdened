# Unburdened - Deployment Guide

## ✅ Migration Complete: Direct Appwrite Integration

Your app now uses Appwrite directly without the Express backend! This makes deployment much simpler.

## Architecture

```
Frontend (Next.js) → Appwrite Cloud
```

**What was removed:**
- Express backend server
- All `/backend/routes/*` files
- Authentication middleware
- API proxy layer

**What's now used:**
- Direct Appwrite SDK calls from frontend
- Appwrite authentication
- Appwrite database with permissions
- Appwrite storage

---

## 🚀 Deploy to Vercel

### Step 1: Prepare Your Repository

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Migrate to direct Appwrite integration"
   git push
   ```

2. **Make sure your `.gitignore` includes:**
   ```
   .env.local
   .env
   node_modules/
   .next/
   ```

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI (optional):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard (Recommended):**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - **Root Directory:** Set to `frontend`
   - **Framework Preset:** Next.js (auto-detected)
   - Click "Deploy"

3. **Or deploy via CLI:**
   ```bash
   cd frontend
   vercel
   ```

### Step 3: Configure Environment Variables in Vercel

In your Vercel project settings, add these environment variables:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68f9203d001c83b2af32
NEXT_PUBLIC_APPWRITE_DATABASE_ID=68f926d100165c31e432
NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID=posts
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID=comments
NEXT_PUBLIC_APPWRITE_POST_LIKES_COLLECTION_ID=postlikes
NEXT_PUBLIC_APPWRITE_SAVED_POSTS_COLLECTION_ID=savedposts
NEXT_PUBLIC_APPWRITE_MEDIA_BUCKET_ID=68f93ad1001a1ef04399
```

**How to add them:**
1. Go to your Vercel project
2. Click "Settings" → "Environment Variables"
3. Add each variable above
4. Select "Production", "Preview", and "Development"
5. Click "Save"

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:
- Go to "Deployments" tab
- Click the three dots on the latest deployment
- Click "Redeploy"

---

## 🔒 Configure Appwrite Permissions

### Important: Set up proper permissions in Appwrite Console

1. **Go to your Appwrite Console:** https://cloud.appwrite.io

2. **Posts Collection Permissions:**
   - Read: `any` (anyone can read posts)
   - Create: `users` (only authenticated users can create)
   - Update: `user:[USER_ID]` (only post owner can update)
   - Delete: `user:[USER_ID]` (only post owner can delete)

3. **Comments Collection Permissions:**
   - Read: `any`
   - Create: `users`
   - Update: `user:[USER_ID]`
   - Delete: `user:[USER_ID]`

4. **Post Likes Collection Permissions:**
   - Read: `any`
   - Create: `users`
   - Delete: `user:[USER_ID]`

5. **Saved Posts Collection Permissions:**
   - Read: `user:[USER_ID]` (only owner can see their saves)
   - Create: `users`
   - Delete: `user:[USER_ID]`

6. **Users Collection Permissions:**
   - Read: `user:[USER_ID]` (users can only read their own profile)
   - Create: `users`
   - Update: `user:[USER_ID]`
   - Delete: `user:[USER_ID]`

7. **Media Bucket Permissions:**
   - Read: `any` (profile images are public)
   - Create: `users`
   - Update: `user:[USER_ID]`
   - Delete: `user:[USER_ID]`
   - Set `fileSecurity: false` for public access

---

## 🧪 Test Your Deployment

After deployment, test these features:

- [ ] User registration
- [ ] User login
- [ ] Create a post
- [ ] Like a post
- [ ] Save a post
- [ ] Add a comment
- [ ] Upload profile picture
- [ ] Update profile
- [ ] View saved posts
- [ ] Delete own post

---

## 📝 What About Content Moderation?

Your moderation feature currently calls OpenAI API. You have two options:

### Option 1: Remove Moderation (Simplest)
Just remove the moderation check from `page.jsx`:

```javascript
// Remove this block:
try {
  const moderationData = await moderationAPI.moderateContent(newPost.trim());
  if (moderationData.flagged) {
    // ...
  }
} catch (moderationError) {
  console.warn("Moderation check failed, proceeding with post:", moderationError);
}
```

### Option 2: Create Appwrite Function for Moderation
1. Create an Appwrite Function
2. Add OpenAI API key to function environment
3. Call the function before creating posts

### Option 3: Create Single Next.js API Route
1. Create `frontend/src/app/api/moderate/route.js`
2. Add OpenAI API key to Vercel environment (without `NEXT_PUBLIC_` prefix)
3. Call this API route before creating posts

---

## 🎉 You're Done!

Your app is now deployed with:
- ✅ Frontend on Vercel
- ✅ Backend on Appwrite Cloud
- ✅ No separate backend server to manage
- ✅ Automatic scaling
- ✅ Free tier available

### Your Deployment URLs:
- **Frontend:** `https://your-app.vercel.app`
- **Appwrite:** `https://nyc.cloud.appwrite.io/v1`

---

## 🐛 Troubleshooting

### "User not authenticated" errors
- Check that Appwrite session cookies are working
- Verify CORS settings in Appwrite Console
- Add your Vercel domain to Appwrite's allowed platforms

### "Permission denied" errors
- Review Appwrite collection permissions
- Make sure document-level permissions are set correctly
- Check that `fileSecurity` is set to `false` for media bucket

### Environment variables not working
- Make sure all variables start with `NEXT_PUBLIC_`
- Redeploy after adding environment variables
- Check for typos in variable names

---

## 📚 Next Steps

1. **Add Custom Domain** (optional)
   - Go to Vercel project settings
   - Add your custom domain
   - Update Appwrite allowed platforms

2. **Set up Analytics** (optional)
   - Vercel Analytics (built-in)
   - Google Analytics
   - Plausible

3. **Monitor Performance**
   - Vercel Dashboard shows performance metrics
   - Appwrite Console shows API usage

4. **Backup Strategy**
   - Appwrite has automatic backups
   - Consider exporting data periodically

---

## 💰 Cost Estimate

**Free Tier:**
- Vercel: Free for personal projects
- Appwrite Cloud: Free tier includes:
  - 75,000 requests/month
  - 2GB bandwidth
  - 2GB storage
  - Unlimited users

**Paid Plans (if you exceed free tier):**
- Vercel Pro: $20/month
- Appwrite Pro: $15/month

For a small to medium app, free tier should be sufficient!
