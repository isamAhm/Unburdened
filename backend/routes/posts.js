const express = require("express");
const DatabaseService = require("../services/database");
const authenticateUser = require("../middleware/authenticate");
const router = express.Router();

// Fetch posts created by the authenticated user
router.get("/mine", authenticateUser, async (req, res) => {
  try {
    const posts = await DatabaseService.listUserPosts(req.userId);
    res.json(posts);
  } catch (err) {
    console.error("GET /api/posts/mine failed:", err);
    res.status(500).json({ error: err.message || "Failed to fetch posts" });
  }
});

// Fetch all posts
router.get("/", async (req, res) => {
  try {
    const posts = await DatabaseService.getAllPosts();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

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

// Create a new post (requires authentication)
router.post("/", authenticateUser, async (req, res) => {
  const { content, mood } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Content is required" });
  }

  if (!mood || !ALLOWED_MOODS.includes(mood)) {
    return res.status(400).json({ error: "Valid mood is required" });
  }

  try {
    const post = await DatabaseService.createPost(content, mood, req.userId);
    res.json(post);
  } catch (err) {
    console.error("POST /api/posts failed:", err);
    const status = err?.response?.status || 500;
    const message =
      err?.response?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to create post";
    res.status(status).json({ error: message });
  }
});

// Get saved posts for authenticated user (MUST be before /:id routes)
router.get("/saved/list", authenticateUser, async (req, res) => {
  try {
    const posts = await DatabaseService.listSavedPosts(req.userId);
    res.json(posts);
  } catch (err) {
    console.error("GET /api/posts/saved/list failed:", err);
    res.status(500).json({ error: err.message || "Failed to fetch saved posts" });
  }
});

// Update post content (requires authentication)
router.put("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const post = await DatabaseService.getPost(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId !== req.userId) {
      return res.status(403).json({ error: "You do not have permission to edit this post" });
    }

    const updated = await DatabaseService.updatePost(id, {
      content: content.trim(),
    });

    res.json(updated);
  } catch (err) {
    console.error("PUT /api/posts/:id failed:", err);
    const status = err?.code === 404 ? 404 : err?.response?.status || 500;
    const message = err?.response?.message || err?.message || "Failed to update post";
    res.status(status).json({ error: message });
  }
});

// Toggle like on a post
router.put("/:id/like", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await DatabaseService.togglePostLike(id, req.userId);
    res.json(result);
  } catch (err) {
    console.error("PUT /api/posts/:id/like failed:", err);
    const status = err?.response?.status || 500;
    const message =
      err?.response?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to update like";
    res.status(status).json({ error: message });
  }
});

// Toggle save on a post
router.put("/:id/save", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await DatabaseService.toggleSavePost(id, req.userId);
    res.json(result);
  } catch (err) {
    console.error("PUT /api/posts/:id/save failed:", err);
    const status = err?.response?.status || 500;
    const message =
      err?.response?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to update save";
    res.status(status).json({ error: message });
  }
});

// Fetch comments for a post
router.get("/:id/comments", async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await DatabaseService.listComments(id);
    res.json(comments);
  } catch (err) {
    console.error("GET /api/posts/:id/comments failed:", err);
    res.status(500).json({ error: err.message || "Failed to fetch comments" });
  }
});

// Add a comment to a post
router.post("/:id/comments", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { content, parentId } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  try {
    const comment = await DatabaseService.addComment(
      id,
      req.userId,
      content.trim(),
      parentId || null
    );
    res.json(comment);
  } catch (err) {
    console.error("POST /api/posts/:id/comments failed:", err);
    const status = err?.response?.status || 400;
    const message =
      err?.response?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to add comment";
    res.status(status).json({ error: message });
  }
});

// Delete a post (requires authentication)
router.delete("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await DatabaseService.getPost(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId !== req.userId) {
      return res.status(403).json({ error: "You do not have permission to delete this post" });
    }

    const result = await DatabaseService.deletePost(id);
    res.json(result);
  } catch (err) {
    console.error("DELETE /api/posts/:id failed:", err);
    const status = err?.code === 404 ? 404 : err?.response?.status || 500;
    const message = err?.response?.message || err?.message || "Failed to delete post";
    res.status(status).json({ error: message });
  }
});

module.exports = router;
