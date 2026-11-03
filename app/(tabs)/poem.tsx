import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Platform,
  ScrollView
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";

import { loadItem } from "../../lib/storage";
import {
  getAllPoems,
  getPoemsByPoet,
  getPoemsByGenre
} from "../../lib/poems";
import {
  isPoemSaved,
  toggleSavedPoem,
  getSavedPoemsFull
} from "../../lib/saved-poems";
import poets from "../../data/poets.json";
import { useTheme } from "../../lib/theme-context";
import { supabase } from "../../lib/supabase";
import { getGreeting } from "../../lib/greeting";
import ScreenWrapper from "../../components/ScreenWrapper";
import { ThemedText } from "../../components/themed-text";

export default function Poem() {
  const { theme } = useTheme();

  const { poetId, genre, poemId, source } = useLocalSearchParams<{
    poetId?: string;
    genre?: string;
    poemId?: string;
    source?: string;
  }>();

  /* ------------------ utils ------------------ */
  function shuffle<T>(array: T[]) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /* ------------------ state ------------------ */
  const [poems, setPoems] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState<"en" | "tr">("en");
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [saved, setSaved] = useState(false);
  const [userName, setUserName] = useState<string>("Guest");
  const [isLoading, setIsLoading] = useState(true);

  const initialFiltersRef = useRef<{ poetId?: string; genre?: string; source?: string } | null>(null);

  const poem = poems[index];
  const poet = poem ? poets.find((p) => p.id === poem.poetId) : null;

  /* ---------------- animations ---------------- */
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  function animateIn() {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        useNativeDriver: true
      })
    ]).start();
  }

  function animateOut(cb: () => void) {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 12,
        duration: 140,
        useNativeDriver: true
      })
    ]).start(cb);
  }

  function animateHeart() {
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.4,
        friction: 5,
        useNativeDriver: true
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true
      })
    ]).start();
  }

  /* ---------------- effects ---------------- */

  // Load poems (home / filtered / saved)
  useEffect(() => {
    async function loadPoems() {
      setIsLoading(true);

      if (source === "saved") {
        const savedPoems = await getSavedPoemsFull();
        setPoems(savedPoems);
      } else if (poetId) {
        setPoems(getPoemsByPoet(poetId));
      } else if (genre) {
        setPoems(getPoemsByGenre(genre));
      } else {
        setPoems(shuffle(getAllPoems()));
      }

      setIsLoading(false);
    }

    loadPoems();
  }, [source, poetId, genre]);

  // Track initial filters so we only reset index when filter context truly changes.
  useEffect(() => {
    const currentFilters = { poetId, genre, source };

    if (!initialFiltersRef.current) {
      initialFiltersRef.current = currentFilters;
      return;
    }

    const filtersChanged =
      initialFiltersRef.current.poetId !== poetId ||
      initialFiltersRef.current.genre !== genre ||
      initialFiltersRef.current.source !== source;

    if (filtersChanged) {
      initialFiltersRef.current = currentFilters;
      setIndex(0);
    }
  }, [poetId, genre, source]);

  // Preferences
  useEffect(() => {
    loadItem("language").then((l) => l && setLanguage(l));
    loadItem("transliteration").then(
      (t) => t !== null && setShowTransliteration(t)
    );
  }, []);

  // Saved state
  useEffect(() => {
    if (!poem) return;
    isPoemSaved(poem.id).then(setSaved);
  }, [poem?.id]);

  // Jump to poem when opened from My Gulistan
  useEffect(() => {
    if (!poemId || poems.length === 0) return;
    const idx = poems.findIndex((p) => p.id === Number(poemId));
    if (idx >= 0) setIndex(idx);
  }, [poemId, poems]);

  // Initial animation
  useEffect(() => {
    animateIn();
  }, []);

  // load user once
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;

      const name =
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0];

      if (name) setUserName(name);
    });
  }, []);

  /* ---------------- gestures ---------------- */
  // Horizontal pan gesture: only react to clear left / right swipes and
  // ignore mostly vertical movement so the card feels stable.
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 20])
    .onEnd((e) => {
      // Swipe left → next poem (if any)
      if (e.translationX < -50 && index < poems.length - 1) {
        animateOut(() => {
          setIndex((i) => i + 1);
          animateIn();
        });
      }

      // Swipe right → previous poem (if any)
      if (e.translationX > 50 && index > 0) {
        animateOut(() => {
          setIndex((i) => i - 1);
          animateIn();
        });
      }
    });

  /* ---------------- derived helpers ---------------- */
  const poemTitle = poem
    ? (poem.original as string).split("\n")[0]
    : "";

  const poemBodyOriginal = poem
    ? (poem.original as string).split("\n").slice(1).join("\n")
    : "";

  /* ---------------- loading & empty states ---------------- */
  const renderLoading = () => (
    <ScreenWrapper padded={false}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <ThemedText style={{ color: theme.textMuted }}>
          Loading poetry…
        </ThemedText>
      </View>
    </ScreenWrapper>
  );

  const renderEmpty = () => (
    <ScreenWrapper padded={false}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24
        }}
      >
        <ThemedText
          type="subtitle"
          style={{
            color: theme.textPrimary,
            textAlign: "center",
            marginBottom: 8
          }}
        >
          No poems to show.
        </ThemedText>
        <ThemedText
          style={{
            color: theme.textMuted,
            fontSize: 14,
            textAlign: "center"
          }}
        >
          {source === "saved"
            ? "You haven’t saved any poems yet. Save a poem to see it here."
            : "Please try a different filter or come back later."}
        </ThemedText>
      </View>
    </ScreenWrapper>
  );

  if (isLoading) {
    return renderLoading();
  }

  if (!poems.length || !poem || !poet) {
    return renderEmpty();
  }

  const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  } as const;

  /* ---------------- render ---------------- */
  return (
    <ScreenWrapper padded={false}>
      <GestureDetector gesture={panGesture}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.xl
          }}
        >
          {/* Greeting / header */}
          <View
            style={{
              marginBottom: spacing.lg,
              alignItems: "center"
            }}
          >
            <ThemedText
              style={{
                color: theme.textMuted,
                fontSize: 14,
                textAlign: "center",
                letterSpacing: 0.4
              }}
            >
              {getGreeting()}, {userName}
            </ThemedText>

            <ThemedText
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                textAlign: "center",
                marginTop: spacing.xs,
                fontStyle: "italic"
              }}
            >
              May a verse find you today...
            </ThemedText>
          </View>

          {/* Full-screen poem card */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Animated.View
              style={{
                opacity: fade,
                transform: [{ translateY }],
                backgroundColor: theme.cardBackground,
                borderRadius: 26,
                padding: spacing.xl,
                borderWidth: 1,
                borderColor: theme.cardBorder,
                flex: 1
              }}
            >
              {/* Card header / controls */}
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: spacing.md
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Pressable onPress={() => setLanguage("en")}>
                    <ThemedText
                      style={{
                        color:
                          language === "en"
                            ? theme.accent
                            : theme.textMuted,
                        marginRight: spacing.md
                      }}
                    >
                      EN
                    </ThemedText>
                  </Pressable>
                  <Pressable onPress={() => setLanguage("tr")}>
                    <ThemedText
                      style={{
                        color:
                          language === "tr"
                            ? theme.accent
                            : theme.textMuted
                      }}
                    >
                      TR
                    </ThemedText>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() =>
                    setShowTransliteration(!showTransliteration)
                  }
                >
                  <ThemedText
                    style={{
                      color: showTransliteration
                        ? theme.accent
                        : theme.textMuted
                    }}
                  >
                    Transliteration
                  </ThemedText>
                </Pressable>
              </View>

              {/* Reminder link */}
              <Pressable
                onPress={() => router.push("/settings")}
                style={{ marginBottom: spacing.sm }}
              >
                <ThemedText
                  type="link"
                  style={{
                    color: theme.textMuted,
                    textAlign: "center"
                  }}
                >
                  Daily Poetry Reminder
                </ThemedText>
              </Pressable>

              {/* Poem content */}
              <View style={{ flex: 1, marginTop: spacing.sm }}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: spacing.xl }}
                >
                  {/* Title / first line */}
                  <ThemedText
                    type="poemTitle"
                    style={{
                      color: theme.textPrimary,
                      marginBottom: poemBodyOriginal ? spacing.md : spacing.lg
                    }}
                  >
                    {poemTitle}
                  </ThemedText>

                  {/* Remaining original body, if any */}
                  {poemBodyOriginal ? (
                    <ThemedText
                      type="poemBody"
                      style={{
                        color: theme.textPrimary,
                        marginBottom: spacing.lg
                      }}
                    >
                      {poemBodyOriginal}
                    </ThemedText>
                  ) : null}

                  {/* Transliteration */}
                  {showTransliteration && poem.transliteration && (
                    <ThemedText
                      type="poemTransliteration"
                      style={{
                        color: theme.textSecondary,
                        marginVertical: spacing.md
                      }}
                    >
                      {poem.transliteration}
                    </ThemedText>
                  )}

                  {/* Translation */}
                  <ThemedText
                    type="poemTranslation"
                    style={{
                      color: theme.textPrimary,
                      marginTop: spacing.md,
                      marginBottom: spacing.xl
                    }}
                  >
                    {poem.translations[language]}
                  </ThemedText>
                </ScrollView>
              </View>

              {/* Actions / footer */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: spacing.sm
                }}
              >
                <Pressable
                  onPress={async () => {
                    animateHeart();
                    const updated = await toggleSavedPoem(poem.id);
                    setSaved(updated.includes(poem.id));
                  }}
                  style={{ marginHorizontal: spacing.lg }}
                >
                  <Animated.Text
                    style={{
                      color: saved ? "#e63946" : theme.textMuted,
                      fontSize: 22,
                      transform: [{ scale: heartScale }]
                    }}
                  >
                    ♥
                  </Animated.Text>
                </Pressable>

                <Pressable
                  onPress={async () => {
                    const text = `${poem.original}\n\n${poem.translations[language]}\n\n— ${poet.name}\nGulistanimiz`;
                    try {
                      // Web share uses the native navigator API; native uses expo-sharing.
                      if (Platform.OS === "web" && (navigator as any)?.share) {
                        await (navigator as any).share({ text });
                      } else {
                        await Sharing.shareAsync(
                          "data:text/plain;charset=utf-8," +
                            encodeURIComponent(text)
                        );
                      }
                    } catch {}
                  }}
                  style={{ marginHorizontal: spacing.lg }}
                >
                  <Text
                    style={{ color: theme.textMuted, fontSize: 22 }}
                  >
                    ⤴︎
                  </Text>
                </Pressable>
              </View>

              <ThemedText
                type="poemMeta"
                style={{
                  color: theme.textMuted,
                  textAlign: "center"
                }}
              >
                — {poet.name}
              </ThemedText>
            </Animated.View>
          </View>
        </View>
      </GestureDetector>
    </ScreenWrapper>
  );
}
