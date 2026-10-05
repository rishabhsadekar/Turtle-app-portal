"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  Send,
  Copy,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Trash2,
  Check,
  Plus,
  Lock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ProgramTrack, TurtleProject, AppliedProject } from "@/types";

export default function ApplyPage() {
  const { data: session, status } = useSession();
  const [existingApp, setExistingApp] = useState<any | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedApp, setSubmittedApp] = useState<{
    id: string;
    fullName: string;
    tamuEmail: string;
    projectCount: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Smooth scroll to top of window or error banner
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Clear single field error when user interacts with input
  const clearFieldError = (fieldName: string) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const copy = { ...prev };
      delete copy[fieldName];
      return copy;
    });
  };

  // Dynamic input styling based on error state
  const getFieldClass = (fieldName: string, isReadOnly: boolean = false) => {
    if (isReadOnly) {
      return "w-full px-3.5 py-2.5 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-emerald-200 cursor-not-allowed font-mono text-xs outline-none";
    }
    const hasError = Boolean(fieldErrors[fieldName]);
    if (hasError) {
      return "w-full px-3.5 py-2.5 rounded-lg border-2 border-red-500 bg-red-950/25 text-white placeholder-red-400/50 ring-2 ring-red-500/40 focus:border-red-400 focus:ring-red-400 outline-none transition-all text-xs";
    }
    return "w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 outline-none transition-all text-xs";
  };

  // Available projects from server
  const [allProjects, setAllProjects] = useState<TurtleProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectSearch, setProjectSearch] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    tamuEmail: "",
    uin: "",
    major: "Computer Science",
    classification: "Freshman" as "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate",
    graduationTerm: "May 2028",
    gpa: "",
    primaryTrack: "Hatchling Development" as ProgramTrack,
    secondaryTrack: "Software & Autonomy" as ProgramTrack | "None",
    skills: [] as string[],
    experience: "",
    whyTurtle: "",
    timeCommitment: "10-15 hrs/week",
    resumeUrl: "",
    githubOrPortfolio: "",
  });

  // Selected projects (1 to 5 in ranked order)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  
  // Custom answers per project: { [projectId]: { [questionId]: answerString } }
  const [projectAnswers, setProjectAnswers] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoadingProjects(true);
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (data.success && Array.isArray(data.projects)) {
          setAllProjects(data.projects);
          if (data.projects.length > 0) {
            setSelectedProjectIds([data.projects[0].id]);
          }
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    const user = session?.user;
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        tamuEmail: user.email || prev.tamuEmail,
        fullName: prev.fullName || user.name || "",
      }));

      const checkExisting = async () => {
        try {
          setCheckingExisting(true);
          const res = await fetch("/api/applications/status");
          const data = await res.json();
          if (data.success && data.application) {
            setExistingApp(data.application);
          }
        } catch (err) {
          // ignore error
        } finally {
          setCheckingExisting(false);
        }
      };
      checkExisting();
    }
  }, [session]);

  const toggleProject = (projectId: string) => {
    clearFieldError("projects");
    if (selectedProjectIds.includes(projectId)) {
      if (selectedProjectIds.length === 1) {
        setFieldErrors((prev) => ({ ...prev, projects: "You must select at least 1 project (up to 5 maximum)." }));
        setErrorMsg("You must select at least 1 project (up to 5 maximum).");
        scrollToTop();
        return;
      }
      setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId));
      setErrorMsg(null);
    } else {
      if (selectedProjectIds.length >= 5) {
        setFieldErrors((prev) => ({ ...prev, projects: "You can select a maximum of 5 projects." }));
        setErrorMsg("You can select a maximum of 5 projects.");
        scrollToTop();
        return;
      }
      setSelectedProjectIds((prev) => [...prev, projectId]);
      setErrorMsg(null);
    }
  };

  const moveProject = (index: number, direction: "up" | "down") => {
    setSelectedProjectIds((prev) => {
      const copy = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleAnswerChange = (projectId: string, questionId: string, val: string) => {
    setProjectAnswers((prev) => ({
      ...prev,
      [projectId]: {
        ...(prev[projectId] || {}),
        [questionId]: val,
      },
    }));
    clearFieldError(`q_${projectId}_${questionId}`);
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Please enter your full legal or preferred name.";
      }
      const email = formData.tamuEmail.trim().toLowerCase();
      if (!email) {
        newErrors.tamuEmail = "Please provide your Texas A&M email address.";
      } else if (!email.endsWith("@tamu.edu")) {
        newErrors.tamuEmail = "Please provide a valid Texas A&M email address ending with @tamu.edu.";
      }
      const uin = formData.uin.trim();
      if (!uin) {
        newErrors.uin = "Please enter your 9-digit Texas A&M student UIN.";
      } else if (!/^\d{9}$/.test(uin)) {
        newErrors.uin = "UIN must be exactly 9 numeric digits.";
      }
      if (!formData.major.trim()) {
        newErrors.major = "Please enter your major or engineering department.";
      }
      if (!formData.graduationTerm.trim()) {
        newErrors.graduationTerm = "Please specify your expected graduation term (e.g. May 2028).";
      }
    } else if (currentStep === 2) {
      if (selectedProjectIds.length < 1) {
        newErrors.projects = "Please select at least 1 project to apply to.";
      } else if (selectedProjectIds.length > 5) {
        newErrors.projects = "You can select a maximum of 5 projects.";
      }
    } else if (currentStep === 3) {
      for (const pId of selectedProjectIds) {
        const proj = allProjects.find((p) => p.id === pId);
        if (proj && proj.questions) {
          for (const q of proj.questions) {
            if (q.required) {
              const ans = projectAnswers[pId]?.[q.id]?.trim();
              if (!ans) {
                newErrors[`q_${pId}_${q.id}`] = `Required answer for ${proj.name}: "${q.question}"`;
              }
            }
          }
        }
      }

      if (!formData.experience.trim()) {
        newErrors.experience = "Please describe your engineering, technical, or project background.";
      }
      if (!formData.whyTurtle.trim()) {
        newErrors.whyTurtle = "Please let us know why you are interested in TURTLE Robotics.";
      }
      if (!formData.resumeUrl.trim()) {
        newErrors.resumeUrl = "Please provide a link to your resume or portfolio.";
      } else {
        try {
          new URL(formData.resumeUrl.trim());
        } catch {
          newErrors.resumeUrl = "Please provide a valid URL (starting with http:// or https://).";
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setErrorMsg(Object.values(newErrors)[0]);
      scrollToTop();
      return false;
    }

    setFieldErrors({});
    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
      scrollToTop();
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setFieldErrors({});
    setStep((s) => Math.max(1, s - 1));
    scrollToTop();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check each step. If any is invalid, navigate back to that step and scroll to top
    if (!validateStep(1)) {
      setStep(1);
      scrollToTop();
      return;
    }
    if (!validateStep(2)) {
      setStep(2);
      scrollToTop();
      return;
    }
    if (!validateStep(3)) {
      setStep(3);
      scrollToTop();
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setFieldErrors({});

    const formattedAppliedProjects: AppliedProject[] = selectedProjectIds.map((pId, idx) => {
      const proj = allProjects.find((p) => p.id === pId);
      const answers = (proj?.questions || []).map((q) => ({
        questionId: q.id,
        questionText: q.question,
        answer: projectAnswers[pId]?.[q.id] || "No answer provided",
      }));

      return {
        projectId: pId,
        projectName: proj?.name || pId.toUpperCase(),
        projectFullName: proj?.fullName || proj?.name || "",
        rank: idx + 1,
        answers,
      };
    });

    try {
      const payload = {
        ...formData,
        appliedProjects: formattedAppliedProjects,
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSubmittedApp({
        id: data.application.id,
        fullName: data.application.fullName,
        tamuEmail: data.application.tamuEmail,
        projectCount: formattedAppliedProjects.length,
      });
      scrollToTop();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred while submitting.");
      scrollToTop();
    } finally {
      setSubmitting(false);
    }
  };

  const copyAppId = () => {
    if (submittedApp?.id) {
      navigator.clipboard.writeText(submittedApp.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredProjects = allProjects.filter((p) => {
    const q = projectSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.fullName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  // Success view
  if (submittedApp) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-[#111218] rounded-2xl p-8 border border-gray-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
              TURTLE Robotics • Texas A&M
            </span>
            <h2 className="text-2xl font-black text-white">
              Application Successfully Submitted!
            </h2>
            <p className="text-xs text-gray-300">
              Howdy <span className="font-semibold text-white">{submittedApp.fullName}</span>! We received your application for{" "}
              <span className="font-semibold text-yellow-400">{submittedApp.projectCount} project{submittedApp.projectCount > 1 ? "s" : ""}</span>.
            </p>
          </div>

          <div className="p-4 bg-[#0a0a0f] border border-gray-800 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs text-gray-400 font-medium">Your Tracking ID</div>
              <div className="text-lg font-mono font-bold text-yellow-400">{submittedApp.id}</div>
            </div>
            <button
              onClick={copyAppId}
              type="button"
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1b26] border border-gray-700 text-gray-200 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              {copied ? "Copied!" : "Copy ID"}
            </button>
          </div>

          <div className="text-xs text-gray-400 text-left bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 leading-relaxed">
            <strong className="text-yellow-400">What happens next?</strong>
            <ul className="list-disc list-inside mt-1 space-y-1 text-gray-300">
              <li>Project leads and officers review your responses on a rolling basis.</li>
              <li>You can check your status anytime using your TAMU email ({submittedApp.tamuEmail}) or UIN.</li>
              <li>Interview invites will be dispatched via email and displayed on your status tracker.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/status"
              className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs shadow-lg transition-all"
            >
              Check Application Status
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#1c1d29] text-gray-300 font-semibold text-xs hover:bg-[#252737] hover:text-white transition-colors border border-gray-800"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 1. Loading State
  if (status === "loading" || checkingExisting) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          Verifying TAMU student credentials...
        </p>
      </div>
    );
  }

  // 2. Authentication Gate: Must login to apply
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-[#111218] rounded-2xl p-8 border border-gray-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto text-yellow-400 shadow-inner">
            <Lock className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-[11px] font-bold text-red-200 uppercase tracking-wider">
              <span>Authentication Required</span>
            </div>
            <h2 className="text-2xl font-black text-white">Sign In to Apply</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              To apply for TURTLE Robotics projects, Texas A&M candidates must first sign in with their official <strong className="text-yellow-400 font-mono">@tamu.edu</strong> Google account.
            </p>
          </div>

          <div className="p-4 bg-[#0a0a0f] rounded-xl border border-gray-800 text-left text-xs space-y-2.5 text-gray-300">
            <div className="font-semibold text-white flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-yellow-400" />
              Why is sign-in required?
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px]">
              <li>Guarantees student applicant identity and Texas A&M eligibility.</li>
              <li>Protects your application responses, portfolio, and interview slot.</li>
              <li>Enables secure tracking of your admission status.</li>
            </ul>
          </div>

          <Link
            href="/login?callbackUrl=/apply"
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

  // 3. Prevent duplicate active applications
  if (existingApp) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-[#111218] rounded-2xl p-8 border border-gray-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
              Application on File
            </span>
            <h2 className="text-2xl font-black text-white">Application Already Submitted</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Howdy <span className="font-semibold text-white">{existingApp.fullName}</span>! You have already submitted an active application under <span className="font-mono text-yellow-400">{existingApp.tamuEmail}</span>.
            </p>
          </div>

          <div className="p-4 bg-[#0a0a0f] border border-gray-800 rounded-xl text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Application ID:</span>
              <span className="font-mono font-bold text-yellow-400">{existingApp.id}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Status:</span>
              <span className="font-semibold text-white">{existingApp.status.replace(/_/g, " ")}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/status"
              className="w-full inline-flex items-center justify-center py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-extrabold shadow-lg transition-all hover:scale-[1.02]"
            >
              <span>View My Application Status</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#0a0a0f] text-gray-300 text-xs font-semibold hover:bg-white/5 border border-gray-800 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>TURTLE Robotics • Texas A&M</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Member Application Portal
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl mx-auto">
            Apply to <strong className="text-yellow-400 font-semibold">1 to 5 active TURTLE projects</strong> from our research and competitive engineering lab.
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="mb-8 bg-[#111218] p-4 rounded-xl border border-gray-800 shadow-sm">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
            {[
              { num: 1, label: "1. Academic & Info" },
              { num: 2, label: "2. Projects (1–5)" },
              { num: 3, label: "3. Questions & Essays" },
              { num: 4, label: "4. Review & Submit" },
            ].map((s) => (
              <div
                key={s.num}
                className={`py-2 px-1 rounded-lg border transition-all ${
                  step === s.num
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/40 font-bold"
                    : step > s.num
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "text-gray-500 border-transparent"
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step === s.num
                        ? "bg-yellow-500 text-black"
                        : step > s.num
                        ? "bg-emerald-500 text-black"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {step > s.num ? "✓" : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div
            id="form-error-banner"
            tabIndex={-1}
            className="mb-6 p-4 rounded-xl bg-red-950/60 border-2 border-red-500 text-red-200 text-xs shadow-xl shadow-red-950/50 flex items-start space-x-3 animate-shake outline-none"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <div className="space-y-1.5 w-full">
              <div className="font-bold text-sm text-red-300">
                Please complete or correct the highlighted fields below
              </div>
              <p className="leading-relaxed text-red-200">{errorMsg}</p>
              {Object.keys(fieldErrors).length > 1 && (
                <div className="mt-2 pt-2 border-t border-red-800/60">
                  <span className="font-semibold text-red-300 block mb-1">
                    Fields requiring attention ({Object.keys(fieldErrors).length}):
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-red-300/90 text-[11px]">
                    {Object.entries(fieldErrors).map(([key, msg]) => (
                      <li key={key}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-[#111218] rounded-2xl p-6 sm:p-8 border border-gray-800 shadow-xl">
          {/* Authentication Banner */}
          {session?.user ? (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Authenticated as:</span>{" "}
                  <span className="font-mono text-yellow-400 font-bold">{session.user.email}</span>
                  {session.user.name && <span className="text-gray-400 ml-1.5">({session.user.name})</span>}
                </div>
              </div>
              <span className="text-[11px] text-gray-400 bg-[#0a0a0f] px-2.5 py-1 rounded-lg border border-gray-800 shrink-0">
                Verified TAMU Account
              </span>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white">Have an official @tamu.edu Google Account?</span>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Sign in to verify your identity, auto-fill your email, and track review decisions instantly.
                  </p>
                </div>
              </div>
              <Link
                href="/login?callbackUrl=/apply"
                className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold transition-all shrink-0 hover:scale-105"
              >
                Sign In with TAMU Google →
              </Link>
            </div>
          )}

          {/* STEP 1: Academic & Personal Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-white">
                  Step 1: Personal & Academic Information
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Tell us who you are and what you study at Texas A&M.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors ${
                    fieldErrors.fullName ? "text-red-400" : "text-gray-300"
                  }`}>
                    Full Legal / Preferred Name <span className={fieldErrors.fullName ? "text-red-400" : "text-yellow-400"}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      clearFieldError("fullName");
                    }}
                    placeholder="e.g. Reveille Aggie"
                    className={getFieldClass("fullName")}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-red-400 font-semibold flex items-center mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`block text-xs font-bold uppercase tracking-wider transition-colors ${
                      fieldErrors.tamuEmail ? "text-red-400" : "text-gray-300"
                    }`}>
                      Texas A&M Email (@tamu.edu) <span className={fieldErrors.tamuEmail ? "text-red-400" : "text-yellow-400"}>*</span>
                    </label>
                    {session?.user?.email && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        Locked & Verified
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    readOnly={Boolean(session?.user?.email)}
                    value={formData.tamuEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, tamuEmail: e.target.value });
                      clearFieldError("tamuEmail");
                    }}
                    placeholder="e.g. netid@tamu.edu"
                    className={getFieldClass("tamuEmail", Boolean(session?.user?.email))}
                  />
                  {fieldErrors.tamuEmail ? (
                    <p className="text-[11px] text-red-400 font-semibold flex items-center mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {fieldErrors.tamuEmail}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 mt-1">
                      {session?.user?.email
                        ? "Automatically verified from your TAMU Google session."
                        : "Must be your official @tamu.edu address."}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors ${
                    fieldErrors.uin ? "text-red-400" : "text-gray-300"
                  }`}>
                    Universal Identification Number (UIN) <span className={fieldErrors.uin ? "text-red-400" : "text-yellow-400"}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={9}
                    value={formData.uin}
                    onChange={(e) => {
                      setFormData({ ...formData, uin: e.target.value.replace(/\D/g, "") });
                      clearFieldError("uin");
                    }}
                    placeholder="9-digit UIN (e.g. 931001234)"
                    className={`${getFieldClass("uin")} font-mono`}
                  />
                  {fieldErrors.uin && (
                    <p className="text-[11px] text-red-400 font-semibold flex items-center mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {fieldErrors.uin}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors ${
                    fieldErrors.major ? "text-red-400" : "text-gray-300"
                  }`}>
                    Major / Department <span className={fieldErrors.major ? "text-red-400" : "text-yellow-400"}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.major}
                    onChange={(e) => {
                      setFormData({ ...formData, major: e.target.value });
                      clearFieldError("major");
                    }}
                    placeholder="e.g. Mechanical Engineering / Computer Science"
                    className={getFieldClass("major")}
                  />
                  {fieldErrors.major && (
                    <p className="text-[11px] text-red-400 font-semibold flex items-center mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {fieldErrors.major}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Classification <span className="text-yellow-400">*</span>
                  </label>
                  <select
                    value={formData.classification}
                    onChange={(e) => setFormData({ ...formData, classification: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 outline-none"
                  >
                    <option value="Freshman">Freshman (Hatchling candidate)</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate Student</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors ${
                    fieldErrors.graduationTerm ? "text-red-400" : "text-gray-300"
                  }`}>
                    Expected Graduation Term <span className={fieldErrors.graduationTerm ? "text-red-400" : "text-yellow-400"}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.graduationTerm}
                    onChange={(e) => {
                      setFormData({ ...formData, graduationTerm: e.target.value });
                      clearFieldError("graduationTerm");
                    }}
                    placeholder="e.g. May 2028"
                    className={getFieldClass("graduationTerm")}
                  />
                  {fieldErrors.graduationTerm && (
                    <p className="text-[11px] text-red-400 font-semibold flex items-center mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {fieldErrors.graduationTerm}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Cumulative GPA (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="e.g. 3.82"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Project Choices (1-5 Projects from turtlerobotics.org/projects) */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-gray-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Step 2: Select Your Projects (Choose 1 to 5)
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Explore active projects from <a href="https://www.turtlerobotics.org/projects" target="_blank" rel="noopener noreferrer" className="text-yellow-400 underline font-semibold">turtlerobotics.org/projects</a>. Select between 1 and 5 projects and order them by preference.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      fieldErrors.projects
                        ? "bg-red-500/20 text-red-400 border-red-500 ring-2 ring-red-500/40 animate-pulse"
                        : selectedProjectIds.length >= 1 && selectedProjectIds.length <= 5
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}>
                      {selectedProjectIds.length} / 5 Selected (Min 1, Max 5)
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Selection Error Alert */}
              {fieldErrors.projects && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500 text-red-300 text-xs flex items-center space-x-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="font-semibold">{fieldErrors.projects}</span>
                </div>
              )}

              {/* Selected Projects Rank Manager */}
              {selectedProjectIds.length > 0 && (
                <div className="bg-[#0c0d14] border border-yellow-500/30 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center justify-between">
                    <span>Your Ranked Project Preferences (Use arrows to reorder)</span>
                    <span className="text-[11px] font-normal text-gray-400">Choice #1 is your top preference</span>
                  </div>

                  <div className="space-y-2">
                    {selectedProjectIds.map((pId, idx) => {
                      const proj = allProjects.find((p) => p.id === pId);
                      return (
                        <div
                          key={pId}
                          className="bg-[#141520] rounded-xl p-3 border border-gray-700/80 shadow-sm flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 rounded-full bg-yellow-500 text-black flex items-center justify-center font-extrabold text-[11px] shrink-0">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-white flex items-center space-x-2">
                                <span className="text-yellow-400">{proj?.name || pId.toUpperCase()}</span>
                                <span className="text-xs font-normal text-gray-300">
                                  — {proj?.fullName}
                                </span>
                              </div>
                              <div className="text-[11px] text-gray-400">
                                {proj?.questions.length || 0} application question{(proj?.questions.length || 0) === 1 ? "" : "s"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveProject(idx, "up")}
                              className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-20"
                              title="Move up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === selectedProjectIds.length - 1}
                              onClick={() => moveProject(idx, "down")}
                              className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-20"
                              title="Move down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleProject(pId)}
                              className="p-1 rounded text-red-400 hover:bg-red-500/10"
                              title="Remove project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Project Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects (e.g. DIRT, DRON, Combat, Humanoid, Rover, Exoskeleton)..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-700 bg-[#0a0a0f] text-white text-xs focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 outline-none"
                />
              </div>

              {/* Projects Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[440px] overflow-y-auto pr-1 rounded-xl p-1 transition-all ${
                fieldErrors.projects ? "border-2 border-red-500/60 ring-2 ring-red-500/30 bg-red-950/10" : ""
              }`}>
                {loadingProjects ? (
                  <div className="col-span-2 py-8 text-center text-xs text-gray-500">
                    Loading TURTLE projects...
                  </div>
                ) : (
                  filteredProjects.map((proj) => {
                    const isSelected = selectedProjectIds.includes(proj.id);
                    const rank = selectedProjectIds.indexOf(proj.id) + 1;
                    return (
                      <div
                        key={proj.id}
                        onClick={() => toggleProject(proj.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#191924] border-yellow-500 ring-1 ring-yellow-500 shadow-md shadow-yellow-500/5"
                            : "bg-[#0f1017] border-gray-800 hover:border-gray-700 hover:bg-[#13141d]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-sm text-yellow-400 tracking-wide">
                                {proj.name}
                              </span>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500 text-black">
                                  Choice #{rank}
                                </span>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${
                                isSelected
                                  ? "bg-yellow-500 border-yellow-500 text-black"
                                  : "border-gray-700 text-transparent"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                          <div className="font-semibold text-xs text-gray-200 mb-1">
                            {proj.fullName}
                          </div>
                          <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">
                            {proj.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400">
                          <span>{proj.questions?.length || 0} application questions</span>
                          <span className="font-semibold text-yellow-400">
                            {isSelected ? "Selected ✓" : "+ Add Project"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Project-Specific Questions & Motivation */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-white">
                  Step 3: Project-Specific Questions & Motivation
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Answer the tailored questions for the projects you selected in Step 2.
                </p>
              </div>

              {/* Dynamic Project Questions */}
              <div className="space-y-6">
                {selectedProjectIds.map((pId, idx) => {
                  const proj = allProjects.find((p) => p.id === pId);
                  if (!proj) return null;
                  return (
                    <div
                      key={pId}
                      className="bg-[#0e0f16] rounded-xl p-5 border border-gray-800 space-y-4"
                    >
                      <div className="flex items-center space-x-2 border-b border-gray-800 pb-2">
                        <span className="px-2 py-0.5 rounded bg-yellow-500 text-black font-extrabold text-xs">
                          Choice #{idx + 1}
                        </span>
                        <h3 className="font-bold text-sm text-white">
                          <span className="text-yellow-400">{proj.name}</span>: {proj.fullName}
                        </h3>
                      </div>

                      {proj.questions && proj.questions.length > 0 ? (
                        proj.questions.map((q) => {
                          const fieldKey = `q_${pId}_${q.id}`;
                          const hasError = Boolean(fieldErrors[fieldKey]);
                          return (
                            <div key={q.id} className="space-y-1.5">
                              <label className={`block text-xs font-semibold transition-colors ${
                                hasError ? "text-red-400" : "text-gray-200"
                              }`}>
                                {q.question} {q.required && <span className={hasError ? "text-red-400" : "text-yellow-400"}>*</span>}
                              </label>
                              {q.description && (
                                <p className="text-[11px] text-gray-400">{q.description}</p>
                              )}
                              {q.type === "textarea" ? (
                                <textarea
                                  rows={3}
                                  required={q.required}
                                  value={projectAnswers[pId]?.[q.id] || ""}
                                  onChange={(e) => handleAnswerChange(pId, q.id, e.target.value)}
                                  placeholder="Your response..."
                                  className={`w-full px-3.5 py-2 rounded-lg border text-xs outline-none transition-all ${
                                    hasError
                                      ? "border-2 border-red-500 bg-red-950/25 text-white placeholder-red-400/50 ring-2 ring-red-500/40 focus:border-red-400 focus:ring-red-400"
                                      : "border-gray-700 bg-[#0a0a0f] text-white focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500"
                                  }`}
                                />
                              ) : (
                                <input
                                  type="text"
                                  required={q.required}
                                  value={projectAnswers[pId]?.[q.id] || ""}
                                  onChange={(e) => handleAnswerChange(pId, q.id, e.target.value)}
                                  placeholder="Your response..."
                                  className={`w-full px-3.5 py-2 rounded-lg border text-xs outline-none transition-all ${
                                    hasError
                                      ? "border-2 border-red-500 bg-red-950/25 text-white placeholder-red-400/50 ring-2 ring-red-500/40 focus:border-red-400 focus:ring-red-400"
                                      : "border-gray-700 bg-[#0a0a0f] text-white focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500"
                                  }`}
                                />
                              )}
                              {hasError && (
                                <p className="text-[11px] text-red-400 font-semibold flex items-center mt-1 animate-fadeIn">
                                  <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                                  {fieldErrors[fieldKey]}
                                </p>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-500 italic">No specific questions for this project.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* General Technical Background & Essays */}
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                  General Experience & Portfolio Links
                </h3>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors ${
                    fieldErrors.experience ? "text-red-400" : "text-gray-300"
                  }`}>
                    Previous Projects, Technical Experience, or Relevant Coursework <span className={fieldErrors.experience ? "text-red-400" : "text-yellow-400"}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.experience}
                    onChange={(e) => {
                      setFormData({ ...formData, experience: e.target.value });
                      clearFieldError("experience");
                    }}
                    placeholder="Tell us about personal projects, hackathons, robotics, class labs (e.g. ENGR 102/216), or self-taught skills. Beginners: share what you are learning!"
                    className={getFieldClass("experience")}
                  />
                  {fieldErrors.experience && (
                    <p className="text-[11px] text-red-400 font-semibold flex items-center mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {fieldErrors.experience}
                    </p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors ${
                    fieldErrors.whyTurtle ? "text-red-400" : "text-gray-300"
                  }`}>
                    Why TURTLE Robotics? What do you hope to gain and contribute? <span className={fieldErrors.whyTurtle ? "text-red-400" : "text-yellow-400"}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.whyTurtle}
                    onChange={(e) => {
                      setFormData({ ...formData, whyTurtle: e.target.value });
                      clearFieldError("whyTurtle");
                    }}
                    placeholder="What attracts you to TURTLE Robotics? How will you actively engage with the team during lab builds and testing cycles?"
                    className={getFieldClass("whyTurtle")}
                  />
                  {fieldErrors.whyTurtle && (
                    <p className="text-[11px] text-red-400 font-semibold flex items-center mt-1.5 animate-fadeIn">
                      <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                      {fieldErrors.whyTurtle}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                    Weekly Time Commitment
                  </label>
                  <select
                    value={formData.timeCommitment}
                    onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 outline-none"
                  >
                    <option value="5-10 hrs/week">5-10 hours / week (Standard Hatchling pace)</option>
                    <option value="10-15 hrs/week">10-15 hours / week (Core project member)</option>
                    <option value="15+ hrs/week">15+ hours / week (Project lead / intense build)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 transition-colors ${
                      fieldErrors.resumeUrl ? "text-red-400" : "text-gray-300"
                    }`}>
                      Resume Link (Google Drive / Box / LinkedIn) <span className={fieldErrors.resumeUrl ? "text-red-400" : "text-yellow-400"}>*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.resumeUrl}
                      onChange={(e) => {
                        setFormData({ ...formData, resumeUrl: e.target.value });
                        clearFieldError("resumeUrl");
                      }}
                      placeholder="https://drive.google.com/file/d/..."
                      className={getFieldClass("resumeUrl")}
                    />
                    {fieldErrors.resumeUrl && (
                      <p className="text-[11px] text-red-400 font-semibold flex items-center mt-1.5 animate-fadeIn">
                        <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                        {fieldErrors.resumeUrl}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-500 mt-1">
                      Set permissions to "Anyone with the link can view".
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      GitHub or Portfolio URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.githubOrPortfolio}
                      onChange={(e) => setFormData({ ...formData, githubOrPortfolio: e.target.value })}
                      placeholder="https://github.com/your-username"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-white">
                  Step 4: Final Review & Submission
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Please review your details and project preferences before submitting.
                </p>
              </div>

              <div className="bg-[#0c0d14] rounded-xl p-5 border border-gray-800 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-gray-800">
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block uppercase">Applicant</span>
                    <strong className="text-white text-sm">{formData.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block uppercase">TAMU Email</span>
                    <strong className="text-yellow-400 font-mono">{formData.tamuEmail}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block uppercase">UIN</span>
                    <span className="text-gray-200 font-mono">{formData.uin}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block uppercase">Academic Standing</span>
                    <span className="text-gray-200">{formData.classification} • {formData.major} ({formData.graduationTerm})</span>
                  </div>
                </div>

                {/* Ranked Project Choices */}
                <div className="pb-3 border-b border-gray-800">
                  <span className="text-xs text-yellow-400 font-bold block uppercase mb-2">
                    Ranked Project Choices ({selectedProjectIds.length})
                  </span>
                  <div className="space-y-2">
                    {selectedProjectIds.map((pId, idx) => {
                      const proj = allProjects.find((p) => p.id === pId);
                      return (
                        <div key={pId} className="p-3 bg-[#141520] rounded-lg border border-gray-800 text-xs">
                          <div className="flex items-center space-x-2 font-bold text-white mb-1">
                            <span className="px-2 py-0.5 rounded bg-yellow-500 text-black font-mono text-[10px] font-extrabold">
                              Choice #{idx + 1}
                            </span>
                            <span className="text-yellow-400">{proj?.name}</span>
                            <span className="text-gray-300 font-normal">— {proj?.fullName}</span>
                          </div>
                          {proj?.questions.map((q) => (
                            <div key={q.id} className="mt-1 pl-3 border-l border-gray-700 text-[11px]">
                              <span className="text-gray-400 font-medium">{q.question}:</span>
                              <p className="text-gray-200 italic mt-0.5">
                                {projectAnswers[pId]?.[q.id] || "No answer entered"}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block uppercase">Experience Summary</span>
                    <p className="text-gray-300 mt-1 whitespace-pre-wrap">{formData.experience}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block uppercase">Why TURTLE</span>
                    <p className="text-gray-300 mt-1 whitespace-pre-wrap">{formData.whyTurtle}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block uppercase">Resume Link</span>
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-yellow-400 underline inline-flex items-center mt-1 font-medium"
                    >
                      {formData.resumeUrl} <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-gray-300 text-xs leading-relaxed">
                <strong className="text-yellow-400">Aggie Honor Code:</strong> An Aggie does not lie, cheat or steal, or tolerate those who do. By submitting this application, I certify that all responses represent my own work.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-gray-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2.5 rounded-xl border border-gray-700 bg-white/5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-extrabold shadow-md transition-all hover:scale-105"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1.5 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="inline-flex items-center px-8 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-extrabold shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>Submitting Application...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2 stroke-[2.5]" />
                    Submit Final Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
