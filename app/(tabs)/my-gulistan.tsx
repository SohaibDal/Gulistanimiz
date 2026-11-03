import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { getSavedPoemsFull } from "../../lib/saved-poems";
import poets from "../../data/poets.json";
import { useTheme } from "../../lib/theme-context";
import { signOut } from "../../lib/auth";
import ScreenWrapper from "../../components/ScreenWrapper";
import { supabase } from "../../lib/supabase";

export default function MyGulistan() {
  const { theme, themeName, setThemeName } = useTheme();
  const [savedPoems, setSavedPoems] = useState<any[]>([]);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
    getSavedPoemsFull().then(setSavedPoems);
  }, []);

  const avatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture;

  const name =
    user?.user_metadata?.full_name ||
    user?.email ||
    "Guest";


  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 60
        }}
      >
        <View
          style={{
            alignItems: "center",
            marginBottom: 28
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.placeholder,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12
            }}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40
                }}
              />
            ) : (
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 32
                }}
              >
                {name.charAt(0)}
              </Text>
            )}
          </View>

          {/* Name */}
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: 18,
              fontFamily: "CormorantGaramond_400Regular"
            }}
          >
            {name}
          </Text>
        </View>


        {/* Title */}
        <Text
          style={{
            color: theme.textPrimary,
            fontSize: 28,
            marginBottom: 28,
            textAlign: "center",
            fontFamily: "CormorantGaramond_400Regular"
          }}
        >
          My Gulistan
        </Text>

        {/* Settings / Preferences */}
        <View
          style={{
            backgroundColor: theme.cardBackground,
            borderRadius: 24,
            padding: 22,
            marginBottom: 32,
            borderWidth: 1,
            borderColor: theme.cardBorder
          }}
        >
          {/* Daily Reminder */}
          <Pressable
            onPress={() => router.push("/settings")}
            style={{ marginBottom: 20 }}
          >
            <Text
              style={{
                color: theme.accent,
                fontSize: 16,
                textAlign: "center"
              }}
            >
              Daily Poetry Reminder
            </Text>
          </Pressable>

          {/* Theme Toggle */}
          <Text
            style={{
              color: theme.textMuted,
              textAlign: "center",
              marginBottom: 12
            }}
          >
            Reading Theme
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center"
            }}
          >
            <Pressable
              onPress={() => setThemeName("dark")}
              style={{ marginHorizontal: 20 }}
            >
              <Text
                style={{
                  color:
                    themeName === "dark"
                      ? theme.accent
                      : theme.textMuted,
                  fontSize: 15
                }}
              >
                Dark
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setThemeName("sepia")}
              style={{ marginHorizontal: 20 }}
            >
              <Text
                style={{
                  color:
                    themeName === "sepia"
                      ? theme.accent
                      : theme.textMuted,
                  fontSize: 15
                }}
              >
                Sepia
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Empty State */}
        {savedPoems.length === 0 && (
          <View
            style={{
              backgroundColor: theme.cardBackground,
              borderRadius: 24,
              padding: 24,
              marginBottom: 32,
              borderWidth: 1,
              borderColor: theme.cardBorder
            }}
          >
            <Text
              style={{
                color: theme.textMuted,
                textAlign: "center"
              }}
            >
              You haven’t saved any poems yet.
            </Text>
          </View>
        )}

        {/* Saved Poems */}
        {savedPoems.map((poem) => {
          const poet = poets.find((p) => p.id === poem.Id);

          return (
            <Pressable
              key={poem.id}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/poem",
                  params: { 
                    poemId: poem.id, 
                    source: "saved"
                  }
                })
              }
              style={{
                backgroundColor: theme.cardBackground,
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: theme.cardBorder
              }}
            >
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 16,
                  marginBottom: 6
                }}
                numberOfLines={2}
              >
                {poem.original}
              </Text>

              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 13
                }}
              >
                — {poet?.name}
              </Text>
            </Pressable>
          );
        })}

        {/* Logout */}
        <Pressable
          onPress={async () => {
            await signOut();
            router.replace("/auth");
          }}
          style={{
            marginTop: 40,
            backgroundColor: theme.danger,
            paddingVertical: 14,
            borderRadius: 28
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontSize: 16
            }}
          >
            Log out
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenWrapper>
  );
}
