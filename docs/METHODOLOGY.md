# Orbis — Methodology

Orbis helps family farmers in Brazil's semi-arid region test their own planting decision against decades of NASA climate data. This document explains how the numbers shown in the app are produced and what they cannot tell.

## Data

- **Source:** NASA POWER (Prediction Of Worldwide Energy Resources), daily point data, Agroclimatology community, accessed through the public API at power.larc.nasa.gov.
- **Parameters:** `PRECTOTCORR` (precipitation, mm/day), `T2M` (mean air temperature at 2 m, °C), `T2M_MAX` and `T2M_MIN` (daily maximum and minimum, °C).
- **Period:** 1985 to 2024 (40 growing seasons).
- **Location:** Serra Talhada, Pernambuco, Brazil (7.988° S, 38.296° W, municipal seat coordinates from IBGE). Sertão of Pernambuco, Pajeú micro-region, Caatinga biome, mostly rainfed family farming.

## Method

1. **Reference evapotranspiration (ETo).** Computed daily with the Hargreaves equation, as given in FAO Irrigation and Drainage Paper 56 (eq. 52). Extraterrestrial radiation is derived from latitude and day of year (FAO-56, eq. 21 to 25). Hargreaves was chosen because it needs only temperature, which NASA POWER provides consistently for the whole period.
2. **Crop water demand.** For each crop, daily ETo is multiplied by a crop coefficient (Kc) that follows the four-stage FAO-56 curve (initial, development, mid-season, late season). Planting dates, stage lengths and Kc values come from FAO-56 (Tables 11 and 12) and from Embrapa's climate-risk zoning for the Pajeú-Moxotó region (see REFERENCES.md):

| Crop | Planting date | Stage lengths (init/dev/mid/late, days) | Kc (ini/mid/end) | Notes |
| --- | --- | --- | --- | --- |
| Maize | Jan 21 | 25/40/45/30 (FAO-56, arid climate, Dec/Jan planting) | 0.30/1.20/0.35 | Planting date is the middle of Embrapa's favorable window for Pajeú-Moxotó (Jan 1 to Feb 10). Kc end assumes grain dried in the field. |
| Cowpea | Jan 21 | 15/25/35/20 | 0.40/1.05/0.35 | Kc mid and end from FAO-56 "Green gram and cowpeas". FAO-56 has no cowpea stage lengths; dry bean lengths are used as an approximation. Reference planting date falls within Embrapa's January window. |
| Cassava (year 1) | Jan 11 | 20/40/90/60 | 0.30/0.80/0.30 | FAO-56, tropical regions, rainy-season planting. Planting date is a team assumption (start of the rainy season). |
3. **Season water balance.** For every season, total rainfall during the crop cycle is divided by total crop water demand over the same days.
4. **Classification.** Ratio ≥ 1.0: *sufficient* (rainfall covered the demand). Ratio between 0.7 and 1.0: *tight*. Ratio below 0.7: *insufficient*. The 0.7 boundary is a team assumption, not taken from a published source; it is kept configurable in `config/crops.json`. In the app these classes read as "enough rain", "tight" and "rain fell short".
5. **Summary.** The app shows how many of the last 40, 20 and 10 seasons fell into each class, for the farmer's current crop and for two alternatives.

## Planting options (what the farmer can change)

Knowing that rain often falls short is not enough: the farmer needs a decision within reach. For each crop, Orbis repeats the same water-balance calculation for nine planting dates (every 10 days from January 1 to March 21) and, for maize, two seed cycles:

- **Normal cycle (about 140 days):** FAO-56 stage lengths for maize in arid climates.
- **Early cycle (about 100 days):** FAO notes that early grain varieties take 80 to 110 days when mean temperatures are above 20 °C. Stage lengths were scaled proportionally from the normal cycle (team assumption).

The most robust option is the one with the fewest short-rain seasons over the last 20 seasons, then the last 10, then the most "enough rain" seasons over 40. A single decade is a small sample, so it is never used alone.

Results for Serra Talhada (seasons in which rain fell short):

