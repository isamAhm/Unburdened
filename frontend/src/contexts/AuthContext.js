"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  account,
  databases,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  ID,
} from "../lib/appwrite";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const session = await account.get();
      if (session) {
        // Gate: reject any session whose email is not yet verified
        if (!session.emailVerification) {
          await account.deleteSession("current");
          console.log("Session evicted — email not verified");
          return;
        }

        // Fetch user profile from database
        try {
          const userDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            session.$id,
          );
          setUser({
            id: session.$id,
            email: session.email,
            name: session.name,
            emailVerification: session.emailVerification,
            ...userDoc,
          });
        } catch (docError) {
          setUser({
            id: session.$id,
            email: session.email,
            name: session.name,
            emailVerification: session.emailVerification,
          });
        }
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log("No active session");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();

      // Block login if email is not verified
      if (!session.emailVerification) {
        // Clean up the session we just created so they are not silently logged in
        await account.deleteSession("current");
        return {
          success: false,
          requiresVerification: true,
          error: "Please verify your email before logging in.",
        };
      }

      // Fetch user profile
      try {
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          session.$id,
        );
        setUser({
          id: session.$id,
          email: session.email,
          name: session.name,
          emailVerification: session.emailVerification,
          ...userDoc,
        });
      } catch (docError) {
        setUser({
          id: session.$id,
          email: session.email,
          name: session.name,
          emailVerification: session.emailVerification,
        });
      }

      setIsAuthenticated(true);
      toast.success(`Welcome back, ${session.name || session.email}!`);
      return { success: true, user: session };
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg = error.message || "Login failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (email, password, name) => {
    try {
      // Create account
      const newUser = await account.create(ID.unique(), email, password, name);

      // Auto-login after registration
      await account.createEmailPasswordSession(email, password);

      // Create user document
      try {
        await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          newUser.$id,
          {
            name: name,
            email: email,
            bio: "",
            avatarUrl: null,
            avatarFileId: null,
            createdAt: new Date().toISOString(),
          },
        );
      } catch (docError) {
        console.warn("Failed to create user document:", docError);
      }

      // Send verification email
      try {
        const verifyUrl = `${window.location.origin}/verify-email`;
        await account.createVerification(verifyUrl);
      } catch (verifyError) {
        console.warn("Failed to send verification email:", verifyError);
      }

      // Delete the session — user must verify before being allowed in
      try {
        await account.deleteSession("current");
      } catch (sessionError) {
        console.warn("Failed to delete post-registration session:", sessionError);
      }

      // Do NOT set isAuthenticated — they haven't verified yet
      return { success: true, requiresVerification: true, user: newUser };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = error.message || "Registration failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("userReactions");
      localStorage.removeItem("userLikedPosts");
      localStorage.removeItem("userSavedPosts");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("userReactions");
      localStorage.removeItem("userLikedPosts");
      localStorage.removeItem("userSavedPosts");
      toast.success("Logged out");
    }
  };

  const resendVerification = async (email, password) => {
    try {
      const verifyUrl = `${window.location.origin}/verify-email`;
      let createdTempSession = false;

      // If credentials are supplied, we may not have an active session
      // (e.g. login was blocked because email wasn't verified). Create a
      // temporary session solely to send the email, then immediately remove it.
      if (email && password) {
        try {
          await account.createEmailPasswordSession(email, password);
          createdTempSession = true;
        } catch (sessionError) {
          // Session might already exist — continue and try to send anyway
          console.warn("Temp session creation failed, trying without:", sessionError);
        }
      }

      await account.createVerification(verifyUrl);
      toast.success("Verification email sent! Please check your inbox.");

      if (createdTempSession) {
        // Clean up — user should not end up logged in
        try { await account.deleteSession("current"); } catch (_) {}
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      const errorMsg = error.message || "Failed to send verification email";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const refreshUser = async () => {
    try {
      const session = await account.get();
      if (session) {
        // Guard: still enforce verification on refresh
        if (!session.emailVerification) {
          await account.deleteSession("current");
          setUser(null);
          setIsAuthenticated(false);
          return;
        }
        try {
          const userDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            session.$id,
          );
          setUser({
            id: session.$id,
            email: session.email,
            name: session.name,
            emailVerification: session.emailVerification,
            ...userDoc,
          });
        } catch (docError) {
          setUser({
            id: session.$id,
            email: session.email,
            name: session.name,
            emailVerification: session.emailVerification,
          });
        }
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const resetUrl = `${window.location.origin}/reset-password`;
      await account.createRecovery(email, resetUrl);
      toast.success("Password reset email sent! Check your inbox.");
      return { success: true };
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMsg = error.message || "Failed to send reset email";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await account.updatePassword(newPassword, currentPassword);
      toast.success("Password updated successfully.");
      return { success: true };
    } catch (error) {
      console.error("Change password error:", error);
      const errorMsg = error.message || "Failed to update password";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser,
    resendVerification,
    forgotPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
