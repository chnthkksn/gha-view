import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const client = new MongoClient(process.env.MONGODB_URI);
export const db = client.db("gh-action-web");

export const auth = betterAuth({
  database: mongodbAdapter(db),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      scope: ["repo", "workflow", "read:org", "read:user", "user:email"],
    },
  },
  plugins: [twoFactor(), passkey()],
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000",
  ],
});

export type Session = typeof auth.$Infer.Session;
