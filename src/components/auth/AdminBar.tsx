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
        className={`panel-subtle mb-6 flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm ${
          canEdit ? "ring-1 ring-[var(--traycer-teal-muted)]/30" : ""
        }`}
      >
        <div className="text-[var(--text-muted)]">
          {canEdit ? (
            <>
              <span className="font-medium text-[var(--traycer-teal-light)]">Admin mode</span>
              <span className="ml-2">— {user?.email}</span>
            </>
          ) : (
            <>
              <span className="font-medium text-white">View-only</span>
              <span className="ml-2">
                Browse freely. Sign in to add or edit marketing data.
              </span>
            </>
          )}
        </div>
        {canEdit ? (
          <button type="button" onClick={() => signOut()} className="btn-secondary">
            Sign out
          </button>
        ) : (
          <button type="button" onClick={() => setLoginOpen(true)} className="btn-primary">
            Admin sign in
          </button>
        )}
      </div>

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Admin sign in">
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          Use the same email and password as Creatorboard admin.
        </p>
        <label className="mb-3 block text-sm text-[var(--text-muted)]">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            autoComplete="username"
          />
        </label>
        <label className="mb-3 block text-sm text-[var(--text-muted)]">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="input-field"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <button
          type="button"
          disabled={submitting}
          onClick={handleLogin}
          className="btn-primary w-full !py-2.5"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </Modal>
    </>
  );
}
