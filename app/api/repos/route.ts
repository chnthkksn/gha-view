import { NextResponse } from "next/server";
import { auth, db } from "@/lib/auth";
import { createGitHubClient } from "@/lib/github";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query the database directly to get the GitHub account with access token
    // We try both string and ObjectId to be safe, but based on the record it is an ObjectId
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

    const github = createGitHubClient(account.accessToken as string);
    const repos = await github.getRepositoriesWithActions();

    return NextResponse.json({ repositories: repos });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch repositories",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
