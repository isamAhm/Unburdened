"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { profileAPI } from "../api/profile-appwrite";
import { postsAPI } from "../api/posts-appwrite";
import ConfirmModal from "./ConfirmModal";
import toast from "react-hot-toast";

const initialEditState = {
  isEditing: false,
  value: "",
};

const ProfileModal = ({ isOpen, onClose, onPostsUpdated }) => {
  const { user, refreshUser, changePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editStates, setEditStates] = useState({});
  const [showConfessionsModal, setShowConfessionsModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const hasProfileChanges = useMemo(() => {
    if (!profile || !user) return false;
    return (
      profile.name !== (user.name || "") ||
      (profile.bio || "") !== (user.bio || "")
    );
  }, [profile, user]);

  // Fetch profile info only (cached - only when profile doesn't exist)
  const fetchProfileInfo = async () => {
    try {
      const profileData = await profileAPI.getProfile();
      setProfile({
        name: profileData.user?.name || "",
        email: profileData.user?.email || "",
        bio: profileData.user?.bio || "",
        avatarUrl: profileData.user?.avatarUrl || null,
        avatarFileId: profileData.user?.avatarFileId || null,
      });
    } catch (error) {
      console.error("Failed to fetch profile info:", error);
      toast.error(error.message || "Failed to load profile information");
    }
  };

  // Fetch posts data (cached - only refetch when explicitly needed)
  const fetchPostsData = async () => {
    setLoadingPosts(true);
    try {
      const [profileData, savedData] = await Promise.all([
        profileAPI.getProfile(),
        postsAPI.getSavedPosts(),
      ]);
      setPosts(profileData.posts || []);
      setSavedPosts(savedData || []);
    } catch (error) {
      console.error("Failed to fetch posts data:", error);
      toast.error(error.message || "Failed to load posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  // Initial load when modal opens and state cleanup when it closes
  useEffect(() => {
    if (isOpen) {
      // Fetch profile info only if not already loaded
      if (!profile) {
        fetchProfileInfo();
      }
      // Always fetch posts data to get latest
      fetchPostsData();
    } else {
      // Security best practice: clear sensitive data when modal closes
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setAvatarUploading(true);

    try {
      console.log("Uploading avatar...");
      const result = await profileAPI.uploadAvatar(file);
      await refreshUser();
      setProfile((prev) => ({
        ...prev,
        avatarUrl: result.user?.avatarUrl || prev?.avatarUrl || null,
        avatarFileId: result.user?.avatarFileId || prev?.avatarFileId || null,
        name: result.user?.name ?? prev.name,
        bio: result.user?.bio ?? prev.bio,
      }));
      toast.success("Profile image updated");
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleProfileSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        bio: profile.bio,
      };

      const result = await profileAPI.updateProfile(payload);
      await refreshUser();
      setProfile((prev) => ({
        ...prev,
        name: result.user?.name ?? prev.name,
        bio: result.user?.bio ?? prev.bio,
      }));
      toast.success("Profile updated");
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };


  const toggleEditPost = (postId, content) => {
    setEditStates((prev) => ({
      ...prev,
      [postId]: prev[postId]?.isEditing
        ? initialEditState
        : { isEditing: true, value: content },
    }));
  };

  const handleEditChange = (postId, value) => {
    setEditStates((prev) => ({
      ...prev,
      [postId]: {
        ...(prev[postId] || initialEditState),
        value,
      },
    }));
  };

  const handleSavePost = async (postId) => {
    const state = editStates[postId];
    if (!state?.value?.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    try {
      const result = await postsAPI.updatePost(postId, state.value.trim());
      setPosts((prev) =>
        prev.map((post) =>
          post.$id === postId || post.id === postId
            ? { ...post, content: result.content }
            : post
        )
      );
      setEditStates((prev) => ({
        ...prev,
        [postId]: initialEditState,
      }));
      toast.success("Post updated");
      if (typeof onPostsUpdated === "function") {
        await onPostsUpdated();
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      toast.error(error.response?.data?.error || "Failed to update post");
    }
  };

  const handleDeletePost = async (postId) => {
    setConfirmDelete(postId);
  };

  const executeDeletePost = async () => {
    if (!confirmDelete) return;

    try {
      await postsAPI.deletePost(confirmDelete);
      // Optimistic update - remove from local state immediately
      setPosts((prev) => prev.filter((post) => post.$id !== confirmDelete && post.id !== confirmDelete));
      toast.success("Post deleted");
      if (typeof onPostsUpdated === "function") {
        await onPostsUpdated();
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error(error.message || "Failed to delete post");
      // Refetch on error to restore correct state
      await fetchPostsData();
    }
  };

  const handleUnsavePost = async (postId) => {
    try {
      await postsAPI.toggleSave(postId);
      // Optimistic update - remove from saved list immediately
      setSavedPosts((prev) => prev.filter((post) => post.$id !== postId && post.id !== postId));
      toast.success("Post unsaved");
      if (typeof onPostsUpdated === "function") {
        await onPostsUpdated();
      }
    } catch (error) {
      console.error("Failed to unsave post:", error);
      toast.error(error.response?.data?.error || "Failed to unsave post");
      // Refetch on error to restore correct state
      await fetchPostsData();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-[#1E1E1E] rounded-lg w-full max-w-2xl border border-[#2A2A2A] shadow-xl">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#2A2A2A]">
            <div>
              <h2 className="text-lg sm:text-xl font-medium text-white">Your Profile</h2>
              <p className="text-xs sm:text-sm text-[#A4A4A4]">
                Manage your profile details
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[#A4A4A4] hover:text-white transition-colors text-xl"
              aria-label="Close profile"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <section className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6 items-start">
              <div className="flex flex-col items-center gap-4 mx-auto md:mx-0">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-[#151515] border border-[#2A2A2A] flex items-center justify-center">
                    {profile?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatarUrl}
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl sm:text-4xl text-[#A4A4A4]">
                        <i className="fas fa-user"></i>
                      </span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-[#2A2A2A] text-white px-2 sm:px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-[#353535] transition-colors">
                    {avatarUploading ? "..." : "Change"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                    />
                  </label>
                </div>
                <div className="text-center text-xs text-[#A4A4A4]">
                  Recommended: 400x400px
                </div>
              </div>

              <div className="space-y-4 w-full">
                <div>
                  <label className="block text-xs sm:text-sm text-[#A4A4A4] mb-2">Name</label>
                  <input
                    type="text"
                    value={profile?.name || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full bg-[#151515] text-white rounded p-2 sm:p-3 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-[#A4A4A4] mb-2">Email</label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full bg-[#151515] text-white/60 rounded p-2 sm:p-3 border border-[#2A2A2A] cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-[#A4A4A4] mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile?.bio || ""}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Write something about yourself..."
                    className="w-full bg-[#151515] text-white rounded p-2 sm:p-3 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A] min-h-[80px] sm:min-h-[100px] text-sm resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 flex-wrap">
                  <button
                    onClick={() => setShowSavedModal(true)}
                    className="bg-[#2A2A2A] text-white px-4 py-2 rounded text-sm hover:bg-[#353535] transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-bookmark"></i>
                    Saved ({savedPosts.length})
                  </button>
                  <button
                    onClick={() => setShowConfessionsModal(true)}
                    className="bg-[#2A2A2A] text-white px-4 py-2 rounded text-sm hover:bg-[#353535] transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-comment-dots"></i>
                    Your Confessions ({posts.length})
                  </button>
                </div>

                <div className="border-t border-[#2A2A2A] pt-4 mt-2">
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="text-sm text-[#A4A4A4] hover:text-white transition-colors flex items-center gap-2"
                  >
                    <i className={`fas fa-chevron-${showPasswordForm ? 'up' : 'down'}`}></i>
                    Change Password
                  </button>

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3 bg-[#151515] p-4 rounded-lg border border-[#2A2A2A]">
                      <div>
                        <label className="block text-xs text-[#A4A4A4] mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#1E1E1E] text-white rounded p-2 pr-10 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A] text-sm"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4A4A4] hover:text-white transition-colors"
                            tabIndex="-1"
                          >
                            <i className={`fas ${showCurrentPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[#A4A4A4] mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#1E1E1E] text-white rounded p-2 pr-10 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A] text-sm"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4A4A4] hover:text-white transition-colors"
                            tabIndex="-1"
                          >
                            <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-[#A4A4A4] mb-1">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#1E1E1E] text-white rounded p-2 pr-10 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A] text-sm"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4A4A4] hover:text-white transition-colors"
                            tabIndex="-1"
                          >
                            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="bg-[#2A2A2A] text-white px-4 py-2 rounded text-sm hover:bg-[#353535] disabled:opacity-50 transition-colors"
                        >
                          {passwordLoading ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="flex justify-end w-full pt-4 border-t border-[#2A2A2A]">
                  <button
                    onClick={handleProfileSave}
                    disabled={saving || !hasProfileChanges}
                    className="bg-[#2A2A2A] text-white px-6 py-2 rounded text-sm hover:bg-[#353535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Saving..." : "Save profile details"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Confessions Modal */}
      {showConfessionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-[#1E1E1E] rounded-lg w-full max-w-3xl max-h-[90vh] border border-[#2A2A2A] shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#2A2A2A] flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-white">Your Confessions</h2>
                <p className="text-xs sm:text-sm text-[#A4A4A4]">
                  {posts.length} total confessions
                </p>
              </div>
              <button
                onClick={() => setShowConfessionsModal(false)}
                className="text-[#A4A4A4] hover:text-white transition-colors text-xl"
                aria-label="Close confessions"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {loadingPosts ? (
                <div className="text-sm text-[#A4A4A4] text-center py-8">Loading...</div>
              ) : posts.length === 0 ? (
                <div className="text-sm text-[#A4A4A4] text-center py-8">
                  You haven't posted any confessions yet.
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {posts.map((post) => {
                    const postId = post.$id || post.id;
                    const editState = editStates[postId] || initialEditState;

                    return (
                      <div
                        key={postId}
                        className="bg-[#151515] border border-[#2A2A2A] rounded-lg p-3 sm:p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs text-[#6F6F6F]">
                            {new Date(post.$createdAt || Date.now()).toLocaleString()}
                          </div>
                          <div className="flex gap-2 text-xs flex-shrink-0">
                            <button
                              onClick={() => toggleEditPost(postId, post.content)}
                              className="text-[#A4A4A4] hover:text-white transition-colors"
                            >
                              {editState.isEditing ? "Cancel" : "Edit"}
                            </button>
                            <button
                              onClick={() => handleDeletePost(postId)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {editState.isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={editState.value}
                              onChange={(e) => handleEditChange(postId, e.target.value)}
                              className="w-full bg-[#1E1E1E] text-white rounded p-2 sm:p-3 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A] text-sm resize-none"
                              maxLength={150}
                              rows={3}
                            />
                            <div className="flex justify-end gap-2 text-sm">
                              <button
                                onClick={() => toggleEditPost(postId, post.content)}
                                className="px-3 py-1 rounded bg-[#2A2A2A] text-white hover:bg-[#353535] transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSavePost(postId)}
                                className="px-3 py-1 rounded bg-[#3E7BFA] text-white hover:bg-[#4C86FF] transition-colors"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-white whitespace-pre-wrap break-words">
                            {post.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Confessions Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-[#1E1E1E] rounded-lg w-full max-w-3xl max-h-[90vh] border border-[#2A2A2A] shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#2A2A2A] flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-white">Saved Confessions</h2>
                <p className="text-xs sm:text-sm text-[#A4A4A4]">
                  {savedPosts.length} saved confessions
                </p>
              </div>
              <button
                onClick={() => setShowSavedModal(false)}
                className="text-[#A4A4A4] hover:text-white transition-colors text-xl"
                aria-label="Close saved confessions"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {loadingPosts ? (
                <div className="text-sm text-[#A4A4A4] text-center py-8">Loading...</div>
              ) : savedPosts.length === 0 ? (
                <div className="text-sm text-[#A4A4A4] text-center py-8">
                  You haven't saved any confessions yet.
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {savedPosts.map((post) => {
                    const postId = post.$id || post.id;

                    return (
                      <div
                        key={postId}
                        className="bg-[#151515] border border-[#2A2A2A] rounded-lg p-3 sm:p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs text-[#6F6F6F]">
                            {new Date(post.$createdAt || Date.now()).toLocaleString()}
                          </div>
                          <button
                            onClick={() => handleUnsavePost(postId)}
                            className="text-xs text-[#A4A4A4] hover:text-white transition-colors flex items-center gap-1"
                          >
                            <i className="fas fa-bookmark"></i>
                            Unsave
                          </button>
                        </div>
                        <p className="text-sm text-white whitespace-pre-wrap break-words">
                          {post.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDeletePost}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
      />
    </>
  );
};

export default ProfileModal;

