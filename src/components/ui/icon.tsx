import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { StyleProp, TextStyle } from 'react-native';

import { Brand } from '@/constants/theme';
import type { IconName } from '@/types';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Ícone único do app (MaterialCommunityIcons).
 * Tem o melhor conjunto de ícones agrícolas entre as famílias disponíveis.
 */
export function Icon({ name, size = 20, color = Brand.green, style }: IconProps) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}
