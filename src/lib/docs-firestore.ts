import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type DocOverride = {
  content: string;
  updatedAt: unknown;
  updatedBy: string;
};

function slugToId(slug: string[]): string {
  return slug.join("__");
}

export async function getDocOverride(slug: string[]): Promise<DocOverride | null> {
  const ref = doc(db, "docs_overrides", slugToId(slug));
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as DocOverride;
}

export async function saveDocOverride(
  slug: string[],
  content: string,
  userEmail: string
): Promise<void> {
  const ref = doc(db, "docs_overrides", slugToId(slug));
  await setDoc(ref, {
    content,
    updatedAt: serverTimestamp(),
    updatedBy: userEmail,
  });
}

export async function clearDocOverride(slug: string[]): Promise<void> {
  const ref = doc(db, "docs_overrides", slugToId(slug));
  await deleteDoc(ref);
}
