"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaCalendarDays,
  FaCloudArrowUp,
  FaHandshake,
  FaHouse,
  FaPenToSquare,
} from "react-icons/fa6";

const links = [
  { href: "/", label: "Dashboard", icon: FaHouse },
  { href: "/calendar", label: "Calendar", icon: FaCalendarDays },
  { href: "/collabs", label: "YouTuber Collabs", icon: FaHandshake },
  { href: "/content", label: "Content Planner", icon: FaPenToSquare },
  { href: "/traffic", label: "Data Upload", icon: FaCloudArrowUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative z-20 flex w-56 shrink-0 flex-col border-r border-[var(--border)] bg-black/80 px-3 py-8 backdrop-blur-sm">
      <div className="mb-10 px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--traycer-teal-light)]">
          Internal
        </p>
        <h1 className="font-serif mt-1 text-xl font-normal text-white">Marketing Hub</h1>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-[var(--traycer-teal-dark)]/40 text-white ring-1 ring-[var(--traycer-teal-muted)]/50"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-white"
              }`}
            >
              <Icon className="text-sm opacity-80" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
