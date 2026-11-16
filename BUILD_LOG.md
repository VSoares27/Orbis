# BUILD_LOG — fix/dados-honestos (15/11/2026)

## 1. Tarefas

| Tarefa | Situação |
| --- | --- |
| T0 Preparar | Feita. Antes de mexer: `tsc` limpo; `lint` com 1 erro já existente (`use-nasa-projection.ts:20`, setState em efeito) — corrigido depois. |
| T1 Cenários de anos reais | Feita. Sem API de projeção; histórico ano a ano (`PRECTOTCORR_SUM`, aceito pela API). Serra Talhada: 949 / 649 / 382 mm (online). |
| T2 Dados embutidos offline | Feita. Só até 0,75° de Serra Talhada; outros locais mostram o erro de sempre. |
| T3 Local padrão sem GPS | Feita + extra aprovado: também após 8 s sem resposta ao pedido de localização. |
| T4 Safras nas recomendações | Feita. Empates na "melhor data" citam todas as datas (o `best` do JSON desempata pelos últimos 20 anos, que não estão no arquivo). |
| T5 Verificação | Feita. `npx tsx` foi bloqueado no ambiente; roda com `node --import ./scripts/ts-register.mjs scripts/verificar-dados.ts` (Node 24, sem dependências). |
| T6 Link público | Feita. EAS Hosting, conta `joaomanoel01s-team`. |
| T7 Documentação | Feita (README.md e README.br.md; o link para `README.en.md` inexistente foi corrigido). |

Correções extras, autorizadas pelo João (incluem mudança em tela):
- Nota do simulador segue o histórico real em Serra Talhada (6+ faltas em 10 → até 49; 4–5 → até 74; não vale no cenário Mais chuva). Melhor época restrita a jan–mar na região.
- Web: `Alert.alert` era vazio (excluir lavoura/manejo não funcionava) → `src/lib/web-alert.ts`.
- Web: seletor de data não existia → `src/lib/datetimepicker.web.tsx` + `metro.config.js`.
- Web: moldura de celular no computador; abas no formato de celular; folhas com largura de celular; simulador com campos empilhados.
- Radiação solar `-999` aparecia como 0 kWh/m² → repete a última leitura válida.
- Selo "ATUALIZANDO" preso enquanto o GPS procura.
- Texto de excluir lavoura agora avisa que as anotações também são apagadas (o banco usa `ON DELETE CASCADE`).

## 2. Arquivos alterados
- `src/services/nasa-projection.ts`: cenários de anos reais, cache por coordenada, fallback embutido.
- `src/services/nasa-power.ts`: preenche lacunas de radiação solar.
- `src/lib/serra-talhada.ts` (novo): coordenada, raio e histórico embutido.
- `src/lib/planting-simulator.ts`: frases das safras, teto da nota, melhor época jan–mar.
- `src/lib/projection.ts`, `src/types/index.ts`: textos e tipos sem NEX-GDDP/ACCESS-CM2.
- `src/lib/web-alert.ts`, `src/lib/datetimepicker.web.tsx` (novos): correções da web.
- `src/context/device-location.tsx`: `DEFAULT_LOCATION` e espera de 8 s.
- `src/hooks/use-nasa-projection.ts`, `src/hooks/use-nasa-climate.ts`: lint e selo de carregamento.
- `src/app/_layout.tsx` (1 import), `src/app/lavouras.tsx` (texto + largura da folha), `src/components/app-tabs.web.tsx`, `src/components/activity-sheet.tsx`, `src/components/planting-simulator-card.tsx`, `src/constants/theme.ts` (`PhoneFrameWidth`): ajustes autorizados.
- `src/data/serra-talhada-*.json`, `docs/METHODOLOGY.md`, `docs/REFERENCES.md`: copiados sem alteração.
- `scripts/verificar-dados.ts`, `scripts/ts-register.mjs`, `scripts/ts-hooks.mjs`: verificação.
- `app.json`: `owner` e `extra.eas.projectId`. `metro.config.js`: seletor de data na web.
- `README.md`, `README.br.md`, `docs/telas/*`, `docs/build-log/*`: documentação e prints.

## 3. `verificar-dados.ts`
19 verificações OK, "Tudo certo." (3 cenários 948/649/382 mm; ordem; deltas 0 no Normal; milho 21/01 = 8/1/1, melhor 11/02 com 5; nota 49 "risco"; melhor época Fev 74; Mais chuva sem teto; soja e Recife sem mudança; offline em Serra Talhada usa dados embutidos; offline em Recife mostra erro).

## 4. Checagens
- `npx tsc --noEmit`: sem erros.
- `npm run lint`: sem erros (o erro antigo foi corrigido).
- `git diff --stat main -- src/app src/components src/constants assets`: **não está vazio**, por decisão do João (ajustes de bugs e mobile-first): `_layout.tsx` 1 linha, `lavouras.tsx`, `activity-sheet.tsx`, `app-tabs.web.tsx`, `planting-simulator-card.tsx`, `theme.ts`.

## 5. Publicação
- URL: https://joaomanoel01s-team-orbis.expo.app
- `curl -sI`: 200 OK, **sem** `Cross-Origin-Opener-Policy`/`Embedder-Policy`. O EAS só envia esses cabeçalhos com `web.output: "static"`; testei e o modo static gera erro de hidratação React #418, então mantive `single`. Sem os cabeçalhos, o SQLite web leu, gravou e apagou normalmente no Chromium.
- CORS: chamadas à `power.larc.nasa.gov` (diária e mensal) respondem 200 a partir do link publicado; a API envia `Access-Control-Allow-Origin: *`.

## 6. Roteiro manual (localização bloqueada)
Início, Clima, Simulador (cultura, data, 3 cenários, frases do milho), Lavouras (cadastrar, recarregar, excluir) e Caderneta (registrar, excluir) funcionaram. Prints em `docs/telas/` e `docs/build-log/`. **Não testado:** localização permitida no navegador (o navegador de teste nega GPS), Safari e Firefox.

## 7. Riscos e pendências
- Testar em Safari/iPhone e Firefox (SQLite sem COOP/COEP só foi testado no Chromium).
- Limites 6/10 e 4/10 do teto da nota são escolha do time; está declarado no README.
- Mercado continua acessível por `/mercado` com dados fictícios (fora das abas).
- O banco apaga as anotações junto com a lavoura (CASCADE); o texto foi ajustado, o comportamento não.
