import { type Href } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ElementRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './ui/icon';
import { AppText } from './ui/text';

import { Brand, PhoneFrameWidth, Radii, Shadows, Spacing } from '@/constants/theme';
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

/** Acima desta largura de janela, o app aparece dentro da moldura de celular. */
const FRAME_BREAKPOINT = 520;

/**
 * Layout de abas para web (a barra nativa não existe no navegador).
 * Mantém a mesma navegação das abas nativas, com visual da marca.
 *
 * O Orbis é mobile-first: num navegador largo (computador), o app aparece numa
 * coluna com largura de celular, centralizada; num celular, ocupa a tela toda.
 * As abas seguem o padrão de celular (ícone sobre o texto) e respeitam a área
 * segura de baixo (barra de gestos do iPhone).
 */
export default function AppTabsWeb() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const framed = width > FRAME_BREAKPOINT;

  return (
    <View style={[styles.backdrop, framed && styles.backdropFramed]}>
      <View style={[styles.device, framed && styles.deviceFramed]}>
        <Tabs style={styles.root}>
          <TabSlot style={styles.slot} />
          <TabList
            style={[styles.tabList, { paddingBottom: Spacing.two + (framed ? 0 : insets.bottom) }]}>
            <View style={styles.tabBar}>
              {tabs.map((tab) => (
                <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                  <WebTabButton icon={tab.icon}>{tab.label}</WebTabButton>
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
const WebTabButton = forwardRef<ElementRef<typeof Pressable>, TabTriggerSlotProps & { icon: IconName }>(
  function WebTabButton({ children, isFocused, icon, style, ...props }, ref) {
    return (
      <Pressable
        ref={ref}
        {...props}
        style={({ pressed }) => [
          styles.tab,
          isFocused && styles.tabFocused,
          pressed && styles.pressed,
        ]}>
        <Icon name={icon} size={20} color={isFocused ? Brand.green : Brand.textMuted} />
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
    maxWidth: PhoneFrameWidth,
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
    justifyContent: 'space-between',
    gap: Spacing.one,
    width: '100%',
    backgroundColor: Brand.surface,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Brand.border,
    padding: Spacing.one,
    ...Shadows.floating,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    minHeight: 48,
    paddingVertical: 6,
    paddingHorizontal: Spacing.one,
    borderRadius: Radii.pill,
  },
  tabFocused: {
    backgroundColor: Brand.greenSoft,
  },
  labelFocused: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
