# Deployment Checklist

Use this checklist to ensure a smooth deployment.

---

## ✅ Pre-Deployment

### Local Testing
- [ ] Run `cd frontend && npm run dev`
- [ ] Test user registration
- [ ] Test user login
- [ ] Test creating a post
- [ ] Test liking a post
- [ ] Test saving a post
- [ ] Test commenting
- [ ] Test profile update
- [ ] Test avatar upload
- [ ] Test viewing saved posts
- [ ] Test deleting a post
- [ ] Test logout

### Code Review
- [ ] All files compile without errors
- [ ] No console errors in browser
- [ ] Environment variables are set in `frontend/.env.local`
- [ ] Git repository is up to date

---

## 🚀 Deployment

### Vercel Setup
- [ ] Create Vercel account (if needed)
- [ ] Import Git repository
- [ ] Set root directory to `frontend`
- [ ] Framework preset is "Next.js"

### Environment Variables in Vercel
Add these in Vercel dashboard → Settings → Environment Variables:

- [ ] `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- [ ] `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- [ ] `NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID`
- [ ] `NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID`
- [ ] `NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID`
- [ ] `NEXT_PUBLIC_APPWRITE_POST_LIKES_COLLECTION_ID`
- [ ] `NEXT_PUBLIC_APPWRITE_SAVED_POSTS_COLLECTION_ID`
- [ ] `NEXT_PUBLIC_APPWRITE_MEDIA_BUCKET_ID`

### Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete
- [ ] Note your deployment URL

---

## 🔐 Appwrite Configuration

### Add Platform
Go to Appwrite Console → Your Project → Settings → Platforms:

- [ ] Add Web platform
- [ ] Add your Vercel URL: `https://your-app.vercel.app`
- [ ] Add localhost for testing: `http://localhost:3000`

### Set Permissions

#### Posts Collection
- [ ] Read: `any`
- [ ] Create: `users`
- [ ] Update: `user:[USER_ID]`
- [ ] Delete: `user:[USER_ID]`

#### Comments Collection
- [ ] Read: `any`
- [ ] Create: `users`
- [ ] Update: `user:[USER_ID]`
- [ ] Delete: `user:[USER_ID]`

#### Post Likes Collection
- [ ] Read: `any`
- [ ] Create: `users`
- [ ] Delete: `user:[USER_ID]`

#### Saved Posts Collection
- [ ] Read: `user:[USER_ID]`
- [ ] Create: `users`
- [ ] Delete: `user:[USER_ID]`

#### Users Collection
- [ ] Read: `user:[USER_ID]`
- [ ] Create: `users`
- [ ] Update: `user:[USER_ID]`

#### Media Bucket
- [ ] Read: `any`
- [ ] Create: `users`
- [ ] Update: `user:[USER_ID]`
- [ ] Delete: `user:[USER_ID]`
- [ ] File Security: `false`

---

## 🧪 Post-Deployment Testing

### Test on Production URL
Visit your Vercel URL and test:

- [ ] Homepage loads correctly
- [ ] Can register new account
- [ ] Can login
- [ ] Can create a post
- [ ] Can see posts from other users
- [ ] Can like a post
- [ ] Can save a post
- [ ] Can comment on a post
- [ ] Can upload profile picture
- [ ] Can update profile
- [ ] Can view saved posts
- [ ] Can delete own post
- [ ] Can logout
- [ ] Refresh page maintains login state

### Check Browser Console
- [ ] No JavaScript errors
- [ ] No network errors
- [ ] No CORS errors

### Check Appwrite Console
- [ ] New users appear in Users collection
- [ ] New posts appear in Posts collection
- [ ] Likes appear in Post Likes collection
- [ ] Saves appear in Saved Posts collection
- [ ] Comments appear in Comments collection
- [ ] Profile images appear in Media bucket

---

## 🎉 Launch

### Final Steps
- [ ] Test with multiple users (use incognito mode)
- [ ] Test on mobile device
- [ ] Test on different browsers
- [ ] Share with friends for beta testing

### Optional Enhancements
- [ ] Add custom domain in Vercel
- [ ] Set up Vercel Analytics
- [ ] Add error monitoring (Sentry)
- [ ] Set up backup strategy
- [ ] Add rate limiting (Appwrite has built-in)

---

## 📝 Post-Launch

### Monitor
- [ ] Check Vercel dashboard for errors
- [ ] Check Appwrite console for API usage
- [ ] Monitor user feedback

### Cleanup (Optional)
- [ ] Delete `/backend` folder (after confirming everything works)
- [ ] Delete old API files in `/frontend/src/api`
- [ ] Update main README.md

---

## 🐛 If Something Goes Wrong

### Rollback Plan
1. Keep the `/backend` folder until you're 100% sure
2. Old code is still in Git history
3. Can revert commits if needed

### Common Issues
- **"User not authenticated"** → Check Appwrite platforms
- **"Permission denied"** → Check collection permissions
- **"CORS error"** → Add Vercel domain to Appwrite
- **Environment variables not working** → Redeploy after adding them

---

## ✅ Success Criteria

Your deployment is successful when:
- [ ] All features work on production
- [ ] No errors in browser console
- [ ] Users can register and login
- [ ] Posts can be created and viewed
- [ ] Profile pictures upload correctly
- [ ] App is fast and responsive

---

## 🎊 Congratulations!

Once all checkboxes are checked, your app is live! 🚀

Share your deployment URL and celebrate! 🎉
