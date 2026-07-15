"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/actions";
import { useToast } from "@/components/ui/Toast";

interface SettingsClientProps {
  email: string;
  username: string;
  userId: string;
}

export function SettingsClient({ email, username: initialUsername, userId }: SettingsClientProps) {
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

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

      <div className="max-w-lg space-y-8">
        <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Profile</h2>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground-secondary mb-1.5">
              Email
            </label>
            <input id="email" value={email} disabled className="opacity-60 cursor-not-allowed" />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground-secondary mb-1.5">
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your display name"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-primary text-background font-medium hover:bg-primary-hover transition-colors"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Account</h2>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-negative/30 text-negative hover:bg-negative/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
