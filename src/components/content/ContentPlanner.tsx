"use client";

import { useState } from "react";
import { useMarketing } from "@/components/providers/MarketingProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { RequireAdmin } from "@/components/shared/RequireAdmin";
import {
  addCampaign,
  addInHouseVideo,
  addSocialPost,
  addVideoRelease,
  deleteCampaign,
  deleteInHouseVideo,
  deleteSocialPost,
  deleteVideoRelease,
  updateCampaign,
  updateInHouseVideo,
  updateSocialPost,
  updateVideoRelease,
} from "@/lib/firestore";
import type { Campaign, InHouseVideo, SocialPost, VideoRelease } from "@/lib/types";

type Tab = "tweets" | "releases" | "inhouse" | "campaigns";

export function ContentPlanner() {
  const [tab, setTab] = useState<Tab>("tweets");
  const tabs: { id: Tab; label: string }[] = [
    { id: "tweets", label: "Tweets / Social" },
    { id: "releases", label: "Video Releases" },
    { id: "inhouse", label: "In-House Videos" },
    { id: "campaigns", label: "Other Campaigns" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "bg-amber-500 text-zinc-950"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "tweets" && <SocialPostsSection />}
      {tab === "releases" && <VideoReleasesSection />}
      {tab === "inhouse" && <InHouseSection />}
      {tab === "campaigns" && <CampaignsSection />}
    </div>
  );
}

function SectionShell({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  const { canEdit } = useAuth();
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        {canEdit ? (
          <button
            type="button"
            onClick={onAdd}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950"
          >
            Add new
          </button>
        ) : (
          <RequireAdmin fallback={null}>
            <span />
          </RequireAdmin>
        )}
      </div>
      {children}
    </div>
  );
}

