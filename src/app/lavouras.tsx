import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ActivitySheet } from '@/components/activity-sheet';
import { CropCard } from '@/components/crop-card';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Brand, PhoneFrameWidth, Radii, Spacing } from '@/constants/theme';
import type { NewActivityInput } from '@/db/repository';
import { useActivities } from '@/hooks/use-activities';
import { useCrops } from '@/hooks/use-crops';
import { formatDayMonth, formatNumber } from '@/lib/format';
import type { Crop, CropStatus } from '@/types';

type FilterKey = 'todas' | CropStatus;

const filterLabels: { key: FilterKey; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'saudavel', label: 'Boas' },
  { key: 'atencao', label: 'Atenção' },
  { key: 'colheita', label: 'Colheita' },
];

export default function CropsScreen() {
  const { crops, error, reload, addCrop, removeCrop } = useCrops();
  const { addActivity } = useActivities();
  const [filter, setFilter] = useState<FilterKey>('todas');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [manageCropId, setManageCropId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', variety: '', area: '' });

  const filtered = filter === 'todas' ? crops : crops.filter((crop) => crop.status === filter);
  const totalArea = crops.reduce((total, crop) => total + crop.areaHectares, 0);
  const nextHarvest = [...crops].sort((a, b) =>
    a.harvestForecast.localeCompare(b.harvestForecast),
  )[0];

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  function toggleDetails(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  function handleManage(crop: Crop) {
    setManageCropId(crop.id);
  }

  function handleDelete(crop: Crop) {
    Alert.alert(
      'Remover plantação',
      `Tem certeza que deseja apagar ${crop.name}? As anotações dessa plantação na caderneta também serão apagadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            void removeCrop(crop.id).catch(() => {
              Alert.alert('Erro', 'Não foi possível apagar essa plantação agora.');
            });
          },
        },
      ],
    );
  }

  const handleSaveActivity = useCallback(
    async (input: NewActivityInput) => {
      await addActivity(input);
      Alert.alert('Serviço anotado', 'A anotação já está salva na sua caderneta.');
    },
    [addActivity],
  );

  async function handleAddCrop() {
    const name = form.name.trim();
    if (!name || saving) return;

    const area = Number(form.area.replace(',', '.')) || 0.1;
    const plantedAt = new Date().toISOString().slice(0, 10);
    const harvestDate = new Date();
    harvestDate.setDate(harvestDate.getDate() + 90);

    const newCrop: Crop = {
      id: `crop-${Date.now()}`,
      name,
      variety: form.variety.trim() || 'Comum da região',
      areaHectares: area,
      plantedAt,
      harvestForecast: harvestDate.toISOString().slice(0, 10),
      status: 'saudavel',
      progress: 5,
      icon: 'sprout',
      irrigation: { needMm: 25, recommendedMm: 20 },
      nextAction: 'Acompanhar nascimento das mudas',
      notes:
        'Plantação anotada por você. Atualize as informações conforme a roça for crescendo.',
    };

    setSaving(true);

    try {
      await addCrop(newCrop);
      setForm({ name: '', variety: '', area: '' });
      setModalVisible(false);
    } catch (cause) {
      Alert.alert(
        'Não foi possível salvar',
        cause instanceof Error ? cause.message : 'Tente novamente em instantes.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title">Minhas plantações</AppText>
          <AppText variant="caption" tone="secondary">
            Acompanhe o crescimento, a água e a colheita de cada roça.
          </AppText>
        </View>
        <Button
          label="Nova"
          size="sm"
          icon="plus"
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Resumo geral da propriedade. */}
      <Card style={styles.summary}>
        <SummaryItem
          icon="sprout-outline"
          value={`${crops.length}`}
          label="plantações"
        />
        <View style={styles.summaryDivider} />
        <SummaryItem
          icon="ruler-square"
          value={formatNumber(totalArea, 2)}
          label="hectares"
        />
        <View style={styles.summaryDivider} />
        <SummaryItem
          icon="calendar-check-outline"
          value={nextHarvest ? formatDayMonth(nextHarvest.harvestForecast) : '—'}
          label="próxima colheita"
        />
      </Card>

      <View style={styles.localNote}>
        <Icon name="check-circle-outline" size={16} color={Brand.green} />
        <AppText variant="caption" tone="secondary">
          Suas anotações ficam salvas no celular, mesmo sem sinal na roça.
        </AppText>
      </View>

      {error && (
        <Card variant="outline">
          <AppText variant="caption" tone="danger">
            Não foi possível carregar suas plantações agora.
          </AppText>
        </Card>
      )}

      {/* Filtros por situação. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {filterLabels.map((item) => {
          const count =
            item.key === 'todas'
              ? crops.length
              : crops.filter((crop) => crop.status === item.key).length;
          const active = filter === item.key;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Filtrar por ${item.label}`}
              onPress={() => setFilter(item.key)}
              style={({ pressed }) => [
                styles.filterChip,
                active && styles.filterChipActive,
                pressed && styles.pressed,
              ]}>
              <AppText
                variant="label"
                tone={active ? 'inverse' : 'secondary'}
                style={active && styles.filterChipTextActive}>
                {item.label} · {count}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {filtered.map((crop) => (
          <CropCard
            key={crop.id}
            crop={crop}
            expanded={expandedId === crop.id}
            onToggleDetails={() => toggleDetails(crop.id)}
            onManage={() => handleManage(crop)}
            onDelete={() => handleDelete(crop)}
          />
        ))}
      </View>

      {filtered.length === 0 && (
        <Card>
          <EmptyState
            title={crops.length === 0 ? 'Nenhuma plantação anotada' : 'Nenhuma plantação neste filtro'}
            description={
              crops.length === 0
                ? 'Cadastre o que você plantou para começar o acompanhamento.'
                : 'Troque o filtro ou anote uma nova plantação para acompanhar.'
            }
          />
        </Card>
      )}

      <Card variant="soft" style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Icon name="lightbulb-on-outline" size={20} color={Brand.amber} />
          <AppText variant="label" tone="amber">
            DICA PARA A TERRA
          </AppText>
        </View>
        <AppText variant="body" tone="secondary">
          Alterne o que você planta em cada safra para diminuir pragas e manter a terra forte. O app
          usa o tempo de cada cultura para avisar a hora certa de cuidar e colher.
        </AppText>
      </Card>

      {/* Modal de cadastro salvo no aparelho. */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Fechar cadastro"
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeader}>
                <View style={styles.headerText}>
                  <AppText variant="heading">Nova plantação</AppText>
                  <AppText variant="caption" tone="secondary">
                    Anote o que você plantou para acompanhar até a colheita.
                  </AppText>
                </View>
                <IconButton
                  icon="close"
                  accessibilityLabel="Fechar"
                  onPress={() => setModalVisible(false)}
                  background={Brand.cream}
                  color={Brand.textSecondary}
                />
              </View>

              <Input
                label="O que vai plantar"
                placeholder="Ex.: Milho"
                value={form.name}
                onChangeText={(name) => setForm((current) => ({ ...current, name }))}
                icon="sprout"
                autoFocus
              />

              <Input
                label="Tipo / Semente"
                placeholder="Ex.: Milho verde ou criouro"
                value={form.variety}
                onChangeText={(variety) => setForm((current) => ({ ...current, variety }))}
                icon="leaf"
              />

              <Input
                label="Tamanho da área (hectares)"
                placeholder="Ex.: 1,5"
                value={form.area}
                onChangeText={(area) => setForm((current) => ({ ...current, area }))}
                keyboardType="decimal-pad"
                icon="ruler-square"
                hint="Ajuda a calcular quanta água e colheita esperar."
              />

              <AppText variant="caption" tone="muted">
                Fica salvo no seu celular para você consultar mesmo sem internet na roça.
              </AppText>

              <Button
                label={saving ? 'Salvando...' : 'Salvar plantação'}
                icon="plus"
                fullWidth
                onPress={() => void handleAddCrop()}
                disabled={!form.name.trim() || saving}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {manageCropId && (
        <ActivitySheet
          crops={crops}
          visible
          defaultCropId={manageCropId}
          onClose={() => setManageCropId(null)}
          onSave={handleSaveActivity}
        />
      )}
    </Screen>
  );
}

function SummaryItem({
  icon,
  value,
  label,
}: {
  icon: 'sprout-outline' | 'ruler-square' | 'calendar-check-outline';
  value: string;
  label: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <Icon name={icon} size={18} color={Brand.green} />
      <AppText variant="subtitle" style={styles.summaryValue}>
        {value}
      </AppText>
      <AppText variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </AppText>
    </View>
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
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: 18,
    lineHeight: 24,
  },
  summaryDivider: {
    width: 1,
    height: 44,
    backgroundColor: Brand.border,
  },
  localNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -Spacing.one,
  },
  filters: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  filterChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  filterChipActive: {
    backgroundColor: Brand.green,
    borderColor: Brand.green,
  },
  filterChipTextActive: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  list: {
    gap: Spacing.two,
  },
  tipCard: {
    gap: Spacing.two,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(14, 47, 34, 0.45)',
  },
  keyboardView: {
    width: '100%',
    maxWidth: PhoneFrameWidth,
    alignSelf: 'center',
  },
  sheet: {
    backgroundColor: Brand.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.border,
    alignSelf: 'center',
    marginBottom: Spacing.one,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});