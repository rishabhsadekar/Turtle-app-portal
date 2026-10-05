import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { findApplicationByEmail } from "@/lib/storage";

export async function GET() {
  return handleStatusCheck();
}

export async function POST() {
  return handleStatusCheck();
}

async function handleStatusCheck() {
  try {
    // 1. Strictly verify authenticated session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required: Please sign in with your TAMU Google account to view your application status.",
          unauthenticated: true,
        },
        { status: 401 }
      );
    }

    const sessionEmail = session.user.email.toLowerCase().trim();

    // 2. Only allow viewing the authenticated user's own application
    const app = findApplicationByEmail(sessionEmail);
    if (!app) {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          error: `No application found for ${sessionEmail}. Have you submitted an application yet?`,
        },
        { status: 404 }
      );
    }

    // 3. Return applicant-safe view (omits internal officer notes and reviewer score)
    const publicApp = {
      id: app.id,
      fullName: app.fullName,
      tamuEmail: app.tamuEmail,
      primaryTrack: app.primaryTrack,
      secondaryTrack: app.secondaryTrack,
      status: app.status,
      submittedAt: app.submittedAt,
      interviewSlot: app.interviewSlot,
      classification: app.classification,
      major: app.major,
      appliedProjects: app.appliedProjects || [],
    };

    return NextResponse.json({
      success: true,
      application: publicApp,
      currentUserEmail: sessionEmail,
    });
  } catch (error) {
    console.error("Status lookup error:", error);
    return NextResponse.json(
      { success: false, error: "Error retrieving application status" },
      { status: 500 }
    );
  }
}