function SocialPostsSection() {
  const { posts } = useMarketing();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SocialPost | null>(null);
  const [form, setForm] = useState({
    title: "",
    platform: "Twitter",
    scheduledDate: new Date().toISOString().slice(0, 10),
    status: "scheduled" as SocialPost["status"],
    cost: 0,
    link: "",
    notes: "",
  });

  const reset = () => {
    setEditing(null);
    setForm({
      title: "",
      platform: "Twitter",
      scheduledDate: new Date().toISOString().slice(0, 10),
      status: "scheduled",
      cost: 0,
      link: "",
      notes: "",
    });
  };

  const save = async () => {
    const data = {
      title: form.title.trim(),
      platform: form.platform,
      scheduledDate: form.scheduledDate,
      status: form.status,
      cost: form.cost || undefined,
      link: form.link.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (editing) await updateSocialPost(editing.id, data);
    else await addSocialPost(data);
    setOpen(false);
    reset();
  };

  return (
    <SectionShell title="Social posts" onAdd={() => { reset(); setOpen(true); }}>
      <ItemList
        items={posts.map((p) => ({
          id: p.id,
          title: p.title,
          date: p.scheduledDate,
          status: p.status,
          extra: p.platform,
          onEdit: () => {
            setEditing(p);
            setForm({
              title: p.title,
              platform: p.platform,
              scheduledDate: p.scheduledDate.slice(0, 10),
              status: p.status,
              cost: p.cost ?? 0,
              link: p.link ?? "",
              notes: p.notes ?? "",
            });
            setOpen(true);
          },
          onDelete: () => deleteSocialPost(p.id),
        }))}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit post" : "New post"}>
        <GenericFields
          fields={[
            { key: "title", label: "Title / hook", value: form.title },
            { key: "platform", label: "Platform", value: form.platform },
            { key: "scheduledDate", label: "Date", value: form.scheduledDate, type: "date" },
            { key: "link", label: "Link", value: form.link },
            { key: "cost", label: "Cost ($)", value: String(form.cost), type: "number" },
          ]}
          onChange={(k, v) => setForm({ ...form, [k]: k === "cost" ? Number(v) : v })}
          statusOptions={["draft", "scheduled", "posted"]}
          status={form.status}
          onStatus={(s) => setForm({ ...form, status: s as SocialPost["status"] })}
          notes={form.notes}
          onNotes={(n) => setForm({ ...form, notes: n })}
          onSave={save}
        />
      </Modal>
    </SectionShell>
  );
}

function VideoReleasesSection() {
  const { releases } = useMarketing();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VideoRelease | null>(null);
  const [form, setForm] = useState({
    title: "",
    scheduledDate: new Date().toISOString().slice(0, 10),
    status: "planned" as VideoRelease["status"],
    videoLink: "",
    notes: "",
  });

  const save = async () => {
    const data = {
      title: form.title.trim(),
      scheduledDate: form.scheduledDate,
      status: form.status,
      videoLink: form.videoLink.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (editing) await updateVideoRelease(editing.id, data);
    else await addVideoRelease(data);
    setOpen(false);
  };

  return (
    <SectionShell title="Video releases" onAdd={() => { setEditing(null); setOpen(true); }}>
      <ItemList
        items={releases.map((v) => ({
          id: v.id,
          title: v.title,
          date: v.scheduledDate,
          status: v.status,
          onEdit: () => {
            setEditing(v);
            setForm({
              title: v.title,
              scheduledDate: v.scheduledDate.slice(0, 10),
              status: v.status,
              videoLink: v.videoLink ?? "",
              notes: v.notes ?? "",
            });
            setOpen(true);
          },
          onDelete: () => deleteVideoRelease(v.id),
        }))}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Video release">
        <GenericFields
          fields={[
            { key: "title", label: "Title", value: form.title },
            { key: "scheduledDate", label: "Release date", value: form.scheduledDate, type: "date" },
            { key: "videoLink", label: "Video link", value: form.videoLink },
          ]}
          onChange={(k, v) => setForm({ ...form, [k]: v })}
          statusOptions={["planned", "in_progress", "live"]}
          status={form.status}
          onStatus={(s) => setForm({ ...form, status: s as VideoRelease["status"] })}
          notes={form.notes}
          onNotes={(n) => setForm({ ...form, notes: n })}
          onSave={save}
        />
      </Modal>
    </SectionShell>
  );
}

function InHouseSection() {
  const { inHouse } = useMarketing();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InHouseVideo | null>(null);
  const [form, setForm] = useState({
    title: "",
    scheduledDate: new Date().toISOString().slice(0, 10),
    status: "planned" as InHouseVideo["status"],
    videoLink: "",
    cost: 0,
    notes: "",
  });

  const save = async () => {
    const data = {
      title: form.title.trim(),
      scheduledDate: form.scheduledDate,
      status: form.status,
      videoLink: form.videoLink.trim() || undefined,
      cost: form.cost || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (editing) await updateInHouseVideo(editing.id, data);
    else await addInHouseVideo(data);
    setOpen(false);
  };

  return (
    <SectionShell title="In-house videos" onAdd={() => setOpen(true)}>
      <ItemList
        items={inHouse.map((v) => ({
          id: v.id,
          title: v.title,
          date: v.scheduledDate,
          status: v.status,
          onEdit: () => {
            setEditing(v);
            setForm({
              title: v.title,
              scheduledDate: v.scheduledDate.slice(0, 10),
              status: v.status,
              videoLink: v.videoLink ?? "",
              cost: v.cost ?? 0,
              notes: v.notes ?? "",
            });
            setOpen(true);
          },
          onDelete: () => deleteInHouseVideo(v.id),
        }))}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="In-house video">
        <GenericFields
          fields={[
            { key: "title", label: "Title", value: form.title },
            { key: "scheduledDate", label: "Target date", value: form.scheduledDate, type: "date" },
            { key: "videoLink", label: "Video link", value: form.videoLink },
            { key: "cost", label: "Production cost ($)", value: String(form.cost), type: "number" },
          ]}
          onChange={(k, v) => setForm({ ...form, [k]: k === "cost" ? Number(v) : v })}
          statusOptions={["planned", "in_production", "live"]}
          status={form.status}
          onStatus={(s) => setForm({ ...form, status: s as InHouseVideo["status"] })}
          notes={form.notes}
          onNotes={(n) => setForm({ ...form, notes: n })}
          onSave={save}
        />
      </Modal>
    </SectionShell>
  );
}

function CampaignsSection() {
  const { campaigns } = useMarketing();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState({
    name: "",
    scheduledDate: new Date().toISOString().slice(0, 10),
    description: "",
    cost: 0,
    link: "",
    notes: "",
  });

  const save = async () => {
    const data = {
      name: form.name.trim(),
      scheduledDate: form.scheduledDate,
      description: form.description.trim() || undefined,
      cost: form.cost || undefined,
      link: form.link.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (editing) await updateCampaign(editing.id, data);
    else await addCampaign(data);
    setOpen(false);
  };

  return (
    <SectionShell title="Marketing campaigns" onAdd={() => setOpen(true)}>
      <ItemList
        items={campaigns.map((c) => ({
          id: c.id,
          title: c.name,
          date: c.scheduledDate,
          extra: c.description,
          onEdit: () => {
            setEditing(c);
            setForm({
              name: c.name,
              scheduledDate: c.scheduledDate.slice(0, 10),
              description: c.description ?? "",
              cost: c.cost ?? 0,
              link: c.link ?? "",
              notes: c.notes ?? "",
            });
            setOpen(true);
          },
          onDelete: () => deleteCampaign(c.id),
        }))}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Campaign">
        <GenericFields
          fields={[
            { key: "name", label: "Campaign name", value: form.name },
            { key: "scheduledDate", label: "Date", value: form.scheduledDate, type: "date" },
            { key: "description", label: "Description", value: form.description },
            { key: "link", label: "Link", value: form.link },
            { key: "cost", label: "Cost ($)", value: String(form.cost), type: "number" },
          ]}
          onChange={(k, v) =>
            setForm({ ...form, [k]: k === "cost" ? Number(v) : v } as typeof form)
          }
          notes={form.notes}
          onNotes={(n) => setForm({ ...form, notes: n })}
          onSave={save}
        />
      </Modal>
    </SectionShell>
  );
}

function ItemList({
  items,
}: {
  items: {
    id: string;
    title: string;
    date: string;
    status?: string;
    extra?: string;
    onEdit: () => void;
    onDelete: () => void;
  }[];
}) {
  const { canEdit } = useAuth();
  if (!items.length) {
    return <p className="py-8 text-center text-zinc-500">Nothing here yet.</p>;
  }
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3"
        >
          <div>
            <p className="font-medium text-zinc-100">{item.title}</p>
            <p className="text-xs text-zinc-500">
              {item.date.slice(0, 10)}
              {item.extra ? ` · ${item.extra}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {item.status && <Badge label={item.status} />}
            {canEdit && (
              <>
                <button type="button" onClick={item.onEdit} className="text-sm text-zinc-400 hover:text-zinc-100">
                  Edit
                </button>
                <button type="button" onClick={item.onDelete} className="text-sm text-red-400">
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function GenericFields({
  fields,
  onChange,
  statusOptions,
  status,
  onStatus,
  notes,
  onNotes,
  onSave,
}: {
  fields: { key: string; label: string; value: string; type?: string }[];
  onChange: (key: string, value: string) => void;
  statusOptions?: string[];
  status?: string;
  onStatus?: (s: string) => void;
  notes?: string;
  onNotes?: (n: string) => void;
  onSave: () => void;
}) {
  return (
    <div>
      {fields.map((f) => (
        <label key={f.key} className="mb-3 block text-sm text-zinc-300">
          {f.label}
          <input
            type={f.type ?? "text"}
            value={f.value}
            onChange={(e) => onChange(f.key, e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
          />
        </label>
      ))}
      {statusOptions && onStatus && (
        <label className="mb-3 block text-sm text-zinc-300">
          Status
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
      )}
      {onNotes && (
        <label className="mb-4 block text-sm text-zinc-300">
          Notes
          <textarea
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
          />
        </label>
      )}
      <button type="button" onClick={onSave} className="w-full rounded-lg bg-amber-500 py-2 font-semibold text-zinc-950">
        Save
      </button>
    </div>
  );
}
