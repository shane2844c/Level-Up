import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNavigation } from "@/components/mobile/MobileBottomNavigation";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ToastProvider } from "@/components/ui/Toast";
import { LevelUpProvider } from "@/components/progress/LevelUpCelebration";
import { requireAuth } from "@/lib/supabase/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <ToastProvider>
      <LevelUpProvider>
        <ServiceWorkerRegister />
        <OfflineBanner />
        <div className="jar-app min-h-screen">
          <AppSidebar />
          <div className="md:pl-[17rem]">
            <main className="max-w-[1400px] mx-auto px-4 py-5 md:px-8 md:py-8 mobile-nav-offset md:pb-8 safe-area-pt safe-area-pl safe-area-pr">
              {children}
            </main>
          </div>
          <MobileBottomNavigation />
        </div>
      </LevelUpProvider>
    </ToastProvider>
  );
}
