"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Lock,
  RefreshCw,
  User,
  GraduationCap,
} from "lucide-react";
import { ApplicationStatus, AppliedProject } from "@/types";

interface PublicApplication {
  id: string;
  fullName: string;
  tamuEmail: string;
  primaryTrack: string;
  secondaryTrack: string;
  status: ApplicationStatus;
  submittedAt: string;
  interviewSlot?: string;
  classification: string;
  major: string;
  appliedProjects?: AppliedProject[];
}

export default function StatusTrackerPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [app, setApp] = useState<PublicApplication | null>(null);

  const fetchUserStatus = async () => {
    setLoading(true);
    setErrorMsg(null);
    setNotFound(false);

    try {
      const res = await fetch("/api/applications/status");
      const data = await res.json();

      if (res.status === 404 || data.notFound) {
        setNotFound(true);
        setApp(null);
      } else if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load application status.");
      } else {
        setApp(data.application);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to retrieve status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchUserStatus();
    }
  }, [status, session]);

  const getStatusBadge = (appStatus: ApplicationStatus) => {
    switch (appStatus) {
      case "SUBMITTED":
        return {
          label: "Application Received",
          bg: "bg-blue-950/40 text-blue-300 border-blue-800/80",
          icon: Clock,
          color: "text-blue-400",
        };
      case "UNDER_REVIEW":
        return {
          label: "Under Officer Review",
          bg: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
          icon: Clock,
          color: "text-yellow-400",
        };
      case "INTERVIEW_INVITED":
        return {
          label: "Interview Invited",
          bg: "bg-purple-950/40 text-purple-300 border-purple-800/80",
          icon: Calendar,
          color: "text-purple-400",
        };
      case "ACCEPTED":
        return {
          label: "Accepted - Welcome to TURTLE!",
          bg: "bg-emerald-950/40 text-emerald-300 border-emerald-800/80",
          icon: CheckCircle2,
          color: "text-emerald-400",
        };
      case "WAITLISTED":
        return {
          label: "Waitlisted",
          bg: "bg-orange-950/40 text-orange-300 border-orange-800/80",
          icon: AlertCircle,
          color: "text-orange-400",
        };
      case "REJECTED":
        return {
          label: "Not Selected This Cycle",
          bg: "bg-gray-900 text-gray-400 border-gray-800",
          icon: ShieldAlert,
          color: "text-gray-400",
        };
    }
  };

  const getStepState = (appStatus: ApplicationStatus) => {
    switch (appStatus) {
      case "SUBMITTED":
        return 0;
      case "UNDER_REVIEW":
        return 1;
      case "INTERVIEW_INVITED":
        return 2;
      case "ACCEPTED":
      case "WAITLISTED":
      case "REJECTED":
        return 3;
    }
  };

  // 1. Loading Session State
  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          Verifying TAMU student credentials...
        </p>
      </div>
    );
  }

  // 2. Authentication Gate: Must login to view application status
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-[#111218] rounded-2xl p-8 border border-gray-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto text-yellow-400 shadow-inner">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-[11px] font-bold text-red-200 uppercase tracking-wider">
              <span>Candidate Authentication</span>
            </div>
            <h2 className="text-2xl font-black text-white">Sign In to View Status</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              To protect candidate privacy and interview decisions, you must sign in with your official <strong className="text-yellow-400 font-mono">@tamu.edu</strong> Google account. You can only view your own application status.
            </p>
          </div>

          <div className="p-4 bg-[#0a0a0f] rounded-xl border border-gray-800 text-left text-xs space-y-2 text-gray-300">
            <div className="font-semibold text-white flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-yellow-400" />
              Privacy & Security
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Applications are private to the applicant. Nobody else can search for or view your responses, evaluation stage, or scheduled interviews.
            </p>
          </div>

          <Link
            href="/login?callbackUrl=/status"
            className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black shadow-lg shadow-yellow-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Sign In with TAMU Google Account</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>

          <Link href="/" className="inline-block text-xs text-gray-500 hover:text-gray-300 transition-colors">
            ← Return to TURTLE Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Title & Authenticated Account Bar */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-xs font-bold uppercase tracking-wider">
            <Search className="w-3.5 h-3.5" />
            <span>Applicant Tracker</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Your Application Status
          </h1>
          <p className="text-xs text-gray-400">
            Real-time status tracking for your TURTLE Robotics recruitment submission.
          </p>
        </div>

        {/* Authenticated Candidate Identity Card */}
        <div className="p-4 bg-[#111218] border border-gray-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-bold overflow-hidden shrink-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Student"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(session.user.name || "A").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>{session.user.name || "Texas A&M Applicant"}</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Verified
                </span>
              </div>
              <div className="text-xs font-mono text-yellow-400">{session.user.email}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchUserStatus}
            disabled={loading}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-gray-700 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Checking..." : "Refresh Status"}</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold">Unable to load status</p>
              <p className="text-red-400 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Case 1: Application Loading */}
        {loading && !app && (
          <div className="bg-[#111218] rounded-2xl p-12 border border-gray-800 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-400">Retrieving your application record...</p>
          </div>
        )}

        {/* Case 2: No Application Found for this logged in account */}
        {notFound && !loading && (
          <div className="bg-[#111218] rounded-2xl p-8 border border-gray-800 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto text-yellow-400">
              <GraduationCap className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">No Application on File</h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                We have not received an application submitted under <strong className="text-yellow-400 font-mono">{session.user.email}</strong> for the current recruitment cycle.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/apply"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black shadow-lg shadow-yellow-500/20 transition-all hover:scale-105"
              >
                <span>Apply for TURTLE Robotics Projects</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Case 3: Application Exists — Display Full Tracker */}
        {app && (
          <div className="bg-[#111218] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
            {/* Top banner with Status */}
            {(() => {
              const badge = getStatusBadge(app.status);
              const Icon = badge.icon;
              return (
                <div className={`p-6 border-b ${badge.bg}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-[#0a0a0f] border border-gray-800 shadow-inner">
                        <Icon className={`w-6 h-6 ${badge.color}`} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          Current Stage
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-white">{badge.label}</h2>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono bg-[#0a0a0f]/80 text-yellow-400 px-2.5 py-1 rounded border border-gray-800 font-bold">
                        {app.id}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Visual Process Stepper */}
            <div className="px-6 py-5 bg-[#0e0f16] border-b border-gray-800">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {["Submitted", "Under Review", "Interview", "Decision"].map((label, idx) => {
                  const activeIdx = getStepState(app.status);
                  const isDone = idx < activeIdx || (idx === 3 && activeIdx === 3 && app.status === "ACCEPTED");
                  const isCurrent = idx === activeIdx;

                  return (
                    <div key={label} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                          isDone
                            ? "bg-emerald-500 text-black"
                            : isCurrent
                            ? "bg-yellow-500 text-black ring-4 ring-yellow-500/20"
                            : "bg-gray-800 text-gray-500"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          isCurrent ? "text-yellow-400 font-bold" : isDone ? "text-emerald-400" : "text-gray-500"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Application Information Details */}
            <div className="p-6 space-y-5 text-xs">
              {/* Interview slot highlight if present */}
              {app.interviewSlot && (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/80 text-purple-200 space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-sm text-purple-300">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>Interview Scheduled!</span>
                  </div>
                  <p className="text-xs text-purple-300">
                    Your scheduled slot: <strong className="text-white">{app.interviewSlot}</strong>. Check your TAMU email for the calendar invitation and room details in 023 Haynes.
                  </p>
                </div>
              )}

              {/* Acceptance highlight */}
              {app.status === "ACCEPTED" && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-sm text-yellow-400">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>Welcome to TURTLE Robotics!</span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Congratulations! Our leadership team was thoroughly impressed by your application. Watch your email for Discord access, general meeting schedules, and 023 Haynes card access.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold block uppercase">Candidate</span>
                  <div className="font-bold text-white text-sm">{app.fullName}</div>
                  <div className="text-xs text-yellow-400 font-mono">{app.tamuEmail}</div>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold block uppercase">Major & Classification</span>
                  <div className="font-medium text-white">{app.major}</div>
                  <div className="text-xs text-gray-400">{app.classification}</div>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold block uppercase">Submitted On</span>
                  <div className="text-gray-300 text-xs mt-0.5">
                    {new Date(app.submittedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold block uppercase">Primary Subteam</span>
                  <div className="text-white font-medium">{app.primaryTrack}</div>
                </div>
              </div>

              {/* Applied Projects Summary */}
              {app.appliedProjects && app.appliedProjects.length > 0 && (
                <div className="pt-3 border-t border-gray-800">
                  <span className="text-[11px] text-yellow-400 font-bold block uppercase mb-2">
                    Your Applied Projects ({app.appliedProjects.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {app.appliedProjects.map((proj) => (
                      <div
                        key={proj.projectId}
                        className="px-3 py-1.5 rounded-lg bg-[#0a0a0f] border border-gray-800 text-xs flex items-center space-x-2"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-yellow-500 text-black font-extrabold text-[10px]">
                          Choice #{proj.rank}
                        </span>
                        <span className="font-bold text-white">{proj.projectName}</span>
                        <span className="text-gray-400 text-[11px] hidden sm:inline">— {proj.projectFullName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer notes */}
            <div className="px-6 py-4 bg-[#0a0a0f] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                <span>Questions? Contact turtlerobotics@gmail.com</span>
              </div>
              <Link href="/" className="font-semibold text-yellow-400 hover:underline">
                Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
