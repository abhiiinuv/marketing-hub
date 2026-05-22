"use client";

import { isFirebaseConfigured } from "@/lib/firebase";

export function FirebaseSetupBanner() {
  if (isFirebaseConfigured()) return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <strong>Firebase not configured.</strong> Copy{" "}
      <code className="rounded bg-zinc-800 px-1">.env.local.example</code> to{" "}
      <code className="rounded bg-zinc-800 px-1">.env.local</code> and add your Firebase
      project keys. Data will not persist until then.
    </div>
  );
}
