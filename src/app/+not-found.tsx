import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Brand, Spacing } from '@/constants/theme';

/** Endereço que não existe no app (ex.: link digitado errado). */
export default function NotFoundScreen() {
  return (
    <Screen>
      <View style={styles.box}>
        <Icon name="map-marker-question-outline" size={48} color={Brand.green} />
        <AppText variant="title" style={styles.center}>
          Página não encontrada
        </AppText>
        <AppText variant="body" tone="secondary" style={styles.center}>
          Esse endereço não existe no Orbis. Volte para o início para ver o clima e o
          simulador de plantio.
        </AppText>
        <Button label="Ir para o início" icon="home-variant-outline" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  center: { textAlign: 'center' },
});
