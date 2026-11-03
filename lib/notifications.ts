import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { saveItem, loadItem } from "./storage";
import { getRandomPoemForNotification } from "./random-poem";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export async function requestNotificationPermission() {
  if (Platform.OS === "web") return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }
}


export async function scheduleDailyPoetry(time: string) {
  if (Platform.OS === "web") return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hour, minute] = time.split(":").map(Number);

  const { body, poet } = getRandomPoemForNotification();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🌙 Gulitanimiz",
      body: `${body}\n— ${poet}`,
      sound: true
    },
    trigger: {
      hour,
      minute,
      repeats: true
    }
  });
}

export async function getSavedNotificationTime() {
  return await loadItem("notificationTime");
}
