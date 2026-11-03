import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/theme-context";

export default function TabLayout() {
  const { theme } = useTheme(); // ✅ hook INSIDE component

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 70
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 6
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          )
        }}
      />

      <Tabs.Screen
        name="writers"
        options={{
          title: "Writers",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          )
        }}
      />

      <Tabs.Screen
        name="genres"
        options={{
          title: "Genres",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          )
        }}
      />

      <Tabs.Screen
        name="my-gulistan"
        options={{
          title: "My Gulistan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          )
        }}
      />

      {/* Hidden reader route */}
      <Tabs.Screen
        name="poem"
        options={{ href: null }}
      />
    </Tabs>
  );
}
