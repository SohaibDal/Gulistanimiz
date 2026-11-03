import { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Image,
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
  getPoemsByGenre,
  Poem
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

// In-memory session state for the poem tab only (no cross-launch persistence)
let lastSessionPoemIndex: number | null = null;

export default function PoemScreen() {
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
  const [poems, setPoems] = useState<Poem[]>([]);
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState<"en" | "tr">("en");
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [saved, setSaved] = useState(false);
  const [userName, setUserName] = useState<string>("Guest");

  const poem = poems[index];
  const poet = useMemo(
    () => (poem ? poets.find((p) => p.id === poem.poetId) : null),
    [poem]
  );

  const isEdge = poems.length <= 1 || index === 0 || index === poems.length - 1;

  /* ---------------- animations ---------------- */
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const edgeNudge = useRef(new Animated.Value(0)).current;

  function animateIn() {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
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
        toValue: 8,
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

  function animateEdgeNudge(direction: "left" | "right") {
    const sign = direction === "left" ? -1 : 1;

    Animated.sequence([
      Animated.timing(edgeNudge, {
        toValue: 8 * sign,
        duration: 90,
        useNativeDriver: true
      }),
      Animated.timing(edgeNudge, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true
      })
    ]).start();
  }

  /* ---------------- effects ---------------- */

  // Load poems (home / filtered / saved)
  useEffect(() => {
    async function loadPoems() {
      let loaded: Poem[] = [];

      if (source === "saved") {
        loaded = await getSavedPoemsFull();
      } else if (poetId) {
        loaded = getPoemsByPoet(poetId);
      } else if (genre) {
        loaded = getPoemsByGenre(genre);
      } else {
        loaded = shuffle(getAllPoems());
      }

      setPoems(loaded);

      // Decide initial index based on params / session state
      let initialIndex = 0;

      if (poemId) {
        const idx = loaded.findIndex((p) => p.id === Number(poemId));
        if (idx >= 0) {
          initialIndex = idx;
        }
      } else if (lastSessionPoemIndex !== null && lastSessionPoemIndex < loaded.length) {
        initialIndex = lastSessionPoemIndex;
      }

      setIndex(initialIndex);
    }

    loadPoems();
  }, [source, poetId, genre, poemId]);

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

  // Keep last visible index in memory for this session
  useEffect(() => {
    lastSessionPoemIndex = index;
  }, [index]);

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
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      if (!poems.length) return;

      const { translationX, velocityX } = e;
      const swipePower = translationX + velocityX * 0.05;

      const threshold = 50;

      // Next
      if (swipePower < -threshold) {
        if (index < poems.length - 1) {
          animateOut(() => {
            setIndex((i) => Math.min(i + 1, poems.length - 1));
            animateIn();
          });
        } else {
          animateEdgeNudge("left");
        }
      }

      // Previous
      if (swipePower > threshold) {
        if (index > 0) {
          animateOut(() => {
            setIndex((i) => Math.max(i - 1, 0));
            animateIn();
          });
        } else {
          animateEdgeNudge("right");
        }
      }
    });

  /* ---------------- empty / loading ---------------- */
  if (!poems.length) {
    return (
      <ScreenWrapper>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text
            style={{
              color: theme.textMuted,
              fontSize: 16,
              textAlign: "center"
            }}
          >
            No poems to show right now.
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 13,
              textAlign: "center",
              marginTop: 6
            }}
          >
            Try changing your filter or saving a few favorites first.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!poem || !poet) {
    return (
      <ScreenWrapper>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text
            style={{
              color: theme.textMuted,
              fontSize: 16
            }}
          >
            Loading poetry…
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  /* ---------------- render ---------------- */
  return (
    <ScreenWrapper padded={false}>
      <GestureDetector gesture={panGesture}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            paddingVertical: 32
          }}
        >
          {/* Greeting / header */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                color: theme.textMuted,
                fontSize: 14,
                textAlign: "center",
                letterSpacing: 0.4
              }}
            >
              {getGreeting()}, {userName}
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                textAlign: "center",
                marginTop: 4,
                fontStyle: "italic"
              }}
            >
              May a verse find you today...
            </Text>
          </View>

          <Animated.View
            style={{
              opacity: fade,
              transform: [
                { translateY },
                { translateX: edgeNudge }
              ],
              backgroundColor: theme.cardBackground,
              borderRadius: 26,
              padding: 22,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              maxHeight: "82%"
            }}
          >
            {/* Top controls */}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable
                  hitSlop={8}
                  onPress={() => setLanguage("en")}
                >
                  <Text
                    style={{
                      color:
                        language === "en"
                          ? theme.accent
                          : theme.textMuted,
                      marginRight: 14,
                      fontSize: 13
                    }}
                  >
                    EN
                  </Text>
                </Pressable>
                <Pressable
                  hitSlop={8}
                  onPress={() => setLanguage("tr")}
                >
                  <Text
                    style={{
                      color:
                        language === "tr"
                          ? theme.accent
                          : theme.textMuted,
                      fontSize: 13
                    }}
                  >
                    TR
                  </Text>
                </Pressable>
              </View>

              <Pressable
                hitSlop={8}
                onPress={() => setShowTransliteration(!showTransliteration)}
              >
                <Text
                  style={{
                    color: showTransliteration
                      ? theme.accent
                      : theme.textMuted,
                    fontSize: 12
                  }}
                >
                  Transliteration
                </Text>
              </Pressable>
            </View>

            {/* Daily reminder link */}
            <Pressable
              onPress={() => router.push("/settings")}
              style={{ marginBottom: 12 }}
            >
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 12,
                  textAlign: "right"
                }}
              >
                Daily Poetry Reminder
              </Text>
            </Pressable>

            {/* Poem content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 26,
                  lineHeight: 40,
                  textAlign: "center"
                }}
              >
                {poem.original}
              </Text>

              {showTransliteration && !!poem.transliteration && (
                <Text
                  style={{
                    color: theme.textSecondary,
                    marginTop: 16,
                    textAlign: "center",
                    fontSize: 14
                  }}
                >
                  {poem.transliteration}
                </Text>
              )}

              <Text
                style={{
                  color: theme.textPrimary,
                  textAlign: "center",
                  marginTop: 20,
                  fontSize: 15
                }}
              >
                {poem.translations[language]}
              </Text>
            </ScrollView>

            {/* Bottom actions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable
                  onPress={async () => {
                    animateHeart();
                    const updated = await toggleSavedPoem(poem.id);
                    setSaved(updated.includes(poem.id));
                  }}
                  style={{ marginRight: 24 }}
                  hitSlop={8}
                >
                  <Animated.Text
                    style={{
                      color: saved ? theme.danger : theme.textMuted,
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
                      if (Platform.OS === "web" && (navigator as any).share) {
                        await (navigator as any).share({ text });
                      } else {
                        await Sharing.shareAsync(
                          "data:text/plain;charset=utf-8," +
                            encodeURIComponent(text)
                        );
                      }
                    } catch {
                      // ignore share errors
                    }
                  }}
                  hitSlop={8}
                >
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontSize: 20
                    }}
                  >
                    ⤴︎
                  </Text>
                </Pressable>
              </View>

              {/* Simple index / hint */}
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 12
                }}
              >
                {index + 1} / {poems.length}
              </Text>
            </View>

            <View style={{ marginTop: 12, alignItems: "center" }}>
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 13
                }}
              >
                — {poet.name}
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 11,
                  marginTop: 6
                }}
              >
                {isEdge ? "Swipe to explore poems" : "Swipe left or right"}
              </Text>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
    </ScreenWrapper>
  );
}
