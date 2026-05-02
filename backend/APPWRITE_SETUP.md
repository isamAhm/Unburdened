# Appwrite Setup Guide for Unburdened Backend

## Prerequisites

1. Create an Appwrite account at [https://appwrite.io](https://appwrite.io)
2. Create a new project in your Appwrite console

## Step 1: Get Your Appwrite Credentials

✅ **Your Project Details:**

- **Project ID**: `68f9203d001c83b2af32`
- **Project Name**: `Unburdened`
- **Endpoint**: `https://nyc.cloud.appwrite.io/v1`

1. Go to your Appwrite project dashboard at [https://console.appwrite.io](https://console.appwrite.io)
2. Navigate to **Settings** → **API Keys**
3. Create a new API key with the following scopes:

   - `databases.read`
   - `databases.write`
   - `users.read`
   - `users.write`
   - `account`
   - `files.read`
   - `files.write`
   - `functions.read`
   - `functions.write`

4. Copy the **API Key** and update it in your `.env` file

## Step 2: Create Database and Collections

### Create Database

1. Go to **Databases** in your Appwrite console
2. Create a new database with ID: `unburdened`

### Create Collections

#### Posts Collection

1. Create a new collection with ID: `posts`
2. Add the following attributes:
   - `content` (String, required, size: 1000)
   - `userId` (String, required, size: 255)
   - `likes` (Integer, default: 0)
   - `commentsCount` (Integer, default: 0)
   - `mood` (String, required, size: 64)
   
   **Note**: Appwrite automatically provides `$createdAt` for all documents, so you don't need to add a `createdAt` attribute.

#### Users Collection

1. Create a new collection with ID: `users`
2. Add the following attributes:
   - `email` (String, required, size: 255)
   - `name` (String, required, size: 255)
   
   **Note**: Appwrite automatically provides `$createdAt` for all documents, so you don't need to add a `createdAt` attribute.

#### Comments Collection

1. Create a new collection with ID: `comments`
2. Add the following attributes:
   - `postId` (String, required, size: 255)
   - `userId` (String, required, size: 255)
   - `content` (String, required, size: 1000)
   - `parentId` (String, optional, size: 255)
   
   **Note**: Appwrite automatically provides `$createdAt` for all documents, so you don't need to add a `createdAt` attribute.

#### Post Likes Collection

1. Create a new collection with ID: `postLikes`
2. Add the following attributes:
   - `postId` (String, required, size: 255)
   - `userId` (String, required, size: 255)
   
   **Note**: Appwrite automatically provides `$createdAt` for all documents, so you don't need to add a `createdAt` attribute.
   
3. Add a unique index on `postId` + `userId` to prevent duplicate likes.

### Set Collection Permissions

For both collections, set permissions to:

- **Create**: `users` (authenticated users can create)
- **Read**: `any` (anyone can read)
- **Update**: `users` (authenticated users can update)
- **Delete**: `users` (authenticated users can delete)

## Step 3: Create Storage Bucket

1. Go to **Storage** in your Appwrite console
2. Create a new bucket with ID: `media`
3. Set the following permissions:
   - **Create**: `users` (authenticated users can upload)
   - **Read**: `any` (anyone can view)
   - **Update**: `users` (authenticated users can update)
   - **Delete**: `users` (authenticated users can delete)
4. Set file size limit to 10MB
5. Allow only these file types: `jpeg`, `jpg`, `png`, `gif`, `mp4`, `webm`, `mov`

## Step 4: Configure Environment Variables

✅ **Your `.env` file has been updated with your project details!**

```env
# Server configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Appwrite Configuration
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=68f9203d001c83b2af32
APPWRITE_PROJECT_NAME=Unburdened
APPWRITE_API_KEY=your_api_key_here  # ← Update this with your API key (must include the scopes above)
APPWRITE_ACCOUNT_API_KEY=           # Optional: provide a dedicated API key for auth flows (must include `account`)
APPWRITE_DEV_KEY=                   # Optional: Appwrite Dev Key (use for rate-limit free dev environments)
APPWRITE_POSTS_INCLUDE_TITLE=false        # Set to false if you removed the `title` attribute from the posts collection
APPWRITE_DATABASE_ID=unburdened
APPWRITE_POSTS_COLLECTION_ID=posts
APPWRITE_USERS_COLLECTION_ID=users
APPWRITE_COMMENTS_COLLECTION_ID=comments
APPWRITE_POST_LIKES_COLLECTION_ID=postLikes
APPWRITE_MEDIA_BUCKET_ID=media

# Optional: OpenAI API Key for content moderation
OPENAI_API_KEY=your_openai_api_key_here
```

**Next Step**: Get your API key from the Appwrite console and replace `your_api_key_here` in the `.env` file.

## Step 5: Test the Setup

1. Start your backend server:

   ```bash
   npm start
   ```

2. Test the health endpoint:

   ```bash
   curl http://localhost:5000/api/health
   ```

3. Test user registration:

   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
   ```

4. Test user login:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify` - Verify session

### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post (requires auth)
- `PUT /api/posts/:id/react` - Update post reaction
- `DELETE /api/posts/:id` - Delete a post (requires auth)

### Storage

- `POST /api/storage/upload` - Upload a file (requires auth)
- `GET /api/storage/download/:fileId` - Get file download URL
- `GET /api/storage/preview/:fileId` - Get file preview URL
- `DELETE /api/storage/:fileId` - Delete a file (requires auth)
- `GET /api/storage` - List files (requires auth)

### Moderation

- `POST /api/moderate` - Moderate content using OpenAI
- `POST /api/moderate/appwrite` - Moderate content using Appwrite Functions

## Features Included

✅ **User Authentication** - Complete registration, login, logout system
✅ **Database Operations** - Full CRUD operations for posts and users
✅ **File Storage** - Upload, download, preview, and delete files
✅ **Content Moderation** - OpenAI integration with keyword fallback
✅ **Session Management** - Secure session handling
✅ **Error Handling** - Comprehensive error handling and logging
✅ **CORS Configuration** - Proper CORS setup for frontend integration

## Next Steps

1. Set up your frontend to use these API endpoints
2. Implement real-time features using Appwrite's real-time subscriptions
3. Add more advanced content moderation using Appwrite Functions
4. Implement user profiles and additional user data
5. Add push notifications for reactions and interactions
