import { ReactNode } from "react";
import { View, ImageBackground } from "react-native";
import { useTheme } from "../lib/theme-context";

type Props = {
  children: ReactNode;
  padded?: boolean;
};

export default function ScreenWrapper({
  children,
  padded = true
}: Props) {
  const { theme } = useTheme();

  return (
    <ImageBackground
      source={theme.backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Overlay */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme.backgroundOverlay
        }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: padded ? 20 : 0,
            paddingVertical: padded ? 40 : 0
          }}
        >
          {children}
        </View>
      </View>
    </ImageBackground>
  );
}
