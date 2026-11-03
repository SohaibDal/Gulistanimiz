import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllPoems } from "./poems";

const STORAGE_KEY = "savedPoems";

/* ---------- helpers ---------- */

async function getSavedIds(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/* ---------- public API ---------- */

// Toggle save / unsave
export async function toggleSavedPoem(poemId: number): Promise<number[]> {
  const saved = await getSavedIds();

  let updated: number[];
  if (saved.includes(poemId)) {
    updated = saved.filter((id) => id !== poemId);
  } else {
    updated = [...saved, poemId];
  }

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// Check if poem is saved
export async function isPoemSaved(poemId: number): Promise<boolean> {
  const saved = await getSavedIds();
  return saved.includes(poemId);
}

// 🔑 IDs only (optional utility)
export async function getSavedPoems(): Promise<number[]> {
  return getSavedIds();
}

// ✅ FULL poems (THIS WAS MISSING)
export async function getSavedPoemsFull() {
  const savedIds = await getSavedIds();
  const allPoems = getAllPoems();

  return allPoems.filter((poem) => savedIds.includes(poem.id));
}
