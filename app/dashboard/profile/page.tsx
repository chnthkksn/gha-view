"use client";

import { useSession, updateUser } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { data: session, refetch } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  const initials = (user.name || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const image = formData.get("image") as string;

    try {
      await updateUser({
        name,
        image,
      });
      await refetch();
      setMessage({ type: "success", text: "profile updated successfully" });
      setIsEditing(false);
      router.refresh();
    } catch {
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[760px] mx-auto px-5 py-7 pb-20 md:pb-14">
      <button
        onClick={() => router.push("/dashboard")}
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs mb-5 cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        back to dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight mb-1">
            profile
          </h1>
          <p className="text-muted-foreground/70 text-xs">
            manage your account settings and preferences
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className={cn(
            "text-xs font-semibold h-auto py-2 px-3.5",
            !isEditing && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {isEditing ? "cancel" : "edit profile"}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <div className="text-[13px] font-semibold">Personal information</div>
          <div className="text-muted-foreground/70 text-[11.5px] mt-0.5">
            {isEditing ? "editing mode" : "your public profile details from GitHub"}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-[11px] text-muted-foreground uppercase tracking-wider"
              >
                display name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name || ""}
                placeholder="Your Display Name"
                required
                className="bg-background border-white/[0.12] text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="image"
                className="text-[11px] text-muted-foreground uppercase tracking-wider"
              >
                avatar url
              </Label>
              <Input
                id="image"
                name="image"
                defaultValue={user.image || ""}
                placeholder="https://github.com/..."
                className="bg-background border-white/[0.12] text-[13px]"
              />
            </div>

            {message && (
              <div
                className={cn(
                  "p-2.5 rounded-md text-xs",
                  message.type === "success"
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {message.text}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                className="text-xs font-medium h-auto py-2 px-4 border-white/[0.14]"
              >
                cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="text-xs font-bold h-auto py-2 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                save changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-5">
            {message && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary rounded-md px-3 py-2 text-xs mb-4.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                {message.text}
              </div>
            )}
            <div className="flex items-center gap-4 mb-5">
              <Avatar className="h-16 w-16 border border-white/[0.12]">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-[#1B1F26] text-muted-foreground text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-bold">{user.name}</div>
                <div className="text-muted-foreground text-[13px]">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="grid gap-2.5">
              <div className="bg-[#0F1216] border border-white/[0.06] rounded-lg px-3.5 py-3">
                <div className="text-muted-foreground/70 text-[10px] uppercase tracking-wider mb-1">
                  display name
                </div>
                <div className="text-[13px] font-medium">{user.name}</div>
              </div>
              <div className="bg-[#0F1216] border border-white/[0.06] rounded-lg px-3.5 py-3">
                <div className="text-muted-foreground/70 text-[10px] uppercase tracking-wider mb-1">
                  email address
                </div>
                <div className="text-[13px] font-medium break-all">
                  {user.email}
                </div>
              </div>
              <div className="bg-[#0F1216] border border-white/[0.06] rounded-lg px-3.5 py-3">
                <div className="text-muted-foreground/70 text-[10px] uppercase tracking-wider mb-1">
                  member since
                </div>
                <div className="text-[13px] font-medium">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
