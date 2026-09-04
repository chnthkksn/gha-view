"use client";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Key, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PasskeyLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await signIn.passkey();

      if (error) {
        console.error(error);
        toast.error("Failed to sign in with passkey");
        return;
      }

      // Successful login will redirect automatically or we can force it
      if (data) {
        router.push("/dashboard");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2 border-white/[0.14] hover:bg-white/[0.06] text-foreground font-semibold text-[13px] h-auto py-3"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Key className="h-4 w-4" />
      )}
      Sign in with passkey
    </Button>
  );
}
