const express = require("express");
const AuthService = require("../services/auth");
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({
      error: "Email, password, and name are required",
    });
  }

  try {
    const result = await AuthService.register(email, password, name);

    if (result.success) {
      res.status(201).json({
        message: "User registered successfully",
        user: result.user,
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error("POST /api/auth/register failed:", err);
    const status = err?.response?.status || 500;
    const message = err?.response?.message || err?.message || "Registration failed";
    res.status(status).json({ error: message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  try {
    const result = await AuthService.login(email, password);

    if (result.success) {
      res.json({
        message: "Login successful",
        session: result.session,
        user: result.user,
      });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (err) {
    console.error("POST /api/auth/login failed:", err);
    const status = err?.response?.status || 500;
    const message = err?.response?.message || err?.message || "Login failed";
    res.status(status).json({ error: message });
  }
});

// Logout user
router.post("/logout", async (req, res) => {
  const { sessionSecret } = req.body;

  if (!sessionSecret) {
    return res.status(400).json({ error: "Session secret is required" });
  }

  try {
    const result = await AuthService.logout(sessionSecret);

    if (result.success) {
      res.json({ message: "Logout successful" });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (err) {
    console.error("POST /api/auth/logout failed:", err);
    const status = err?.response?.status || 500;
    const message = err?.response?.message || err?.message || "Logout failed";
    res.status(status).json({ error: message });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  const sessionSecret = req.headers["x-appwrite-session"];

  if (!sessionSecret) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const result = await AuthService.getCurrentUser(sessionSecret);

    if (result.success) {
      res.json({ user: result.user });
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (err) {
    console.error("GET /api/auth/me failed:", err);
    const status = err?.response?.status || 500;
    const message = err?.response?.message || err?.message || "Failed to get user";
    res.status(status).json({ error: message });
  }
});

// Verify session
router.get("/verify", async (req, res) => {
  const sessionSecret = req.headers["x-appwrite-session"];

  if (!sessionSecret) {
    return res.status(401).json({ error: "Session secret required" });
  }

  try {
    const result = await AuthService.verifySession(sessionSecret);

    if (result.valid) {
      res.json({ valid: true, userId: result.userId });
    } else {
      res.status(401).json({ valid: false, error: result.error });
    }
  } catch (err) {
    console.error("GET /api/auth/verify failed:", err);
    const status = err?.response?.status || 500;
    const message = err?.response?.message || err?.message || "Session verification failed";
    res.status(status).json({ error: message });
  }
});

module.exports = router;
