"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Modal } from "@/components/shared/Modal";

export function AdminBar() {
  const { user, loading, canEdit, signIn, signOut } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      setLoginOpen(false);
      setPassword("");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <div
        className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
          canEdit
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            : "border-zinc-700 bg-zinc-900/80 text-zinc-400"
        }`}
      >
        <div>
          {canEdit ? (
            <>
              <span className="font-medium text-emerald-300">Admin mode</span>
              <span className="ml-2 text-zinc-400">— signed in as {user?.email}</span>
            </>
          ) : (
            <>
              <span className="font-medium text-zinc-200">View-only</span>
              <span className="ml-2">
                Anyone can browse the calendar and charts. Sign in to add or edit data.
              </span>
            </>
          )}
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-zinc-200 hover:bg-zinc-800"
          >
            Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Admin sign in
          </button>
        )}
      </div>

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Admin sign in">
        <p className="mb-4 text-sm text-zinc-400">
          Use the same email and password as Creatorboard admin. Firebase Email/Password must be
          enabled in your project.
        </p>
        <label className="mb-3 block text-sm text-zinc-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
            autoComplete="username"
          />
        </label>
        <label className="mb-3 block text-sm text-zinc-300">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <button
          type="button"
          disabled={submitting}
          onClick={handleLogin}
          className="w-full rounded-lg bg-amber-500 py-2 font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </Modal>
    </>
  );
}
