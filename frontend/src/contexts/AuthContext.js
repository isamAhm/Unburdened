"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, ID } from "../lib/appwrite";
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
        // Fetch user profile from database
        try {
          const userDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            session.$id
          );
          setUser({
            id: session.$id,
            email: session.email,
            name: session.name,
            ...userDoc,
          });
        } catch (docError) {
          // User document doesn't exist, use session data
          setUser({
            id: session.$id,
            email: session.email,
            name: session.name,
          });
        }
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Not authenticated
      console.log("No active session");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const session = await account.get();
      
      // Fetch user profile
      try {
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          session.$id
        );
        setUser({
          id: session.$id,
          email: session.email,
          name: session.name,
          ...userDoc,
        });
      } catch (docError) {
        setUser({
          id: session.$id,
          email: session.email,
          name: session.name,
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
          }
        );
      } catch (docError) {
        console.warn("Failed to create user document:", docError);
      }
      
      setUser({
        id: newUser.$id,
        email: email,
        name: name,
      });
      setIsAuthenticated(true);
      
      toast.success("Account created successfully!");
      return { success: true, user: newUser };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = error.message || "Registration failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
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

  const refreshUser = async () => {
    try {
      const session = await account.get();
      if (session) {
        try {
          const userDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            session.$id
          );
          setUser({
            id: session.$id,
            email: session.email,
            name: session.name,
            ...userDoc,
          });
        } catch (docError) {
          setUser({
            id: session.$id,
            email: session.email,
            name: session.name,
          });
        }
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
