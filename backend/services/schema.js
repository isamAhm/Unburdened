const {
  databases,
  DATABASE_ID,
  POSTS_COLLECTION_ID,
} = require("../config/appwrite");

const ALLOWED_MOODS = [
  "nothing",
  "hopeful",
  "anxious",
  "overwhelmed",
  "reflective",
  "grateful",
  "seekingSupport",
  "cannabis",
  "chill",
];

const SHOULD_ENSURE_SCHEMA =
  (process.env.APPWRITE_ENSURE_SCHEMA || "true").toLowerCase() !== "false";

async function listPostAttributes() {
  const response = await databases.listAttributes(
    DATABASE_ID,
    POSTS_COLLECTION_ID
  );
  return response?.attributes || [];
}

async function ensureStringAttributeExists(key, size, required, defaultValue) {
  if (!SHOULD_ENSURE_SCHEMA) {
    return;
  }

  try {
    const attributes = await listPostAttributes();
    const hasAttribute = attributes.some((attribute) => attribute?.key === key);

    if (hasAttribute) {
      return;
    }

    await databases.createStringAttribute(
      DATABASE_ID,
      POSTS_COLLECTION_ID,
      key,
      size,
      required,
      defaultValue,
      false
    );

    console.info(
      `Appwrite posts collection schema updated: added string attribute "${key}".`
    );
  } catch (error) {
    console.warn(
      "Unable to ensure Appwrite posts schema. Set APPWRITE_ENSURE_SCHEMA=false to skip.",
      error?.message || error
    );
  }
}

async function ensureIntegerAttributeExists(key, required = true, defaultValue = 0) {
  if (!SHOULD_ENSURE_SCHEMA) {
    return;
  }

  try {
    const attributes = await listPostAttributes();
    const hasAttribute = attributes.some((attribute) => attribute?.key === key);

    if (hasAttribute) {
      return;
    }

    await databases.createIntegerAttribute(
      DATABASE_ID,
      POSTS_COLLECTION_ID,
      key,
      required,
      defaultValue
    );

    console.info(
      `Appwrite posts collection schema updated: added integer attribute "${key}".`
    );
  } catch (error) {
    console.warn(
      `Unable to ensure Appwrite posts schema for ${key}. Set APPWRITE_ENSURE_SCHEMA=false to skip.`,
      error?.message || error
    );
  }
}

async function ensureMoodAttributeExists() {
  await ensureStringAttributeExists("mood", 64, true, ALLOWED_MOODS[0]);
}

async function ensurePostsSchema() {
  await ensureMoodAttributeExists();
  await ensureIntegerAttributeExists("likes");
  await ensureIntegerAttributeExists("commentsCount");
}

module.exports = {
  ensurePostsSchema,
};

