"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCalendarEvents } from "@/lib/calendar";
import {
  subscribeCampaigns,
  subscribeCollaborations,
  subscribeInHouseVideos,
  subscribeSocialPosts,
  subscribeTrafficUploads,
  subscribeVideoReleases,
} from "@/lib/firestore";
import type {
  CalendarEvent,
  Campaign,
  ChartAnnotation,
  Collaboration,
  InHouseVideo,
  SocialPost,
  TrafficUpload,
  VideoRelease,
} from "@/lib/types";
import { normalizeChartDate } from "@/lib/dates";
import { EVENT_TYPE_LABELS } from "@/lib/types";

export function useMarketingData() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [releases, setReleases] = useState<VideoRelease[]>([]);
  const [inHouse, setInHouse] = useState<InHouseVideo[]>([]);
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [trafficUploads, setTrafficUploads] = useState<TrafficUpload[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubs = [
      subscribeSocialPosts(setPosts),
      subscribeVideoReleases(setReleases),
      subscribeInHouseVideos(setInHouse),
      subscribeCollaborations(setCollabs),
      subscribeCampaigns(setCampaigns),
      subscribeTrafficUploads(setTrafficUploads),
    ];
    setReady(true);
    return () => unsubs.forEach((u) => u());
  }, []);

  const calendarEvents = useMemo(
    () => buildCalendarEvents(posts, releases, inHouse, collabs, campaigns),
    [posts, releases, inHouse, collabs, campaigns]
  );

  const chartAnnotations = useMemo((): ChartAnnotation[] => {
    return calendarEvents.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      title: e.title,
      date: normalizeChartDate(e.date) ?? e.date.slice(0, 10),
      status: e.status,
      cost: e.cost,
      collabType: e.collabType,
      videoLink: e.videoLink,
      channelLink: e.channelLink,
      link: e.link,
      notes: e.notes,
    }));
  }, [calendarEvents]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return calendarEvents
      .filter((e) => e.date.slice(0, 10) >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [calendarEvents]);

  return {
    ready,
    posts,
    releases,
    inHouse,
    collabs,
    campaigns,
    trafficUploads,
    calendarEvents,
    chartAnnotations,
    upcoming,
    EVENT_TYPE_LABELS,
  };
}

export type MarketingData = ReturnType<typeof useMarketingData>;
export type { CalendarEvent };
