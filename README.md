# 🌱 Orbis

> Climate simulations powered by NASA data to help family farmers decide **what to plant** and **when to plant**.

[🇧🇷 Português](./README.br.md) · 🇺🇸 English

Built for the **NASA Space Apps Hackathon**, using the public **NASA POWER** (Prediction Of Worldwide Energy Resources) API.

---

## 📖 About

Smallholder farmers feel climate unpredictability first-hand: rain that doesn't arrive, heat out of season, a lost harvest. Most forecasting tools are designed for large-scale producers, with technical language and little connection to the reality of people farming a few hectares.

**Orbis** is a mobile app (Android, iOS and web) that reads the phone's location, fetches NASA satellite data for that exact point, and answers in plain language questions like:

- *How has the weather been on my farm over the last few days?*
- *Do I need to irrigate today?*
- *Which month should I plant maize, beans, soybean or cassava?*
- *What if next year is drier or wetter than usual?*

> The app's interface is in Brazilian Portuguese, since it targets Brazilian family farmers.

## ✨ Features

| Screen | What it does |
| --- | --- |
| **Home** | Greeting, today's weather, weekly rainfall, irrigation advice and automatic alerts (heavy rain, fungal-disease risk, strong wind for spraying). |
| **Climate** | Daily series for the last 14 days at the device location, plus the **planting simulator**. |
| **Crops** | Register crops (name, variety, area), track status and expected harvest. |
| **Field Notebook** | Field diary: log irrigation, fertilizing, spraying, planting, harvesting and other tasks. |

> 🛒 A **Market** screen (peer-to-peer trading between farmers) exists with demo data, but it is **disabled** in the tab bar in this version.

### 🧪 Planting simulator

The core of the project. The farmer picks:

1. **A crop**: maize, beans, soybean or cassava.
2. **A planting date**.
3. **A climate scenario**: *Wetter*, *Normal* or *Drier*.

The app evaluates **all 12 possible planting windows** (one starting each month), compares them with the chosen date and shows:

