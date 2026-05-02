import { Client, Databases, Account, Storage, ID, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Initialize services
export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

// Database and collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '68f926d100165c31e432';
export const POSTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID || 'posts';
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users';
export const COMMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID || 'comments';
export const POST_LIKES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_POST_LIKES_COLLECTION_ID || 'postlikes';
export const SAVED_POSTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SAVED_POSTS_COLLECTION_ID || 'savedposts';

// Storage bucket IDs
export const MEDIA_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_MEDIA_BUCKET_ID || '68f93ad1001a1ef04399';

// Export ID and Query helpers
export { ID, Query };

export default client;
