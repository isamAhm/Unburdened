const { Client, Databases, Account, Storage, Functions } = require("node-appwrite");
require("dotenv").config();

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID);

if (process.env.APPWRITE_API_KEY) {
  client.setKey(process.env.APPWRITE_API_KEY);
} else if (process.env.APPWRITE_DEV_KEY) {
  client.setKey(process.env.APPWRITE_DEV_KEY);
}

// Initialize services
const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);
const functions = new Functions(client);

// Database and collection IDs
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "unburdened";
const POSTS_COLLECTION_ID = process.env.APPWRITE_POSTS_COLLECTION_ID || "posts";
const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID || "users";
const COMMENTS_COLLECTION_ID =
  process.env.APPWRITE_COMMENTS_COLLECTION_ID || "comments";
const POST_LIKES_COLLECTION_ID =
  process.env.APPWRITE_POST_LIKES_COLLECTION_ID || "postlikes";
const SAVED_POSTS_COLLECTION_ID =
  process.env.APPWRITE_SAVED_POSTS_COLLECTION_ID || "savedposts";

// Storage bucket IDs
const MEDIA_BUCKET_ID = process.env.APPWRITE_MEDIA_BUCKET_ID || "media";

module.exports = {
  client,
  databases,
  account,
  storage,
  functions,
  DATABASE_ID,
  POSTS_COLLECTION_ID,
  USERS_COLLECTION_ID,
  COMMENTS_COLLECTION_ID,
  POST_LIKES_COLLECTION_ID,
  SAVED_POSTS_COLLECTION_ID,
  MEDIA_BUCKET_ID,
};
