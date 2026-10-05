export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INTERVIEW_INVITED"
  | "ACCEPTED"
  | "WAITLISTED"
  | "REJECTED";

export type ProgramTrack =
  | "Hatchling Development"
  | "Software & Autonomy"
  | "Mechanical Design"
  | "Electrical & Firmware"
  | "Business & Operations";

export interface ReviewScore {
  technical: number;
  passion: number;
  teamwork: number;
  overall: number;
}

export interface InternalNote {
  id: string;
  author: string;
  note: string;
  timestamp: string;
}

export interface ProjectQuestion {
  id: string;
  question: string;
  description?: string;
  required: boolean;
  type: "text" | "textarea";
}

export interface TurtleProject {
  id: string;
  name: string; // e.g. "DIRT", "AMPS", "DRON"
  fullName: string; // e.g. "Diagnostic Inspection Robot for Terrain"
  description: string;
  category?: string;
  questions: ProjectQuestion[];
}

export interface ProjectAnswer {
  questionId: string;
  questionText: string;
  answer: string;
}

export interface AppliedProject {
  projectId: string;
  projectName: string;
  projectFullName: string;
  rank: number; // 1 to 5
  answers: ProjectAnswer[];
}

export interface Application {
  id: string;
  fullName: string;
  tamuEmail: string;
  uin: string;
  major: string;
  classification: "Freshman" | "Sophomore" | "Junior" | "Senior" | "Graduate";
  graduationTerm: string;
  gpa?: string;
  primaryTrack: ProgramTrack;
  secondaryTrack: ProgramTrack | "None";
  appliedProjects?: AppliedProject[]; // 1 to 5 projects
  skills: string[];
  experience: string;
  whyTurtle: string;
  timeCommitment: string;
  resumeUrl: string;
  githubOrPortfolio?: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewScore?: ReviewScore;
  internalNotes: InternalNote[];
  interviewSlot?: string;
}
