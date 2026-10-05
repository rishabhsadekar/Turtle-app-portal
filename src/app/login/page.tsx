"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Bot,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Info,
  GraduationCap,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [authLoading, setAuthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const errorParam = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/apply";

  useEffect(() => {
    if (errorParam === "InvalidDomain") {
      setErrorMessage(
        "Access Restricted: Only official @tamu.edu Google Workspace accounts are permitted. Personal Gmail accounts cannot be used."
      );
    } else if (errorParam === "OAuthSignin" || errorParam === "OAuthCallback") {
      setErrorMessage(
        "Google authentication failed or was cancelled. Please make sure you select an active @tamu.edu account."
      );
    } else if (errorParam) {
      setErrorMessage("Authentication failed: " + errorParam);
    }
  }, [errorParam]);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setErrorMessage(null);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Google sign in error", err);
      setErrorMessage("Failed to initiate Google sign in.");
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 relative z-10">
        {/* Card Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-xl shadow-yellow-500/20 mb-2">
            <Bot className="w-9 h-9 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-[11px] font-bold text-red-200 uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-red-300" />
              <span>Texas A&M University</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Applicant Single Sign-On
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
              Sign in with your TAMU Google account to access your TURTLE Robotics application and track review status.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start space-x-3 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Authenticated State */}
        {status === "authenticated" && session?.user ? (
          <div className="bg-[#111218] p-6 rounded-2xl border border-gray-800 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-400 mx-auto flex items-center justify-center text-yellow-400 overflow-hidden shadow-md">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "TAMU Applicant"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-black">
                  {(session.user.name || "A").charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified TAMU Account</span>
              </div>
              <h2 className="text-lg font-bold text-white">{session.user.name}</h2>
              <p className="text-xs font-mono text-yellow-400/90">{session.user.email}</p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/apply"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-extrabold shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Continue to Application</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>

              <Link
                href="/status"
                className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#0a0a0f] hover:bg-white/5 border border-gray-700 text-gray-200 text-xs font-semibold transition-colors"
              >
                Check Application Status
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full inline-flex items-center justify-center py-2 px-4 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 text-xs transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Unauthenticated State - Google Only */
          <div className="bg-[#111218] p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6">
            <div className="space-y-4">
              <button
                type="button"
                disabled={authLoading}
                onClick={handleGoogleSignIn}
                className="w-full relative flex items-center justify-center px-4 py-3.5 border border-gray-700 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{authLoading ? "Connecting to Google..." : "Sign in with TAMU Google Account"}</span>
              </button>

              <div className="flex items-start space-x-2.5 text-xs text-gray-400 bg-[#0a0a0f] p-3 rounded-xl border border-gray-800">
                <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-gray-300 font-medium">
                    Strictly restricted to official <span className="text-yellow-400 font-mono font-semibold">@tamu.edu</span> accounts.
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Personal Gmail addresses or other non-TAMU accounts will be rejected by security policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info & Officer link */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-2">
          <Link href="/" className="hover:text-yellow-400 transition-colors">
            ← Back to TURTLE Home
          </Link>
          <Link href="/admin" className="hover:text-yellow-400 transition-colors flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Officer Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}
