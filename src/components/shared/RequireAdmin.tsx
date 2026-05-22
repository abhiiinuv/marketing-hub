"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export function RequireAdmin({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { canEdit } = useAuth();
  if (!canEdit) {
    return (
      fallback ?? (
        <p className="text-sm text-zinc-500">Sign in as admin to use this action.</p>
      )
    );
  }
  return <>{children}</>;
}
