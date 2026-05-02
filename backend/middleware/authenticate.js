const AuthService = require("../services/auth");

module.exports = async function authenticateUser(req, res, next) {
  try {
    const sessionSecret = req.headers["x-appwrite-session"];

    if (!sessionSecret) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const verification = await AuthService.verifySession(sessionSecret);

    if (!verification.valid) {
      return res.status(401).json({ error: "Invalid session" });
    }

    req.userId = verification.userId;
    req.sessionSecret = sessionSecret;
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(401).json({ error: "Authentication required" });
  }
};

