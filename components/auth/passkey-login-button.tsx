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
      className="w-full gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-white"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Key className="mr-2 h-4 w-4" />
      )}
      Sign in with Passkey
    </Button>
  );
}
