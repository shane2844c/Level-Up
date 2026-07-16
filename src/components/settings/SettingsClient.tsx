"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import {
  MobileSettingsGroup,
  MobileSettingsRow,
} from "@/components/mobile/MobileSettingsGroup";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";
import { usePwaEnvironment } from "@/hooks/usePwaEnvironment";

interface SettingsClientProps {
  email: string;
  username: string;
  userId: string;
}

export function SettingsClient({
  email,
  username: initialUsername,
  userId,
}: SettingsClientProps) {
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { standalone } = usePwaEnvironment();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ username: username.trim() || null })
      .eq("id", userId);
    setLoading(false);
    if (error) {
      showToast("Failed to update profile.", "error");
    } else {
      showToast("Profile updated", "success");
      router.refresh();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
      />

      <div className="max-w-lg space-y-6">
        <MobileSettingsGroup title="Account">
          <form onSubmit={handleSave} className="divide-y divide-border">
            <MobileSettingsRow label="Email">
              <input
                value={email}
                disabled
                className="w-full max-w-[220px] text-right opacity-60 cursor-not-allowed"
              />
            </MobileSettingsRow>
            <MobileSettingsRow label="Username">
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Display name"
                className="w-full max-w-[220px] text-right"
              />
            </MobileSettingsRow>
            <div className="px-4 py-3">
              <button
                type="submit"
                disabled={loading}
                className="min-h-[44px] w-full rounded-xl bg-primary text-background text-sm font-medium hover:bg-primary-hover transition-colors active:opacity-80"
              >
                {loading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </MobileSettingsGroup>

        {!standalone && (
          <MobileSettingsGroup title="App">
            <div className="p-4">
              <InstallPrompt variant="settings" className="border-0 bg-transparent p-0" />
            </div>
          </MobileSettingsGroup>
        )}

        <MobileSettingsGroup title="Appearance">
          <MobileSettingsRow
            label="Theme"
            value="Dark mode"
          />
        </MobileSettingsGroup>

        <MobileSettingsGroup title="Session">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex min-h-[48px] w-full items-center gap-3 px-4 py-3 text-sm font-medium text-negative hover:bg-negative/10 transition-colors active:opacity-80"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </MobileSettingsGroup>
      </div>
    </>
  );
}
