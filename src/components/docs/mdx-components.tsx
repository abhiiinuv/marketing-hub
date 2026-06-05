import Link from "next/link";
import type { ReactNode } from "react";

function Card({
  title,
  href,
  children,
}: {
  title: string;
  icon: string | undefined;
  href: string | undefined;
  children: ReactNode | undefined;
}) {
  const inner = (
    <div className="group flex flex-col justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 transition-all hover:border-[var(--traycer-teal-muted)] hover:bg-[var(--surface-hover)]">
      <div>
        <p className="mb-1.5 text-sm font-semibold text-white">{title}</p>
        {children && (
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">{children}</p>
        )}
      </div>
      {href && (
        <span className="flex items-center gap-1 text-xs font-medium text-[var(--traycer-teal-light)] transition-colors group-hover:text-[#a8d4d4]">
          Learn more
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  );

  if (!href) return inner;
  const isExternal = href.startsWith("http");
  return isExternal ? (
    <a href={href} target="_blank" rel="noreferrer" className="block no-underline">
      {inner}
    </a>
  ) : (
    <Link href={`/docs${href}`} className="block no-underline">
      {inner}
    </Link>
  );
}

function CardGroup({ cols, children }: { cols: number | undefined; children: ReactNode }) {
  const gridCols = cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return <div className={`my-6 grid grid-cols-1 gap-4 ${gridCols}`}>{children}</div>;
}

function Columns({ cols, children }: { cols: number | undefined; children: ReactNode }) {
  const gridCols = cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return <div className={`my-6 grid grid-cols-1 gap-4 ${gridCols}`}>{children}</div>;
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-[var(--traycer-teal-muted)]/50 bg-[var(--traycer-teal-dark)]/20 px-4 py-3 text-sm text-[var(--traycer-teal-light)]">
      <span className="mr-2 font-semibold">Note:</span>
      {children}
    </div>
  );
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-yellow-700/50 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-300">
      <span className="mr-2 font-semibold">Warning:</span>
      {children}
    </div>
  );
}

function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-green-700/50 bg-green-900/20 px-4 py-3 text-sm text-green-300">
      <span className="mr-2 font-semibold">Tip:</span>
      {children}
    </div>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="my-6 space-y-0 border-l border-[var(--border)] pl-6">{children}</ol>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="relative pb-6 last:pb-0">
      <span className="absolute -left-[25px] flex h-5 w-5 items-center justify-center rounded-full border border-[var(--traycer-teal-muted)] bg-[var(--surface)] text-[10px] font-bold text-[var(--traycer-teal-light)]" />
      <p className="mb-1 font-semibold text-white">{title}</p>
      <div className="text-sm text-[var(--text-muted)]">{children}</div>
    </li>
  );
}

function AccordionGroup({ children }: { children: ReactNode }) {
  return <div className="my-4 space-y-2">{children}</div>;
}

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)]">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white select-none">
        {title}
      </summary>
      <div className="px-4 pb-4 text-sm text-[var(--text-muted)]">{children}</div>
    </details>
  );
}

function Tab({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function Tabs({ children }: { children: ReactNode }) {
  return <div className="my-4">{children}</div>;
}

export const mdxComponents = {
  Card,
  CardGroup,
  Columns,
  Note,
  Warning,
  Tip,
  Steps,
  Step,
  AccordionGroup,
  Accordion,
  Tab,
  Tabs,
  a: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (!href) return <a {...rest}>{children}</a>;
    if (href.startsWith("http") || href.startsWith("mailto")) {
      return (
        <a href={href} target="_blank" rel="noreferrer" {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href.startsWith("/") ? `/docs${href}` : href} {...rest}>
        {children}
      </Link>
    );
  },
};