| Maize option | Last 10 | Last 20 | Last 40 |
| --- | --- | --- | --- |
| Normal cycle, planted Jan 21 (reference) | 8 | 11 | 18 |
| Normal cycle, planted Feb 11 | 5 | 7 | 17 |
| Early cycle, planted Feb 21 | 5 | 8 | 18 |
| Normal cycle, planted Mar 21 | 8 | 12 | 25 |

Reading: within the official planting window for Pajeú-Moxotó (Embrapa indicates January 1 to February 10, possibly extending to February 20), later plantings in early-to-mid February and early-cycle seeds were less exposed to short rain in recent decades. Planting in March was consistently worse. These are indications for discussion with local technicians, not prescriptions.

## What the results cannot tell

- **Scale.** NASA POWER is gridded data (about 0.5°, roughly 50 km). It describes the region, not a specific field.
- **Water on the farm.** Cisterns, wells, irrigation and soil water storage are not modeled. A farm with stored water may do better than the regional history suggests.
- **Rainfall timing.** Total rainfall in the cycle is compared with total demand; a dry spell at a critical stage inside a "sufficient" season is not captured.
- **Soil, pests and markets.** None of these are included. They can change which rotation is best.
- **Hargreaves accuracy.** It is a temperature-based approximation of evapotranspiration and can differ from the full Penman-Monteith method.
- **Conservative by design.** Because stored soil water is ignored, the method tends to classify more seasons as short of rain than a full soil water balance would. Comparisons between crops and between decades are more reliable than any single absolute number.
- **"Rain fell short" is not crop failure.** It means rainfall did not cover the full water demand of a well-watered crop.
- **Cassava is drought tolerant.** The FAO-56 mid-season Kc for cassava assumes non-stressed conditions, so the method underestimates cassava's viability.
- **Drought years.** The 2015–2024 decade includes part of the 2012–2017 drought in Brazil's semi-arid region; decade comparisons should be read with that in mind.

## Key results for Serra Talhada (1985–2024)

| | 1985–1994 average | 2015–2024 average |
| --- | --- | --- |
| Annual rainfall | 683 mm | 547 mm |
| Mean temperature | 25.6 °C | 26.3 °C |
| Days at or above 35 °C | 118 per year | 145 per year |

Seasons in which rain fell short (ratio < 0.7):

| Crop | 2005–2014 | 2015–2024 | Last 40 seasons |
| --- | --- | --- | --- |
| Maize | 3 of 10 | 8 of 10 | 18 of 40 |
| Cowpea | 4 of 10 | 6 of 10 | 16 of 40 |
| Cassava | 2 of 10 | 5 of 10 | 15 of 40 |

Orbis is a decision-support tool. It supports, and never replaces, the judgment of farmers and local agricultural experts.

## Output format (read by the app)

```json
{
  "meta": { "place": "...", "lat": 0, "lon": 0, "period": [1985, 2024], "source": "...", "thresholds": {}, "limitations": [] },
  "climate": { "annual": [ { "year": 1985, "rain_mm": 0, "t_mean_c": 0, "hot_days": 0 } ] },
  "crops": {
    "milho": {
      "label": "Milho",
      "source": "...",
      "seasons": [ { "season": 1985, "planting_date": "1985-03-01", "rain_mm": 0, "demand_mm": 0, "ratio": 0, "class": "suficiente" } ],
      "summary": { "last_40": { "suficiente": 0, "apertado": 0, "insuficiente": 0, "total": 40, "from": 1985, "to": 2024 } },
      "planting_options": [ { "variant": "normal", "variant_label": "...", "planting": "02-11", "is_current": false, "summary": { "last_10": {}, "last_20": {}, "last_40": {} } } ],
      "best_option": { "variant": "normal", "planting": "02-11", "summary": {} }
    }
  }
}
```

## Reproducibility

All code is in the analysis folder and can be re-run with `python run.py`; data downloaded on 2026-11-14. Unit tests (`python -m pytest`) include the FAO-56 worked example for extraterrestrial radiation.
