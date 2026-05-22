"use client";

import { useEffect, useMemo, useState } from "react";
import { useMarketing } from "@/components/providers/MarketingProvider";
import {
  buildChartTimeline,
  buildTrafficSeries,
  type ChartPointWithEvents,
} from "@/lib/chartData";
import type { ChartAnnotation } from "@/lib/types";

export function useTrafficChartData() {
  const { trafficUploads, chartAnnotations } = useMarketing();
  const [metric, setMetric] = useState("sessions");
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);

  const activeUpload = useMemo(() => {
    if (selectedUploadId) {
      return trafficUploads.find((u) => u.id === selectedUploadId) ?? trafficUploads[0];
    }
    return trafficUploads[0];
  }, [trafficUploads, selectedUploadId]);

  useEffect(() => {
    if (activeUpload?.primaryMetric) {
      setMetric(activeUpload.primaryMetric);
    }
  }, [activeUpload?.id, activeUpload?.primaryMetric]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, ChartAnnotation[]>();
    for (const a of chartAnnotations) {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    }
    return map;
  }, [chartAnnotations]);

  const trafficByDate = useMemo(() => {
    if (!activeUpload) return new Map<string, number>();
    return buildTrafficSeries(activeUpload.rows, metric);
  }, [activeUpload, metric]);

  const chartData = useMemo((): ChartPointWithEvents[] => {
    if (!activeUpload) return [];
    const timeline = buildChartTimeline(trafficByDate, chartAnnotations);
    return timeline.map((point) => ({
      ...point,
      events: eventsByDate.get(point.date) ?? [],
    }));
  }, [activeUpload, trafficByDate, chartAnnotations, eventsByDate]);

  const availableMetrics = useMemo(() => {
    if (!activeUpload?.rows.length) return [];
    const keys = new Set<string>();
    for (const row of activeUpload.rows) {
      Object.keys(row).forEach((k) => {
        if (k !== "date" && typeof row[k] === "number") keys.add(k);
      });
    }
    return [...keys];
  }, [activeUpload]);

  const hasTrafficValues = chartData.some((d) => d.value != null && d.value > 0);

  const metricLabel = metric.replace(/_/g, " ");

  return {
    trafficUploads,
    activeUpload,
    chartData,
    hasTrafficValues,
    metric,
    setMetric,
    metricLabel,
    selectedUploadId,
    setSelectedUploadId,
    availableMetrics,
  };
}
