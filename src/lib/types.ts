export type CollabType = "dedicated" | "integration";
export type CollabStatus = "planned" | "in_progress" | "live" | "completed";

export type MarketingEventType =
  | "tweet"
  | "video_release"
  | "in_house"
  | "collab"
  | "campaign";

export interface Collaboration {
  id: string;
  creatorName: string;
  channelLink: string;
  type: CollabType;
  cost: number;
  status: CollabStatus;
  videoLink?: string;
  scheduledDate: string;
  notes?: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  title: string;
  platform: string;
  scheduledDate: string;
  status: "draft" | "scheduled" | "posted";
  cost?: number;
  link?: string;
  notes?: string;
}

export interface VideoRelease {
  id: string;
  title: string;
  scheduledDate: string;
  status: "planned" | "in_progress" | "live";
  videoLink?: string;
  notes?: string;
}

export interface InHouseVideo {
  id: string;
  title: string;
  scheduledDate: string;
  status: "planned" | "in_production" | "live";
  videoLink?: string;
  cost?: number;
  notes?: string;
}

export interface Campaign {
  id: string;
  name: string;
  scheduledDate: string;
  description?: string;
  cost?: number;
  link?: string;
  notes?: string;
}

export interface TrafficRow {
  date: string;
  sessions?: number;
  users?: number;
  pageviews?: number;
  [key: string]: string | number | undefined;
}

export interface TrafficUpload {
  id: string;
  filename: string;
  uploadedAt: string;
  rows: TrafficRow[];
  primaryMetric: string;
}

export interface CalendarEvent {
  id: string;
  eventType: MarketingEventType;
  title: string;
  date: string;
  status?: string;
  cost?: number;
  collabType?: CollabType;
  videoLink?: string;
  channelLink?: string;
  link?: string;
  notes?: string;
  sourceId: string;
}

export interface ChartAnnotation {
  id: string;
  eventType: MarketingEventType;
  title: string;
  date: string;
  status?: string;
  cost?: number;
  collabType?: CollabType;
  videoLink?: string;
  channelLink?: string;
  link?: string;
  notes?: string;
}

export const EVENT_TYPE_LABELS: Record<MarketingEventType, string> = {
  tweet: "Tweet / Social",
  video_release: "Video Release",
  in_house: "In-House Video",
  collab: "YouTuber Collab",
  campaign: "Campaign",
};

export const EVENT_TYPE_COLORS: Record<MarketingEventType, string> = {
  tweet: "#3b82f6",
  video_release: "#8b5cf6",
  in_house: "#10b981",
  collab: "#f97316",
  campaign: "#ec4899",
};
