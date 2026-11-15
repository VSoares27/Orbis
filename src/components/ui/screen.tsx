import type { ReactElement, ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  /** Por padrão a tela rola. Use false em telas com lista própria. */
  scroll?: boolean;
  /** Aplica o padding horizontal padrão. */
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Permite pull-to-refresh (ex.: tela de clima). */
  refreshControl?: ReactElement;
};

/**
 * Container base das telas.
 * - Cuida do safe area no topo (as abas nativas cuidam da parte de baixo).
 * - Centraliza o conteúdo em tablets/web com largura máxima confortável.
 */
export function Screen({ children, scroll = true, padded = true, contentStyle, refreshControl }: ScreenProps) {
  const padding = padded ? styles.padded : undefined;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, padding, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Brand.cream,
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  padded: {
    paddingHorizontal: Spacing.three,
  },
  flex: {
    flex: 1,
  },
});
