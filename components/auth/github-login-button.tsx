"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { useState } from "react";

export function GitHubLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[13px] h-auto py-3"
    >
      <Github className="h-4 w-4" />
      {isLoading ? "Connecting..." : "Continue with GitHub"}
    </Button>
  );
}
