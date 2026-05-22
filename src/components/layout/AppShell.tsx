"use client";

import { Sidebar } from "./Sidebar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { MarketingProvider } from "@/components/providers/MarketingProvider";
import { AdminBar } from "@/components/auth/AdminBar";
import { FirebaseSetupBanner } from "@/components/shared/FirebaseSetupBanner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MarketingProvider>
        <div className="relative flex min-h-screen bg-black text-white">
          <div className="grain-overlay" aria-hidden />
          <div className="teal-accent-blob" aria-hidden />
          <Sidebar />
          <main className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
            <FirebaseSetupBanner />
            <AdminBar />
            {children}
          </main>
        </div>
      </MarketingProvider>
    </AuthProvider>
  );
}
