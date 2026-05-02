const express = require("express");
const axios = require("axios");
const { functions } = require("../config/appwrite");
require("dotenv").config();

const router = express.Router();

// Content moderation using OpenAI
router.post("/", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    // If OpenAI API key is available, use OpenAI moderation
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        "https://api.openai.com/v1/moderations",
        { input: content },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      const flagged = response.data.results[0].flagged;
      res.json({ flagged, method: "openai" });
    } else {
      // Fallback to basic keyword filtering
      const flaggedKeywords = [
        "spam",
        "scam",
        "hate",
        "abuse",
        "harassment",
        "violence",
        "explicit",
        "inappropriate",
      ];

      const flagged = flaggedKeywords.some((keyword) =>
        content.toLowerCase().includes(keyword)
      );

      res.json({ flagged, method: "keyword" });
    }
  } catch (err) {
    console.error("POST /api/moderate failed:", err);
    const status = err?.response?.status || 500;
    const message =
      err?.response?.message || err?.message || "Failed to moderate content";
    res.status(status).json({ error: message });
  }
});

// Appwrite function-based moderation (if you set up Appwrite Functions)
router.post("/appwrite", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const response = await functions.createExecution(
      process.env.APPWRITE_MODERATION_FUNCTION_ID || "moderation",
      JSON.stringify({ content })
    );

    res.json({
      flagged: response.response === "true",
      method: "appwrite",
      executionId: response.$id,
    });
  } catch (err) {
    console.error("POST /api/moderate/appwrite failed:", err);
    const status = err?.response?.status || 500;
    const message =
      err?.response?.message ||
      err?.message ||
      "Failed to moderate content with Appwrite";
    res.status(status).json({ error: message });
  }
});

module.exports = router;
