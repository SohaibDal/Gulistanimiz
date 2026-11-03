import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default'
    | 'title'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'link'
    | 'poemTitle'
    | 'poemBody'
    | 'poemTransliteration'
    | 'poemTranslation'
    | 'poemMeta';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'poemTitle' ? styles.poemTitle : undefined,
        type === 'poemBody' ? styles.poemBody : undefined,
        type === 'poemTransliteration'
          ? styles.poemTransliteration
          : undefined,
        type === 'poemTranslation' ? styles.poemTranslation : undefined,
        type === 'poemMeta' ? styles.poemMeta : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
  poemTitle: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '600',
  },
  poemBody: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  poemTransliteration: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  poemTranslation: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  poemMeta: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
