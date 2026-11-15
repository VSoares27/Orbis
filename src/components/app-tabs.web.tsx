import { type Href } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ElementRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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

/**
 * Layout de abas para web (a barra nativa não existe no navegador).
 * Mantém a mesma navegação das abas nativas, com visual da marca.
 */
export default function AppTabsWeb() {
  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} />
      <TabList style={styles.tabList}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <WebTabButton icon={tab.icon}>{tab.label}</WebTabButton>
            </TabTrigger>
          ))}
        </View>
      </TabList>
    </Tabs>
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
        style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
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
  labelFocused: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
