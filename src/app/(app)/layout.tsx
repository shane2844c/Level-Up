import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { ToastProvider } from "@/components/ui/Toast";
import { LevelUpProvider } from "@/components/progress/LevelUpCelebration";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <LevelUpProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar />
        <div className="md:pl-64">
          <MobileHeader />
          <main className="max-w-content mx-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>
        <MobileNavigation />
      </div>
      </LevelUpProvider>
    </ToastProvider>
  );
}
