import { NextResponse } from "next/server";
import { getAllProjects } from "@/lib/storage";

export async function GET() {
  try {
    const projects = getAllProjects();
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve projects" },
      { status: 500 }
    );
  }
}
