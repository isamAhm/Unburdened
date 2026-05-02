# Quick Start Guide

## 🎉 Your App is Ready for Deployment!

The migration to direct Appwrite integration is complete. Here's what to do next:

---

## 1. Test Locally (5 minutes)

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` and test:
- ✅ Register a new account
- ✅ Create a post
- ✅ Like and save posts
- ✅ Upload profile picture

---

### Option A: Via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. **Important:** Set "Root Directory" to `frontend`
5. Add environment variables (see below)
6. Click "Deploy"

### Option B: Via CLI

```bash
npm i -g vercel
cd frontend
vercel
```

---

## 3. Add Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables

Add these (copy from `frontend/.env.local`):

```
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

Then click "Redeploy" to apply the changes.

---

## 4. Configure Appwrite (Important!)

Go to [Appwrite Console](https://cloud.appwrite.io):

### Add Your Vercel Domain

1. Go to your project settings
2. Click "Platforms"
3. Add your Vercel domain: `https://your-app.vercel.app`
4. Also add `http://localhost:3000` for local development

### Set Collection Permissions

For each collection, set these permissions:

**Posts Collection:**
- Read: `any`
- Create: `users`
- Update: `user:[USER_ID]`
- Delete: `user:[USER_ID]`

**Comments Collection:**
- Read: `any`
- Create: `users`
- Update: `user:[USER_ID]`
- Delete: `user:[USER_ID]`

**Post Likes Collection:**
- Read: `any`
- Create: `users`
- Delete: `user:[USER_ID]`

**Saved Posts Collection:**
- Read: `user:[USER_ID]`
- Create: `users`
- Delete: `user:[USER_ID]`

**Users Collection:**
- Read: `user:[USER_ID]`
- Create: `users`
- Update: `user:[USER_ID]`

**Media Bucket:**
- Read: `any`
- Create: `users`
- Update: `user:[USER_ID]`
- Delete: `user:[USER_ID]`
- Set `fileSecurity: false`

---

## 5. Test Production (5 minutes)

Visit your Vercel URL and test all features again.

---

## ✅ Done!

Your app is now live with:
- Frontend on Vercel (free tier)
- Backend on Appwrite Cloud (free tier)
- No server management needed
- Automatic scaling

---

## 📚 More Information

- **Full deployment guide:** See `DEPLOYMENT_GUIDE.md`
- **What changed:** See `MIGRATION_SUMMARY.md`
- **Troubleshooting:** See `DEPLOYMENT_GUIDE.md` → Troubleshooting section

---

## 🐛 Issues?

### "User not authenticated"
- Add your Vercel domain to Appwrite platforms
- Check that cookies are enabled

### "Permission denied"
- Review Appwrite collection permissions above
- Make sure you're logged in

### Environment variables not working
- Redeploy after adding variables
- Check for typos in variable names
- Make sure they all start with `NEXT_PUBLIC_`

---

## 🎊 Congratulations!

You've successfully migrated to a modern, serverless architecture!
