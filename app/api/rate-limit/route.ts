import { NextResponse } from "next/server";
import { auth, db } from "@/lib/auth";
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

    // Get GitHub access token
    const account = await db.collection("account").findOne({
      userId: new ObjectId(session.user.id),
      providerId: "github",
    });

    if (!account || !account.accessToken) {
      return NextResponse.json(
        { error: "No GitHub access token found" },
        { status: 401 }
      );
    }

    // Check rate limit
    const response = await fetch("https://api.github.com/rate_limit", {
      headers: {
        Authorization: `Bearer ${account.accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const rateLimit = await response.json();

    return NextResponse.json(rateLimit);
  } catch (error) {
    console.error("Error checking rate limit:", error);
    return NextResponse.json(
      { error: "Failed to check rate limit" },
      { status: 500 }
    );
  }
}
