const express = require("express");
const cors = require("cors");
const postsRouter = require("./routes/posts");
const moderationRouter = require("./routes/moderation");
const authRouter = require("./routes/auth");
const storageRouter = require("./routes/storage");
const profileRouter = require("./routes/profile");
const { ensurePostsSchema } = require("./services/schema");
require("dotenv").config();

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Parse JSON only for JSON content types (express.json() already does this, but be explicit)
app.use(express.json({ 
  type: ['application/json', 'text/json'] 
}));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/moderate", moderationRouter);
app.use("/api/storage", storageRouter);
app.use("/api/profile", profileRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      database: "Appwrite",
      authentication: "Appwrite",
      storage: "Appwrite",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${port}/api/auth`);
    console.log(`📝 Posts endpoints: http://localhost:${port}/api/posts`);
    console.log(
      `🛡️  Moderation endpoints: http://localhost:${port}/api/moderate`
    );
    console.log(`📁 Storage endpoints: http://localhost:${port}/api/storage`);
    if (port !== DEFAULT_PORT) {
      console.warn(
        `⚠️  Default port ${DEFAULT_PORT} was busy. Running on ${port} instead. ` +
          `Set PORT in your .env to use this port explicitly.`
      );
    }
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = port + 1;
      console.error(
        `❌ Port ${port} is already in use. Attempting to use port ${nextPort}...`
      );
      startServer(nextPort);
    } else {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  });
};

async function bootstrap() {
  try {
    await ensurePostsSchema();
  } catch (error) {
    console.warn("Continuing without ensuring Appwrite schema:", error?.message || error);
  }

  startServer(DEFAULT_PORT);
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap backend:", error);
  process.exit(1);
});
