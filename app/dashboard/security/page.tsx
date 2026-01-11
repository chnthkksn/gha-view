"use client";

import {
  useSession,
  listSessions,
  revokeSession,
  passkey,
  deleteUser,
} from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Github,
  Key,
  Smartphone,
  Laptop,
  LogOut,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/components/dashboard/confirmation-dialog";
import { AddPasskeyDialog } from "@/components/dashboard/add-passkey-dialog";
import { toast } from "sonner";
import { UAParser } from "ua-parser-js";

interface SessionData {
  id: string;
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}

interface PasskeyData {
  id: string;
  name?: string | null;
  createdAt: Date;
}

export default function SecurityPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [passkeys, setPasskeys] = useState<PasskeyData[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(false);
  const [isAddPasskeyOpen, setIsAddPasskeyOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchPasskeys();
  }, []);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const { data } = await listSessions();
      setSessions((data as unknown as SessionData[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchPasskeys = async () => {
    setIsLoadingPasskeys(true);
    try {
      const { data } = await passkey.listUserPasskeys();
      setPasskeys((data as unknown as PasskeyData[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPasskeys(false);
    }
  };

  const handleRevokeSession = async (token: string) => {
    await revokeSession({ token });
    fetchSessions();
    toast.success("Session revoked");
  };

  const handleCreatePasskey = async (name: string) => {
    try {
      const res = await passkey.addPasskey({
        name,
      });
      if (res?.error) {
        throw new Error(res.error.message);
      }
      await fetchPasskeys();
      toast.success("Passkey added successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to add passkey");
    }
  };

  const handleDeletePasskey = async (id: string) => {
    try {
      await passkey.deletePasskey({ id });
      await fetchPasskeys();
      toast.success("Passkey deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete passkey");
    }
  };
  const getDeviceIcon = (uaString: string) => {
    const parser = new UAParser(uaString);
    const device = parser.getDevice();

    if (device.type === "mobile") return <Smartphone className="h-5 w-5" />;
    if (device.type === "tablet") return <Smartphone className="h-5 w-5" />; // Tablet icon vs smartphone
    return <Laptop className="h-5 w-5" />;
  };

  const getSessionInfo = (uaString: string) => {
    const parser = new UAParser(uaString);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    const browserName = browser.name || "Unknown Browser";
    const osName = os.name || "Unknown OS";

    return {
      title: `${browserName} on ${osName}`,
      subtitle: device.model
        ? `${device.vendor || ""} ${device.model}`
        : "Desktop",
    };
  };

  if (!session?.user) return null;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 pb-20 md:pb-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard")}
        className="gap-2 -ml-2 mb-2 sm:mb-4 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Security
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your account security, sessions, and authentication methods.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Connected Accounts & Passkeys */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <CardTitle>Authentication</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <Github className="h-5 w-5" />
                  <div>
                    <div className="font-medium">GitHub</div>
                    <div className="text-xs text-muted-foreground">
                      Connected
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-green-200 text-green-700 bg-green-50"
                >
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-orange-600" />
                <CardTitle>Passkeys</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingPasskeys ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {passkeys.map((pk) => (
                    <div
                      key={pk.id}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Key className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                        <div className="font-medium text-sm truncate">
                          {pk.name || "WebAuthn Key"}
                        </div>
                      </div>
                      <ConfirmationDialog
                        trigger={
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-red-500 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        title="Delete Passkey?"
                        description="You will no longer be able to sign in with this passkey."
                        confirmLabel="Delete"
                        variant="destructive"
                        onConfirm={() => handleDeletePasskey(pk.id)}
                      />
                    </div>
                  ))}
                  {passkeys.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No passkeys added.
                    </p>
                  )}
                </>
              )}
              <Button
                onClick={() => setIsAddPasskeyOpen(true)}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Passkey
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Laptop className="h-5 w-5 text-purple-600" />
              <CardTitle>Active Sessions</CardTitle>
            </div>
            <CardDescription>
              Manage devices where you are currently logged in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingSessions ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                sessions.map((s) => {
                  const info = getSessionInfo(s.userAgent || "");
                  return (
                    <div
                      key={s.id}
                      className="flex flex-col gap-3 p-3 sm:p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 bg-muted rounded-full shrink-0">
                          {getDeviceIcon(s.userAgent || "")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm sm:text-base font-medium">
                              {info.title}
                            </span>
                            {s.id === session.session.id && (
                              <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Globe className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {s.ipAddress || "Unknown IP"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="hidden sm:inline">
                                {info.subtitle}
                              </span>
                              {info.subtitle && (
                                <span className="hidden sm:inline">•</span>
                              )}
                              <span>
                                Expires:{" "}
                                {new Date(s.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {s.id !== session.session.id && (
                        <ConfirmationDialog
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 w-full sm:w-auto justify-center"
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Revoke Session
                            </Button>
                          }
                          title="Revoke Session?"
                          description="The selected device will be logged out immediately."
                          confirmLabel="Revoke"
                          variant="destructive"
                          onConfirm={() => handleRevokeSession(s.token)}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              <CardTitle className="text-base sm:text-lg">
                Danger Zone
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 gap-3 sm:gap-4">
              <div className="space-y-1">
                <div className="font-medium text-sm sm:text-base text-red-900 dark:text-red-200">
                  Delete Account
                </div>
                <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">
                  Permanently remove your account and all data.
                </div>
              </div>
              <ConfirmationDialog
                trigger={
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Delete Account
                  </Button>
                }
                title="Delete Your Account?"
                description="This action is permanent and cannot be undone. All your data will be wiped immediately."
                confirmLabel="Delete Account"
                variant="destructive"
                onConfirm={async () => {
                  await deleteUser();
                  router.push("/");
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <AddPasskeyDialog
        open={isAddPasskeyOpen}
        onOpenChange={setIsAddPasskeyOpen}
        onAdd={handleCreatePasskey}
      />
    </div>
  );
}
