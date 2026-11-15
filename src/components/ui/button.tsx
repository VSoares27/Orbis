import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon } from './icon';
import { AppText } from './text';

import { Brand, Radii, Spacing } from '@/constants/theme';
import type { IconName } from '@/types';

type ButtonVariant = 'primary' | 'secondary' | 'amber' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<ButtonVariant, { background: string; text: string; border?: string }> = {
  primary: { background: Brand.green, text: Brand.cream },
  secondary: { background: Brand.greenSoft, text: Brand.green },
  amber: { background: Brand.amber, text: '#FFFFFF' },
  outline: { background: 'transparent', text: Brand.green, border: Brand.green },
  ghost: { background: 'transparent', text: Brand.green },
  danger: { background: Brand.dangerSoft, text: Brand.danger },
};

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number; gap: number }> = {
  sm: { paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, fontSize: 13, gap: 6 },
  md: { paddingVertical: 12, paddingHorizontal: Spacing.four, fontSize: 15, gap: Spacing.two },
  lg: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.five, fontSize: 16, gap: Spacing.two },
};

/** Botão padrão. Funciona bem com toque no campo (área generosa). */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const colors = variantStyles[variant];
  const sizing = sizeStyles[size];
  const contentColor = colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.background,
          paddingVertical: sizing.paddingVertical,
          paddingHorizontal: sizing.paddingHorizontal,
          gap: sizing.gap,
          borderWidth: colors.border ? 1.5 : 0,
          borderColor: colors.border,
        },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {icon && iconPosition === 'left' && (
        <Icon name={icon} size={sizing.fontSize + 5} color={contentColor} />
      )}
      <AppText
        style={{ color: contentColor, fontSize: sizing.fontSize, fontWeight: '700' }}
        numberOfLines={1}>
        {label}
      </AppText>
      {icon && iconPosition === 'right' && (
        <Icon name={icon} size={sizing.fontSize + 5} color={contentColor} />
      )}
    </Pressable>
  );
}

/** Botão apenas de ícone (ex.: sino de notificações, atualizar clima). */
export function IconButton({
  icon,
  size = 40,
  iconSize = 20,
  color = Brand.green,
  background = Brand.greenSoft,
  accessibilityLabel,
  ...rest
}: Omit<PressableProps, 'children'> & {
  icon: IconName;
  size?: number;
  iconSize?: number;
  color?: string;
  background?: string;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.iconButton,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
        pressed && styles.pressed,
      ]}
      {...rest}>
      <View>
        <Icon name={icon} size={iconSize} color={color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
