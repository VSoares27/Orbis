/**
 * `Alert.alert` na web.
 *
 * No react-native-web, `Alert.alert` é uma função vazia: avisos não aparecem e
 * confirmações com botões (ex.: "Excluir" na Caderneta e em Lavouras) nunca
 * chamam o `onPress`. Aqui ligamos o `Alert.alert` às caixas nativas do
 * navegador, sem mudar nada nas telas:
 *
 * - sem botões ou com um botão: `window.alert` e depois o `onPress` do botão;
 * - com "Cancelar" + uma ação: `window.confirm`; OK chama a ação, Cancelar
 *   chama o `onPress` do botão de cancelar (se houver).
 *
 * No Android e no iOS este arquivo não faz nada.
 */

import { Alert, Platform, type AlertButton } from 'react-native';

import { t } from './i18n';

/** Monta o texto da caixa, traduzindo título e cada linha da mensagem. */
function messageOf(title: string, message?: string) {
  if (!message) return t(title);
  const lines = message.split('\n').map((line) => t(line));
  return `${t(title)}\n\n${lines.join('\n')}`;
}

function webAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (typeof window === 'undefined') return;
  const text = messageOf(title, message);

  if (!buttons || buttons.length <= 1) {
    window.alert(text);
    buttons?.[0]?.onPress?.();
    return;
  }

  const cancel = buttons.find((button) => button.style === 'cancel');
  const action = [...buttons].reverse().find((button) => button !== cancel) ?? buttons[0];

  if (window.confirm(text)) {
    action.onPress?.();
  } else {
    cancel?.onPress?.();
  }
}

if (Platform.OS === 'web') {
  Alert.alert = webAlert as typeof Alert.alert;
}
