"use client";
import React from "react";
import { useState, useCallback, useEffect } from "react";



function MainComponent() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [userReactions, setUserReactions] = useState({});
  const [error, setError] = useState("");
  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch("/api/db/socialunburdenedplatform", {
        method: "POST",
        body: JSON.stringify({
          query: "SELECT * FROM `posts` ORDER BY `created_at` DESC",
        }),
      });
      const data = await response.json();
      setPosts(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedReactions = localStorage.getItem("userReactions");
    if (savedReactions) {
      setUserReactions(JSON.parse(savedReactions));
    }
  }, []);

  useEffect(() => {
    fetch("/api/db/socialunburdenedplatform", {
      method: "POST",
      body: JSON.stringify({
        query:
          "CREATE TABLE IF NOT EXISTS `posts` (id TEXT PRIMARY KEY, content TEXT, created_at TEXT, hearts INTEGER, wow INTEGER, laugh INTEGER)",
      }),
    }).then(() => {
      fetchPosts();
    });
  }, [fetchPosts]);

  const addPost = useCallback(async () => {
    if (!newPost.trim()) return;
    setError("");

    try {
      const moderationResponse = await fetch("/integrations/text-moderation/", {
        method: "POST",
        body: JSON.stringify({ input: newPost.trim() }),
      });

      const moderationData = await moderationResponse.json();

      if (moderationData.results[0].flagged) {
        setError("This content cannot be posted. Please try something else.");
        return;
      }

      await fetch("/api/db/socialunburdenedplatform", {
        method: "POST",
        body: JSON.stringify({
          query:
            "INSERT INTO `posts` (content, created_at, hearts, wow, laugh) VALUES (?, ?, 0, 0, 0)",
          values: [newPost.trim(), new Date().toISOString()],
        }),
      });
      setNewPost("");
      fetchPosts();
    } catch (error) {
      setError("Something went wrong. Please try again.");
    }
  }, [newPost, fetchPosts]);
  const react = useCallback(
    async (postId, reaction) => {
      const reactionKey = `${postId}-${reaction}`;
      const hasReacted = userReactions[reactionKey];

      const newValue = hasReacted ? -1 : 1;
      const newReactions = {
        ...userReactions,
        [reactionKey]: !hasReacted,
      };

      setUserReactions(newReactions);
      localStorage.setItem("userReactions", JSON.stringify(newReactions));

      await fetch("/api/db/socialunburdenedplatform", {
        method: "POST",
        body: JSON.stringify({
          query: `UPDATE \`posts\` SET \`${reaction}\` = \`${reaction}\` + ? WHERE \`id\` = ?`,
          values: [newValue, postId],
        }),
      });
      fetchPosts();
    },
    [fetchPosts, userReactions]
  );

  return (
    <div className="min-h-screen bg-[#151515]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-white mb-2">
            <i className="fas fa-comment-dots mr-2"></i>
            Unburdened
          </h1>
          <p className="text-[#A4A4A4] text-sm">Share your confessions anonymously</p>
        </div>
        <div className="bg-[#1E1E1E] rounded-lg p-4 mb-8 border border-[#2A2A2A]">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            maxLength={150}
            placeholder="Confess something..."
            className="w-full bg-[#151515] text-white rounded p-3 mb-3 resize-none h-24 focus:outline-none border border-[#2A2A2A] placeholder:text-[#A4A4A4] text-sm"
          />
          <div className="flex flex-col space-y-2">
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#A4A4A4]">
                {150 - newPost.length} left
              </span>
              <button
                onClick={addPost}
                disabled={!newPost.trim()}
                className="bg-[#2A2A2A] text-white px-4 py-2 rounded text-sm hover:bg-[#353535] disabled:opacity-50"
              >
                Confess
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-sm text-[#A4A4A4]">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(posts || []).map((post) => (
              <div
                key={post.id}
                className="bg-[#1E1E1E] rounded-lg p-4 shadow-lg border border-[#2A2A2A] flex flex-col justify-between h-full"
              >
                <p className="text-white text-sm mb-3 break-words">
                  {post.content}
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => react(post.id, "hearts")}
                    className={`text-[#A4A4A4] hover:text-white text-sm flex items-center gap-1.5 transition-colors ${
                      userReactions[`${post.id}-hearts`] ? "text-white" : ""
                    }`}
                  >
                    <i
                      className={`${
                        userReactions[`${post.id}-hearts`] ? "fas" : "far"
                      } fa-heart`}
                    ></i>
                    <span>{post.hearts || 0}</span>
                  </button>
                  <button
                    onClick={() => react(post.id, "wow")}
                    className={`text-[#A4A4A4] hover:text-white text-sm flex items-center gap-1.5 transition-colors ${
                      userReactions[`${post.id}-wow`] ? "text-white" : ""
                    }`}
                  >
                    <i
                      className={`${
                        userReactions[`${post.id}-wow`] ? "fas" : "far"
                      } fa-surprise`}
                    ></i>
                    <span>{post.wow || 0}</span>
                  </button>
                  <button
                    onClick={() => react(post.id, "laugh")}
                    className={`text-[#A4A4A4] hover:text-white text-sm flex items-center gap-1.5 transition-colors ${
                      userReactions[`${post.id}-laugh`] ? "text-white" : ""
                    }`}
                  >
                    <i
                      className={`${
                        userReactions[`${post.id}-laugh`] ? "fas" : "far"
                      } fa-laugh`}
                    ></i>
                    <span>{post.laugh || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MainComponent;