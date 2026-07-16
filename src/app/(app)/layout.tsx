import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNavigation } from "@/components/mobile/MobileBottomNavigation";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { ToastProvider } from "@/components/ui/Toast";
import { LevelUpProvider } from "@/components/progress/LevelUpCelebration";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <LevelUpProvider>
        <ServiceWorkerRegister />
        <OfflineBanner />
        <div className="min-h-screen bg-background">
          <AppSidebar />
          <div className="md:pl-64">
            <main className="max-w-content mx-auto px-4 py-5 md:px-8 md:py-8 mobile-nav-offset md:pb-8 safe-area-pt safe-area-pl safe-area-pr">
              {children}
            </main>
          </div>
          <MobileBottomNavigation />
        </div>
      </LevelUpProvider>
    </ToastProvider>
  );
}
