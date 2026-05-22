"use client";

import { useState } from "react";
import { useMarketing } from "@/components/providers/MarketingProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { RequireAdmin } from "@/components/shared/RequireAdmin";
import { addBacklogItem, deleteBacklogItem, updateBacklogItem } from "@/lib/firestore";
import type { BacklogItem, CollabType } from "@/lib/types";

const emptyForm = {
  creatorName: "",
  channelLink: "",
  finalVideoLink: "",
  cost: 0,
  type: "dedicated" as CollabType,
  publishedDate: new Date().toISOString().slice(0, 10),
  performanceNotes: "",
};

export function BacklogManager() {
  const { backlog } = useMarketing();
  const { canEdit } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BacklogItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (b: BacklogItem) => {
    setEditing(b);
    setForm({
      creatorName: b.creatorName,
      channelLink: b.channelLink,
      finalVideoLink: b.finalVideoLink,
      cost: b.cost,
      type: b.type,
      publishedDate: b.publishedDate.slice(0, 10),
      performanceNotes: b.performanceNotes ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      creatorName: form.creatorName.trim(),
      channelLink: form.channelLink.trim(),
      finalVideoLink: form.finalVideoLink.trim(),
      cost: Number(form.cost) || 0,
      type: form.type,
      publishedDate: form.publishedDate,
      performanceNotes: form.performanceNotes.trim() || undefined,
    };
    if (editing) await updateBacklogItem(editing.id, payload);
    else await addBacklogItem(payload);
    setOpen(false);
  };

  return (
    <div>
      <p className="mb-4 text-sm text-zinc-400">
        Archive of completed YouTuber collaborations with performance notes for future planning.
      </p>
      <RequireAdmin>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Add backlog entry
          </button>
        </div>
      </RequireAdmin>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {backlog.map((b) => (
          <article
            key={b.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-zinc-100">{b.creatorName}</h3>
              <Badge label={b.type} />
            </div>
            <p className="text-xs text-zinc-500">Published {b.publishedDate.slice(0, 10)}</p>
            <p className="mt-2 text-sm text-zinc-300">Cost: ${b.cost.toLocaleString()}</p>
            <div className="mt-2 flex gap-3 text-sm">
              <a href={b.channelLink} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                Channel
              </a>
              <a href={b.finalVideoLink} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                Final video
              </a>
            </div>
            {b.performanceNotes && (
              <p className="mt-3 text-sm text-zinc-400">{b.performanceNotes}</p>
            )}
            {canEdit && (
              <div className="mt-4 flex gap-3 text-sm">
                <button type="button" onClick={() => openEdit(b)} className="text-zinc-400 hover:text-zinc-100">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteBacklogItem(b.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            )}
          </article>
        ))}
        {!backlog.length && (
          <p className="col-span-full py-12 text-center text-zinc-500">
            No archived collaborations yet. Archive from the Collabs page or add manually.
          </p>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit backlog entry" : "Add backlog entry"}>
        <BacklogForm form={form} setForm={setForm} onSave={save} />
      </Modal>
    </div>
  );
}

function BacklogForm({
  form,
  setForm,
  onSave,
}: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  onSave: () => void;
}) {
  return (
    <div>
      {(["creatorName", "channelLink", "finalVideoLink"] as const).map((key) => (
        <label key={key} className="mb-3 block text-sm text-zinc-300">
          {key.replace(/([A-Z])/g, " $1")}
          <input
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 capitalize"
          />
        </label>
      ))}
      <label className="mb-3 block text-sm text-zinc-300">
        Type
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as CollabType })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
        >
          <option value="dedicated">Dedicated</option>
          <option value="integration">Integration</option>
        </select>
      </label>
      <label className="mb-3 block text-sm text-zinc-300">
        Cost ($)
        <input
          type="number"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
        />
      </label>
      <label className="mb-3 block text-sm text-zinc-300">
        Published date
        <input
          type="date"
          value={form.publishedDate}
          onChange={(e) => setForm({ ...form, publishedDate: e.target.value })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
        />
      </label>
      <label className="mb-4 block text-sm text-zinc-300">
        Performance notes
        <textarea
          value={form.performanceNotes}
          onChange={(e) => setForm({ ...form, performanceNotes: e.target.value })}
          rows={4}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
        />
      </label>
      <button
        type="button"
        onClick={onSave}
        className="w-full rounded-lg bg-amber-500 py-2 font-semibold text-zinc-950"
      >
        Save
      </button>
    </div>
  );
}
