import type {
  CalendarEvent,
  Campaign,
  Collaboration,
  InHouseVideo,
  SocialPost,
  VideoRelease,
} from "./types";

export function buildCalendarEvents(
  posts: SocialPost[],
  releases: VideoRelease[],
  inHouse: InHouseVideo[],
  collabs: Collaboration[],
  campaigns: Campaign[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const p of posts) {
    events.push({
      id: `tweet-${p.id}`,
      sourceId: p.id,
      eventType: "tweet",
      title: p.title,
      date: p.scheduledDate,
      status: p.status,
      cost: p.cost,
      link: p.link,
      notes: p.notes,
    });
  }

  for (const v of releases) {
    events.push({
      id: `video-${v.id}`,
      sourceId: v.id,
      eventType: "video_release",
      title: v.title,
      date: v.scheduledDate,
      status: v.status,
      videoLink: v.videoLink,
      notes: v.notes,
    });
  }

  for (const v of inHouse) {
    events.push({
      id: `inhouse-${v.id}`,
      sourceId: v.id,
      eventType: "in_house",
      title: v.title,
      date: v.scheduledDate,
      status: v.status,
      cost: v.cost,
      videoLink: v.videoLink,
      notes: v.notes,
    });
  }

  for (const c of collabs) {
    events.push({
      id: `collab-${c.id}`,
      sourceId: c.id,
      eventType: "collab",
      title: c.creatorName,
      date: c.scheduledDate,
      status: c.status,
      cost: c.cost,
      collabType: c.type,
      videoLink: c.videoLink,
      channelLink: c.channelLink,
      notes: c.notes,
    });
  }

  for (const c of campaigns) {
    events.push({
      id: `campaign-${c.id}`,
      sourceId: c.id,
      eventType: "campaign",
      title: c.name,
      date: c.scheduledDate,
      cost: c.cost,
      link: c.link,
      notes: c.notes ?? c.description,
    });
  }

  return events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const key = e.date.slice(0, 10);
    const list = map.get(key) ?? [];
    list.push(e);
    map.set(key, list);
  }
  return map;
}
