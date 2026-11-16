import { router, usePathname, type Href } from 'expo-router';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ElementRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './ui/icon';
import { AppText } from './ui/text';

import { Brand, PhoneFrameWidth, Radii, Shadows, Spacing } from '@/constants/theme';
import { setLanguage, t, toggleLanguage, useLanguage, type Language } from '@/lib/i18n';
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

/** A aba está ativa quando a rota atual é ela ou uma rota dentro dela. */
function isActiveTab(pathname: string, href: string) {
  if (href === '/') return pathname === '/' || pathname === '/index';
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
 *
 * Idioma: no computador, um seletor "PT · EN" fica fora da moldura, no canto;
 * no celular, um botão compacto fica no fim da barra de abas.
 */
export default function AppTabsWeb() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const framed = width > FRAME_BREAKPOINT;
  const language = useLanguage();

  return (
    <View style={[styles.backdrop, framed && styles.backdropFramed]}>
      {framed && <LanguageSwitch language={language} />}
      <View style={[styles.device, framed && styles.deviceFramed]}>
        <Tabs style={styles.root}>
          <TabSlot style={styles.slot} />
          <TabList
            style={[styles.tabList, { paddingBottom: Spacing.two + (framed ? 0 : insets.bottom) }]}>
            <View style={styles.tabBar} role="tablist">
              {tabs.map((tab) => (
                <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                  <WebTabButton
                    icon={tab.icon}
                    target={tab.href}
                    active={isActiveTab(pathname, String(tab.href))}>
                    {tab.label}
                  </WebTabButton>
                </TabTrigger>
              ))}
              {!framed && <LanguageTabButton language={language} />}
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
 *
 * No export web, o `onPress` e o `isFocused` do TabTrigger não funcionam (o
 * toque não trocava de aba e nenhuma aba aparecia ativa). Por isso a navegação
 * usa `router.navigate`, o mesmo caminho dos atalhos da tela Início, e a aba
 * ativa vem da rota atual. O TabTrigger continua registrando as rotas.
 */
const WebTabButton = forwardRef<
  ElementRef<typeof Pressable>,
  TabTriggerSlotProps & { icon: IconName; target: Href; active: boolean }
>(function WebTabButton(
  { children, icon, target, active, isFocused: _isFocused, onPress: _onPress, style, ...props },
  ref,
) {
  const language = useLanguage(); // redesenha o rótulo ao trocar o idioma
  return (
    <Pressable
      ref={ref}
      {...props}
      onPress={() => {
        if (!active) router.navigate(target);
      }}
      role="tab"
      aria-label={
        typeof children === 'string' ? (language === 'en' ? t(children) : children) : undefined
      }
      aria-selected={active}
      style={({ pressed }) => [styles.tab, active && styles.tabFocused, pressed && styles.pressed]}>
      <Icon name={icon} size={20} color={active ? Brand.green : Brand.textMuted} />
      <AppText
        variant="caption"
        tone={active ? 'brand' : 'muted'}
        style={active ? styles.labelFocused : undefined}>
        {children}
      </AppText>
    </Pressable>
  );
});

/** Seletor "PT · EN" fora da moldura (computador e tablet). */
function LanguageSwitch({ language }: { language: Language }) {
  return (
    <View style={styles.switchWrap} role="radiogroup" aria-label="Idioma / Language">
      <Icon name="translate" size={18} color={Brand.cream} />
      {(['pt', 'en'] as const).map((option) => {
        const selected = option === language;
        return (
          <Pressable
            key={option}
            role="radio"
            aria-checked={selected}
            aria-label={option === 'pt' ? 'Português' : 'English'}
            onPress={() => setLanguage(option)}
            style={({ pressed }) => [
              styles.switchOption,
              selected && styles.switchOptionSelected,
              pressed && styles.pressed,
            ]}>
            <AppText variant="label" style={{ color: selected ? Brand.green : Brand.cream }}>
              {option === 'pt' ? 'PT' : 'EN'}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Botão compacto de idioma no fim da barra de abas (celular). */
function LanguageTabButton({ language }: { language: Language }) {
  const target = language === 'pt' ? 'EN' : 'PT';
  return (
    <Pressable
      role="button"
      aria-label={language === 'pt' ? 'Switch to English' : 'Mudar para português'}
      onPress={toggleLanguage}
      style={({ pressed }) => [styles.tab, styles.languageTab, pressed && styles.pressed]}>
      <Icon name="translate" size={20} color={Brand.textMuted} />
      <AppText variant="caption" tone="muted" style={styles.labelFocused}>
        {target}
      </AppText>
    </Pressable>
  );
}

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
  languageTab: {
    flex: 0,
    minWidth: 44,
  },
  switchWrap: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.one,
    paddingLeft: Spacing.two,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(244, 239, 230, 0.35)',
  },
  switchOption: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
  },
  switchOptionSelected: {
    backgroundColor: Brand.cream,
  },
  pressed: {
    opacity: 0.7,
  },
});
