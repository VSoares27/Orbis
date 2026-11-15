import { type Href } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ElementRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Icon } from './ui/icon';
import { AppText } from './ui/text';

import { Brand, Radii, Shadows, Spacing } from '@/constants/theme';
import type { IconName } from '@/types';

type TabItem = {
  name: string;
  href: Href;
  label: string;
  icon: IconName;
};

const tabs: TabItem[] = [
  { name: 'index', href: '/', label: 'Início', icon: 'home-variant-outline' },
  { name: 'clima', href: '/clima', label: 'Clima', icon: 'weather-partly-cloudy' },
  { name: 'lavouras', href: '/lavouras', label: 'Lavouras', icon: 'sprout' },
  { name: 'caderneta', href: '/caderneta', label: 'Caderneta', icon: 'notebook-outline' },
];

/** Largura do "celular" quando o app é aberto num navegador largo. */
const PHONE_WIDTH = 430;
/** Acima desta largura de janela, o app aparece dentro da moldura. */
const FRAME_BREAKPOINT = 520;
/** Abaixo desta largura, as abas ficam mais compactas para caber. */
const COMPACT_TABS_BREAKPOINT = 400;

/**
 * Layout de abas para web (a barra nativa não existe no navegador).
 * Mantém a mesma navegação das abas nativas, com visual da marca.
 *
 * O Orbis é mobile-first: num navegador largo (computador), o app aparece numa
 * coluna com largura de celular, centralizada; num celular, ocupa a tela toda.
 */
export default function AppTabsWeb() {
  const { width } = useWindowDimensions();
  const framed = width > FRAME_BREAKPOINT;
  const compact = Math.min(width, PHONE_WIDTH) < COMPACT_TABS_BREAKPOINT;

  return (
    <View style={[styles.backdrop, framed && styles.backdropFramed]}>
      <View style={[styles.device, framed && styles.deviceFramed]}>
        <Tabs style={styles.root}>
          <TabSlot style={styles.slot} />
          <TabList style={styles.tabList}>
            <View style={styles.tabBar}>
              {tabs.map((tab) => (
                <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                  <WebTabButton icon={tab.icon} compact={compact}>
                    {tab.label}
                  </WebTabButton>
                </TabTrigger>
              ))}
            </View>
          </TabList>
        </Tabs>
      </View>
    </View>
  );
}

/**
 * `asChild` exige que o componente aceite e encaminhe `ref`.
 * Por isso usamos forwardRef em volta do Pressable.
 */
const WebTabButton = forwardRef<
  ElementRef<typeof Pressable>,
  TabTriggerSlotProps & { icon: IconName; compact?: boolean }
>(
  function WebTabButton({ children, isFocused, icon, compact, style, ...props }, ref) {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={({ pressed }) => [
          styles.tab,
          compact && styles.tabCompact,
          pressed && styles.pressed,
        ]}>
        <Icon
          name={icon}
          size={compact ? 18 : 20}
          color={isFocused ? Brand.green : Brand.textMuted}
        />
        <AppText
          variant="caption"
          tone={isFocused ? 'brand' : 'muted'}
          style={isFocused ? styles.labelFocused : undefined}>
          {children}
        </AppText>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Brand.cream,
  },
  backdropFramed: {
    backgroundColor: Brand.greenDark,
    paddingVertical: Spacing.three,
  },
  device: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: Brand.cream,
    overflow: 'hidden',
  },
  deviceFramed: {
    maxWidth: PHONE_WIDTH,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Brand.border,
    ...Shadows.floating,
  },
  root: {
    flex: 1,
    backgroundColor: Brand.cream,
  },
  slot: {
    flex: 1,
  },
  tabList: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Brand.cream,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    alignSelf: 'center',
    backgroundColor: Brand.surface,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: Spacing.one,
    ...Shadows.floating,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
  },
  tabCompact: {
    flexDirection: 'column',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: Spacing.two,
  },
  labelFocused: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
