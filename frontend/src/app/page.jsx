"use client";
import React from "react";
import { useState, useCallback, useEffect } from "react";
import { postsAPI } from "../api/posts-appwrite";
import { moderationAPI } from "../api/moderation";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";
import ProfileModal from "../components/ProfileModal";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

const MOOD_OPTIONS = [
  { value: "nothing", label: "Nothing", icon: "fa-minus-circle" },
  { value: "hopeful", label: "Hopeful", icon: "fa-sun" },
  { value: "anxious", label: "Anxious", icon: "fa-heartbeat" },
  { value: "overwhelmed", label: "Overwhelmed", icon: "fa-water" },
  { value: "reflective", label: "Reflective", icon: "fa-moon" },
  { value: "grateful", label: "Grateful", icon: "fa-hands-praying" },
  { value: "seekingSupport", label: "Seeking Support", icon: "fa-hands-helping" },
  { value: "cannabis", label: "Cannabis", icon: "fa-cannabis" },
  { value: "chill", label: "Chill", icon: "fa-wind" },
];

const MOOD_METADATA = MOOD_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {});

const LikeButton = ({ liked, count, disabled, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={liked}
      className={`text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${liked ? "text-white" : "text-[#A4A4A4] hover:text-white"
        }`}
    >
      {/* Original like icon, but filled when liked and with a tiny bounce animation */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="17"
        viewBox="0 0 24 24"
        className={`transition-transform duration-150 justify-center text-center items-center ${liked ? "scale-110 transition -translate-y-0.5" : ""
          }`}
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
      </svg>
      <span>{count}</span>
    </button>
  );
};

const LIKE_STORAGE_KEY = "userLikedPosts";
const SAVE_STORAGE_KEY = "userSavedPosts";

function MainComponent() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[0].value);
  const [filterMood, setFilterMood] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState({});
  const [userSaves, setUserSaves] = useState({});
  const [likePending, setLikePending] = useState({});
  const [savePending, setSavePending] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsVisible, setCommentsVisible] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentTargets, setCommentTargets] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [activeCommentModal, setActiveCommentModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      const data = await postsAPI.getAllPosts();
      // Normalize posts to ensure they have an 'id' field
      const normalized = (data || []).map((post) => ({
        ...post,
        id: post.$id || post.id,
      }));
      setPosts(normalized);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedLikes = localStorage.getItem(LIKE_STORAGE_KEY);
    if (savedLikes) {
      try {
        const parsed = JSON.parse(savedLikes);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setUserLikes(parsed);
        } else {
          localStorage.removeItem(LIKE_STORAGE_KEY);
        }
      } catch (err) {
        console.warn("Failed to parse stored likes, clearing...", err);
        localStorage.removeItem(LIKE_STORAGE_KEY);
      }
    }

    const savedSaves = localStorage.getItem(SAVE_STORAGE_KEY);
    if (savedSaves) {
      try {
        const parsed = JSON.parse(savedSaves);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          setUserSaves(parsed);
        } else {
          localStorage.removeItem(SAVE_STORAGE_KEY);
        }
      } catch (err) {
        console.warn("Failed to parse stored saves, clearing...", err);
        localStorage.removeItem(SAVE_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const persistLikes = useCallback((likesMap) => {
    try {
      localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(likesMap));
    } catch (err) {
      console.warn("Failed to persist likes", err);
    }
  }, []);

  const persistSaves = useCallback((savesMap) => {
    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(savesMap));
    } catch (err) {
      console.warn("Failed to persist saves", err);
    }
  }, []);

  const refreshSavedState = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const savedData = await postsAPI.getSavedPosts();
      const savedIds = (savedData || []).reduce((acc, post) => {
        const postId = post.$id || post.id;
        acc[postId] = true;
        return acc;
      }, {});

      setUserSaves(savedIds);
      persistSaves(savedIds);
    } catch (error) {
      console.error("Error refreshing saved state:", error);
    }
  }, [isAuthenticated, persistSaves]);

  const fetchCommentsForPost = useCallback(async (postId) => {
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const data = await postsAPI.getComments(postId);
      const normalized = (data || []).map((comment) => ({
        ...comment,
        id: comment.$id || comment.id,
      }));
      setCommentsByPost((prev) => ({ ...prev, [postId]: normalized }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  }, []);

  const addPost = useCallback(async () => {
    if (!newPost.trim()) return;

    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      toast.error("Please login to post a confession");
      return;
    }

    setError("");

    try {
      // Optional: Add content moderation
      try {
        const moderationData = await moderationAPI.moderateContent(newPost.trim());
        if (moderationData.flagged) {
          const errorMsg = "This content cannot be posted. Please try something else.";
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }
      } catch (moderationError) {
        console.warn("Moderation check failed, proceeding with post:", moderationError);
      }

      // Create post with user ID
      await postsAPI.createPost(newPost.trim(), selectedMood, user.id);
      setNewPost("");
      setSelectedMood(MOOD_OPTIONS[0].value);
      toast.success("Confession posted successfully!");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      const errorMsg = error.response?.data?.error || "Something went wrong. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  }, [newPost, selectedMood, fetchPosts, isAuthenticated, user]);
  const toggleLike = useCallback(
    async (postId) => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        toast.error("Please login to like posts");
        return;
      }

      const isPending = likePending[postId];
      if (isPending) {
        return;
      }

      setLikePending((prev) => ({ ...prev, [postId]: true }));

      try {
        const result = await postsAPI.toggleLike(postId);

        setUserLikes((prev) => {
          const next = { ...prev };
          if (result.liked) {
            next[postId] = true;
          } else {
            delete next[postId];
          }
          persistLikes(next);
          return next;
        });

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: result.likes } : post
          )
        );
      } catch (error) {
        console.error("Error toggling like:", error);
        const errorMsg = error.response?.data?.error || error.message || "Failed to update like";
        toast.error(errorMsg);
        await fetchPosts();
      } finally {
        setLikePending((prev) => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
      }
    },
    [fetchPosts, isAuthenticated, likePending, persistLikes]
  );

  const toggleSave = useCallback(
    async (postId) => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        toast.error("Please login to save posts");
        return;
      }

      const isPending = savePending[postId];
      if (isPending) {
        return;
      }

      setSavePending((prev) => ({ ...prev, [postId]: true }));

      try {
        const result = await postsAPI.toggleSave(postId);

        setUserSaves((prev) => {
          const next = { ...prev };
          if (result.saved) {
            next[postId] = true;
          } else {
            delete next[postId];
          }
          persistSaves(next);
          return next;
        });

        // Toast after state update to avoid duplicates
        if (result.saved) {
          toast.success("Confession saved");
        } else {
          toast.success("Confession unsaved");
        }
      } catch (error) {
        console.error("Error toggling save:", error);
        const errorMsg = error.response?.data?.error || error.message || "Failed to update save";
        toast.error(errorMsg);
      } finally {
        setSavePending((prev) => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
      }
    },
    [isAuthenticated, savePending, persistSaves]
  );

  const toggleComments = useCallback(
    async (postId) => {
      // Open modal and fetch comments
      setActiveCommentModal(postId);

      if (!commentsByPost[postId]) {
        await fetchCommentsForPost(postId);
      }
    },
    [commentsByPost, fetchCommentsForPost]
  );

  const handleCommentSubmit = useCallback(
    async (postId) => {
      if (!isAuthenticated) {
        setShowAuthModal(true);
        toast.error("Please login to comment");
        return;
      }

      const content = (commentDrafts[postId] || "").trim();
      if (!content) {
        return;
      }

      const target = commentTargets[postId];

      try {
        await postsAPI.addComment(postId, content, target?.id);
        setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
        setCommentTargets((prev) => ({ ...prev, [postId]: null }));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                ...post,
                commentsCount: (post.commentsCount || 0) + 1,
              }
              : post
          )
        );
        await fetchCommentsForPost(postId);
        toast.success("Comment added");
      } catch (error) {
        console.error("Error adding comment:", error);
        const errorMsg = error.message || "Failed to add comment";
        toast.error(errorMsg);
      }
    },
    [commentDrafts, commentTargets, fetchCommentsForPost, isAuthenticated]
  );

  const handleDeleteComment = useCallback(
    async (postId, commentId) => {
      // Set the confirmation state instead of using confirm()
      setConfirmDelete({ postId, commentId });
    },
    []
  );

  const executeDeleteComment = useCallback(
    async () => {
      if (!confirmDelete) return;

      const { postId, commentId } = confirmDelete;

      try {
        await postsAPI.deleteComment(commentId, postId);
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                ...post,
                commentsCount: Math.max(0, (post.commentsCount || 0) - 1),
              }
              : post
          )
        );
        await fetchCommentsForPost(postId);
        toast.success("Comment deleted");
      } catch (error) {
        console.error("Error deleting comment:", error);
        const errorMsg = error.message || "Failed to delete comment";
        toast.error(errorMsg);
      }
    },
    [confirmDelete, fetchCommentsForPost]
  );

  const handleReplySelect = useCallback((postId, comment) => {
    setCommentTargets((prev) => ({
      ...prev,
      [postId]: {
        id: comment.id,
        content: comment.content,
        userId: comment.userId,
      },
    }));
  }, []);

  const clearReplyTarget = useCallback((postId) => {
    setCommentTargets((prev) => ({ ...prev, [postId]: null }));
  }, []);

  const buildCommentTree = useCallback((comments = []) => {
    const map = {};
    const roots = [];
    comments.forEach((comment) => {
      const commentId = comment.id || comment.$id;
      map[commentId] = {
        ...comment,
        id: commentId,
        children: [],
      };
    });

    Object.values(map).forEach((comment) => {
      if (comment.parentId && map[comment.parentId]) {
        map[comment.parentId].children.push(comment);
      } else {
        roots.push(comment);
      }
    });

    return roots;
  }, []);

  const renderCommentNodes = (postId, nodes, depth = 0) => {
    if (!nodes || !nodes.length) {
      return null;
    }

    return nodes.map((comment) => {
      const commenterLabel = comment.userId
        ? `Anon ${comment.userId.slice(-4)}`
        : "Anonymous";
      const timestamp = comment.$createdAt
        ? new Date(comment.$createdAt).toLocaleString()
        : "";

      return (
        <div
          key={comment.id}
          className={`mt-3 ${depth > 0 ? "ml-4 border-l border-[#2A2A2A] pl-4" : ""
            }`}
        >
          <div className="flex justify-between text-[11px] text-[#A4A4A4]">
            <span>{commenterLabel}</span>
            {timestamp && <span className="text-[#4A4A4A]">{timestamp}</span>}
          </div>
          <p className="text-sm text-white mt-1 whitespace-pre-line">
            {comment.content}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {isAuthenticated && (
              <button
                onClick={() => handleReplySelect(postId, comment)}
                className="text-xs text-[#A4A4A4] hover:text-white flex items-center gap-1"
              >
                <i className="far fa-comment-dots"></i>
                Reply
              </button>
            )}
            {user && comment.userId === user.id && (
              <button
                onClick={() => handleDeleteComment(postId, comment.id)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <i className="far fa-trash-alt"></i>
                Delete
              </button>
            )}
          </div>
          {comment.children?.length
            ? renderCommentNodes(postId, comment.children, depth + 1)
            : null}
        </div>
      );
    });
  };

  const renderCommentSection = (postId) => {
    const comments = commentsByPost[postId] || [];
    const tree = buildCommentTree(comments);
    const isLoading = loadingComments[postId];

    return (
      <div>
        {isLoading ? (
          <div className="text-xs text-[#A4A4A4]">Loading comments...</div>
        ) : tree.length ? (
          renderCommentNodes(postId, tree)
        ) : (
          <p className="text-xs text-[#4A4A4A]">Be the first to comment</p>
        )}
      </div>
    );
  };

  const renderCommentInput = (postId) => {
    const draft = commentDrafts[postId] || "";
    const replyTarget = commentTargets[postId];

    return (
      <div className="border-t border-[#2A2A2A] bg-[#1E1E1E]/20 p-4 sm:p-6">
        {isAuthenticated ? (
          <div>
            {replyTarget ? (
              <div className="text-xs text-[#A4A4A4] mb-2 flex items-center justify-between">
                <span>
                  Replying to{" "}
                  {replyTarget.userId
                    ? `Anon ${replyTarget.userId.slice(-4)}`
                    : "Anonymous"}
                  :{" "}
                  <em className="text-[#FFFFFFB3]">
                    {replyTarget.content.slice(0, 40)}
                    {replyTarget.content.length > 40 ? "..." : ""}
                  </em>
                </span>
                <button
                  className="text-[10px] text-[#FF8A8A]"
                  onClick={() => clearReplyTarget(postId)}
                >
                  Cancel
                </button>
              </div>
            ) : null}
            <textarea
              value={draft}
              onChange={(e) =>
                setCommentDrafts((prev) => ({
                  ...prev,
                  [postId]: e.target.value,
                }))
              }
              maxLength={500}
              placeholder="Share your thoughts..."
              className="w-full bg-[#1e1e1e]/70 backdrop-blur-lg text-white rounded p-2 text-sm border border-[#2A2A2A] focus:outline-none resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[11px] text-[#4A4A4A]">
                {500 - draft.length} characters left
              </span>
              <button
                onClick={() => handleCommentSubmit(postId)}
                disabled={!draft.trim()}
                className="text-xs bg-[#2A2A2A] text-white px-3 py-1.5 rounded disabled:opacity-50"
              >
                Post Comment
              </button>
            </div>
          </div>
        ) : (
          <button
            className="text-xs text-[#A4A4A4] hover:text-white flex items-center gap-1"
            onClick={() => setShowAuthModal(true)}
          >
            <i className="fas fa-lock"></i>
            Login to join the conversation
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#151515]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-medium text-white mb-2">
                <i className="fas fa-comment-dots mr-2"></i>
                Unburdened
              </h1>
              <p className="text-[#A4A4A4] text-sm">Share your confessions anonymously</p>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="bg-[#2A2A2A] text-white px-3 py-1 rounded text-sm hover:bg-[#353535] transition-colors"
                  >
                    Profile
                  </button>
                  <span className="text-[#A4A4A4] text-sm">
                    Welcome, {user?.name || user?.email}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-[#2A2A2A] text-white px-3 py-1 rounded text-sm hover:bg-[#353535] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-[#2A2A2A] text-white px-4 py-2 rounded text-sm hover:bg-[#353535] transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="bg-[#1E1E1E] rounded-lg p-4 mb-8 border border-[#2A2A2A]">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            maxLength={1000}
            placeholder={isAuthenticated ? "Confess something..." : "Login to share your confessions..."}
            disabled={!isAuthenticated}
            className="w-full bg-[#151515] text-white rounded p-3 mb-3 resize-none h-24 focus:outline-none border border-[#2A2A2A] placeholder:text-[#A4A4A4] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="mb-3">
            <span className="text-xs text-[#A4A4A4] uppercase tracking-wide">How are you feeling?</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {MOOD_OPTIONS.map((option) => {
                const isActive = selectedMood === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedMood(option.value)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors border ${isActive
                      ? "bg-white text-[#151515] border-white"
                      : "bg-[#2A2A2A] text-[#A4A4A4] border-[#3A3A3A] hover:bg-[#353535] hover:text-white"
                      }`}
                  >
                    <i className={`fas ${option.icon}`}></i>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#A4A4A4]">
                {1000 - newPost.length} left
              </span>
              <button
                onClick={addPost}
                disabled={!newPost.trim() || !isAuthenticated}
                className="bg-[#2A2A2A] text-white px-4 py-2 rounded text-sm hover:bg-[#353535] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuthenticated ? "Confess" : "Login to Confess"}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-sm text-[#A4A4A4]">Loading...</div>
          </div>
        ) : (
          <>
            <div className="sticky top-0 z-10 bg-[#151515] pb-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <i className="fas fa-filter text-[#A4A4A4] text-sm"></i>
                  <span className="text-xs text-[#A4A4A4] uppercase tracking-wide">Filter by mood</span>
                  <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'} text-[#A4A4A4] text-xs transition-transform`}></i>
                </button>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-[#2A2A2A] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded text-xs transition-colors ${viewMode === "grid"
                      ? "bg-white text-[#151515]"
                      : "text-[#A4A4A4] hover:text-white"
                      }`}
                    title="Grid view"
                  >
                    <i className="fas fa-th"></i>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 rounded text-xs transition-colors ${viewMode === "list"
                      ? "bg-white text-[#151515]"
                      : "text-[#A4A4A4] hover:text-white"
                      }`}
                    title="List view"
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>
              {showFilters && (
                <div className="relative">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                      onClick={() => setFilterMood("all")}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors border whitespace-nowrap ${filterMood === "all"
                        ? "bg-white text-[#151515] border-white"
                        : "bg-[#2A2A2A] text-[#A4A4A4] border-[#3A3A3A] hover:bg-[#353535] hover:text-white"
                        }`}
                    >
                      <i className="fas fa-th"></i>
                      All
                    </button>
                    {MOOD_OPTIONS.map((option) => {
                      const isActive = filterMood === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setFilterMood(option.value)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors border whitespace-nowrap ${isActive
                            ? "bg-white text-[#151515] border-white"
                            : "bg-[#2A2A2A] text-[#A4A4A4] border-[#3A3A3A] hover:bg-[#353535] hover:text-white"
                            }`}
                        >
                          <i className={`fas ${option.icon}`}></i>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#151515] to-transparent pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#151515] to-transparent pointer-events-none"></div>
                </div>
              )}
            </div>
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
              {(posts || [])
                .filter((post) => filterMood === "all" || post.mood === filterMood)
                .map((post) => (
                  <div
                    key={post.id}
                    className={`bg-[#1E1E1E] rounded-lg p-4 shadow-lg border border-[#2A2A2A] cursor-pointer hover:border-[#3A3A3A] transition-colors ${viewMode === "grid" ? "flex flex-col justify-between h-full" : "flex flex-col"
                      }`}
                    onClick={() => toggleComments(post.id)}
                  >
                    <div className={viewMode === "list" ? "flex gap-4" : ""}>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2 text-xs text-[#A4A4A4] uppercase tracking-wide">
                            <i className={`fas ${MOOD_METADATA[post.mood]?.icon || "fa-circle"}`}></i>
                            <span>{MOOD_METADATA[post.mood]?.label || "Mood"}</span>
                            {user && post.userId === user.id && (
                              <span className="ml-1 px-1 py-0.5 bg-blue-800/10 backdrop-blur-md text-blue-600 text-[8px] rounded-md">
                                you
                              </span>
                            )}
                          </div>
                          {post.$createdAt ? (
                            <span className="text-[10px] text-[#4A4A4A]">
                              {new Date(post.$createdAt).toLocaleDateString()}
                            </span>
                          ) : null}
                        </div>
                        <p className={`text-white text-sm mb-3 break-words ${viewMode === "grid" ? "line-clamp-6 max-h-[120px] overflow-hidden" : "line-clamp-3"
                          }`}>
                          {post.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end" onClick={(e) => e.stopPropagation()}>
                      <LikeButton
                        liked={!!userLikes[post.id]}
                        count={post.likes || 0}
                        disabled={!!likePending[post.id]}
                        onClick={() => toggleLike(post.id)}
                      />
                      <button
                        onClick={() => toggleSave(post.id)}
                        disabled={!!savePending[post.id]}
                        className={`text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userSaves[post.id] ? "text-white" : "text-[#A4A4A4] hover:text-white"
                          }`}
                      >
                        <i className={`${userSaves[post.id] ? "fas" : "far"} fa-bookmark`}></i>
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="text-[#A4A4A4] hover:text-white text-sm flex items-center gap-1.5 transition-colors"
                      >
                        <i className="far fa-comment-dots"></i>
                        <span>
                          {typeof post.commentsCount === "number"
                            ? post.commentsCount
                            : commentsByPost[post.id]?.length || 0}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onPostsUpdated={async () => {
          await fetchPosts();
          await refreshSavedState();
        }}
      />

      {/* Comments Modal */}
      {activeCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-black/20 backdrop-blur-md rounded-lg w-full max-w-2xl max-h-[90vh] border border-[#2A2A2A] shadow-xl flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 sm:p-6 border-[#2A2A2A] flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-white">Comments</h2>
                <p className="text-xs sm:text-sm text-[#A4A4A4]">
                  {commentsByPost[activeCommentModal]?.length || 0} comments
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveCommentModal(null);
                  setCommentTargets((prev) => ({ ...prev, [activeCommentModal]: null }));
                }}
                className="text-[#A4A4A4] hover:text-white transition-colors text-xl"
                aria-label="Close comments"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Post Content */}
            <div className="p-4 sm:p-6 border-b-2 border-[#2A2A2A] rounded-xl flex-shrink-0">
              {/* <div className="flex items-center gap-2 mb-3">
                <i className="fas fa-comment-alt text-[#A4A4A4] text-xs"></i>
                <span className="text-xs text-[#A4A4A4] uppercase tracking-wide font-medium">Original Post</span>
              </div> */}
              {(() => {
                const post = posts.find((p) => p.id === activeCommentModal);
                if (!post) return null;
                return (
                  <div className="bg-[#1E1E1E]/70 rounded-lg p-4 border border-[#2A2A2A]">
                    <div className="flex items-center gap-2 text-xs text-[#A4A4A4] uppercase tracking-wide mb-2">
                      <i className={`fas ${MOOD_METADATA[post.mood]?.icon || "fa-circle"}`}></i>
                      <span>{MOOD_METADATA[post.mood]?.label || "Mood"}</span>
                      {user && post.userId === user.id && (
                        <span className="ml-1 px-1 py-0.5 bg-blue-800/10 backdrop-blur-md text-blue-600 text-[8px] rounded-md">
                          you
                        </span>
                      )}
                    </div>
                    <p className="text-white text-sm whitespace-pre-wrap break-words">
                      {post.content}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Comments Section Label */}
            <div className="px-4 sm:px-6 pt-4 pb-2 bg-black/20 backdrop-blur-md flex-shrink-0">
              <div className="flex items-center gap-2">
                <i className="fas fa-comments text-[#A4A4A4] text-xs"></i>
                <span className="text-xs text-[#A4A4A4] uppercase tracking-wide font-medium">
                  Comments ({commentsByPost[activeCommentModal]?.length || 0})
                </span>
              </div>
            </div>

            {/* Comments List - Scrollable */}
            <div className="px-4 sm:px-6 pb-4 overflow-y-auto flex-1 min-h-0 bg-black/20 backdrop-blur-md">
              {renderCommentSection(activeCommentModal)}
            </div>

            {/* Comment Input - Fixed at Bottom */}
            <div className="flex-shrink-0">
              {renderCommentInput(activeCommentModal)}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </div>
  );
}

export default MainComponent;