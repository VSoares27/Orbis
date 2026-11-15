import { NativeTabs } from 'expo-router/native-tabs';

import { Brand } from '@/constants/theme';

/**
 * Barra de abas nativa (iOS/Android).
 * Os ícones usam SF Symbols no iOS e Material Symbols no Android.
 */
export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Brand.cream}
      tintColor={Brand.green}
      indicatorColor={Brand.greenSoft}
      labelStyle={{
        default: { color: Brand.textSecondary, fontSize: 11 },
        selected: { color: Brand.green, fontSize: 11, fontWeight: '700' },
      }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="clima">
        <NativeTabs.Trigger.Label>Clima</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'cloud.sun', selected: 'cloud.sun.fill' }}
          md="partly_cloudy_day"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="lavouras">
        <NativeTabs.Trigger.Label>Lavouras</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'leaf', selected: 'leaf.fill' }} md="agriculture" />
      </NativeTabs.Trigger>

      {/* <NativeTabs.Trigger name="mercado">
        <NativeTabs.Trigger.Label>Mercado</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'cart', selected: 'cart.fill' }} md="storefront" />
      </NativeTabs.Trigger> */}

      <NativeTabs.Trigger name="caderneta">
        <NativeTabs.Trigger.Label>Caderneta</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md="menu_book" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
