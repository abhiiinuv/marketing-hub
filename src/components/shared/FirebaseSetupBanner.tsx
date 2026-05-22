"use client";

import { isFirebaseConfigured } from "@/lib/firebase";

export function FirebaseSetupBanner() {
  if (isFirebaseConfigured()) return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200/90">
      <strong>Firebase not configured.</strong> Copy{" "}
      <code className="rounded bg-black/40 px-1">.env.local.example</code> to{" "}
      <code className="rounded bg-black/40 px-1">.env.local</code> and add your Firebase keys.
    </div>
  );
}
