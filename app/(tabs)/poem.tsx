import { useEffect, useState, useRef } from "react";
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
      if (source === "saved") {
        const saved = await getSavedPoemsFull();
        setPoems(saved);
      } else if (poetId) {
        setPoems(getPoemsByPoet(poetId));
      } else if (genre) {
        setPoems(getPoemsByGenre(genre));
      } else {
        setPoems(shuffle(getAllPoems()));
      }
    }

    loadPoems();
  }, [source, poetId, genre]);

  // Reset index when filter changes
  useEffect(() => {
    setIndex(0);
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
  const panGesture = Gesture.Pan().activeOffsetX([-20, 20]).failOffsetY([-15, 20]).onEnd((e) => {
    if (e.translationX < -50 && index < poems.length - 1) {
      animateOut(() => {
        setIndex((i) => i + 1);
        animateIn();
      });
    }

    if (e.translationX > 50 && index > 0) {
      animateOut(() => {
        setIndex((i) => i - 1);
        animateIn();
      });
    }
  });

  /* ---------------- loading fallback ---------------- */
  if (!poem || !poet) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text style={{ color: theme.textMuted }}>Loading poetry…</Text>
      </View>
    );
  }

  /* ---------------- render ---------------- */
  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 20
        }}
      >
        {/* 🌿 WELCOME UI — ADD THIS BLOCK */}
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
            transform: [{ translateY }],
            backgroundColor: theme.cardBackground,
            borderRadius: 26,
            padding: 28,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            alignItems: "center",
            maxHeight: "80%" // 👈 IMPORTANT
          }}
        >
          {/* Controls */}
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Pressable onPress={() => setLanguage("en")}>
                <Text
                  style={{
                    color:
                      language === "en"
                        ? theme.accent
                        : theme.textMuted,
                    marginRight: 14
                  }}
                >
                  EN
                </Text>
              </Pressable>
              <Pressable onPress={() => setLanguage("tr")}>
                <Text
                  style={{
                    color:
                      language === "tr"
                        ? theme.accent
                        : theme.textMuted
                  }}
                >
                  TR
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setShowTransliteration(!showTransliteration)}
            >
              <Text
                style={{
                  color: showTransliteration
                    ? theme.accent
                    : theme.textMuted
                }}
              >
                Transliteration
              </Text>
            </Pressable>
          </View>

          {/* Reminder */}
          <Pressable onPress={() => router.push("/settings")}>
            <Text style={{ color: theme.textMuted, marginBottom: 12 }}>
              Daily Poetry Reminder
            </Text>
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Poem */}
            <Text
              style={{
                color: theme.textPrimary,
                fontSize: 28,
                lineHeight: 44,
                textAlign: "center"
              }}
            >
              {poem.original}
            </Text>

            {showTransliteration && (
              <Text
                style={{
                  color: theme.textSecondary,
                  marginVertical: 16,
                  textAlign: "center"
                }}
              >
                {poem.transliteration}
              </Text>
            )}

            <Text
              style={{
                color: theme.textPrimary,
                textAlign: "center",
                marginVertical: 16,
                marginBottom: 24
              }}
            >
              {poem.translations[language]}
            </Text>
          </ScrollView>

          {/* Actions */}
          <View style={{ flexDirection: "row" }}>
            <Pressable
              onPress={async () => {
                animateHeart();
                const updated = await toggleSavedPoem(poem.id);
                setSaved(updated.includes(poem.id));
              }}
              style={{ marginHorizontal: 24 }}
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
                  if (Platform.OS === "web" && navigator.share) {
                    await navigator.share({ text });
                  } else {
                    await Sharing.shareAsync(
                      "data:text/plain;charset=utf-8," +
                        encodeURIComponent(text)
                    );
                  }
                } catch {}
              }}
              style={{ marginHorizontal: 24 }}
            >
              <Text style={{ color: theme.textMuted, fontSize: 22 }}>
                ⤴︎
              </Text>
            </Pressable>
          </View>

          <Text
            style={{
              color: theme.textMuted,
              marginTop: 20
            }}
          >
            — {poet.name}
          </Text>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
