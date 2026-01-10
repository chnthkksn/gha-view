import { NextResponse } from "next/server";
import { auth, db } from "@/lib/auth";
import { createGitHubClient } from "@/lib/github";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database directly to get the GitHub account with access token
    const account = await db.collection("account").findOne({
      userId: new ObjectId(session.user.id),
      providerId: "github",
    });

    if (!account || !account.accessToken) {
      return NextResponse.json(
        {
          error:
            "No GitHub access token found. Please sign out and sign in again.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as
      | "queued"
      | "in_progress"
      | "completed"
      | null;
    const limit = searchParams.get("limit");

    const github = createGitHubClient(account.accessToken as string);

    const runs = await github.getAllWorkflowRuns({
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({ workflow_runs: runs });
  } catch (error) {
    console.error("Error fetching workflow runs:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch workflow runs",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
