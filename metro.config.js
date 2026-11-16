// Configuração necessária para o expo-sqlite no web (WASM + SharedArrayBuffer).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

// O seletor de data nativo não tem versão web: no navegador usamos
// src/lib/datetimepicker.web.tsx (campo de data do próprio navegador).
const DATETIMEPICKER = '@react-native-community/datetimepicker';
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === DATETIMEPICKER) {
    return {
      type: 'sourceFile',
      filePath: require('path').join(__dirname, 'src/lib/datetimepicker.web.tsx'),
    };
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  };
};

module.exports = config;