- a **score from 0 to 100** and a rating (**ideal**, **moderate** or **risk**);
- the **best month to plant** and the expected harvest month;
- expected total rainfall and average temperature over the crop cycle, compared with the historical baseline;
- **practical recommendations** in plain language (e.g. prepare irrigation, manage drainage, use mulch to retain moisture);
- in the Serra Talhada (PE) region, the **actual outcome of recent crop seasons** for the chosen crop and date (see [Serra Talhada crop-season analysis](#-serra-talhada-crop-season-analysis)).

The score starts at 100 and loses points when projected cycle rainfall falls below or above the crop's ideal range, or when average temperature leaves its ideal range. Each crop's parameters live in [`src/lib/planting-simulator.ts`](./src/lib/planting-simulator.ts).

## 🛰️ NASA data

Orbis makes two kinds of queries to the [NASA POWER API](https://power.larc.nasa.gov/docs/services/api/) (`AG` agroclimatology community). No API key is required.

| Use | Endpoint | Parameters |
| --- | --- | --- |
| Recent weather (14 days) | `temporal/daily/point` | `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `RH2M`, `WS2M`, `ALLSKY_SFC_SW_DWN`, `EVLAND` |
| Year-by-year monthly history (1985–2024) | `temporal/monthly/point` | `T2M`, `PRECTOTCORR_SUM` (monthly total; falls back to `PRECTOTCORR` × days in month) |

Units are converted for everyday use (wind in km/h, solar radiation in kWh/m²), and evapotranspiration (`EVLAND`) feeds the irrigation advice.

### ⚠️ How the scenarios are built

The simulator's three scenarios are **not projections of the future**. Each one is the average of a group of **years that actually happened** at the device's coordinate, according to NASA POWER (1985–2024):

| Scenario (in app) | Years used |
| --- | --- |
| Wetter ("Mais chuva") | average of the **10 wettest years** between 1985 and 2024 |
| Normal | average of all **40 years** (1985 to 2024) |
| Drier ("Mais seco") | average of the **10 driest years** between 1985 and 2024 |

"Wettest" and "driest" are ranked by total calendar-year rainfall. Each scenario's temperature is the average of the same group of years. The simulator's "before" value is always the Normal scenario. In Serra Talhada, for example, annual rainfall is about 948 mm (Wetter), 648 mm (Normal) and 382 mm (Drier).

At the time of this project the NASA POWER projection API (CMIP6) **does not cover Brazil**, so the app does not call it. If the online query fails near Serra Talhada (within 0.75°), the app uses a copy of NASA POWER data bundled with the app (`src/data/serra-talhada-clima.json`, accessed on 2026-11-14) and says so in the simulation notes. Anywhere else it shows an error: **no data is made up**.

Results are a **decision-support tool, not a guaranteed forecast**.

## 🌽 Serra Talhada crop-season analysis

For Serra Talhada (Pernambuco), in Brazil's semi-arid Sertão, the team compared, season by season from 1985 to 2024, the rainfall of each crop cycle with the water demand of maize, cowpea and cassava, computed with the FAO-56 method (Hargreaves ETo × crop coefficient Kc) from NASA POWER daily data. Each season was classified as "enough rain", "tight" or "rain fell short" for nine planting dates between January 1 and March 21. For maize planted on January 21, for example, rain fell short in 8 of the last 10 seasons; planting on February 11, it was 5. The simulator shows this result alongside its recommendations when the location is in the region. Method, limits and sources are in [`docs/METHODOLOGY.md`](./docs/METHODOLOGY.md) and [`docs/REFERENCES.md`](./docs/REFERENCES.md).

## 🏗️ Architecture

- **No backend**: the app queries NASA POWER directly.
- **Offline-first for farmer data**: crops and notebook entries are stored in on-device **SQLite** (`expo-sqlite`), seeded with sample data on first launch.
- **Real location**: `expo-location` reads the device GPS. If permission is denied or GPS fails, the app uses **Serra Talhada (PE)** as the default location (shown as "Local padrão" at the top of the screens); once GPS responds, the real position replaces it.
- **Graceful fallback**: if NASA POWER is unreachable for recent daily weather (no internet or 15 s timeout), the screen shows demo data with a "DEMO" badge. For the simulator scenarios, see the section above.
- **In-memory cache** of the year-by-year history per coordinate (switching scenarios makes no new request).

### Folder structure

```
src/
├── app/            # Screens (Expo Router): index, clima, lavouras, caderneta, mercado
├── components/     # UI components and cards (simulator, weather, crops...)
├── context/        # Device location
├── db/             # SQLite schema and repository
├── hooks/          # useNasaClimate, useNasaProjection, useCrops, useActivities
├── lib/            # Pure logic: simulator, projection, alerts, irrigation
├── services/       # NASA POWER integration
├── data/           # Demo data and Serra Talhada data (NASA POWER)
├── constants/      # Theme
└── types/          # TypeScript types
```

## 🧰 Tech stack

- [Expo](https://expo.dev) SDK 58 + [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing, native tabs)
- React 19 and React Native 0.88 (with React Compiler)
- TypeScript
- `expo-sqlite`, `expo-location`
- [NASA POWER API](https://power.larc.nasa.gov/)

## 🚀 Getting started

**Prerequisites:** Node.js (LTS) and npm. To test on a phone, use [Expo Go](https://expo.dev/go) or a [development build](https://docs.expo.dev/develop/development-builds/introduction/).

```bash
# 1. Install dependencies
npm install

# 2. Start the project
npx expo start
```

Then choose where to open it:

```bash
npm run android   # Android emulator or device
npm run ios       # iOS simulator (macOS)
npm run web       # browser
```

> Grant location access when prompted. Without it, the app can't fetch weather for your farm.
>
> Without location permission, the app uses Serra Talhada (PE) as the default location.
>
> In the browser, we tested on 2026-11-15: NASA POWER answers with `Access-Control-Allow-Origin: *` and requests work. If NASA ever blocks them via CORS, daily weather falls back to demo data and the simulator keeps working for Serra Talhada with the bundled data.

To check the code: `npm run lint` and `npx tsc --noEmit`.

To check the data layer (offline), run `npx tsx scripts/verificar-dados.ts`, or, on Node 24 with nothing to install, `node --import ./scripts/ts-register.mjs scripts/verificar-dados.ts`.

## ⚠️ Known limitations

- The crops' ideal rainfall and temperature ranges are simplified reference values; they should be validated with local agronomy support (e.g. Embrapa, Emater).
- Irrigation advice uses a simple rule (evapotranspiration minus the day's rain), with no soil sensors or crop coefficient (Kc). The evapotranspiration used is `EVLAND` (actual evapotranspiration from NASA POWER's land-surface model), **not** the FAO-56 reference evapotranspiration (ETo).
- NASA POWER daily data lags by about 3 days: the app's "today" is the most recent day available.
- Simulator scenarios are averages of past years (1985–2024), not projections of the future climate.
- The crop-season sentence only applies to the Serra Talhada region (within 0.75° of the town) and to maize, cowpea and cassava.
- The simulator score comes from simplified ideal ranges and may disagree with the crop-season result (e.g. maize on January 21 scores high in the Normal scenario, yet rain fell short in 8 of the last 10 seasons). Both are shown side by side.
- The Market screen uses fictional data and is disabled.

## 🗺️ Roadmap

- Real future-climate projections for Brazil (e.g. NASA NEX-GDDP-CMIP6).
- Own server as a NASA POWER proxy and cache.
- Extend the FAO-56 crop-season analysis to other towns in the semi-arid region.
- More crops and varieties, with parameters validated by specialists.
- Soil sensor and crop coefficient (Kc) integration.
- Enable the Market screen for direct farmer-to-farmer sales.

## 🤖 Use of AI

AI tools (Claude) were used to support code, analysis and writing. The data comes from NASA POWER and decisions were reviewed by the team.

## 📄 License

Released under the MIT License. See [`LICENSE`](./LICENSE).

## 🙏 Acknowledgments

- **NASA POWER**, for open agroclimatology data.
- The **NASA Space Apps Hackathon** organizers.
- Family farmers, who inspire this project.
