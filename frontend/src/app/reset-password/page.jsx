"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { account } from "../../lib/appwrite";
import toast from "react-hot-toast";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !secret) {
      setStatus("error");
      setErrorMsg("Invalid or missing reset link parameters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setStatus("submitting");
    setErrorMsg("");

    try {
      await account.updateRecovery(userId, secret, password, confirmPassword);
      setStatus("success");
      toast.success("Password reset successfully!");
    } catch (err) {
      console.error("Password reset failed:", err);
      setErrorMsg(
        err.message || "Failed to reset password. The link might be expired."
      );
      setStatus("error");
      toast.error("Password reset failed.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#151515] flex items-center justify-center px-4">
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-emerald-900/30 border border-emerald-700/40">
              <i className="fas fa-check text-2xl text-emerald-400" />
            </div>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Password Reset Successful
          </h1>
          <p className="text-sm text-[#A4A4A4] mb-8">
            Your password has been updated. You can now log in with your new password.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-white text-[#151515] font-medium py-3 rounded-lg hover:bg-[#E0E0E0] transition-colors text-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151515] flex items-center justify-center px-4">
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#2A2A2A]">
            <i className="fas fa-lock text-xl text-[#A4A4A4]" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Set New Password
          </h1>
          <p className="text-sm text-[#A4A4A4]">
            Please enter your new password below.
          </p>
        </div>

        {status === "error" && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700/40 rounded text-red-400 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#A4A4A4] mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#151515] text-white rounded p-3 pr-10 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A]"
                placeholder="Enter new password"
                required
                minLength={8}
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
          <div>
            <label className="block text-sm text-[#A4A4A4] mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#151515] text-white rounded p-3 pr-10 border border-[#2A2A2A] focus:outline-none focus:border-[#4A4A4A]"
                placeholder="Confirm new password"
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
          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-[#2A2A2A] text-white py-3 rounded hover:bg-[#353535] disabled:opacity-50 transition-colors mt-2"
          >
            {status === "submitting" ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#151515] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#4A4A4A] border-t-white animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
