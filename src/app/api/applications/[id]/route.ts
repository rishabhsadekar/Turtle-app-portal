import { NextResponse } from "next/server";
import { getApplicationById, updateApplication, addInternalNote, deleteApplication } from "@/lib/storage";
import { Application } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params.id;
    const decodedId = decodeURIComponent(rawId);
    const app = getApplicationById(decodedId) || getApplicationById(rawId);
    if (!app) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, application: app },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params.id;
    const decodedId = decodeURIComponent(rawId);
    const body = await request.json();
    const { status, reviewScore, newNote, interviewSlot } = body;

    let updated: Application | null = getApplicationById(decodedId) || getApplicationById(rawId) || null;
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    const targetId = updated.id;

    if (newNote && newNote.note) {
      updated = addInternalNote(targetId, newNote.author || "Officer", newNote.note);
    }

    const fieldsToUpdate: any = {};
    if (status) fieldsToUpdate.status = status;
    if (reviewScore) fieldsToUpdate.reviewScore = reviewScore;
    if (interviewSlot !== undefined) fieldsToUpdate.interviewSlot = interviewSlot;

    if (Object.keys(fieldsToUpdate).length > 0) {
      updated = updateApplication(targetId, fieldsToUpdate);
    }

    return NextResponse.json(
      { success: true, application: updated },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (error) {
    console.error("PATCH application error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params.id;
    const decodedId = decodeURIComponent(rawId);
    const success = deleteApplication(decodedId) || deleteApplication(rawId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Application not found or already deleted" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: `Application ${decodedId} deleted successfully` },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (error) {
    console.error("DELETE application error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
