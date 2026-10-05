import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAllApplications,
  saveApplication,
  clearAllApplications,
  findApplicationByEmail,
} from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const project = searchParams.get("project");

    let apps = getAllApplications();

    if (track && track !== "ALL") {
      apps = apps.filter((a) => a.primaryTrack === track || a.secondaryTrack === track);
    }

    if (project && project !== "ALL") {
      apps = apps.filter((a) =>
        a.appliedProjects?.some((p) => p.projectId === project || p.projectName === project)
      );
    }

    if (status && status !== "ALL") {
      apps = apps.filter((a) => a.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.fullName.toLowerCase().includes(q) ||
          a.tamuEmail.toLowerCase().includes(q) ||
          a.uin.includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.major.toLowerCase().includes(q) ||
          a.appliedProjects?.some(
            (p) =>
              p.projectName.toLowerCase().includes(q) ||
              p.projectFullName.toLowerCase().includes(q)
          )
      );
    }

    return NextResponse.json({ success: true, applications: apps });
  } catch (error) {
    console.error("GET applications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Enforce authentication: applicant must be signed in with TAMU Google account
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required: Please sign in with your TAMU Google account (@tamu.edu) to submit an application.",
        },
        { status: 401 }
      );
    }

    const sessionEmail = session.user.email.toLowerCase().trim();
    if (!sessionEmail.endsWith("@tamu.edu")) {
      return NextResponse.json(
        {
          success: false,
          error: "Access restricted: Only official @tamu.edu email accounts are eligible to submit an application.",
        },
        { status: 403 }
      );
    }

    // 2. Check if this student already submitted an application
    const existing = findApplicationByEmail(sessionEmail);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `An application (${existing.id}) has already been submitted under ${sessionEmail}. You can view your current review status on the Application Status page.`,
          existingAppId: existing.id,
        },
        { status: 409 }
      );
    }

    const body = await request.json();
    // Enforce authenticated email on the submitted application
    body.tamuEmail = sessionEmail;

    // Required fields check
    const required = [
      "fullName",
      "tamuEmail",
      "uin",
      "major",
      "classification",
      "graduationTerm",
      "primaryTrack",
      "experience",
      "whyTurtle",
      "timeCommitment",
      "resumeUrl",
    ];

    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate 1 to 5 projects
    const appliedProjects = body.appliedProjects;
    if (!Array.isArray(appliedProjects) || appliedProjects.length < 1 || appliedProjects.length > 5) {
      return NextResponse.json(
        { success: false, error: "Please select between 1 and 5 projects to apply to." },
        { status: 400 }
      );
    }

    // Validate TAMU email
    const email = body.tamuEmail.trim().toLowerCase();
    if (!email.endsWith("@tamu.edu")) {
      return NextResponse.json(
        { success: false, error: "Must use a valid Texas A&M email address (@tamu.edu)" },
        { status: 400 }
      );
    }

    // Validate 9 digit UIN
    const uin = body.uin.trim();
    if (!/^\d{9}$/.test(uin)) {
      return NextResponse.json(
        { success: false, error: "UIN must be a 9-digit Texas A&M student ID number" },
        { status: 400 }
      );
    }

    const created = saveApplication({
      fullName: body.fullName.trim(),
      tamuEmail: email,
      uin: uin,
      major: body.major.trim(),
      classification: body.classification,
      graduationTerm: body.graduationTerm.trim(),
      gpa: body.gpa ? body.gpa.trim() : undefined,
      primaryTrack: body.primaryTrack,
      secondaryTrack: body.secondaryTrack || "None",
      appliedProjects: appliedProjects,
      skills: Array.isArray(body.skills) ? body.skills : [],
      experience: body.experience.trim(),
      whyTurtle: body.whyTurtle.trim(),
      timeCommitment: body.timeCommitment,
      resumeUrl: body.resumeUrl.trim(),
      githubOrPortfolio: body.githubOrPortfolio ? body.githubOrPortfolio.trim() : undefined,
    });

    return NextResponse.json({ success: true, application: created }, { status: 201 });
  } catch (error) {
    console.error("POST application error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearAllApplications();
    return NextResponse.json(
      { success: true, message: "All applicant data cleared successfully" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (error) {
    console.error("DELETE applications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear applications" },
      { status: 500 }
    );
  }
}
