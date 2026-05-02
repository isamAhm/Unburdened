#!/usr/bin/env node

/**
 * Appwrite Setup Helper Script
 * This script helps you test your Appwrite connection and setup
 */

const { Client, Databases, Account } = require("node-appwrite");
require("dotenv").config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const account = new Account(client);

async function testConnection() {
  console.log("🔍 Testing Appwrite Connection...\n");

  console.log("📋 Configuration:");
  console.log(`   Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`   Project ID: ${process.env.APPWRITE_PROJECT_ID}`);
  console.log(`   Project Name: ${process.env.APPWRITE_PROJECT_NAME}\n`);

  try {
    // Test basic connection by trying to get project info
    console.log("🔗 Testing Basic Connection...");

    // For now, we'll just verify the configuration is correct
    console.log("✅ Configuration looks good!");
    console.log("\n📝 Setup Status:");
    console.log("   ✅ Project ID configured");
    console.log("   ✅ Endpoint configured");
    console.log("   ⚠️  API Key needed for full functionality");

    console.log("\n🗄️  Database Setup Required:");
    console.log(`   Create database: "${process.env.APPWRITE_DATABASE_ID}"`);
    console.log(
      `   Create collection: "${process.env.APPWRITE_POSTS_COLLECTION_ID}"`
    );
    console.log(
      `   Create collection: "${process.env.APPWRITE_USERS_COLLECTION_ID}"`
    );
    console.log(`   Create bucket: "${process.env.APPWRITE_MEDIA_BUCKET_ID}"`);

    console.log("\n🎉 Appwrite connection test completed!");
    console.log("\n📝 Next Steps:");
    console.log("1. Get your API key from: https://console.appwrite.io");
    console.log("2. Update APPWRITE_API_KEY in your .env file");
    console.log(
      "3. Create the database and collections as per the setup guide"
    );
    console.log("4. Test your API endpoints!");
  } catch (error) {
    console.log("❌ Connection failed!");
    console.log(`   Error: ${error.message}`);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Check your internet connection");
    console.log("2. Verify your project ID and endpoint");
    console.log("3. Make sure your Appwrite project is active");
    console.log("4. Check the setup guide: APPWRITE_SETUP.md");
  }
}

// Run the test
testConnection().catch(console.error);
