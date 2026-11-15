import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Icon } from './icon';
import { AppText } from './text';

import { Brand, Radii, Spacing } from '@/constants/theme';
import type { IconName } from '@/types';

type InputProps = TextInputProps & {
  label?: string;
  icon?: IconName;
  hint?: string;
};

/** Campo de texto com rótulo, ícone e dica opcionais. */
export function Input({ label, icon, hint, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label && (
        <AppText variant="label" tone="secondary" style={styles.label}>
          {label}
        </AppText>
      )}
      <View style={styles.field}>
        {icon && <Icon name={icon} size={18} color={Brand.textMuted} />}
        <TextInput
          placeholderTextColor={Brand.textMuted}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {hint && (
        <AppText variant="caption" tone="muted" style={styles.hint}>
          {hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  label: {
    marginBottom: 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    minHeight: 46,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Brand.text,
    paddingVertical: Spacing.two,
  },
  hint: {
    marginTop: 2,
  },
});
