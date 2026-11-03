import { View, Text, Pressable } from "react-native";
import { useEffect, useState } from "react";
import {
  scheduleDailyPoetry,
  getSavedNotificationTime,
  requestNotificationPermission
} from "../lib/notifications";
import {
  loadReadingMode,
  saveReadingMode,
  type ReadingMode
} from "../lib/storage";

const TIMES = [
  { label: "8:00 AM", value: "08:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "4:00 PM", value: "16:00" },
  { label: "8:00 PM", value: "20:00" },
  { label: "10:00 PM", value: "22:00" }
];

const READING_MODES: { label: string; value: ReadingMode }[] = [
  { label: "Translation only", value: "translationOnly" },
  { label: "Persian only", value: "persianOnly" },
  { label: "Bilingual", value: "bilingual" }
];

export default function Settings() {
  const [time, setTime] = useState<string | null>(null);
  const [readingMode, setReadingModeState] = useState<ReadingMode | null>(null);

  useEffect(() => {
    getSavedNotificationTime().then(setTime);
    loadReadingMode().then(setReadingModeState);
  }, []);

  async function setReminder(newTime: string) {
    await requestNotificationPermission();
    await scheduleDailyPoetry(newTime);
    setTime(newTime);
  }

  async function setReadingModePreference(mode: ReadingMode) {
    await saveReadingMode(mode);
    setReadingModeState(mode);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0e0e0e",
        padding: 24,
        justifyContent: "center"
      }}
    >
      {/* Title */}
      <Text
        style={{
          color: "#e8e6e3",
          fontSize: 24,
          marginBottom: 12
        }}
      >
        Daily Poetry Reminder
      </Text>

      {/* Description */}
      <Text
        style={{
          color: "#777",
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 32
        }}
      >
        Choose a time to receive a short poem every day.
        A quiet moment, just for you.
      </Text>

      {/* Time options */}
      {TIMES.map((t) => {
        const active = time === t.value;

        return (
          <Pressable
            key={t.value}
            onPress={() => setReminder(t.value)}
            style={{ marginBottom: 20 }}
          >
            <Text
              style={{
                color: active ? "#b59a5a" : "#ccc",
                fontSize: 16
              }}
            >
              {t.label} {active ? "✓" : ""}
            </Text>
          </Pressable>
        );
      })}

      {/* Confirmation */}
      {time && (
        <Text
          style={{
            color: "#666",
            marginTop: 24,
            fontSize: 13
          }}
        >
          You’ll receive poetry daily at {time}.
        </Text>
      )}

      {/* Reading mode section */}
      <View
        style={{
          marginTop: 40
        }}
      >
        <Text
          style={{
            color: "#e8e6e3",
            fontSize: 20,
            marginBottom: 12
          }}
        >
          Reading mode
        </Text>

        {READING_MODES.map((mode) => {
          const active = readingMode === mode.value;

          return (
            <Pressable
              key={mode.value}
              onPress={() => setReadingModePreference(mode.value)}
              style={{ marginBottom: 16 }}
            >
              <Text
                style={{
                  color: active ? "#b59a5a" : "#ccc",
                  fontSize: 16
                }}
              >
                {mode.label} {active ? "✓" : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
