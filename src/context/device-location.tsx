/**
 * Localização do dispositivo.
 *
 * O provedor pede permissão de primeiro plano, obtém a posição atual (com fallback
 * para última posição conhecida) e traduz as coordenadas para cidade/estado.
 * O clima e as simulações usam somente esta localização.
 *
 * Sem GPS (permissão negada ou erro), `location` recebe `DEFAULT_LOCATION`
 * (Serra Talhada, PE), mas `status` e `error` continuam informando o problema.
 * Se o pedido de permissão ficar 8 s sem resposta, também usa o local padrão.
 * Se o GPS responder depois, a localização real substitui a padrão.
 */

import * as Location from 'expo-location';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Linking, Platform } from 'react-native';

import type { FarmLocation } from '@/types';

type DeviceLocationStatus = 'loading' | 'ready' | 'denied' | 'error';

/** Local usado quando o aparelho não informa a posição (região da análise das safras). */
export const DEFAULT_LOCATION: FarmLocation = {
  label: 'Local padrão',
  city: 'Serra Talhada',
  state: 'PE',
  latitude: -7.988,
  longitude: -38.2963,
};

/**
 * Se o pedido de permissão ficar sem resposta (ex.: aviso do navegador ignorado),
 * usa o local padrão depois deste tempo. O GPS real substitui quando responder.
 */
const LOCATION_WAIT_MS = 8_000;

/** Mantém a última posição real, se houver; senão usa o local padrão. */
function keepOrDefault(current: FarmLocation | null) {
  return current ?? DEFAULT_LOCATION;
}

type DeviceLocationContextValue = {
  location: FarmLocation | null;
  status: DeviceLocationStatus;
  loading: boolean;
  error: string | null;
  accuracyMeters: number | null;
  canAskAgain: boolean;
  /** Pede a permissão novamente e tenta localizar. */
  requestLocation: () => Promise<void>;
  /** Atualiza a posição usando a permissão já concedida. */
  refreshLocation: () => Promise<void>;
  /** Abre as configurações do sistema para o usuário liberar a permissão manualmente. */
  openSettings: () => Promise<void>;
};

const DeviceLocationContext = createContext<DeviceLocationContextValue | null>(null);

export function DeviceLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<FarmLocation | null>(null);
  const [status, setStatus] = useState<DeviceLocationStatus>('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [canAskAgain, setCanAskAgain] = useState(true);

  const mounted = useRef(true);
  const bootstrapped = useRef(false);
  const inFlight = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const describePosition = useCallback(
    async (latitude: number, longitude: number): Promise<FarmLocation> => {
      let city = 'Coordenadas do aparelho';
      let state = `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;

      if (Platform.OS !== 'web') {
        try {
          const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
          if (address) {
            city =
              address.city ??
              address.subregion ??
              address.district ??
              'Coordenadas do aparelho';
            state =
              address.region ??
              address.isoCountryCode ??
              `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
          }
        } catch {
          // O geocódigo reverso é opcional; as coordenadas continuam válidas.
        }
      }

      return {
        label: 'Localização atual',
        city,
        state,
        latitude,
        longitude,
      };
    },
    [],
  );

  /**
   * Busca as coordenadas reais assumindo que a permissão já foi concedida.
   * Não altera `loading` diretamente para evitar conflito com os callers.
   */
  const fetchCoordinates = useCallback(async () => {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      throw new Error('Ative a localização (GPS) do aparelho para consultar o clima da sua área.');
    }

    // 1. Tenta pegar a última posição em cache (resposta instantânea e evita timeout indoor)
    let position = await Location.getLastKnownPositionAsync({
      maxAge: 1000 * 60 * 10, // Até 10 minutos atrás
      requiredAccuracy: 1000, // Precisão mínima de 1 km
    });

    // 2. Se não houver cache recente, solicita leitura ativa do GPS
    if (!position) {
      position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    }

    const nextLocation = await describePosition(
      position.coords.latitude,
      position.coords.longitude,
    );

    if (!mounted.current) return;

    setLocation(nextLocation);
    setAccuracyMeters(position.coords.accuracy ?? null);
    setStatus('ready');
  }, [describePosition]);

  const requestLocation = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!mounted.current) return;

      setCanAskAgain(permission.canAskAgain);

      if (!permission.granted) {
        setLocation(keepOrDefault);
        setStatus('denied');
        setError(
          permission.canAskAgain
            ? 'Precisamos da sua permissão para usar o clima e as simulações da sua região.'
            : 'A permissão de localização foi bloqueada. Libere o acesso nas configurações do aparelho.',
        );
        return;
      }

      await fetchCoordinates();
    } catch (cause) {
      if (!mounted.current) return;
      setLocation(keepOrDefault);
      setStatus('error');
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível obter a localização do aparelho.',
      );
    } finally {
      inFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, [fetchCoordinates]);

  const refreshLocation = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);

    try {
      const permission = await Location.getForegroundPermissionsAsync();
      if (!mounted.current) return;

      setCanAskAgain(permission.canAskAgain);

      if (permission.granted) {
        await fetchCoordinates();
      } else {
        // Libera a trava antes de delegar para requestLocation
        inFlight.current = false;
        await requestLocation();
        return;
      }
    } catch (cause) {
      if (!mounted.current) return;
      setLocation(keepOrDefault);
      setStatus('error');
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível verificar ou atualizar a localização.',
      );
    } finally {
      inFlight.current = false;
      if (mounted.current) setLoading(false);
    }
  }, [fetchCoordinates, requestLocation]);

  const openSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  // Inicialização única ao montar o Provider
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const waitTimer = setTimeout(() => {
      if (mounted.current) setLocation(keepOrDefault);
    }, LOCATION_WAIT_MS);

    void refreshLocation().finally(() => clearTimeout(waitTimer));
  }, [refreshLocation]);

  // Revalida automaticamente quando o usuário volta das Configurações do aparelho
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && (status === 'denied' || status === 'error')) {
        void refreshLocation();
      }
    });

    return () => subscription.remove();
  }, [status, refreshLocation]);

  const value = useMemo<DeviceLocationContextValue>(
    () => ({
      location,
      status,
      loading,
      error,
      accuracyMeters,
      canAskAgain,
      requestLocation,
      refreshLocation,
      openSettings,
    }),
    [
      location,
      status,
      loading,
      error,
      accuracyMeters,
      canAskAgain,
      requestLocation,
      refreshLocation,
      openSettings,
    ],
  );

  return (
    <DeviceLocationContext.Provider value={value}>
      {children}
    </DeviceLocationContext.Provider>
  );
}

export function useDeviceLocation() {
  const context = useContext(DeviceLocationContext);
  if (!context) {
    throw new Error('useDeviceLocation precisa estar dentro de DeviceLocationProvider.');
  }
  return context;
}

function formatCoordinate(value: number) {
  return value.toFixed(3).replace('.', ',');
}