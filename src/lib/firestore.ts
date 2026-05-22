import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
  type UpdateData,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Campaign,
  Collaboration,
  InHouseVideo,
  SocialPost,
  TrafficUpload,
  VideoRelease,
} from "./types";

function stripUndefined<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as T;
}

function prepareUpdate<T extends Record<string, unknown>>(
  data: Partial<T>
): UpdateData<DocumentData> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = value === undefined ? deleteField() : value;
  }
  return result as UpdateData<DocumentData>;
}

export const COLLECTIONS = {
  socialPosts: "socialPosts",
  videoReleases: "videoReleases",
  inHouseVideos: "inHouseVideos",
  collaborations: "collaborations",
  campaigns: "campaigns",
  trafficUploads: "trafficUploads",
} as const;

function subscribe<T extends { id: string }>(
  name: string,
  sortField: string,
  cb: (items: T[]) => void
): Unsubscribe {
  const q = query(collection(db, name), orderBy(sortField, "asc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
    cb(items);
  });
}

export const subscribeSocialPosts = (cb: (items: SocialPost[]) => void) =>
  subscribe<SocialPost>(COLLECTIONS.socialPosts, "scheduledDate", cb);

export const subscribeVideoReleases = (cb: (items: VideoRelease[]) => void) =>
  subscribe<VideoRelease>(COLLECTIONS.videoReleases, "scheduledDate", cb);

export const subscribeInHouseVideos = (cb: (items: InHouseVideo[]) => void) =>
  subscribe<InHouseVideo>(COLLECTIONS.inHouseVideos, "scheduledDate", cb);

export const subscribeCollaborations = (cb: (items: Collaboration[]) => void) =>
  subscribe<Collaboration>(COLLECTIONS.collaborations, "scheduledDate", cb);

export const subscribeCampaigns = (cb: (items: Campaign[]) => void) =>
  subscribe<Campaign>(COLLECTIONS.campaigns, "scheduledDate", cb);

export const subscribeTrafficUploads = (cb: (items: TrafficUpload[]) => void) => {
  const q = query(collection(db, COLLECTIONS.trafficUploads), orderBy("uploadedAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as TrafficUpload));
  });
};

export async function addSocialPost(data: Omit<SocialPost, "id">) {
  return addDoc(collection(db, COLLECTIONS.socialPosts), stripUndefined(data));
}

export async function updateSocialPost(id: string, data: Partial<SocialPost>) {
  return updateDoc(doc(db, COLLECTIONS.socialPosts, id), prepareUpdate(data));
}

export async function deleteSocialPost(id: string) {
  return deleteDoc(doc(db, COLLECTIONS.socialPosts, id));
}

export async function addVideoRelease(data: Omit<VideoRelease, "id">) {
  return addDoc(collection(db, COLLECTIONS.videoReleases), stripUndefined(data));
}

export async function updateVideoRelease(id: string, data: Partial<VideoRelease>) {
  return updateDoc(doc(db, COLLECTIONS.videoReleases, id), prepareUpdate(data));
}

export async function deleteVideoRelease(id: string) {
  return deleteDoc(doc(db, COLLECTIONS.videoReleases, id));
}

export async function addInHouseVideo(data: Omit<InHouseVideo, "id">) {
  return addDoc(collection(db, COLLECTIONS.inHouseVideos), stripUndefined(data));
}

export async function updateInHouseVideo(id: string, data: Partial<InHouseVideo>) {
  return updateDoc(doc(db, COLLECTIONS.inHouseVideos, id), prepareUpdate(data));
}

export async function deleteInHouseVideo(id: string) {
  return deleteDoc(doc(db, COLLECTIONS.inHouseVideos, id));
}

export async function addCollaboration(data: Omit<Collaboration, "id">) {
  return addDoc(collection(db, COLLECTIONS.collaborations), stripUndefined(data));
}

export async function updateCollaboration(id: string, data: Partial<Collaboration>) {
  return updateDoc(doc(db, COLLECTIONS.collaborations, id), prepareUpdate(data));
}

export async function deleteCollaboration(id: string) {
  return deleteDoc(doc(db, COLLECTIONS.collaborations, id));
}

export async function addCampaign(data: Omit<Campaign, "id">) {
  return addDoc(collection(db, COLLECTIONS.campaigns), stripUndefined(data));
}

export async function updateCampaign(id: string, data: Partial<Campaign>) {
  return updateDoc(doc(db, COLLECTIONS.campaigns, id), prepareUpdate(data));
}

export async function deleteCampaign(id: string) {
  return deleteDoc(doc(db, COLLECTIONS.campaigns, id));
}

export async function addTrafficUpload(data: Omit<TrafficUpload, "id">) {
  return addDoc(collection(db, COLLECTIONS.trafficUploads), data);
}

export async function deleteTrafficUpload(id: string) {
  return deleteDoc(doc(db, COLLECTIONS.trafficUploads, id));
}
