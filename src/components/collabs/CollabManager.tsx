"use client";

import { useState } from "react";
import { useMarketing } from "@/components/providers/MarketingProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { RequireAdmin } from "@/components/shared/RequireAdmin";
import {
  addCollaboration,
  archiveCollaboration,
  deleteCollaboration,
  updateCollaboration,
} from "@/lib/firestore";
import type { CollabStatus, CollabType, Collaboration } from "@/lib/types";

const emptyForm = {
  creatorName: "",
  channelLink: "",
  type: "dedicated" as CollabType,
  cost: 0,
  status: "planned" as CollabStatus,
  videoLink: "",
  scheduledDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function CollabManager() {
  const { collabs } = useMarketing();
  const { canEdit } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Collaboration | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [publishedDate, setPublishedDate] = useState(new Date().toISOString().slice(0, 10));
  const [performanceNotes, setPerformanceNotes] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: Collaboration) => {
    setEditing(c);
    setForm({
      creatorName: c.creatorName,
      channelLink: c.channelLink,
      type: c.type,
      cost: c.cost,
      status: c.status,
      videoLink: c.videoLink ?? "",
      scheduledDate: c.scheduledDate.slice(0, 10),
      notes: c.notes ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      creatorName: form.creatorName.trim(),
      channelLink: form.channelLink.trim(),
      type: form.type,
      cost: Number(form.cost) || 0,
      status: form.status,
      videoLink: form.videoLink.trim() || undefined,
      scheduledDate: form.scheduledDate,
      notes: form.notes.trim() || undefined,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    if (editing) {
      await updateCollaboration(editing.id, payload);
    } else {
      await addCollaboration(payload);
    }
    setOpen(false);
  };

  const confirmArchive = async (c: Collaboration) => {
    await archiveCollaboration(c, publishedDate, performanceNotes.trim() || undefined);
    setArchiveId(null);
    setPerformanceNotes("");
  };

  return (
    <div>
      <RequireAdmin>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Add collaboration
          </button>
        </div>
      </RequireAdmin>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Creator</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Links</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {collabs.map((c) => (
              <tr key={c.id} className="bg-zinc-950/50 hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-100">{c.creatorName}</p>
                  {c.notes && <p className="mt-0.5 text-xs text-zinc-500 line-clamp-1">{c.notes}</p>}
                </td>
                <td className="px-4 py-3">
                  <Badge label={c.type} />
                </td>
                <td className="px-4 py-3 text-zinc-300">${c.cost.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge label={c.status} />
                </td>
                <td className="px-4 py-3 text-zinc-400">{c.scheduledDate.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  {c.videoLink ? (
                    <a href={c.videoLink} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                      Video
                    </a>
                  ) : (
                    <a href={c.channelLink} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                      Channel
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">
                  {canEdit ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(c)} className="text-zinc-400 hover:text-zinc-100">
                        Edit
                      </button>
                      <button type="button" onClick={() => setArchiveId(c.id)} className="text-emerald-400 hover:text-emerald-300">
                        Archive
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCollaboration(c.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-600">—</span>
                  )}
                </td>
              </tr>
            ))}
            {!collabs.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No active collaborations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit collaboration" : "New collaboration"}>
        <CollabForm form={form} setForm={setForm} onSave={save} />
      </Modal>

      <Modal open={!!archiveId} onClose={() => setArchiveId(null)} title="Move to backlog">
        <p className="mb-4 text-sm text-zinc-400">
          This will move the collaboration to the archive and remove it from active tracking.
        </p>
        <label className="mb-3 block text-sm text-zinc-300">
          Published date
          <input
            type="date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
          />
        </label>
        <label className="mb-4 block text-sm text-zinc-300">
          Performance notes
          <textarea
            value={performanceNotes}
            onChange={(e) => setPerformanceNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            const c = collabs.find((x) => x.id === archiveId);
            if (c) confirmArchive(c);
          }}
          className="w-full rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-500"
        >
          Confirm archive
        </button>
      </Modal>
    </div>
  );
}

function CollabForm({
  form,
  setForm,
  onSave,
}: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  onSave: () => void;
}) {
  const field = (label: string, key: keyof typeof emptyForm, type = "text") => (
    <label className="mb-3 block text-sm text-zinc-300">
      {label}
      <input
        type={type}
        value={String(form[key])}
        onChange={(e) =>
          setForm({
            ...form,
            [key]: type === "number" ? Number(e.target.value) : e.target.value,
          })
        }
        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100"
      />
    </label>
  );

  return (
    <div>
      {field("Creator name", "creatorName")}
      {field("YouTube channel link", "channelLink")}
      <label className="mb-3 block text-sm text-zinc-300">
        Type
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as CollabType })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
        >
          <option value="dedicated">Dedicated video</option>
          <option value="integration">Integration</option>
        </select>
      </label>
      {field("Cost ($)", "cost", "number")}
      <label className="mb-3 block text-sm text-zinc-300">
        Status
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as CollabStatus })}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
        >
          <option value="planned">Planned</option>
          <option value="in_progress">In progress</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      {field("Scheduled date", "scheduledDate", "date")}
      {field("Video link (if live)", "videoLink")}
      <label className="mb-4 block text-sm text-zinc-300">
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
        />
      </label>
      <button
        type="button"
        onClick={onSave}
        className="w-full rounded-lg bg-amber-500 py-2 font-semibold text-zinc-950 hover:bg-amber-400"
      >
        Save
      </button>
    </div>
  );
}
