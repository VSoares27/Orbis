import { useState } from 'react';
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

import { Button, IconButton } from './ui/button';
import { Icon } from './ui/icon';
import { Input } from './ui/input';
import { AppText } from './ui/text';

import { Brand, PhoneFrameWidth, Radii, Spacing } from '@/constants/theme';
import type { NewActivityInput } from '@/db/repository';
import { activityTypeIcons, activityTypeLabels, activityTypes } from '@/lib/activities';
import { formatActivityDate } from '@/lib/format';
import type { Crop, FieldActivityType } from '@/types';

type ActivitySheetProps = {
  crops: Crop[];
  visible: boolean;
  defaultCropId?: string;
  onClose: () => void;
  onSave: (input: NewActivityInput) => Promise<void>;
};

/** Formulário de manejo usado pela tela de lavouras e pela caderneta. */
export function ActivitySheet({
  crops,
  visible,
  defaultCropId,
  onClose,
  onSave,
}: ActivitySheetProps) {
  const [cropId, setCropId] = useState(defaultCropId ?? crops[0]?.id ?? '');
  const [type, setType] = useState<FieldActivityType>('irrigacao');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedCrop = crops.find((crop) => crop.id === cropId);

  async function handleSave() {
    if (!cropId || saving) return;

    setSaving(true);

    try {
      await onSave({
        cropId,
        type,
        notes:
          notes.trim() ||
          `${activityTypeLabels[type]} registrada em ${selectedCrop?.name ?? 'lavoura'}.`,
        occurredAt: new Date().toISOString(),
      });
    } catch (cause) {
      setSaving(false);
      Alert.alert(
        'Não foi possível salvar',
        cause instanceof Error ? cause.message : 'Tente novamente em instantes.',
      );
      return;
    }

    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Fechar registro de manejo"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
          style={styles.keyboardView}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.headerText}>
                <AppText variant="heading">Registrar manejo</AppText>
                <AppText variant="caption" tone="secondary">
                  Hoje · {formatActivityDate(new Date().toISOString())}
                </AppText>
              </View>
              <IconButton
                icon="close"
                accessibilityLabel="Fechar"
                onPress={onClose}
                background={Brand.cream}
                color={Brand.textSecondary}
              />
            </View>

            <ScrollView
              style={styles.sheetScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.sheetContent}>
            <View style={styles.field}>
              <AppText variant="label" tone="secondary">
                Lavoura
              </AppText>
              {crops.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chips}>
                  {crops.map((crop) => {
                    const active = crop.id === cropId;
                    return (
                      <Pressable
                        key={crop.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={`Selecionar ${crop.name}`}
                        onPress={() => setCropId(crop.id)}
                        style={({ pressed }) => [
                          styles.chip,
                          active && styles.chipActive,
                          pressed && styles.pressed,
                        ]}>
                        <Icon
                          name={crop.icon}
                          size={16}
                          color={active ? Brand.cream : Brand.green}
                        />
                        <AppText
                          variant="label"
                          tone={active ? 'inverse' : 'secondary'}
                          style={active && styles.chipTextActive}>
                          {crop.name}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : (
                <AppText variant="caption" tone="muted">
                  Cadastre uma lavoura antes de registrar o manejo.
                </AppText>
              )}
            </View>

            <View style={styles.field}>
              <AppText variant="label" tone="secondary">
                O que foi feito?
              </AppText>
              <View style={styles.typeGrid}>
                {activityTypes.map((item) => {
                  const active = item === type;
                  return (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`Selecionar ${activityTypeLabels[item]}`}
                      onPress={() => setType(item)}
                      style={({ pressed }) => [
                        styles.typeChip,
                        active && styles.chipActive,
                        pressed && styles.pressed,
                      ]}>
                      <Icon
                        name={activityTypeIcons[item]}
                        size={17}
                        color={active ? Brand.cream : Brand.green}
                      />
                      <AppText
                        variant="caption"
                        tone={active ? 'inverse' : 'secondary'}
                        style={active && styles.chipTextActive}>
                        {activityTypeLabels[item]}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Input
              label="Observações"
              placeholder="Ex.: 20 mm no início da manhã"
              value={notes}
              onChangeText={setNotes}
              icon="text-box-outline"
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />

            <View style={styles.localNote}>
              <Icon name="database" size={16} color={Brand.green} />
              <AppText variant="caption" tone="secondary">
                Este registro será salvo no SQLite do aparelho.
              </AppText>
            </View>

            <Button
              label={saving ? 'Salvando...' : 'Salvar na caderneta'}
              icon="check"
              fullWidth
              onPress={() => void handleSave()}
              disabled={!cropId || saving}
            />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(14, 47, 34, 0.45)',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
    maxWidth: PhoneFrameWidth,
    alignSelf: 'center',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '100%',
    backgroundColor: Brand.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
  },
  sheetScroll: {
    flexShrink: 1,
  },
  sheetContent: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
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
  headerText: {
    flex: 1,
    gap: 2,
  },
  field: {
    gap: Spacing.two,
  },
  chips: {
    gap: Spacing.two,
    paddingRight: Spacing.three,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.cream,
  },
  chipActive: {
    backgroundColor: Brand.green,
    borderColor: Brand.green,
  },
  chipTextActive: {
    fontWeight: '700',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Brand.border,
    backgroundColor: Brand.cream,
  },
  notesInput: {
    minHeight: 74,
    textAlignVertical: 'top',
  },
  localNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.75,
  },
});
