"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { account } from "../../lib/appwrite";
import { useAuth } from "../../contexts/AuthContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const hasCalled = useRef(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (!userId || !secret) {
      setStatus("error");
      setErrorMsg("Invalid verification link. Please request a new one.");
      return;
    }

    if (hasCalled.current) return;
    hasCalled.current = true;

    const confirmVerification = async () => {
      try {
        await account.updateVerification(userId, secret);
        // Best-effort refresh — if it fails (e.g. session was deleted post-registration)
        // we still show success since the verification itself succeeded.
        try {
          await refreshUser();
        } catch (_) { }
        setStatus("success");
      } catch (err) {
        console.error("Email verification failed:", err);
        setErrorMsg(
          err.message ||
          "Verification failed. The link may have expired. Please request a new one."
        );
        setStatus("error");
      }
    };

    confirmVerification();
  }, [searchParams, refreshUser]);

  return (
    <div className="min-h-screen bg-[#151515] flex items-center justify-center px-4">
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
        <div className="mb-6">
          {status === "verifying" && (
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-[#2A2A2A] animate-pulse">
              <i className="fas fa-envelope-open text-2xl text-[#A4A4A4]" />
            </div>
          )}
          {status === "success" && (
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-emerald-900/30 border border-emerald-700/40">
              <i className="fas fa-check text-2xl text-emerald-400" />
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-red-900/30 border border-red-700/40">
              <i className="fas fa-times text-2xl text-red-400" />
            </div>
          )}
        </div>

        <h1 className="text-xl font-semibold text-white mb-2">
          {status === "verifying" && "Verifying your email…"}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </h1>

        <p className="text-sm text-[#A4A4A4] mb-8">
          {status === "verifying" && "Hang tight while we confirm your email address."}
          {status === "success" &&
            "Your email has been confirmed. You can now use all features of Unburdened."}
          {status === "error" && errorMsg}
        </p>

        {status !== "verifying" && (
          <button
            onClick={() => router.push("/")}
            className="w-full bg-white text-[#151515] font-medium py-3 rounded-lg hover:bg-[#E0E0E0] transition-colors text-sm"
          >
            {status === "success" ? "Go to Unburdened" : "Back to Home"}
          </button>
        )}

        {status === "verifying" && (
          <div className="flex justify-center gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#4A4A4A] animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#151515] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#4A4A4A] border-t-white animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
