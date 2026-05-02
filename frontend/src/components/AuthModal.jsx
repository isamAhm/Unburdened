"use client";
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          setError("Name is required for registration");
          setLoading(false);
          return;
        }
        result = await register(formData.email, formData.password, formData.name);
      }

      console.log("Auth result in modal:", result);
      
      if (result && result.success) {
        // Close modal and reset form
        setFormData({ email: "", password: "", name: "" });
        setError("");
        onClose();
      } else {
        // Error is already shown via toast in AuthContext
        // Only set local error if needed for form validation
        if (result?.error) {
          setError(result.error);
        }
      }
    } catch (error) {
      console.error("Auth modal error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md mx-4 border border-[#2A2A2A]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">
            {isLogin ? "Login" : "Register"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#A4A4A4] hover:text-white transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-[#A4A4A4] mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-[#151515] text-white rounded p-3 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A]"
                placeholder="Enter your name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-[#A4A4A4] mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-[#151515] text-white rounded p-3 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A]"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#A4A4A4] mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full bg-[#151515] text-white rounded p-3 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A]"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2A2A2A] text-white py-3 rounded hover:bg-[#353535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Please wait..." : (isLogin ? "Login" : "Register")}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({ email: "", password: "", name: "" });
            }}
            className="text-[#A4A4A4] hover:text-white text-sm transition-colors"
          >
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
