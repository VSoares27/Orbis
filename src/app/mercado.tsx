import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MarketCard } from '@/components/market-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { AppText } from '@/components/ui/text';
import { Brand, Radii, Spacing } from '@/constants/theme';
import { categoryLabels, mockMarket } from '@/data/mock';
import { formatCurrency } from '@/lib/format';
import type { MarketCategory } from '@/types';

type CategoryFilter = 'todos' | MarketCategory;

const categories: CategoryFilter[] = ['todos', 'frutas', 'verduras', 'graos', 'laticinios'];

export default function MarketScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('todos');

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = mockMarket.filter((item) => {
    const matchesCategory = category === 'todos' || item.category === category;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      item.product.toLowerCase().includes(normalizedQuery) ||
      item.producer.toLowerCase().includes(normalizedQuery) ||
      item.location.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  function handleContact(product: (typeof mockMarket)[number]) {
    Alert.alert(
      product.product,
      `${product.producer}\n${product.location} · ${product.distanceKm} km\n\n` +
        `${formatCurrency(product.price)} por ${product.unit}\n${product.quantity}\n\n` +
        'Contato de demonstração: (34) 99999-0000',
      [
        { text: 'Fechar', style: 'cancel' },
        {
          text: 'Falar com produtor',
          onPress: () =>
            Alert.alert(
              'Contato',
              'Em produção, este botão abriria um chat ou o WhatsApp do produtor.',
            ),
        },
      ],
    );
  }

  function handleCreateListing() {
    Alert.alert(
      'Anunciar produto',
      'O cadastro de anúncios será conectado ao backend. Por enquanto, esta é apenas uma prévia da experiência.',
      [{ text: 'Entendi' }],
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title">Mercado</AppText>
          <AppText variant="caption" tone="secondary">
            Produtos da Agricultura Familiar perto de você.
          </AppText>
        </View>
        <Button label="Anunciar" size="sm" icon="plus" onPress={handleCreateListing} />
      </View>

      <Card variant="soft" style={styles.banner}>
        <View style={styles.bannerIcon}>
          <Icon name="handshake-outline" size={24} color={Brand.green} />
        </View>
        <View style={styles.bannerText}>
          <AppText variant="subtitle">Venda direta, sem atravessador</AppText>
          <AppText variant="caption" tone="secondary">
            Aproxime produtores e consumidores da sua região e valorize o preço justo.
          </AppText>
        </View>
      </Card>

      <Input
        icon="magnify"
        placeholder="Busque por produto, produtor ou cidade"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        accessibilityLabel="Buscar produtos no mercado"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}>
        {categories.map((key) => {
          const active = category === key;
          const label = key === 'todos' ? 'Todos' : categoryLabels[key];

          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Filtrar por ${label}`}
              onPress={() => setCategory(key)}
              style={({ pressed }) => [
                styles.chip,
                active && styles.chipActive,
                pressed && styles.pressed,
              ]}>
              <AppText variant="label" tone={active ? 'inverse' : 'secondary'}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionHeader
        title="Ofertas disponíveis"
        subtitle={`${filtered.length} ${filtered.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`}
      />

      <View style={styles.list}>
        {filtered.map((item) => (
          <MarketCard key={item.id} item={item} onContact={() => handleContact(item)} />
        ))}
      </View>

      {filtered.length === 0 && (
        <Card>
          <EmptyState
            icon="store-search-outline"
            title="Nenhum produto encontrado"
            description="Tente outra busca ou selecione uma categoria diferente."
          />
        </Card>
      )}

      <Card variant="outline" style={styles.note}>
        <Icon name="information-outline" size={20} color={Brand.sky} />
        <AppText variant="caption" tone="secondary" style={styles.noteText}>
          Prévia do mercado. Preços, ofertas e contatos são fictícios e serão carregados do backend
          quando a integração estiver pronta.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  banner: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
    gap: 2,
  },
  categories: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  chipActive: {
    backgroundColor: Brand.green,
    borderColor: Brand.green,
  },
  pressed: {
    opacity: 0.75,
  },
  list: {
    gap: Spacing.two,
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: Brand.skySoft,
    borderColor: Brand.skySoft,
  },
  noteText: {
    flex: 1,
  },
});
