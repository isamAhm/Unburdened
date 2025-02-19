const express = require("express");
const cors = require("cors");
const postsRouter = require("./routes/posts");
const moderationRouter = require("./routes/moderation");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/posts", postsRouter);
app.use("/api/moderate", moderationRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
