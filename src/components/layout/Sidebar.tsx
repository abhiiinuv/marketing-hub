"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  FaBook,
  FaCalendarDays,
  FaCloudArrowUp,
  FaHandshake,
  FaHouse,
  FaPenToSquare,
  FaXmark,
} from "react-icons/fa6";

const links = [
  { href: "/", label: "Dashboard", icon: FaHouse },
  { href: "/calendar", label: "Calendar", icon: FaCalendarDays },
  { href: "/collabs", label: "YouTuber Collabs", icon: FaHandshake },
  { href: "/content", label: "Content Planner", icon: FaPenToSquare },
  { href: "/traffic", label: "Data Upload", icon: FaCloudArrowUp },
  { href: "/docs", label: "Traycer Docs", icon: FaBook },
];

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(85vw,16rem)] flex-col border-r border-[var(--border)] bg-black/95 px-3 py-6 backdrop-blur-md transition-transform duration-200 md:static md:z-20 md:w-56 md:shrink-0 md:translate-x-0 md:bg-black/80 md:py-8 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between px-2 md:mb-10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--traycer-teal-light)]">
              Internal
            </p>
            <h1 className="font-serif mt-1 text-xl font-normal text-white">Marketing Hub</h1>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="btn-secondary !px-2 !py-1 md:hidden"
            aria-label="Close menu"
          >
            <FaXmark />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={onMobileClose}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm transition-colors md:py-2.5 ${
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
    </>
  );
}
