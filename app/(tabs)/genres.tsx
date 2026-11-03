import { View, Text, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { getGenresWithCounts } from "../../lib/poems";
import { useTheme } from "../../lib/theme-context";
import ScreenWrapper from "../../components/ScreenWrapper";

const genres = getGenresWithCounts();

export default function Genres() {
  const { theme } = useTheme();

  return (
    <ScreenWrapper>
      <Text
        style={{
          color: theme.textPrimary,
          fontSize: 28,
          marginBottom: 24,
          textAlign: "center",
          fontFamily: "CormorantGaramond_400Regular"
        }}
      >
        Genres
      </Text>

      <FlatList
        data={genres}
        keyExtractor={(item) => item.genre}
        contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/poem",
                params: { genre: item.genre }
              })
            }
            style={{
              backgroundColor: theme.cardBackground,
              borderRadius: 22,
              padding: 22,
              borderWidth: 1,
              borderColor: theme.cardBorder
            }}
          >
            <Text
              style={{
                color: theme.textPrimary,
                fontSize: 18,
                marginBottom: 6
              }}
            >
              {item.genre}
            </Text>

            <Text
              style={{
                color: theme.textMuted,
                fontSize: 13
              }}
            >
              {item.count} poems
            </Text>
          </Pressable>
        )}
      />
    </ScreenWrapper>
  );
}
