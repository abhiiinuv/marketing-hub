"use client";

import { useState } from "react";
import { useMarketing } from "@/components/providers/MarketingProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { RequireAdmin } from "@/components/shared/RequireAdmin";
import {
  addCollaboration,
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

  return (
    <div>
      <RequireAdmin>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className="btn-primary text-sm"
          >
            Add collaboration
          </button>
        </div>
      </RequireAdmin>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--text-subtle)]">
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
          <tbody className="divide-y divide-[var(--border)]">
            {collabs.map((c) => (
              <tr key={c.id} className="hover:bg-[var(--surface-hover)]/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{c.creatorName}</p>
                  {c.notes && <p className="mt-0.5 text-xs text-[var(--text-subtle)] line-clamp-1">{c.notes}</p>}
                </td>
                <td className="px-4 py-3">
                  <Badge label={c.type} />
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">${c.cost.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge label={c.status} />
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{c.scheduledDate.slice(0, 10)}</td>
                <td className="px-4 py-3">
                  {c.videoLink ? (
                    <a href={c.videoLink} target="_blank" rel="noreferrer" className="link-teal hover:underline">
                      Video
                    </a>
                  ) : (
                    <a href={c.channelLink} target="_blank" rel="noreferrer" className="link-teal hover:underline">
                      Channel
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">
                  {canEdit ? (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(c)} className="text-[var(--text-muted)] hover:text-white">
                        Edit
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
    <label className="mb-3 block text-sm text-[var(--text-muted)]">
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
        className="input-field"
      />
    </label>
  );

  return (
    <div>
      {field("Creator name", "creatorName")}
      {field("YouTube channel link", "channelLink")}
      <label className="mb-3 block text-sm text-[var(--text-muted)]">
        Type
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as CollabType })}
          className="input-field"
        >
          <option value="dedicated">Dedicated video</option>
          <option value="integration">Integration</option>
        </select>
      </label>
      {field("Cost ($)", "cost", "number")}
      <label className="mb-3 block text-sm text-[var(--text-muted)]">
        Status
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as CollabStatus })}
          className="input-field"
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
          className="input-field"
        />
      </label>
      <button
        type="button"
        onClick={onSave}
        className="btn-primary w-full !py-2.5"
      >
        Save
      </button>
    </div>
  );
}
