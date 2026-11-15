# 🌱 Orbis

> Simulações de clima com dados da NASA para ajudar a agricultura familiar a decidir **o que plantar** e **quando plantar**.

🇧🇷 Português · [🇺🇸 English](./README.en.md)

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
3. **O cenário climático**: *Mais chuva*, *Normal* ou *Mais seco*.

O app avalia **as 12 janelas de plantio possíveis** (um início em cada mês), compara com a data escolhida e mostra:

- uma **nota de 0 a 100** e a classificação (**ideal**, **moderado** ou **risco**);
- o **melhor mês para plantar** e o mês previsto da colheita;
- chuva total e temperatura média esperadas durante o ciclo, comparadas à média histórica;
- **recomendações práticas** em linguagem simples (ex.: preparar irrigação, cuidar do escoamento, usar palhada para segurar a umidade).

A nota parte de 100 e perde pontos quando a chuva prevista para o ciclo fica abaixo ou acima da faixa ideal da cultura, ou quando a temperatura média sai da faixa ideal. Os parâmetros de cada cultura estão em [`src/lib/planting-simulator.ts`](./src/lib/planting-simulator.ts).

## 🛰️ Dados da NASA

O Orbis usa três consultas à [API NASA POWER](https://power.larc.nasa.gov/docs/services/api/) (comunidade `AG`, agroclimatologia). Não é necessária chave de API.

| Uso | Endpoint | Parâmetros |
| --- | --- | --- |
| Clima recente (14 dias) | `temporal/daily/point` | `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `RH2M`, `WS2M`, `ALLSKY_SFC_SW_DWN`, `EVLAND` |
| Climatologia de referência (1985–2024) | `temporal/monthly/point` | `T2M`, `PRECTOTCORR` |
| Projeção futura | `projection/monthly/point` (ensemble CMIP6) | `T2M`, `PRECTOTCORR` |

As unidades são convertidas para o dia a dia do produtor (vento em km/h, radiação em kWh/m²) e a evapotranspiração (`EVLAND`) alimenta a recomendação de irrigação.

### ⚠️ Transparência sobre as projeções

Na data deste projeto, a API de projeção da NASA POWER **ainda não cobre o Brasil**. O app tenta consultá-la primeiro e, quando ela não responde para o ponto, usa uma **estimativa calibrada** sobre a climatologia histórica real da NASA para a coordenada:

| Cenário (no app) | SSP de referência | Ajuste de temperatura | Fator de chuva |
| --- | --- | --- | --- |
| Mais chuva | SSP1-2.6 | +0,8 °C | × 0,98 |
| Normal | SSP2-4.5 | +1,4 °C | × 0,93 |
| Mais seco | SSP3-7.0 | +2,2 °C | × 0,87 |

Esses ajustes são uma **heurística para fins de demonstração**, não o resultado de um downscaling de modelos CMIP6. A tela indica a origem dos dados em cada simulação. Os resultados são uma **ferramenta de apoio à decisão, não uma previsão garantida**.

## 🏗️ Arquitetura

- **Sem backend**: o app consulta a NASA POWER diretamente.
- **Offline-first para os dados do produtor**: lavouras e caderneta ficam em **SQLite** no próprio aparelho (`expo-sqlite`), com dados de exemplo na primeira execução.
- **Localização real**: `expo-location` pega o GPS do aparelho; o clima e as simulações usam somente essa posição.
- **Fallback gracioso**: se a NASA POWER não responder (sem internet, timeout de 15 s, ou bloqueio de CORS no navegador), a tela mostra dados demonstrativos e avisa o usuário.
- **Cache em memória** das projeções por coordenada, cenário e ano.

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
├── data/           # Dados de demonstração
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
> No navegador, a NASA POWER pode bloquear as chamadas por CORS e o app passa a exibir dados demonstrativos. Para a experiência completa, prefira Android ou iOS.

Para checar o código: `npm run lint`.

## ⚠️ Limitações conhecidas

- As faixas ideais de chuva e temperatura das culturas são valores de referência simplificados; devem ser validadas com a assistência técnica local (Embrapa, Emater etc.).
- A irrigação usa uma regra simples (evapotranspiração menos chuva do dia), sem sensores de solo nem coeficiente de cultura (Kc).
- Projeções futuras para o Brasil usam a estimativa calibrada descrita acima.
- A tela de Mercado usa dados fictícios e está desativada.

## 🗺️ Próximos passos

- Backend próprio como proxy da NASA POWER (evita o bloqueio de CORS na web).
- Projeções downscaled reais (por exemplo, NASA NEX-GDDP-CMIP6).
- Mais culturas e variedades, com parâmetros validados por especialistas.
- Integração com sensores de solo e coeficiente de cultura (Kc).
- Ativar a tela de Mercado para venda direta entre produtores.

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo [`LICENSE`](./LICENSE).

## 🙏 Agradecimentos

- **NASA POWER**, pelos dados abertos de agroclimatologia.
- Organização do **NASA Space Apps Hackathon**.
- Aos agricultores familiares, que inspiram este projeto.
