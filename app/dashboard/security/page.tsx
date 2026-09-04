"use client";

import {
  useSession,
  listSessions,
  revokeSession,
  passkey,
  deleteUser,
} from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Github,
  Key,
  Laptop,
  Smartphone,
  LogOut,
  Trash2,
  Plus,
  Loader2,
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

function getSessionTitle(uaString: string) {
  const parser = new UAParser(uaString);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  return `${browser.name || "Unknown Browser"} on ${os.name || "Unknown OS"}`;
}

function getDeviceIcon(uaString: string) {
  const device = new UAParser(uaString).getDevice();
  if (device.type === "mobile" || device.type === "tablet") {
    return <Smartphone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  }
  return <Laptop className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
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

  if (!session?.user) return null;

  return (
    <div className="max-w-[800px] mx-auto px-5 py-7 pb-20 md:pb-14">
      <button
        onClick={() => router.push("/dashboard")}
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs mb-5 cursor-pointer transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        back to dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight mb-1">
          security
        </h1>
        <p className="text-muted-foreground/70 text-xs">
          manage your account security, sessions, and authentication methods
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
        {/* Authentication */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[13px] font-semibold mb-3">authentication</div>
          <div className="flex items-center justify-between bg-[#0F1216] border border-white/[0.06] rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-[22px] h-[22px] rounded-[5px] bg-[#1B1F26] flex items-center justify-center shrink-0">
                <Github className="h-3 w-3" />
              </div>
              <div>
                <div className="text-[12.5px] font-semibold">GitHub</div>
                <div className="text-[10.5px] text-muted-foreground/70">
                  connected
                </div>
              </div>
            </div>
            <span className="text-[10px] text-primary border border-primary/30 rounded px-1.5 py-0.5">
              verified
            </span>
          </div>
        </div>

        {/* Passkeys */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[13px] font-semibold mb-3">passkeys</div>
          <div className="flex flex-col gap-2 mb-2.5">
            {isLoadingPasskeys ? (
              <div className="flex justify-center py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : passkeys.length === 0 ? (
              <div className="text-muted-foreground/70 text-[11.5px]">
                no passkeys added
              </div>
            ) : (
              passkeys.map((pk) => (
                <div
                  key={pk.id}
                  className="flex items-center gap-2 bg-[#0F1216] border border-white/[0.06] rounded-lg px-3 py-2.5"
                >
                  <Key className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-xs flex-1 truncate">
                    {pk.name || "WebAuthn Key"}
                  </span>
                  <ConfirmationDialog
                    trigger={
                      <button className="text-destructive text-xs cursor-pointer shrink-0">
                        delete
                      </button>
                    }
                    title="Delete Passkey?"
                    description="You will no longer be able to sign in with this passkey."
                    confirmLabel="Delete"
                    variant="destructive"
                    onConfirm={() => handleDeletePasskey(pk.id)}
                  />
                </div>
              ))
            )}
          </div>
          <Button
            onClick={() => setIsAddPasskeyOpen(true)}
            variant="outline"
            className="w-full text-xs font-medium h-auto py-2 border-white/[0.14] gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            add new passkey
          </Button>
        </div>
      </div>

      {/* Active sessions */}
      <div className="bg-card border border-border rounded-lg p-4 mb-3.5">
        <div className="text-[13px] font-semibold mb-3">active sessions</div>
        <div className="flex flex-col gap-2">
          {isLoadingSessions ? (
            <div className="flex justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            sessions.map((s) => {
              const isCurrent = s.id === session.session.id;
              return (
                <div
                  key={s.id}
                  className="bg-[#0F1216] border border-white/[0.06] rounded-lg p-3"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12.5px] font-semibold flex items-center gap-1.5">
                          {getDeviceIcon(s.userAgent || "")}
                          {getSessionTitle(s.userAgent || "")}
                        </span>
                        {isCurrent && (
                          <span className="text-[9.5px] bg-primary/15 text-primary rounded px-1.5 py-px">
                            current
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground/70 text-[11px] mt-0.5">
                        {s.ipAddress || "Unknown IP"} &middot; expires{" "}
                        {new Date(s.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                    {!isCurrent && (
                      <ConfirmationDialog
                        trigger={
                          <button className="text-destructive text-[11.5px] cursor-pointer whitespace-nowrap flex items-center gap-1 shrink-0">
                            <LogOut className="h-3 w-3" />
                            revoke
                          </button>
                        }
                        title="Revoke Session?"
                        description="The selected device will be logged out immediately."
                        confirmLabel="Revoke"
                        variant="destructive"
                        onConfirm={() => handleRevokeSession(s.token)}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-destructive/25 rounded-lg p-4">
        <div className="text-[13px] font-semibold text-destructive mb-3">
          danger zone
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap bg-destructive/[0.06] border border-destructive/20 rounded-lg px-3.5 py-3">
          <div>
            <div className="text-[12.5px] font-semibold">delete account</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              permanently remove your account and all data
            </div>
          </div>
          <ConfirmationDialog
            trigger={
              <Button className="bg-destructive text-white hover:bg-destructive/90 text-xs font-bold h-auto py-2 px-3.5">
                <Trash2 className="h-3.5 w-3.5" />
                delete account
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
      </div>

      <AddPasskeyDialog
        open={isAddPasskeyOpen}
        onOpenChange={setIsAddPasskeyOpen}
        onAdd={handleCreatePasskey}
      />
    </div>
  );
}
