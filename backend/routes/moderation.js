const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

router.post("/", async (req, res) => {
  const { content } = req.body;

  try {
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
    res.json({ flagged });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to moderate content" });
  }
});

module.exports = router;
