"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Download,
  FolderOpen,
  History,
  LogOut,
  Settings,
} from "lucide-react";
import { MobileBottomSheet } from "@/components/mobile/MobileBottomSheet";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { signOut } from "@/lib/actions";
import { usePwaEnvironment } from "@/hooks/usePwaEnvironment";
import { cn } from "@/lib/utils";

interface MobileMoreSheetProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    href: "/categories",
    label: "Categories",
    description: "Organise habits into areas of your life",
    icon: FolderOpen,
  },
  {
    href: "/history",
    label: "History",
    description: "View all XP activity",
    icon: History,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Manage your account and preferences",
    icon: Settings,
  },
] as const;

export function MobileMoreSheet({ open, onClose }: MobileMoreSheetProps) {
  const router = useRouter();
  const { standalone } = usePwaEnvironment();

  const handleSignOut = async () => {
    onClose();
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <MobileBottomSheet open={open} onClose={onClose} title="More" ariaLabel="More menu">
      <div className="px-2 py-2 max-h-[70dvh] overflow-y-auto">
        {menuItems.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex min-h-[56px] items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-card active:opacity-80"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-foreground-secondary mt-0.5">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
          </Link>
        ))}

        {!standalone && (
          <div className="px-2 py-2">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Download className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Install App</p>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  Add this app to your Home Screen
                </p>
              </div>
            </div>
            <InstallPrompt variant="settings" className="mt-2 border-0 bg-card p-4" />
          </div>
        )}

        <div className="mt-2 border-t border-border pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className={cn(
              "flex min-h-[56px] w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
              "text-negative hover:bg-negative/10 active:opacity-80"
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-negative/10">
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </div>
    </MobileBottomSheet>
  );
}
