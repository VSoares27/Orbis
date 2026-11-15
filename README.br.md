# 🌱 Orbis

> Simulações de clima com dados da NASA para ajudar a agricultura familiar a decidir **o que plantar** e **quando plantar**.

🇧🇷 Português · [🇺🇸 English](./README.md)

Projeto desenvolvido para o **NASA Space Apps Hackathon**, usando a API pública **NASA POWER** (Prediction Of Worldwide Energy Resources).

---

## 📖 Sobre o projeto

Pequenos agricultores sentem na pele a imprevisibilidade do clima: uma chuva que não vem, um calor fora de época, uma safra perdida. Grande parte das ferramentas de previsão é pensada para o grande produtor, com linguagem técnica e pouca conexão com a realidade de quem planta em poucos hectares.

O **Orbis** é um aplicativo mobile (Android, iOS e web) que pega a localização do celular, busca dados de satélite da NASA para aquele ponto exato e responde, em linguagem simples, perguntas como:

- *Como foi o clima da minha propriedade nos últimos dias?*
- *Preciso irrigar hoje?*
- *Em que mês devo plantar milho, feijão, soja ou mandioca?*
- *E se o próximo ano for mais seco ou mais chuvoso?*

## ✨ Funcionalidades

| Tela | O que faz |
| --- | --- |
| **Início** | Saudação, clima do dia, chuva da semana, recomendação de irrigação e alertas automáticos (chuva forte, risco de fungos, vento forte para pulverização). |
| **Clima** | Série diária dos últimos 14 dias para a localização do aparelho e o **simulador de plantio**. |
| **Lavouras** | Cadastro das plantações (nome, variedade, área), acompanhamento de status e previsão de colheita. |
| **Caderneta** | Diário de campo: registro de irrigação, adubação, pulverização, plantio, colheita e outros manejos. |

> 🛒 Existe uma tela de **Mercado** (compra e venda entre produtores) com dados de demonstração, mas ela está **desativada** na barra de abas nesta versão.

### 🧪 Simulador de plantio

O coração do projeto. O agricultor escolhe:

1. **A cultura**: milho, feijão, soja ou mandioca.
2. **A data de plantio** desejada.
3. **O cenário climático**: *Mais chuva*, *Normal* ou *Mais seco* (grupos de anos reais, veja abaixo).

O app avalia **as 12 janelas de plantio possíveis** (um início em cada mês), compara com a data escolhida e mostra:

