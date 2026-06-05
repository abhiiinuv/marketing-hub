import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { getDocNavigation } from "@/lib/docs";
import type { ReactNode } from "react";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const nav = getDocNavigation();

  return (
    <div className="flex min-h-screen gap-0">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)]/60 px-3 py-8 lg:block xl:w-64">
        <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--traycer-teal-light)]">
          Traycer Docs
        </p>
        <DocsSidebar nav={nav} />
      </aside>
      <main className="min-w-0 flex-1 px-6 py-8 xl:px-12">{children}</main>
    </div>
  );
}
