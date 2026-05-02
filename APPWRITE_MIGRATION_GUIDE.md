# Appwrite Migration Guide: Reactions → Likes & Comments

This guide will help you update your Appwrite database to support the new like button and comment system.

## Step 1: Update Posts Collection

### Remove Old Reaction Attributes

1. Go to **Databases** → **unburdened** → **posts** collection
2. Go to the **Attributes** tab
3. **Delete** these attributes (if they exist):
   - `hearts` (Integer)
   - `wow` (Integer)
   - `laugh` (Integer)

### Add New Attributes

1. Still in the **posts** collection **Attributes** tab
2. **Add** these new attributes:

   **`likes`** (Integer)

   - Type: Integer
   - Required: Yes
   - Default: `0`
   - Array: No

   **`commentsCount`** (Integer)

   - Type: Integer
   - Required: Yes
   - Default: `0`
   - Array: No

3. **Verify** these attributes exist:

   - `content` (String, required, size: 1000)
   - `userId` (String, required, size: 255)
   - `mood` (String, required, size: 64)
   - `likes` (Integer, required, default: 0) ← NEW
   - `commentsCount` (Integer, required, default: 0) ← NEW

   **Note**: Appwrite automatically provides `$createdAt` for all documents, so you don't need to add a `createdAt` attribute.

## Step 2: Create Post Likes Collection

1. Go to **Databases** → **unburdened**
2. Click **Create Collection**
3. Set Collection ID: `postLikes`
4. Add the following attributes:

   **`id`** (String)

   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No
   - **Important**: This is required for the document structure

   **`postId`** (String)

   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No

   **`userId`** (String)

   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No

   **Note**: Appwrite automatically provides `$createdAt` for all documents, so you don't need to add a `createdAt` attribute.

5. **Create Index** (Important!):

   - Go to the **Indexes** tab
   - Click **Create Index**
   - Index Key: `postId_userId_unique`
   - Index Type: **Unique**
   - Attributes:
     - `postId` (ASC)
     - `userId` (ASC)
   - This prevents users from liking the same post twice

6. **Set Permissions**:
   - **Create**: `users` (authenticated users)
   - **Read**: `users` (authenticated users can read their own likes)
   - **Update**: None (likes can't be updated, only created/deleted)
   - **Delete**: `users` (authenticated users can unlike)

## Step 3: Create Comments Collection

1. Go to **Databases** → **unburdened**
2. Click **Create Collection**
3. Set Collection ID: `comments`
4. Add the following attributes:

   **`id`** (String)

   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No
   - **Important**: This is required for the document structure

   **`postId`** (String)

   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No

   **`userId`** (String)

   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No

   **`content`** (String)

   - Type: String
   - Size: 1000
   - Required: Yes
   - Array: No

   **`parentId`** (String)

   - Type: String
   - Size: 255
   - Required: **No** (optional - for nested replies)
   - Array: No

   **Note**: Appwrite automatically provides `$createdAt` for all documents, so you don't need to add a `createdAt` attribute.

5. **Create Index** (Optional but recommended):

   - Go to the **Indexes** tab
   - Click **Create Index**
   - Index Key: `postId_index`
   - Index Type: **Key**
   - Attributes:
     - `postId` (ASC)
   - This speeds up fetching comments for a post

6. **Set Permissions**:
   - **Create**: `users` (authenticated users can comment)
   - **Read**: `any` (anyone can read comments)
   - **Update**: `users` (authenticated users can edit their own comments)
   - **Delete**: `users` (authenticated users can delete their own comments)

## Step 4: Update Environment Variables

Make sure your backend `.env` file includes these collection IDs:

```env
APPWRITE_COMMENTS_COLLECTION_ID=comments
APPWRITE_POST_LIKES_COLLECTION_ID=postLikes
```

## Step 5: Verify Setup

1. **Restart your backend server** - it will automatically create missing attributes if `APPWRITE_ENSURE_SCHEMA=true` (default)

2. **Check backend logs** - you should see messages like:

   ```
   Appwrite posts collection schema updated: added integer attribute "likes".
   Appwrite posts collection schema updated: added integer attribute "commentsCount".
   ```

3. **Test the functionality**:
   - Try liking a post (should toggle like/unlike)
   - Try commenting on a post
   - Try replying to a comment (nested comments)

## Troubleshooting

### Error: "Unknown attribute: likes"

- Make sure you added the `likes` attribute to the `posts` collection
- Restart the backend server to trigger schema auto-creation

### Error: "Collection not found: postLikes"

- Make sure you created the `postLikes` collection with the exact ID: `postLikes`
- Check your `.env` file has `APPWRITE_POST_LIKES_COLLECTION_ID=postLikes`

### Error: "Collection not found: comments"

- Make sure you created the `comments` collection with the exact ID: `comments`
- Check your `.env` file has `APPWRITE_COMMENTS_COLLECTION_ID=comments`

### Likes are being added multiple times

- Make sure you created the unique index on `postId` + `userId` in the `postLikes` collection
- The index should be of type **Unique**

### Comments aren't showing in a tree structure

- Make sure the `parentId` attribute in the `comments` collection is set to **Not Required** (optional)
- The frontend builds the tree structure automatically based on `parentId`

## Summary of Changes

✅ **Removed**: `hearts`, `wow`, `laugh` attributes from `posts` collection  
✅ **Added**: `likes`, `commentsCount` attributes to `posts` collection  
✅ **Created**: `postLikes` collection with unique index  
✅ **Created**: `comments` collection with `parentId` for nested replies

After completing these steps, your app should support the new like button and comment tree functionality!
