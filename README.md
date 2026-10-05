# TURTLE Robotics Application Portal - Texas A&M University

A modern, full-stack member recruitment and application evaluation portal for **TURTLE Robotics** (**T**exas A&M **U**niversity **R**obotics **T**eam and **L**eadership **E**xperience).

Built with **Next.js 14 (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, and a persistent JSON datastore.

---

## 🌟 Key Features

### 1. 🤖 Apply to 1–5 Projects from turtlerobotics.org/projects (`/apply`)
- Integrated with all **24 official TURTLE Robotics projects** sourced directly from [turtlerobotics.org/projects](https://www.turtlerobotics.org/projects):
  - **DIRT** (Diagnostic Inspection Robot for Terrain)
  - **ACHE** (Artificial Cardiovascular and Hemodynamics Experiment)
  - **AMPS** (Adaptive Magnetic Power System)
  - **ANKL** (6-DOF Prosthetic Ankle)
  - **BEEST** (Electromechanical Strandbeest)
  - **BLNC** (Self-Balancing Rovers for Extreme Terrain)
  - **CMBT** (Combat Robotics - 3lb & 1lb)
  - **CNTR** (VR-Controlled Modular Humanoid)
  - **DRON** (Disaster Response Observation Network)
  - **EDEN** (AI-Enabled Humanoid Research)
  - **FASH** (Fashionable Automated Stage Hardware)
  - **GERM** (Self-Regulating Aeroponics Box)
  - **LARM** (Lab Assisting Robotic Manipulator)
  - **MAZE** (Autonomous Lidar Maze Robot)
  - **OLSN** (Custom Pediatric Prosthetic Hand)
  - **ORIO** (3D-Printed Equatorial Mount)
  - **POBS** (Positive Operative Buoyancy Submersible)
  - **PRNT** (4-Axis Non-Planar 3D Printer)
  - **SHDR** (Stroke Rehabilitation Assistive Exoskeleton)
  - **QUAD** (Quadruped Walking Robot)
  - **SNOUT** (Olfactory Sensing Robot)
  - **SWRM** (Swarm Robotics for Collective Behavior)
  - **VEST** (Noninvasive Canine Health Monitoring Vest)
  - **VIRT** (Vision-Integrated Robotic Turret)
- **Ranked Preference System**: Applicants select between 1 and 5 projects and order their preferences (`Choice #1` top preference, `Choice #2`, up to `Choice #5`) with one-click reordering arrows.
- **Dynamic Project Questions**: When applicants choose their projects, the application form dynamically loads and presents the custom questions configured specifically for each of their chosen projects.

### 2. ⚙️ Project Questions Manager in Officer Portal (`/admin`)
- Accessible under the **"Project Questions Manager"** tab in the Executive Portal.
- Officers and project leads can configure questions for any project **before or during the recruitment cycle**:
  - Add new custom questions to any project.
  - Edit question prompts, help descriptions, and input types (multi-line textarea vs single-line text).
  - Toggle "Required" status.
  - Delete or reorder questions.
  - Instant live saving (`PATCH /api/projects/[id]`) that updates `data/projects.json` and immediately reflects on the applicant form.

### 3. 🛡️ Candidate Evaluation Pipeline (`/admin`)
- **Executive Metrics**: Total applicants, pending reviews, scheduled interviews, and accepted candidates.
- **Filtering & Search**:
  - Filter by Project (e.g. view only applicants who applied to `CMBT` or `DIRT`).
  - Filter by Subteam / Track.
  - Filter by Status pipeline.
  - Search by candidate name, email, UIN, major, or project name.
- **Candidate Dossier Modal**:
  - Displays all 1–5 applied projects in ranked order.
  - Displays the candidate's exact responses to each project's custom questions.
  - **Interactive 1–5 Scoring Rubric**: Technical Capability, Passion & Curiosity, Teamwork & Culture Fit.
  - **Status Pipeline Switcher**: `SUBMITTED`, `UNDER_REVIEW`, `INTERVIEW_INVITED`, `ACCEPTED`, `WAITLISTED`, `REJECTED`.
  - **Interview Scheduling**: Input interview date, time, and room.
  - **Internal Officer Notes Log**: Post dated notes tagged by officer role.
- **One-Click CSV Export**: Download the complete candidate roster for executive meetings.

### 4. 🔒 Authenticated Private Status Tracker (`/status`)
- **Strict Privacy Enforcement**: Candidates must sign in with their `@tamu.edu` Google account to view their application status.
- **Self-Only Access**: Arbitrary public searching by other emails or UINs is eliminated. Logged-in applicants can only view their own submission, evaluation stage, and interview details.
- **Auto-Loading**: Seamlessly retrieves and displays the candidate's active dossier, 1–5 ranked choices, current stage badge, and scheduled interview time/room upon sign-in.

### 5. 🔑 Applicant Authentication & Application Gating (`/apply` & `/login`)
- **Mandatory Login to Apply**: Candidates must authenticate with their official Texas A&M account before accessing and submitting the application form.
- **Tamper-Proof Email Verification**: The application form automatically locks the email field to the authenticated `@tamu.edu` session, preventing candidate impersonation.
- **Duplicate Prevention**: Prevents students from submitting multiple simultaneous applications while keeping their existing submission accessible.
- **Exclusive Google SSO Authentication**: Candidates sign in exclusively using their official Texas A&M Google account (`@tamu.edu`). Non-TAMU domains and arbitrary logins are strictly barred.

---

## ⚙️ Google OAuth 2.0 Setup

To enable Google Workspace OAuth sign-in:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a new OAuth 2.0 Client ID (Web Application).
3. Set **Authorized JavaScript origins**: `http://localhost:3000` (or your production domain).
4. Set **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google` (or `https://your-domain.com/api/auth/callback/google`).
5. Copy your **Client ID** and **Client Secret** into `.env.local`:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=turtle-robotics-texas-am-secret-key-2026
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm

### Development Server
```bash
npm.cmd run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building & Running Production Server
```bash
npm.cmd run build
npm.cmd start
```

---

## 📁 Project Architecture

```
├── data/
│   ├── projects.json          # 24 TURTLE projects with customizable questions
│   └── applications.json      # Persistent candidate applications datastore
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   │   ├── route.ts           # GET all projects
│   │   │   │   └── [id]/route.ts      # GET single, PATCH project questions
│   │   │   └── applications/
│   │   │       ├── route.ts           # GET applications, POST new submission (1-5 projects)
│   │   │       ├── [id]/route.ts      # GET single, PATCH evaluation/status/notes
│   │   │       └── status/route.ts    # POST status lookup by Email/UIN/ID
│   │   ├── admin/
│   │   │   └── page.tsx               # Officer review dashboard + Project Questions Manager
│   │   ├── apply/
│   │   │   └── page.tsx               # 4-step form with 1-5 project picker & dynamic questions
│   │   ├── status/
│   │   │   └── page.tsx               # Applicant real-time status tracker
│   │   ├── globals.css                # Texas A&M Maroon styling & grid layout
│   │   ├── layout.tsx                 # Root layout with Navbar and Footer
│   │   └── page.tsx                   # Homepage showcasing subteams & timeline
│   ├── components/
│   │   ├── Navbar.tsx                 # Responsive navigation bar
│   │   └── Footer.tsx                 # Portal footer with TAMU contacts
│   ├── lib/
│   │   └── storage.ts                 # Filesystem database operations
│   └── types/
│       └── index.ts                   # TypeScript interfaces (TurtleProject, ProjectQuestion, etc.)
```

---

## 🏫 About TURTLE Robotics at Texas A&M
- **Organization**: Texas A&M University Robotics Team and Leadership Experience
- **Lab Location**: 023 Haynes Engineering Building, College Station, TX 77843
- **Contact**: `turtlerobotics@gmail.com`
- **Official Website**: [turtlerobotics.org](https://turtlerobotics.org)
- **Projects Page**: [turtlerobotics.org/projects](https://www.turtlerobotics.org/projects)
