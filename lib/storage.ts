import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReadingMode = "translationOnly" | "persianOnly" | "bilingual";

const READING_MODE_KEY = "readingMode";

export async function saveItem(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function loadItem(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function saveReadingMode(mode: ReadingMode) {
  await saveItem(READING_MODE_KEY, mode);
}

export async function loadReadingMode(): Promise<ReadingMode | null> {
  const value = await loadItem(READING_MODE_KEY);

  if (
    value === "translationOnly" ||
    value === "persianOnly" ||
    value === "bilingual"
  ) {
    return value;
  }

  return null;
}
