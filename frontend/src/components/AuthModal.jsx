"use client";
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, resendVerification, forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNeedsVerification(false);
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

      if (result && result.success) {
        if (result.requiresVerification) {
          // Registration complete — show "check your inbox" panel
          toast.success("Account created! Check your email to verify.", { duration: 5000 });
          setNeedsVerification(true);
        } else {
          // Fully verified login — close modal
          setFormData({ email: "", password: "", name: "" });
          setError("");
          onClose();
        }
      } else if (result?.requiresVerification) {
        // Blocked login: credentials OK but email not verified
        setNeedsVerification(true);
      } else if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Auth modal error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    // Pass credentials so resendVerification can create a temp session —
    // the user has no active session since login was blocked.
    await resendVerification(formData.email, formData.password);
    setResending(false);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetToLogin = () => {
    setNeedsVerification(false);
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotSent(false);
    setError("");
    setIsLogin(true);
    setFormData({ email: "", password: "", name: "" });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    await forgotPassword(forgotEmail);
    setForgotSent(true);
    setForgotLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1E1E1E] rounded-lg p-6 w-full max-w-md mx-4 border border-[#2A2A2A]">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium text-white">
            {needsVerification ? "Verify Your Email" : showForgotPassword ? "Reset Password" : isLogin ? "Login" : "Register"}
          </h2>
          <button
            onClick={() => { onClose(); resetToLogin(); }}
            className="text-[#A4A4A4] hover:text-white transition-colors"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* ── Forgot password panel ── */}
        {showForgotPassword ? (
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#2A2A2A]">
              <i className="fas fa-key text-xl text-[#A4A4A4]" />
            </div>
            {forgotSent ? (
              <>
                <p className="text-white font-medium mb-2">Check your inbox</p>
                <p className="text-sm text-[#A4A4A4] mb-6">
                  We sent a password reset link to <span className="text-white">{forgotEmail}</span>. Follow the link to set a new password.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-[#A4A4A4] mb-6">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
                <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
                  <div>
                    <label className="block text-sm text-[#A4A4A4] mb-2">Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-[#151515] text-white rounded p-3 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A]"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-[#2A2A2A] text-white py-3 rounded hover:bg-[#353535] disabled:opacity-50 transition-colors text-sm"
                  >
                    {forgotLoading ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              </>
            )}
            <button
              onClick={resetToLogin}
              className="mt-4 text-[#A4A4A4] hover:text-white text-sm transition-colors"
            >
              ← Back to login
            </button>
          </div>
        ) : /* ── Needs-verification panel ── */
          needsVerification ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-amber-900/30 border border-amber-700/40">
                <i className="fas fa-envelope-open text-xl text-amber-400" />
              </div>
              <p className="text-white font-medium mb-2">Check your inbox</p>
              <p className="text-sm text-[#A4A4A4] mb-3">
                Your account exists but your email isn&apos;t verified yet. Click the link
                we sent you, then come back and log in.
              </p>
              <p className="text-xs text-[#4A4A4A] mb-6">
                Didn&apos;t get it? Check your spam folder or resend below.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full border border-amber-700/50 text-amber-300 py-2.5 rounded text-sm hover:bg-amber-900/20 disabled:opacity-50 transition-colors"
                >
                  {resending ? "Sending…" : "Resend verification email"}
                </button>
                <button
                  onClick={resetToLogin}
                  className="w-full text-[#A4A4A4] hover:text-white py-2 text-sm transition-colors"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          ) : (
            /* ── Normal login / register form ── */
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm text-[#A4A4A4] mb-2">Name</label>
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
                  <label className="block text-sm text-[#A4A4A4] mb-2">Email</label>
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
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm text-[#A4A4A4]">Password</label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-[#A4A4A4] hover:text-white transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-[#151515] text-white rounded p-3 pr-10 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A]"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A4A4A4] hover:text-white transition-colors"
                      tabIndex="-1"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2A2A2A] text-white py-3 rounded hover:bg-[#353535] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Please wait…" : isLogin ? "Login" : "Register"}
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
            </>
          )}
      </div>
    </div>
  );
};

export default AuthModal;
