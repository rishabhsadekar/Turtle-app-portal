"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ShieldAlert,
  User,
  Star,
  ExternalLink,
  MessageSquare,
  X,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  HelpCircle,
  FileQuestion,
  Layers,
} from "lucide-react";
import {
  Application,
  ApplicationStatus,
  ProgramTrack,
  ReviewScore,
  TurtleProject,
  ProjectQuestion,
} from "@/types";

const TRACKS = [
  "ALL",
  "Hatchling Development",
  "Software & Autonomy",
  "Mechanical Design",
  "Electrical & Firmware",
  "Business & Operations",
];

const STATUSES: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "INTERVIEW_INVITED", label: "Interview" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "REJECTED", label: "Rejected" },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"candidates" | "questions">("candidates");

  // ---------------- Candidates State ----------------
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [trackFilter, setTrackFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Modal Review Form state
  const [modalStatus, setModalStatus] = useState<ApplicationStatus>("SUBMITTED");
  const [modalScore, setModalScore] = useState<ReviewScore>({
    technical: 4,
    passion: 4,
    teamwork: 4,
    overall: 4.0,
  });
  const [modalInterview, setModalInterview] = useState("");
  const [newNoteAuthor, setNewNoteAuthor] = useState("Officer Lead");
  const [newNoteText, setNewNoteText] = useState("");
  const [savingApp, setSavingApp] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // ---------------- Projects & Questions Manager State ----------------
  const [projects, setProjects] = useState<TurtleProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [editingQuestions, setEditingQuestions] = useState<ProjectQuestion[]>([]);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [questionsSaveSuccess, setQuestionsSaveSuccess] = useState<string | null>(null);

  // ---------------- Deletion Confirmation & Feedback State ----------------
  const [confirmClearAllOpen, setConfirmClearAllOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingActive, setDeletingActive] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  // Fetch Applications with cache busting
  const fetchApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await fetch("/api/applications", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
    } finally {
      setLoadingApps(false);
    }
  };

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
        if (data.projects.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0].id);
          setEditingQuestions(data.projects[0].questions || []);
        }
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchProjects();
  }, []);

  const handleSelectProjectForQuestions = (proj: TurtleProject) => {
    setSelectedProjectId(proj.id);
    setEditingQuestions(JSON.parse(JSON.stringify(proj.questions || [])));
    setQuestionsSaveSuccess(null);
  };

  const handleAddQuestion = () => {
    const newQ: ProjectQuestion = {
      id: `q-${Date.now()}`,
      question: "New project-specific question prompt...",
      type: "textarea",
      required: true,
    };
    setEditingQuestions((prev) => [...prev, newQ]);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<ProjectQuestion>) => {
    setEditingQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleDeleteQuestion = (index: number) => {
    setEditingQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveQuestions = async () => {
    if (!selectedProjectId) return;
    setSavingQuestions(true);
    setQuestionsSaveSuccess(null);

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: editingQuestions }),
      });

      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === selectedProjectId ? data.project : p))
        );
        setQuestionsSaveSuccess("Questions updated successfully for this project!");
        setTimeout(() => setQuestionsSaveSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Save questions error:", err);
    } finally {
      setSavingQuestions(false);
    }
  };

  const openAppReview = (app: Application) => {
    setSelectedApp(app);
    setModalStatus(app.status);
    setModalInterview(app.interviewSlot || "");
    setModalScore(
      app.reviewScore || {
        technical: 3,
        passion: 4,
        teamwork: 4,
        overall: 3.7,
      }
    );
    setNewNoteText("");
    setSaveSuccessMsg(null);
  };

  const handleScoreChange = (field: keyof ReviewScore, value: number) => {
    const updated = { ...modalScore, [field]: value };
    const avg = Number(
      ((updated.technical + updated.passion + updated.teamwork) / 3).toFixed(1)
    );
    updated.overall = avg;
    setModalScore(updated);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedApp) return;
    setSavingApp(true);
    setSaveSuccessMsg(null);

    try {
      const payload: any = {
        status: modalStatus,
        reviewScore: modalScore,
        interviewSlot: modalInterview.trim() || undefined,
      };

      if (newNoteText.trim()) {
        payload.newNote = {
          author: newNoteAuthor.trim() || "Officer",
          note: newNoteText.trim(),
        };
      }

      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedApp(data.application);
        setApplications((prev) =>
          prev.map((a) => (a.id === data.application.id ? data.application : a))
        );
        setNewNoteText("");
        setSaveSuccessMsg("Application review saved successfully!");
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error("Save error", err);
    } finally {
      setSavingApp(false);
    }
  };

  const executeClearAllApplications = async () => {
    setDeletingActive(true);
    try {
      const res = await fetch("/api/applications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications([]);
        setSelectedApp(null);
        setConfirmClearAllOpen(false);
        setActionFeedback({
          type: "success",
          message: "All applicant records have been permanently cleared.",
        });
      } else {
        setActionFeedback({
          type: "error",
          message: data.error || "Failed to clear applicant data.",
        });
      }
    } catch (err) {
      console.error("Failed to clear applications", err);
      setActionFeedback({
        type: "error",
        message: "Network error occurred while clearing applicant data.",
      });
    } finally {
      setDeletingActive(false);
    }
  };

  const executeDeleteSingleApplication = async () => {
    if (!appToDelete) return;
    setDeletingActive(true);

    try {
      const res = await fetch(`/api/applications/${encodeURIComponent(appToDelete.id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications((prev) => prev.filter((a) => a.id !== appToDelete.id));
        if (selectedApp?.id === appToDelete.id) {
          setSelectedApp(null);
        }
        setActionFeedback({
          type: "success",
          message: `Application for "${appToDelete.name}" (${appToDelete.id}) was permanently deleted.`,
        });
        setAppToDelete(null);
      } else {
        setActionFeedback({
          type: "error",
          message: data.error || "Failed to delete application.",
        });
      }
    } catch (err) {
      console.error("Failed to delete application", err);
      setActionFeedback({
        type: "error",
        message: "Network error occurred while deleting application.",
      });
    } finally {
      setDeletingActive(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Full Name",
      "TAMU Email",
      "UIN",
      "Major",
      "Classification",
      "Grad Term",
      "Primary Track",
      "Applied Projects",
      "Status",
      "Technical Score",
      "Overall Score",
      "Submitted At",
    ];

    const rows = applications.map((a) => [
      a.id,
      `"${a.fullName}"`,
      a.tamuEmail,
      a.uin,
      `"${a.major}"`,
      a.classification,
      a.graduationTerm,
      `"${a.primaryTrack}"`,
      `"${(a.appliedProjects || []).map((p) => `#${p.rank} ${p.projectName}`).join("; ")}"`,
      a.status,
      a.reviewScore?.technical || "",
      a.reviewScore?.overall || "",
      a.submittedAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TURTLE_Applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredApps = applications.filter((app) => {
    const matchesTrack =
      trackFilter === "ALL" ||
      app.primaryTrack === trackFilter ||
      app.secondaryTrack === trackFilter;

    const matchesProject =
      projectFilter === "ALL" ||
      app.appliedProjects?.some(
        (p) => p.projectId === projectFilter || p.projectName === projectFilter
      );

    const matchesStatus =
      statusFilter === "ALL" || app.status === statusFilter;

    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.fullName.toLowerCase().includes(q) ||
      app.tamuEmail.toLowerCase().includes(q) ||
      app.uin.includes(q) ||
      app.id.toLowerCase().includes(q) ||
      app.major.toLowerCase().includes(q) ||
      app.appliedProjects?.some(
        (p) =>
          p.projectName.toLowerCase().includes(q) ||
          p.projectFullName.toLowerCase().includes(q)
      );

    return matchesTrack && matchesProject && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800">Submitted</span>;
      case "UNDER_REVIEW":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">Under Review</span>;
      case "INTERVIEW_INVITED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800">Interview</span>;
      case "ACCEPTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">Accepted</span>;
      case "WAITLISTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-950/60 text-orange-300 border border-orange-800">Waitlisted</span>;
      case "REJECTED":
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-900 text-gray-400 border border-gray-800">Rejected</span>;
    }
  };

  const selectedProjectObj = projects.find((p) => p.id === selectedProjectId);

  const filteredProjectsForQuestions = projects.filter((p) => {
    const q = projectSearchTerm.toLowerCase().trim();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q);
  });

  // Metrics
  const totalCount = applications.length;
  const inReviewCount = applications.filter((a) => a.status === "UNDER_REVIEW").length;
  const interviewCount = applications.filter((a) => a.status === "INTERVIEW_INVITED").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#111218] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-white tracking-tight">
                  TURTLE Executive Portal
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  Officer Access
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Recruitment Pipeline & Project Questions Configuration • Texas A&M University
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                fetchApplications();
                fetchProjects();
              }}
              type="button"
              className="inline-flex items-center px-3.5 py-2 rounded-xl border border-gray-700 bg-white/5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingApps || loadingProjects ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {activeTab === "candidates" && (
              <>
                <button
                  onClick={exportCSV}
                  type="button"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-extrabold shadow-md transition-all hover:scale-105"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                  Export CSV
                </button>
                <button
                  onClick={() => setConfirmClearAllOpen(true)}
                  type="button"
                  className="inline-flex items-center px-3.5 py-2 rounded-xl border border-red-500/40 bg-red-950/30 hover:bg-red-900/50 text-red-300 text-xs font-semibold transition-colors"
                  title="Clear all candidate submissions"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1 text-red-400" />
                  Clear Data
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab("candidates")}
            className={`inline-flex items-center px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "candidates"
                ? "border-yellow-400 text-yellow-400 bg-[#161722] rounded-t-xl"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-t-xl"
            }`}
          >
            <Layers className="w-4 h-4 mr-2" />
            Candidate Applications ({applications.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("questions")}
            className={`inline-flex items-center px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "questions"
                ? "border-yellow-400 text-yellow-400 bg-[#161722] rounded-t-xl"
                : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-t-xl"
            }`}
          >
            <FileQuestion className="w-4 h-4 mr-2" />
            Project Questions Manager ({projects.length} Projects)
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: CANDIDATES EVALUATION PIPELINE                          */}
        {/* ============================================================== */}
        {activeTab === "candidates" && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#111218] p-5 rounded-2xl border border-gray-800 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Applicants</div>
                <div className="text-3xl font-black text-white mt-1">{totalCount}</div>
                <div className="text-[11px] text-gray-500 mt-1">Fall / Spring Cohort</div>
              </div>
              <div className="bg-[#111218] p-5 rounded-2xl border border-gray-800 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-yellow-400">Under Review</div>
                <div className="text-3xl font-black text-yellow-400 mt-1">{inReviewCount}</div>
                <div className="text-[11px] text-gray-500 mt-1">Pending evaluation</div>
              </div>
              <div className="bg-[#111218] p-5 rounded-2xl border border-gray-800 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Interviews</div>
                <div className="text-3xl font-black text-purple-400 mt-1">{interviewCount}</div>
                <div className="text-[11px] text-gray-500 mt-1">Slots assigned</div>
              </div>
              <div className="bg-[#111218] p-5 rounded-2xl border border-gray-800 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Accepted</div>
                <div className="text-3xl font-black text-emerald-400 mt-1">{acceptedCount}</div>
                <div className="text-[11px] text-gray-500 mt-1">Confirmed members</div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-[#111218] p-4 rounded-2xl border border-gray-800 shadow-sm flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by candidate name, TAMU email, UIN, major, or project name..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-700 bg-[#0a0a0f] text-white text-xs focus:ring-2 focus:ring-yellow-500/40 outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-700 text-xs font-medium bg-[#0a0a0f] text-gray-200 outline-none"
                >
                  <option value="ALL">All Projects (24)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <select
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-700 text-xs font-medium bg-[#0a0a0f] text-gray-200 outline-none"
                >
                  {TRACKS.map((t) => (
                    <option key={t} value={t}>
                      {t === "ALL" ? "All Subteams" : t}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-700 text-xs font-medium bg-[#0a0a0f] text-gray-200 outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table of Applications */}
            <div className="bg-[#111218] rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c0d14] border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Major & Year</th>
                      <th className="py-3.5 px-4">Applied Projects (1-5)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Score</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-gray-300">
                    {filteredApps.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No applications found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredApps.map((app) => (
                        <tr
                          key={app.id}
                          onClick={() => openAppReview(app)}
                          className="hover:bg-[#161722] cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="font-bold text-white text-sm">{app.fullName}</div>
                            <div className="text-[11px] text-yellow-400/80 font-mono">{app.tamuEmail}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-200">{app.major}</div>
                            <div className="text-[11px] text-gray-400">{app.classification}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[280px]">
                              {app.appliedProjects && app.appliedProjects.length > 0 ? (
                                app.appliedProjects.map((p) => (
                                  <span
                                    key={p.projectId}
                                    className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#0a0a0f] text-yellow-400 border border-gray-800 flex items-center space-x-1"
                                  >
                                    <span className="font-bold text-[9px] bg-yellow-500 text-black px-1 rounded">
                                      #{p.rank}
                                    </span>
                                    <span>{p.projectName}</span>
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 italic text-[11px]">{app.primaryTrack}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                          <td className="py-3 px-4 font-mono font-bold">
                            {app.reviewScore ? (
                              <span className="text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                                ★ {app.reviewScore.overall}
                              </span>
                            ) : (
                              <span className="text-gray-500 font-normal italic">Unscored</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAppReview(app);
                                }}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 hover:bg-yellow-500 hover:text-black text-gray-300 text-xs font-semibold transition-colors"
                              >
                                Review <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </button>
                              <button
                                type="button"
                                title={`Delete application for ${app.fullName}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAppToDelete({ id: app.id, name: app.fullName });
                                }}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PROJECT QUESTIONS MANAGER                               */}
        {/* ============================================================== */}
        {activeTab === "questions" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sidebar: Projects List */}
            <div className="bg-[#111218] p-4 rounded-2xl border border-gray-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-white uppercase tracking-wider">TURTLE Projects ({projects.length})</h3>
                <span className="text-[10px] text-gray-500">Select to edit</span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
                  placeholder="Search project name..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <div className="space-y-1 max-h-[550px] overflow-y-auto pr-1">
                {filteredProjectsForQuestions.map((p) => {
                  const isSelected = p.id === selectedProjectId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProjectForQuestions(p)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/40 font-bold"
                          : "hover:bg-white/5 text-gray-300"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-extrabold mr-1.5 text-yellow-400">{p.name}</span>
                        <span className="text-[11px] text-gray-400 font-normal truncate">{p.fullName}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0a0a0f] text-gray-400 font-mono border border-gray-800">
                        {p.questions?.length || 0}Q
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Panel: Question Editor for Selected Project */}
            <div className="md:col-span-2 bg-[#111218] p-6 rounded-2xl border border-gray-800 shadow-sm space-y-6">
              {selectedProjectObj ? (
                <>
                  <div className="border-b border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded bg-yellow-500 text-black font-mono font-black text-xs">
                          {selectedProjectObj.name}
                        </span>
                        <h2 className="text-xl font-bold text-white">
                          {selectedProjectObj.fullName}
                        </h2>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
                        {selectedProjectObj.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="inline-flex items-center px-3 py-1.5 rounded-xl border border-gray-700 bg-white/5 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add Question
                      </button>
                      <button
                        type="button"
                        disabled={savingQuestions}
                        onClick={handleSaveQuestions}
                        className="inline-flex items-center px-4 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-extrabold shadow-md transition-all hover:scale-105 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
                        {savingQuestions ? "Saving..." : "Save Questions"}
                      </button>
                    </div>
                  </div>

                  {/* Confirmation Toast */}
                  {questionsSaveSuccess && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center space-x-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{questionsSaveSuccess}</span>
                    </div>
                  )}

                  {/* Questions List */}
                  <div className="space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center justify-between">
                      <span>Configured Application Questions for {selectedProjectObj.name}</span>
                      <span className="text-gray-400 font-normal">{editingQuestions.length} Questions</span>
                    </div>

                    {editingQuestions.length === 0 ? (
                      <div className="text-center py-10 bg-[#0c0d14] rounded-xl border border-dashed border-gray-800 text-xs text-gray-500 space-y-2">
                        <p>No questions configured for this project yet.</p>
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-500 text-black font-extrabold text-xs"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Add First Question
                        </button>
                      </div>
                    ) : (
                      editingQuestions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl border border-gray-800 bg-[#0e0f16] space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-[10px] font-bold uppercase text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                              Question #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(idx)}
                              className="text-gray-500 hover:text-red-400 p-1"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                              Question Prompt / Text
                            </label>
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => handleUpdateQuestion(idx, { question: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs outline-none focus:ring-1 focus:ring-yellow-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-bold uppercase text-gray-400 mb-1">
                                Response Input Format
                              </label>
                              <select
                                value={q.type}
                                onChange={(e) =>
                                  handleUpdateQuestion(idx, { type: e.target.value as any })
                                }
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs outline-none"
                              >
                                <option value="textarea">Paragraph / Multi-line Textarea</option>
                                <option value="text">Single Line Text</option>
                              </select>
                            </div>

                            <div className="flex items-center space-x-2 pt-5">
                              <input
                                type="checkbox"
                                id={`req-${q.id}`}
                                checked={q.required}
                                onChange={(e) =>
                                  handleUpdateQuestion(idx, { required: e.target.checked })
                                }
                                className="rounded text-yellow-500 focus:ring-yellow-500"
                              />
                              <label htmlFor={`req-${q.id}`} className="text-xs font-semibold text-gray-300">
                                Required for applicants applying to this project
                              </label>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-xs text-gray-500">
                  Select a project from the left to view and modify questions.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CANDIDATE REVIEW DRAWER / MODAL                                */}
        {/* ============================================================== */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#111218] w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black/10 rounded">
                      {selectedApp.id}
                    </span>
                    <span className="text-xs uppercase tracking-wider font-extrabold text-black/80">
                      Candidate Dossier & Review
                    </span>
                  </div>
                  <h2 className="text-2xl font-black mt-1 text-black">{selectedApp.fullName}</h2>
                  <p className="text-xs font-semibold text-black/80">
                    {selectedApp.tamuEmail} • UIN: {selectedApp.uin} • {selectedApp.major} ({selectedApp.classification})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  type="button"
                  className="p-2 text-black/70 hover:text-black rounded-lg hover:bg-black/10"
                >
                  <X className="w-6 h-6 stroke-[2.5]" />
                </button>
              </div>

              {/* Success alert */}
              {saveSuccessMsg && (
                <div className="bg-emerald-950/40 border-b border-emerald-800 p-3 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-300">
                {/* Status & Quick Action Pipeline */}
                <div className="bg-[#0c0d14] p-4 rounded-xl border border-gray-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 block mb-1">
                        Application Status Pipeline
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            "SUBMITTED",
                            "UNDER_REVIEW",
                            "INTERVIEW_INVITED",
                            "ACCEPTED",
                            "WAITLISTED",
                            "REJECTED",
                          ] as ApplicationStatus[]
                        ).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setModalStatus(s)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              modalStatus === s
                                ? "bg-yellow-500 text-black border-yellow-500 font-extrabold shadow-sm"
                                : "bg-[#141520] text-gray-300 border-gray-700 hover:bg-gray-800"
                            }`}
                          >
                            {s.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Interview Slot (Optional)
                      </span>
                      <input
                        type="text"
                        value={modalInterview}
                        onChange={(e) => setModalInterview(e.target.value)}
                        placeholder="e.g. Thursday 4:30 PM (023 Haynes)"
                        className="px-3 py-1.5 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs w-full sm:w-64 outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Rubric Evaluation */}
                <div className="border border-gray-800 rounded-xl p-4 bg-[#0c0d14] space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <h3 className="text-xs font-bold uppercase text-white flex items-center space-x-1.5">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>Candidate Evaluation Rubric</span>
                    </h3>
                    <div className="text-xs font-mono font-bold text-gray-300">
                      Overall Score: <span className="text-base text-yellow-400 font-black">{modalScore.overall} / 5.0</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="font-semibold text-gray-300 block mb-1">
                        Technical Capability ({modalScore.technical}/5)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={modalScore.technical}
                        onChange={(e) => handleScoreChange("technical", Number(e.target.value))}
                        className="w-full accent-yellow-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                        <span>Beginner</span>
                        <span>Proficient</span>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-300 block mb-1">
                        Passion & Curiosity ({modalScore.passion}/5)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={modalScore.passion}
                        onChange={(e) => handleScoreChange("passion", Number(e.target.value))}
                        className="w-full accent-yellow-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                        <span>Passive</span>
                        <span>High Drive</span>
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-gray-300 block mb-1">
                        Teamwork & Reliability ({modalScore.teamwork}/5)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={modalScore.teamwork}
                        onChange={(e) => handleScoreChange("teamwork", Number(e.target.value))}
                        className="w-full accent-yellow-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
                        <span>Solitary</span>
                        <span>Culture Add</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Applied Projects (1-5) and Their Answers */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 border-b border-gray-800 pb-2">
                    Applied Projects & Responses
                  </h3>

                  {selectedApp.appliedProjects && selectedApp.appliedProjects.length > 0 ? (
                    <div className="space-y-3">
                      {selectedApp.appliedProjects.map((p) => (
                        <div
                          key={p.projectId}
                          className="bg-[#0c0d14] rounded-xl p-4 border border-gray-800 space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded bg-yellow-500 text-black font-extrabold text-xs">
                              Choice #{p.rank}
                            </span>
                            <span className="font-bold text-white text-sm text-yellow-400">{p.projectName}</span>
                            <span className="text-gray-400 text-xs">— {p.projectFullName}</span>
                          </div>

                          <div className="space-y-2 pl-2">
                            {p.answers && p.answers.length > 0 ? (
                              p.answers.map((ans, aIdx) => (
                                <div key={aIdx} className="bg-[#141520] p-3 rounded-lg border border-gray-800 text-xs">
                                  <div className="font-semibold text-gray-300 mb-1">
                                    Q: {ans.questionText}
                                  </div>
                                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                                    {ans.answer}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-500 italic">No specific questions answered.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#0c0d14] rounded-lg text-xs text-gray-400 border border-gray-800">
                      Applied via track: <strong>{selectedApp.primaryTrack}</strong>
                    </div>
                  )}
                </div>

                {/* Candidate General Background & Links */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 border-b border-gray-800 pb-2">
                    General Background & Essays
                  </h3>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 font-semibold border border-yellow-500/30"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      View Candidate Resume
                    </a>
                    {selectedApp.githubOrPortfolio && (
                      <a
                        href={selectedApp.githubOrPortfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 hover:bg-white/10 font-semibold border border-gray-700"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        Portfolio / GitHub
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Past Projects & Technical Experience
                    </h4>
                    <div className="p-3.5 bg-[#0c0d14] rounded-xl text-xs text-gray-200 leading-relaxed whitespace-pre-wrap border border-gray-800">
                      {selectedApp.experience}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Motivation: Why TURTLE Robotics?
                    </h4>
                    <div className="p-3.5 bg-[#0c0d14] rounded-xl text-xs text-gray-200 leading-relaxed whitespace-pre-wrap border border-gray-800">
                      {selectedApp.whyTurtle}
                    </div>
                  </div>
                </div>

                {/* Internal Reviewer Notes */}
                <div className="space-y-3 pt-2 border-t border-gray-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4 text-yellow-400" />
                    <span>Officer Internal Discussion Notes</span>
                  </h4>

                  <div className="space-y-2">
                    {selectedApp.internalNotes && selectedApp.internalNotes.length > 0 ? (
                      selectedApp.internalNotes.map((n) => (
                        <div key={n.id} className="p-3 rounded-lg bg-[#0c0d14] border border-gray-800 text-xs">
                          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                            <span className="font-bold text-yellow-400">{n.author}</span>
                            <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-300">{n.note}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">No officer notes logged yet.</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <input
                      type="text"
                      value={newNoteAuthor}
                      onChange={(e) => setNewNoteAuthor(e.target.value)}
                      placeholder="Your role (e.g. Software Lead)"
                      className="px-3 py-2 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs sm:w-48 outline-none"
                    />
                    <input
                      type="text"
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      placeholder="Add an internal reviewer comment..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-700 bg-[#0a0a0f] text-white text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#0c0d14] border-t border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 rounded-xl border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAppToDelete({ id: selectedApp.id, name: selectedApp.fullName });
                    }}
                    className="inline-flex items-center px-3 py-2 rounded-xl border border-red-500/30 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Delete Application
                  </button>
                </div>

                <button
                  type="button"
                  disabled={savingApp}
                  onClick={handleSaveEvaluation}
                  className="px-6 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-extrabold shadow-md transition-all hover:scale-105 disabled:opacity-50"
                >
                  {savingApp ? "Saving Changes..." : "Save Evaluation & Status"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* IN-APP CONFIRMATION MODAL: CLEAR ALL APPLICATIONS             */}
        {/* ============================================================== */}
        {confirmClearAllOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#111218] border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Permanently Clear All Data?</h3>
                  <p className="text-xs text-red-400">Irreversible Action</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed bg-[#0a0a0f] p-3 rounded-xl border border-gray-800">
                This will permanently delete all <strong className="text-white font-bold">{applications.length} candidate applications</strong>, reviewer scores, and officer notes from the recruitment database.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  disabled={deletingActive}
                  onClick={() => setConfirmClearAllOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingActive}
                  onClick={executeClearAllApplications}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-lg transition-all hover:scale-105 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingActive ? "Clearing Data..." : "Yes, Clear All Data"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* IN-APP CONFIRMATION MODAL: DELETE SINGLE APPLICATION          */}
        {/* ============================================================== */}
        {appToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#111218] border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center space-x-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Delete Candidate Application?</h3>
                  <p className="text-xs text-yellow-400 font-mono">{appToDelete.id}</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed bg-[#0a0a0f] p-3 rounded-xl border border-gray-800">
                Are you sure you want to permanently delete the application for <strong className="text-white font-semibold">{appToDelete.name}</strong>? All their submitted responses, scores, and scheduled interview slots will be deleted.
              </p>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  disabled={deletingActive}
                  onClick={() => setAppToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-gray-700 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deletingActive}
                  onClick={executeDeleteSingleApplication}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-lg transition-all hover:scale-105 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingActive ? "Deleting..." : "Permanently Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ACTION FEEDBACK TOAST                                          */}
        {/* ============================================================== */}
        {actionFeedback && (
          <div
            className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl border shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom ${
              actionFeedback.type === "success"
                ? "bg-emerald-950/95 border-emerald-500/40 text-emerald-200"
                : "bg-red-950/95 border-red-500/40 text-red-200"
            }`}
          >
            {actionFeedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div className="text-xs font-medium leading-relaxed">{actionFeedback.message}</div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-gray-400 hover:text-white shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
