import { NextResponse } from "next/server";
import { getProjectById, updateProjectQuestions, updateProject } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = getProjectById(params.id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, project });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { questions, description, fullName } = body;

    const existing = getProjectById(params.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (Array.isArray(questions)) {
      updates.questions = questions;
    }
    if (description !== undefined) {
      updates.description = description;
    }
    if (fullName !== undefined) {
      updates.fullName = fullName;
    }

    const updated = updateProject(params.id, updates);
    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("PATCH project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 }
    );
  }
}
