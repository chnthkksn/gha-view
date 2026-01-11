"use client";

import { useSession, updateUser } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Calendar, Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 pb-20 md:pb-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard")}
        className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Profile
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "ghost" : "default"}
          className="w-full sm:w-auto"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your public profile details{" "}
              {isEditing ? "(Editing Mode)" : "from GitHub"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name || ""}
                    placeholder="Your Display Name"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This is how you will appear in the dashboard.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Avatar URL</Label>
                  <Input
                    id="image"
                    name="image"
                    defaultValue={user.image || ""}
                    placeholder="https://github.com/..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Link to your profile picture (defaults to GitHub avatar).
                  </p>
                </div>

                {message && (
                  <div
                    className={`p-3 rounded-md text-sm ${
                      message.type === "success"
                        ? "bg-green-50 text-green-600 dark:bg-green-900/20"
                        : "bg-red-50 text-red-600 dark:bg-red-900/20"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {message && (
                  <div className="p-3 mb-4 rounded-md text-sm bg-green-50 text-green-600 dark:bg-green-900/20 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    {message.text}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="text-xl sm:text-2xl">
                      {user.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold">
                      {user.name}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 text-muted-foreground mb-1.5">
                      <User className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Display Name
                      </span>
                    </div>
                    <div className="font-medium text-sm sm:text-base">
                      {user.name}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 text-muted-foreground mb-1.5">
                      <Mail className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Email Address
                      </span>
                    </div>
                    <div className="font-medium text-sm sm:text-base break-all">
                      {user.email}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-3 text-muted-foreground mb-1.5">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        Member Since
                      </span>
                    </div>
                    <div className="font-medium text-sm sm:text-base">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
