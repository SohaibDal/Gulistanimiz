import { View, Text, Pressable } from "react-native";
import { useEffect, useState } from "react";
import {
  scheduleDailyPoetry,
  getSavedNotificationTime,
  requestNotificationPermission
} from "../lib/notifications";

const TIMES = [
  { label: "8:00 AM", value: "08:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "4:00 PM", value: "16:00" },
  { label: "8:00 PM", value: "20:00" },
  { label: "10:00 PM", value: "22:00" }
];

export default function Settings() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    getSavedNotificationTime().then(setTime);
  }, []);

  async function setReminder(newTime: string) {
    await requestNotificationPermission();
    await scheduleDailyPoetry(newTime);
    setTime(newTime);
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
    </View>
  );
}
