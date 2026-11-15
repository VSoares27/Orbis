import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ExternalLink } from './external-link';
import { Icon } from './ui/icon';
import { IconButton } from './ui/button';
import { AppText } from './ui/text';

import { Brand, Radii, Spacing } from '@/constants/theme';
import { formatUpdatedAt } from '@/lib/format';
import { NASA_POWER_DOCS_URL } from '@/services/nasa-power';
import type { ClimateSource } from '@/types';

type DataSourceNoteProps = {
  source: ClimateSource;
  updatedAt: string;
  loading?: boolean;
  onRefresh?: () => void;
};

/**
 * Transparência sobre a origem dos dados.
 * Sempre exibimos a fonte (NASA POWER) e o horário da última atualização.
 */
export function DataSourceNote({ source, updatedAt, loading, onRefresh }: DataSourceNoteProps) {
  const isNasa = source === 'nasa';

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name="satellite-variant" size={18} color={Brand.sky} />
      </View>

      <View style={styles.texts}>
        <AppText variant="label">{isNasa ? 'Dados NASA POWER' : 'Dados demonstrativos'}</AppText>
        <AppText variant="caption" tone="secondary">
          {isNasa
            ? 'Observações por satélite da NASA para a sua localização.'
            : 'Sem conexão com a NASA POWER. Exibindo uma série de exemplo.'}
        </AppText>
        <AppText variant="caption" tone="muted">
          Atualizado em {formatUpdatedAt(updatedAt)}
        </AppText>

        <ExternalLink href={NASA_POWER_DOCS_URL} style={styles.link}>
          <AppText variant="caption" tone="sky" style={styles.linkText}>
            Entenda a fonte de dados
          </AppText>
        </ExternalLink>
      </View>

      {onRefresh && (
        <IconButton
          icon={loading ? 'dots-horizontal' : 'refresh'}
          accessibilityLabel="Atualizar dados de clima"
          onPress={onRefresh}
          background={Brand.skySoft}
          color={Brand.sky}
          size={36}
          iconSize={18}
        />
      )}

      {loading && <ActivityIndicator color={Brand.sky} style={styles.loading} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radii.lg,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Brand.skySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  link: {
    marginTop: Spacing.one,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  loading: {
    position: 'absolute',
    right: 44,
    top: 16,
  },
});
