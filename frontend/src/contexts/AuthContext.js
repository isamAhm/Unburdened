"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/auth";
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
      const sessionSecret = localStorage.getItem("sessionSecret");
      if (sessionSecret) {
        const result = await authAPI.verifySession();
        if (result.valid) {
          const userResult = await authAPI.getCurrentUser();
          if (userResult.user) {
            setUser(userResult.user);
            setIsAuthenticated(true);
          }
        } else {
          // Clear invalid session
          localStorage.removeItem("sessionSecret");
          localStorage.removeItem("userReactions");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid session
      localStorage.removeItem("sessionSecret");
      localStorage.removeItem("userReactions");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await authAPI.login(email, password);
      console.log("Login result:", result);

      if (result.session && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        toast.success(
          `Welcome back, ${result.user.name || result.user.email}!`
        );
        return { success: true, user: result.user };
      }

      const errorMsg = result.error || "Login failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        error.response?.data?.error || error.message || "Login failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (email, password, name) => {
    try {
      const result = await authAPI.register(email, password, name);
      console.log("Registration result:", result);

      if (result.user || result.message) {
        toast.success("Account created successfully! Logging you in...");
        // Auto-login after registration
        const loginResult = await login(email, password);
        return loginResult;
      }

      const errorMsg = result.error || "Registration failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg =
        error.response?.data?.error || error.message || "Registration failed";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("userReactions");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("sessionSecret");
      localStorage.removeItem("userReactions");
      toast.success("Logged out");
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.user) {
        setUser(response.user);
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
