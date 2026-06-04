"use client";

import { useCallback, useState } from "react";
import { FaBars } from "react-icons/fa6";
import { Sidebar } from "./Sidebar";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { MarketingProvider } from "@/components/providers/MarketingProvider";
import { AdminBar } from "@/components/auth/AdminBar";
import { FirebaseSetupBanner } from "@/components/shared/FirebaseSetupBanner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <AuthProvider>
      <MarketingProvider>
        <div className="relative flex min-h-screen bg-black text-white">
          <div className="grain-overlay" aria-hidden />
          <div className="teal-accent-blob" aria-hidden />
          <Sidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />
          <div className="relative z-10 flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--border)] bg-black/90 px-4 py-3 backdrop-blur md:hidden">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="btn-secondary !px-2.5 !py-2"
                aria-label="Open menu"
              >
                <FaBars />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--traycer-teal-light)]">
                  Marketing Hub
                </p>
              </div>
            </header>
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 md:p-10 lg:p-12">
              <FirebaseSetupBanner />
              <AdminBar />
              {children}
            </main>
          </div>
        </div>
      </MarketingProvider>
    </AuthProvider>
  );
}
