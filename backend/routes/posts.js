const express = require("express");
const db = require("../db");
const router = express.Router();

// Fetch all posts
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Create a new post
router.post("/", async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const result = await db.query(
      "INSERT INTO posts (content) VALUES ($1) RETURNING *",
      [content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Update reaction counts
router.put("/:id/react", async (req, res) => {
  const { id } = req.params;
  const { reaction } = req.body;

  if (!["hearts", "wow", "laugh"].includes(reaction)) {
    return res.status(400).json({ error: "Invalid reaction type" });
  }

  try {
    const result = await db.query(
      `UPDATE posts SET ${reaction} = ${reaction} + 1 WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update reaction" });
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM posts WHERE id = $1", [id]);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

module.exports = router;
