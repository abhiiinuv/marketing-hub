"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/docs";

function NavLeaf({ page }: { page: string }) {
  const pathname = usePathname();
  const href = `/docs/${page}`;
  const active = pathname === href || pathname === `/docs/${page}/`;
  const label = page.split("/").pop()?.replace(/-/g, " ") ?? page;

  return (
    <Link
      href={href}
      className={`block truncate rounded px-3 py-1.5 text-sm capitalize transition-colors ${
        active
          ? "bg-[var(--traycer-teal-dark)]/40 text-white ring-1 ring-[var(--traycer-teal-muted)]/50"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function NavGroupItem({ item }: { item: NavItem }) {
  if (typeof item === "string") return <NavLeaf page={item} />;
  return (
    <div className="mt-4">
      <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
        {item.group}
      </p>
      <div className="space-y-0.5">
        {item.pages.map((p, i) => (
          <NavGroupItem key={i} item={p} />
        ))}
      </div>
    </div>
  );
}

export function DocsSidebar({ nav }: { nav: NavItem[] }) {
  return (
    <nav className="h-full space-y-0.5 overflow-y-auto pr-2">
      {nav.map((item, i) => (
        <NavGroupItem key={i} item={item} />
      ))}
    </nav>
  );
}
