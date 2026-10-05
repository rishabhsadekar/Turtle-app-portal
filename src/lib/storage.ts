import fs from "fs";
import path from "path";
import { Application, InternalNote, TurtleProject, ProjectQuestion, AppliedProject } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "applications.json");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

const SEED_APPLICATIONS: Application[] = [];

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export function clearAllApplications(): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
}

// ----------------- Projects API Storage -----------------
export function getAllProjects(): TurtleProject[] {
  try {
    if (!fs.existsSync(PROJECTS_FILE)) {
      return [];
    }
    let raw = fs.readFileSync(PROJECTS_FILE, "utf-8");
    raw = raw.replace(/^\uFEFF/, "").trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading projects:", error);
    return [];
  }
}

export function getProjectById(id: string): TurtleProject | undefined {
  const projects = getAllProjects();
  return projects.find((p) => p.id.toLowerCase() === id.toLowerCase());
}

export function updateProject(id: string, updates: Partial<TurtleProject>): TurtleProject | null {
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
  };

  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
  return projects[index];
}

export function updateProjectQuestions(id: string, questions: ProjectQuestion[]): TurtleProject | null {
  return updateProject(id, { questions });
}

// ----------------- Applications Storage -----------------
export function getAllApplications(): Application[] {
  ensureDataFile();
  try {
    let raw = fs.readFileSync(DATA_FILE, "utf-8");
    raw = raw.replace(/^\uFEFF/, "").trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading applications:", error);
    return SEED_APPLICATIONS;
  }
}

export function getApplicationById(id: string): Application | undefined {
  const apps = getAllApplications();
  return apps.find((a) => a.id.toLowerCase() === id.toLowerCase());
}

export function findApplicationByQuery(emailOrUin: string): Application | undefined {
  const apps = getAllApplications();
  const clean = emailOrUin.trim().toLowerCase();
  return apps.find(
    (a) =>
      a.tamuEmail.toLowerCase() === clean ||
      a.uin.trim() === clean ||
      a.id.toLowerCase() === clean
  );
}

export function findApplicationByEmail(email: string): Application | undefined {
  const apps = getAllApplications();
  const clean = email.trim().toLowerCase();
  return apps.find((a) => a.tamuEmail.toLowerCase() === clean);
}

export function saveApplication(
  newApp: Omit<Application, "id" | "status" | "submittedAt" | "internalNotes">
): Application {
  const apps = getAllApplications();
  const nextNum = apps.length + 1;
  const padNum = String(nextNum).padStart(3, "0");
  const fullApp: Application = {
    ...newApp,
    id: `TURTLE-2026-${padNum}`,
    status: "SUBMITTED",
    submittedAt: new Date().toISOString(),
    internalNotes: [],
  };

  apps.unshift(fullApp);
  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), "utf-8");
  return fullApp;
}

export function updateApplication(id: string, updates: Partial<Application>): Application | null {
  const apps = getAllApplications();
  const index = apps.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  apps[index] = {
    ...apps[index],
    ...updates,
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), "utf-8");
  return apps[index];
}

export function addInternalNote(id: string, author: string, note: string): Application | null {
  const apps = getAllApplications();
  const index = apps.findIndex((a) => a.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;

  const newNote: InternalNote = {
    id: `note-${Date.now()}`,
    author: author || "Officer",
    note,
    timestamp: new Date().toISOString(),
  };

  apps[index].internalNotes = [...(apps[index].internalNotes || []), newNote];
  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), "utf-8");
  return apps[index];
}

export function deleteApplication(id: string): boolean {
  ensureDataFile();
  const apps = getAllApplications();
  const cleanId = (id || "").trim().toLowerCase();
  if (!cleanId) return false;

  const index = apps.findIndex(
    (a) =>
      (a.id && a.id.trim().toLowerCase() === cleanId) ||
      (a.tamuEmail && a.tamuEmail.trim().toLowerCase() === cleanId)
  );

  if (index === -1) return false;

  apps.splice(index, 1);
  fs.writeFileSync(DATA_FILE, JSON.stringify(apps, null, 2), "utf-8");
  return true;
}

