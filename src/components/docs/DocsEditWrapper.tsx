"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "@/components/providers/AuthProvider";
import { getDocOverride, saveDocOverride, clearDocOverride } from "@/lib/docs-firestore";

type Props = {
  slug: string[];
  fileContent: string;
};

type EditState = "idle" | "editing" | "saving";

export function DocsEditWrapper({ slug, fileContent }: Props) {
  const { canEdit, user } = useAuth();

  // null = no override loaded yet, string = override content
  const [override, setOverride] = useState<string | null>(null);
  const [loadingOverride, setLoadingOverride] = useState(true);

  const [editState, setEditState] = useState<EditState>("idle");
  const [draft, setDraft] = useState("");
  const [saveError, setSaveError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Firestore override on mount; hide server-rendered content when override is active
  useEffect(() => {
    let cancelled = false;
    getDocOverride(slug).then((data) => {
      if (!cancelled) {
        setOverride(data?.content ?? null);
        setLoadingOverride(false);
      }
    });
    return () => { cancelled = true; };
  }, [slug]);

  // Toggle visibility of the server-rendered file content
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".doc-file-content");
    if (el) el.style.display = override !== null ? "none" : "";
  }, [override]);

  // Focus textarea when editor opens
  useEffect(() => {
    if (editState === "editing") {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [editState]);

  const activeContent = override ?? fileContent;

  function openEditor() {
    setDraft(activeContent);
    setSaveError("");
    setEditState("editing");
  }

  function closeEditor() {
    setEditState("idle");
    setSaveError("");
  }

  async function handleSave() {
    if (!user?.email) return;
    setSaveError("");
    setEditState("saving");
    try {
      await saveDocOverride(slug, draft, user.email);
      setOverride(draft);
      setEditState("idle");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
      setEditState("editing");
    }
  }

  async function handleClear() {
    setShowClearConfirm(false);
    await clearDocOverride(slug);
    setOverride(null);
  }

  const hasOverride = override !== null;

  return (
    <>
      {/* Admin toolbar */}
      {canEdit && !loadingOverride && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openEditor}
            className="btn-primary flex items-center gap-1.5 !py-1.5 !text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit this page
          </button>
          {hasOverride && (
            <>
              <span className="rounded-full bg-[var(--traycer-teal-dark)]/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--traycer-teal-light)]">
                Edited
              </span>
              {showClearConfirm ? (
                <span className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  Reset to original?
                  <button type="button" onClick={handleClear} className="text-red-400 hover:text-red-300 font-medium">Yes, reset</button>
                  <button type="button" onClick={() => setShowClearConfirm(false)} className="hover:text-white">Cancel</button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="btn-secondary !py-1.5 !text-xs"
                >
                  Reset to original
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* When a Firestore override exists, render it here (server-rendered content is hidden via effect) */}
      {hasOverride && (
        <div className="doc-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {activeContent}
          </ReactMarkdown>
        </div>
      )}

      {/* Edit slide-over */}
      {(editState === "editing" || editState === "saving") && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeEditor}
            aria-label="Close editor"
          />

          {/* Panel */}
          <div className="relative ml-auto flex h-full w-full max-w-2xl flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <p className="font-semibold text-white">Edit page</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {slug.join(" / ")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="btn-secondary !px-2 !py-1"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={editState === "saving"}
              spellCheck={false}
              className="flex-1 resize-none bg-[var(--surface)] px-5 py-4 font-mono text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-subtle)] disabled:opacity-60"
              placeholder="Write markdown here…"
            />

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                </svg>
                Markdown supported. Saved to Firestore, original file is unchanged.
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={closeEditor} className="btn-secondary !py-1.5 !text-xs">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={editState === "saving"}
                  className="btn-primary !py-1.5 !text-xs disabled:opacity-60"
                >
                  {editState === "saving" ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>

            {saveError && (
              <p className="border-t border-red-900/50 bg-red-950/30 px-5 py-2 text-xs text-red-400">
                {saveError}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
