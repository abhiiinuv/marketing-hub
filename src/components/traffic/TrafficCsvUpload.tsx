"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { parseTrafficCsv, pickDefaultMetric } from "@/lib/csv";
import { addTrafficUpload, deleteTrafficUpload } from "@/lib/firestore";
import { useMarketing } from "@/components/providers/MarketingProvider";

export function TrafficCsvUpload() {
  const { canEdit } = useAuth();
  const { trafficUploads } = useMarketing();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(null);
    setUploading(true);
    try {
      const text = await file.text();
      const { rows, metrics } = parseTrafficCsv(text);
      const primaryMetric = pickDefaultMetric(metrics);
      await addTrafficUpload({
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        rows,
        primaryMetric,
      });
      setSuccess(
        `Uploaded ${rows.length} days. Dashboard chart updated. Metric: ${primaryMetric.replace(/_/g, " ")}.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse CSV");
    } finally {
      setUploading(false);
    }
  };

  const latest = trafficUploads[0];

  return (
    <div className="panel max-w-xl p-6">
      <label className="block text-sm font-medium text-white">Traffic CSV</label>
      <p className="mt-1 mb-4 text-sm leading-relaxed text-[var(--text-muted)]">
        Supports date-per-row exports or wide formats (dates as columns). The dashboard chart
        updates automatically for everyone.
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        disabled={uploading || !canEdit}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
        className="block w-full text-sm text-[var(--text-muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black disabled:opacity-50"
      />
      {!canEdit && (
        <p className="mt-3 text-sm text-[var(--text-subtle)]">
          Sign in as admin to upload or replace CSV data.
        </p>
      )}
      {latest && (
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Current file: <span className="text-white">{latest.filename}</span> ({latest.rows.length}{" "}
          days)
        </p>
      )}
      {canEdit && latest && (
        <button
          type="button"
          onClick={() => deleteTrafficUpload(latest.id)}
          className="mt-3 text-sm text-red-400/90 hover:text-red-300"
        >
          Remove current dataset
        </button>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-3 text-sm text-[var(--traycer-teal-light)]">{success}</p>}
    </div>
  );
}
