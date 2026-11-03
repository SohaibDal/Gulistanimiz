import { View, Text, Pressable, FlatList, Image } from "react-native";
import { router } from "expo-router";
import { getPoetsWithCounts } from "../../lib/poems";
import { poetImages } from "../../lib/poet-images";
import { useTheme } from "../../lib/theme-context";
import ScreenWrapper from "../../components/ScreenWrapper";

const poets = getPoetsWithCounts();

export default function Writers() {
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
        Persian Poets
      </Text>

      <FlatList
        data={poets}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          // ✅ Resolve image safely
          const imageSource =
            item.image && poetImages[item.image]
              ? poetImages[item.image]
              : null;

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/poem",
                  params: { poetId: item.id }
                })
              }
              style={{
                flex: 1,
                backgroundColor: theme.cardBackground,
                borderRadius: 22,
                padding: 18,
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.cardBorder
              }}
            >
              {/* Avatar */}
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: theme.placeholder,
                  marginBottom: 12,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {imageSource ? (
                  <Image
                    source={imageSource}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 36
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontSize: 24,
                      fontFamily: "CormorantGaramond_400Regular"
                    }}
                  >
                    {item.name.charAt(0)}
                  </Text>
                )}
              </View>

              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 16,
                  marginBottom: 4,
                  textAlign: "center"
                }}
              >
                {item.name}
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 13,
                  marginBottom: 6,
                  textAlign: "center"
                }}
              >
                {item.originalName}
              </Text>

              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 12
                }}
              >
                {item.count} poems
              </Text>
            </Pressable>
          );
        }}
      />
    </ScreenWrapper>
  );
}
