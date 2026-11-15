# 🌱 Orbis

> Climate simulations powered by NASA data to help family farmers decide **what to plant** and **when to plant**.

[🇧🇷 Português](./README.md) · 🇺🇸 English

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
- **practical recommendations** in plain language (e.g. prepare irrigation, manage drainage, use mulch to retain moisture).

The score starts at 100 and loses points when projected cycle rainfall falls below or above the crop's ideal range, or when average temperature leaves its ideal range. Each crop's parameters live in [`src/lib/planting-simulator.ts`](./src/lib/planting-simulator.ts).

## 🛰️ NASA data

Orbis makes three kinds of queries to the [NASA POWER API](https://power.larc.nasa.gov/docs/services/api/) (`AG` agroclimatology community). No API key is required.

| Use | Endpoint | Parameters |
| --- | --- | --- |
| Recent weather (14 days) | `temporal/daily/point` | `T2M`, `T2M_MAX`, `T2M_MIN`, `PRECTOTCORR`, `RH2M`, `WS2M`, `ALLSKY_SFC_SW_DWN`, `EVLAND` |
| Reference climatology (1985–2024) | `temporal/monthly/point` | `T2M`, `PRECTOTCORR` |
| Future projection | `projection/monthly/point` (CMIP6 ensemble) | `T2M`, `PRECTOTCORR` |

Units are converted for everyday use (wind in km/h, solar radiation in kWh/m²), and evapotranspiration (`EVLAND`) feeds the irrigation advice.

### ⚠️ Transparency about projections

At the time of this project, the NASA POWER projection API **does not yet cover Brazil**. The app tries it first and, when it has no data for the point, falls back to a **calibrated estimate** built on the real NASA historical climatology for that coordinate:

| Scenario (in app) | Reference SSP | Temperature offset | Rainfall factor |
| --- | --- | --- | --- |
| Wetter | SSP1-2.6 | +0.8 °C | × 0.98 |
| Normal | SSP2-4.5 | +1.4 °C | × 0.93 |
| Drier | SSP3-7.0 | +2.2 °C | × 0.87 |

These offsets are a **heuristic for demonstration purposes**, not the output of downscaled CMIP6 models. The UI indicates the data source in each simulation. Results are a **decision-support tool, not a guaranteed forecast**.

## 🏗️ Architecture

- **No backend**: the app queries NASA POWER directly.
- **Offline-first for farmer data**: crops and notebook entries are stored in on-device **SQLite** (`expo-sqlite`), seeded with sample data on first launch.
- **Real location**: `expo-location` reads the device GPS; weather and simulations use only that position.
- **Graceful fallback**: if NASA POWER is unreachable (no internet, 15 s timeout, or CORS blocking in the browser), the screen shows demo data and notifies the user.
- **In-memory cache** of projections per coordinate, scenario and start year.

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
├── data/           # Demo data
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
> In the browser, NASA POWER may block requests due to CORS and the app will show demo data. For the full experience, use Android or iOS.

To lint the code: `npm run lint`.

## ⚠️ Known limitations

- The crops' ideal rainfall and temperature ranges are simplified reference values; they should be validated with local agronomy support (e.g. Embrapa, Emater).
- Irrigation advice uses a simple rule (evapotranspiration minus the day's rain), with no soil sensors or crop coefficient (Kc).
- Future projections for Brazil use the calibrated estimate described above.
- The Market screen uses fictional data and is disabled.

## 🗺️ Roadmap

- Own backend as a NASA POWER proxy (avoids CORS blocking on web).
- Real downscaled projections (e.g. NASA NEX-GDDP-CMIP6).
- More crops and varieties, with parameters validated by specialists.
- Soil sensor and crop coefficient (Kc) integration.
- Enable the Market screen for direct farmer-to-farmer sales.

## 📄 License

Released under the MIT License. See [`LICENSE`](./LICENSE).

## 🙏 Acknowledgments

- **NASA POWER**, for open agroclimatology data.
- The **NASA Space Apps Hackathon** organizers.
- Family farmers, who inspire this project.