- uma **nota de 0 a 100** e a classificação (**ideal**, **moderado** ou **risco**);
- o **melhor mês para plantar** e o mês previsto da colheita;
- chuva total e temperatura média esperadas durante o ciclo, comparadas à média histórica;
- **recomendações práticas** em linguagem simples (ex.: preparar irrigação, cuidar do escoamento, usar palhada para segurar a umidade);
- na região de Serra Talhada (PE), o **resultado real das últimas safras** para a cultura e a data escolhidas (veja [Análise das safras de Serra Talhada](#-análise-das-safras-de-serra-talhada)).

A nota parte de 100 e perde pontos quando a chuva prevista para o ciclo fica abaixo ou acima da faixa ideal da cultura, ou quando a temperatura média sai da faixa ideal. Os parâmetros de cada cultura estão em [`src/lib/planting-simulator.ts`](./src/lib/planting-simulator.ts).

## 🛰️ Dados da NASA

O Orbis usa duas consultas à [API NASA POWER](https://power.larc.nasa.gov/docs/services/api/) (comunidade `AG`, agroclimatologia). Não é necessária chave de API.

| Uso | Endpoint | Parâmetros |
| --- | --- | --- |
| Clima recente (14 dias) | `temporal/daily/point` | `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `RH2M`, `WS2M`, `ALLSKY_SFC_SW_DWN`, `EVLAND` |
| Histórico mensal ano a ano (1985–2024) | `temporal/monthly/point` | `T2M`, `PRECTOTCORR_SUM` (total do mês; se faltar, `PRECTOTCORR` × dias do mês) |

As unidades são convertidas para o dia a dia do produtor (vento em km/h, radiação em kWh/m²) e a evapotranspiração (`EVLAND`) alimenta a recomendação de irrigação.

### ⚠️ Como os cenários são calculados

Os três cenários do simulador **não são projeções do futuro**. Cada um é a média de um grupo de **anos que aconteceram de verdade** na coordenada do aparelho, segundo a NASA POWER (1985–2024):

| Cenário (no app) | Anos usados |
| --- | --- |
| Mais chuva | média dos **10 anos mais chuvosos** entre 1985 e 2024 |
| Normal | média dos **40 anos** (1985 a 2024) |
| Mais seco | média dos **10 anos mais secos** entre 1985 e 2024 |

"Mais chuvoso" e "mais seco" são definidos pela chuva total do ano civil. A temperatura de cada cenário é a média do mesmo grupo de anos. A comparação "antes" do simulador é sempre o cenário Normal. Em Serra Talhada, por exemplo, a chuva anual fica em cerca de 948 mm (Mais chuva), 648 mm (Normal) e 382 mm (Mais seco).

A API de projeção da NASA POWER (CMIP6) **não cobre o Brasil** na data deste projeto, por isso o app não a consulta. Se a consulta online falhar perto de Serra Talhada (até 0,75°), o app usa uma cópia da NASA POWER salva no próprio app (`src/data/serra-talhada-clima.json`, acessada em 14/11/2026) e avisa isso nas notas da simulação. Em qualquer outro lugar, mostra erro: **nenhum dado é inventado**.

Os resultados são uma **ferramenta de apoio à decisão, não uma previsão garantida**.

## 🌽 Análise das safras de Serra Talhada

Para Serra Talhada (PE), no Sertão do Pajeú, o time comparou, safra a safra de 1985 a 2024, a chuva de cada ciclo com a necessidade de água de milho, feijão-caupi e mandioca, calculada pelo método FAO-56 (ETo de Hargreaves × coeficiente de cultura Kc) a partir dos dados diários da NASA POWER. Cada safra foi classificada como "Choveu o bastante", "Ficou apertado" ou "Faltou chuva", para nove datas de plantio entre 1º de janeiro e 21 de março. No milho plantado em 21/01, por exemplo, faltou chuva em 8 das últimas 10 safras; plantando em 11/02, foram 5. O simulador mostra esse resultado junto das recomendações quando a localização está na região. Método, limites e fontes em [`docs/METHODOLOGY.md`](./docs/METHODOLOGY.md) e [`docs/REFERENCES.md`](./docs/REFERENCES.md).

## 🏗️ Arquitetura

- **Sem backend**: o app consulta a NASA POWER diretamente.
- **Offline-first para os dados do produtor**: lavouras e caderneta ficam em **SQLite** no próprio aparelho (`expo-sqlite`), com dados de exemplo na primeira execução.
- **Localização real**: `expo-location` pega o GPS do aparelho. Se a permissão for negada ou o GPS falhar, o app usa **Serra Talhada (PE)** como local padrão (aparece como "Local padrão" no topo das telas); quando o GPS responder, a posição real substitui a padrão.
- **Fallback gracioso**: se a NASA POWER não responder para o clima diário (sem internet ou timeout de 15 s), a tela mostra dados demonstrativos com o selo "DEMO". Para os cenários do simulador, veja a seção acima.
- **Cache em memória** do histórico ano a ano por coordenada (trocar de cenário não faz nova chamada).

### Estrutura de pastas

```
src/
├── app/            # Telas (Expo Router): index, clima, lavouras, caderneta, mercado
├── components/     # Componentes de UI e cartões (simulador, clima, lavouras...)
├── context/        # Localização do dispositivo
├── db/             # Schema e repositório SQLite
├── hooks/          # useNasaClimate, useNasaProjection, useCrops, useActivities
├── lib/            # Regras puras: simulador, projeção, alertas, irrigação
├── services/       # Integração com a NASA POWER
├── data/           # Dados de demonstração e dados de Serra Talhada (NASA POWER)
├── constants/      # Tema
└── types/          # Tipos TypeScript
```

## 🧰 Tecnologias

- [Expo](https://expo.dev) SDK 58 + [Expo Router](https://docs.expo.dev/router/introduction) (rotas por arquivo e abas nativas)
- React 19 e React Native 0.88 (com React Compiler)
- TypeScript
- `expo-sqlite`, `expo-location`
- [NASA POWER API](https://power.larc.nasa.gov/)

## 🚀 Como rodar

**Pré-requisitos:** Node.js (versão LTS) e npm. Para testar no celular, o app [Expo Go](https://expo.dev/go) ou um [development build](https://docs.expo.dev/develop/development-builds/introduction/).

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o projeto
npx expo start
```

No terminal, escolha onde abrir:

```bash
npm run android   # emulador ou dispositivo Android
npm run ios       # simulador iOS (macOS)
npm run web       # navegador
```

> Permita o acesso à localização quando o app pedir. Sem isso, ele não consegue buscar o clima da sua propriedade.
>
> Sem permissão de localização, o app usa Serra Talhada (PE) como local padrão.
>
> No navegador, testamos em 15/11/2026: a NASA POWER responde com `Access-Control-Allow-Origin: *` e as chamadas funcionam. Se algum dia a NASA bloquear por CORS, o clima diário cai nos dados demonstrativos e o simulador continua funcionando para Serra Talhada com os dados salvos no app.

Para checar o código: `npm run lint` e `npx tsc --noEmit`.

Para conferir a camada de dados (sem internet), rode `npx tsx scripts/verificar-dados.ts`, ou, no Node 24 sem instalar nada, `node --import ./scripts/ts-register.mjs scripts/verificar-dados.ts`.

## ⚠️ Limitações conhecidas

- As faixas ideais de chuva e temperatura das culturas são valores de referência simplificados; devem ser validadas com a assistência técnica local (Embrapa, Emater etc.).
- A irrigação usa uma regra simples (evapotranspiração menos chuva do dia), sem sensores de solo nem coeficiente de cultura (Kc). A evapotranspiração usada é o `EVLAND` (evapotranspiração real do modelo de superfície da NASA POWER), **não** a evapotranspiração de referência (ETo) da FAO-56.
- Os dados diários da NASA POWER têm atraso de cerca de 3 dias: o "hoje" do app é o dia mais recente disponível.
- Os cenários do simulador são médias de anos passados (1985–2024), não projeções do clima futuro.
- A frase com o resultado das safras vale só para a região de Serra Talhada (até 0,75° do município) e para milho, feijão-caupi e mandioca.
- A nota do simulador vem de faixas ideais simplificadas e pode discordar do resultado das safras (ex.: milho em 21/01 tem nota alta no cenário Normal, mas faltou chuva em 8 das últimas 10 safras). As duas informações aparecem lado a lado.
- A tela de Mercado usa dados fictícios e está desativada.

## 🗺️ Próximos passos

- Projeções reais do clima futuro para o Brasil (por exemplo, NASA NEX-GDDP-CMIP6).
- Servidor próprio como proxy e cache da NASA POWER.
- Levar a análise das safras (FAO-56) para outros municípios do Semiárido.
- Mais culturas e variedades, com parâmetros validados por especialistas.
- Integração com sensores de solo e coeficiente de cultura (Kc).
- Ativar a tela de Mercado para venda direta entre produtores.

## 🤖 Uso de IA

Ferramentas de IA (Claude) foram usadas para apoiar o código, a análise e os textos. Os dados vêm da NASA POWER e as decisões foram revisadas pelo time.

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](./LICENSE).

## 🙏 Agradecimentos

- **NASA POWER**, pelos dados abertos de agroclimatologia.
- Organização do **NASA Space Apps Hackathon**.
- Aos agricultores familiares, que inspiram este projeto.
