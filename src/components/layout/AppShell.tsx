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
        <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <FirebaseSetupBanner />
            <AdminBar />
            {children}
          </main>
        </div>
      </MarketingProvider>
    </AuthProvider>
  );
}
