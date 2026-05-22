"use client";

import { useEffect, useMemo, useState } from "react";
import { buildCalendarEvents } from "@/lib/calendar";
import {
  subscribeBacklog,
  subscribeCampaigns,
  subscribeCollaborations,
  subscribeInHouseVideos,
  subscribeSocialPosts,
  subscribeTrafficUploads,
  subscribeVideoReleases,
} from "@/lib/firestore";
import type {
  BacklogItem,
  CalendarEvent,
  Campaign,
  ChartAnnotation,
  Collaboration,
  InHouseVideo,
  SocialPost,
  TrafficUpload,
  VideoRelease,
} from "@/lib/types";
import { EVENT_TYPE_LABELS } from "@/lib/types";

export function useMarketingData() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [releases, setReleases] = useState<VideoRelease[]>([]);
  const [inHouse, setInHouse] = useState<InHouseVideo[]>([]);
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [backlog, setBacklog] = useState<BacklogItem[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [trafficUploads, setTrafficUploads] = useState<TrafficUpload[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubs = [
      subscribeSocialPosts(setPosts),
      subscribeVideoReleases(setReleases),
      subscribeInHouseVideos(setInHouse),
      subscribeCollaborations(setCollabs),
      subscribeBacklog(setBacklog),
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
      date: e.date.slice(0, 10),
      cost: e.cost,
      collabType: e.collabType,
      videoLink: e.videoLink,
      channelLink: e.channelLink,
      link: e.link,
    }));
  }, [calendarEvents]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return calendarEvents.filter((e) => e.date.slice(0, 10) >= today).slice(0, 8);
  }, [calendarEvents]);

  const stats = useMemo(
    () => ({
      activeCollabs: collabs.filter((c) => c.status !== "completed").length,
      liveCollabs: collabs.filter((c) => c.status === "live").length,
      backlogCount: backlog.length,
      upcomingCount: calendarEvents.filter(
        (e) => e.date.slice(0, 10) >= new Date().toISOString().slice(0, 10)
      ).length,
    }),
    [collabs, backlog, calendarEvents]
  );

  return {
    ready,
    posts,
    releases,
    inHouse,
    collabs,
    backlog,
    campaigns,
    trafficUploads,
    calendarEvents,
    chartAnnotations,
    upcoming,
    stats,
    EVENT_TYPE_LABELS,
  };
}

export type MarketingData = ReturnType<typeof useMarketingData>;
export type { CalendarEvent };
