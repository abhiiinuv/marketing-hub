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
    <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 px-3 py-6">
      <div className="mb-8 px-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500">
          Internal
        </p>
        <h1 className="text-lg font-bold text-zinc-50">Marketing Hub</h1>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-amber-500/15 text-amber-400"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              <Icon className="text-base opacity-80" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
