# MASTER PROMPT 1 — VaanEye · COMPLETE PROJECT BRIEF
> Everything about the product in one document. Paste this into any AI to give it full context.

---

## 1. IDENTITY

**Product:** VaanEye (வான்கண்) — "The Eye in the Sky"
**One line:** A single platform that reads free ISRO, NASA and ESA satellite data and tells any citizen ONE thing they can act on — in their own language, on any phone.
**Category:** Geo-intelligence SaaS for citizens, built entirely on 100% free open satellite data.

**Hackathon context:**
| Field | Value |
|---|---|
| Event | Smart India Hackathon 2026 (9th edition) |
| PS ID | SIH26209 |
| PS Title | Student Innovation — Space Technology |
| Theme | Space Technology |
| Category | Software |
| Organisation | AICTE |
| Prize | ₹1,00,000 per winning team |
| Deadline | 30 September 2026 |
| Team | Exactly 6 members, minimum 1 female |
| Grand Finale | December 2026 |

---

## 2. THE PROBLEM (three failures, in order)

1. **Fragmented** — One app for weather, another for crops, a third for floods. Nothing is connected, so nobody sees the whole picture.
2. **Unreadable** — Government agencies publish petabytes of satellite imagery for free, but as raw GeoTIFF rasters that need a GIS degree to even open.
3. **Unreachable** — Every existing tool assumes a smartphone and 4G. The people most exposed to weather, flood and crop failure have neither.

**The gap:** India already owns world-class satellites. The data is already free. The failure is purely in the last mile — nobody translates a raster into a sentence a farmer can act on.

---

## 3. THE SOLUTION

1. **Six domains, one window** — Flood, fire, crop, sea, heat and encroachment fused into a single dashboard instead of ten disconnected portals.
2. **Raster becomes a sentence** — The engine turns imagery into one plain Tamil line: *"Fire 12 km north-east — move now."*
3. **Delivered to any handset** — App push, SMS and Tamil IVR voice call, so it works on a 2G feature phone with no internet.

---

## 4. THE SIX PILLARS

| # | Pillar | What it does | Data used |
|---|---|---|---|
| 1 | **Disaster — Flood & Fire** | SAR sees through monsoon cloud; thermal SWIR pinpoints hotspots and sends the exact GPS grid | Sentinel-1 SAR, VIIRS/MODIS fire, INSAT-3D thermal |
| 2 | **Agriculture — Crop Health** | Weekly NDVI vigour score, SAR soil moisture for irrigation timing, early pest-stress signals | Sentinel-2, Landsat 8/9, Sentinel-1 |
| 3 | **Marine & Fisheries** | Fishing zones from sea temperature + chlorophyll; offline alarm before the maritime border (IMBL) | INCOIS PFZ, Oceansat, MODIS chlorophyll |
| 4 | **Climate & Public Safety** | Land Surface Temperature drives street-level heatwave warnings, rain nowcast and AQI | Landsat LST, INSAT-3D, MODIS |
| 5 | **Infrastructure — Land Change** | Yesterday-vs-today pixel differencing exposes illegal construction and lake encroachment | Sentinel-2, Cartosat, SAR backscatter diff |
| 6 | **Environmental Health** | Oil spills, industrial effluent and deforestation, auto-escalated to the right authority | Sentinel-1/2, Landsat |

---

## 5. USP — WHY WE WIN

| USP | Detail |
|---|---|
| **₹0 data cost** | We launch no satellite. Public feeds via open APIs, so the core map stays free for the citizen forever. |
| **100% reach — 2G phones** | Every rival needs a smartphone and 4G. Our IVR voice + SMS path reaches the rural majority they structurally cannot serve. |
| **6 → 1 window** | Ten disconnected agency portals collapse into one dashboard answering with a single plain Tamil sentence. |
| **Verified accuracy** | Our SGP4 propagation matched live ISS telemetry to **0.3 km ground error** — real, provable positions. |

---

## 6. TECHNOLOGY STACK (fixed — do not substitute)

```
FRONTEND    Next.js 14 (React) · Mapbox GL · deployed on Vercel
BACKEND     Express API broker on the Node.js runtime
DATABASE    Supabase — PostgreSQL + PostGIS
ALERTS      Firebase — FCM push, offline cache, auth
LAST MILE   SMS gateway + IVR Tamil voice broadcast
PROCESSING  Python workers — GDAL, Rasterio, Fiona, NumPy, SciPy,
            PyTorch (CNN on SWIR), OpenCV (temporal differencing)
3D GLOBE    three.js r160 + satellite.js 5.0.0 (SGP4) + live Celestrak TLEs
```

### Why BOTH Supabase and Firebase (judges will ask)
| | Supabase | Firebase |
|---|---|---|
| PostGIS spatial query | ✅ R-Tree, sub-millisecond | ❌ none |
| Realtime while app OPEN | ✅ | ✅ |
| **Push to a CLOSED app** | ❌ **cannot** | ✅ **FCM** |
| Offline sync at sea | ⚠️ weak | ✅ strong |

**Supabase = the brain** (spatial intelligence, land polygons, alert history).
**Firebase = the mouth** (wakes a closed phone at 2 a.m. when the fire starts).
**SMS/IVR = the safety net** (no internet at all).

---

## 7. HOW ONE ALERT IS BORN (the core flow)

```
1. SATELLITE PASS     ISRO / ESA / NASA raw open imagery
        ↓
2. ANALYSE            NDVI · SAR · thermal · AI change detection
        ↓
3. MATCH YOUR LAND    PostGIS finds YOUR field inside the danger zone
        ↓
4. PLAIN SENTENCE     "Fire 12 km away — move north now"
        ↓
5. REACHES YOU        App push · SMS · Tamil voice call
```

**All-weather resilience:** when monsoon cloud blinds optical sensors, the pipeline auto-switches to Sentinel-1 C-band SAR, fused with INSAT-3D thermal refreshing every 15 minutes over India.

---

## 8. ONBOARDING FLOW (6 steps, bilingual Tamil + English)

Every screen shows its name in **Tamil and English at the top**.

1. **Login** — name, 10-digit mobile, language choice, OTP
2. **Location** — two options offered first:
   - Option A: cascade country → state → district → taluk → village
   - Option B: 6-digit PIN code
   - Plus a GPS shortcut
3. **Map verification** — a *separately named screen* so the user never feels they entered the same thing twice. Satellite reports the land type; user confirms Yes/No.
4. **Role** — multi-select Public / Farmer / Fisherman + occupation + inside/outside work area
5. **Mark your place** — role-branched:
   - Farmer: walk / ride / draw / survey-number, with skip + pause-resume
   - Fisherman: 4 sea zones including IMBL border, harbour, boat number
   - Public: GPS or drag pin
6. **Review** — unlimited watched places + alert channel selection → Finish → dashboard

**Demo path:** mobile `9876543210`, PIN `627501`, Farmer + Fisherman + Outside, 2.40 acres / 9,712 m², 8.7642° N 78.1348° E

---

## 9. PROOF THE PROTOTYPE IS REAL

**Accuracy validation — quote this to judges:**
| Check | Value |
|---|---|
| Live wheretheiss.at ISS API | lat −0.934, lon −145.817, alt 418.0 km |
| Our SGP4 propagation | lat −0.931, lon −145.818, alt 418.0 km |
| **Ground error** | **≈ 0.3 km** |
| TLE freshness (3,999 objects) | median 0.3 days, max 25.5 days |

**Live site metrics:** 7,906 satellites propagated in-browser · 16,019 in catalogue · 151 platform features · ₹0 data cost

---

## 10. FEASIBILITY

1. **Technology is already in orbit** — we build and launch nothing. Multi-billion-dollar public satellites are consumed through open REST APIs that are live right now.
2. **Skills are mainstream** — Next.js + Express + Node is a standard stack; GDAL, Rasterio and PyTorch are mature and documented.
3. **Zero capital expenditure** — only open-source packages and free tiers. Vercel + Render carry the pilot. No licence fees, no hardware.
4. **Legally clear** — fully within the National Geospatial Policy 2021; we parse only civilian-grade public telemetry released for public good.

### Risks → Strategies
| Risk | Strategy |
|---|---|
| Cloud blocks optical imagery | auto-fallback to SAR radar |
| Satellite revisit time gaps | fuse geostationary INSAT-3D |
| Villages with no internet | SMS + IVR voice pathway |
| False alarms erode trust | two-sensor confirmation before dispatch |
| Scaling compute cost | tile caching + district-level batching |

---

## 11. VIABILITY

1. **The need repeats every single year** — monsoons, crop cycles and fishing seasons return annually, so retention is structural.
2. **Free core, paid precision** — map and public alerts free forever; ₹15–20/month buys custom-drawn asset boundaries and daily automated monitoring.
3. **Government contracts (B2G)** — State Disaster cells and municipalities license sprawl timelines and encroachment evidence on multi-year terms.
4. **A moat rivals cannot cross** — competitors are smartphone-and-4G only; our IVR + SMS layer reaches the rural majority they cannot serve at any price.

### Scale path
| Phase | Scope |
|---|---|
| 1 | Tamil Nadu pilot — 2 districts, 5,000 users |
| 2 | All coastal states — Tamil + 4 languages |
| 3 | Pan-India — 12 languages, state DM integration |
| 4 | Open API for panchayats, NGOs, researchers |
| 5 | Institutional B2G licensing at state scale |

---

## 12. IMPACT

| Audience | Impact | Reach |
|---|---|---|
| **Farmers** | Weekly crop health score and irrigation timing replace guesswork. Land walked once with GPS, saved forever. Pest stress flagged before it spreads. | 2.5 crore+ farm households |
| **Fishermen** | Fishing-zone bearings end wasted fuel on empty trips; offline maritime-border alarm prevents arrests and boat seizures. | 40 lakh+ coastal livelihoods |
| **Families & workers** | Heatwave, air and flood warnings for their own street — and for their hometown village if they work in another city. | Every citizen in the area |
| **Authorities** | Fire coordinates arrive automatically. Encroachment gets timestamped satellite evidence. Sprawl tracked year over year. | State DM cells, municipalities |

### Benefits
- **Social** — warnings reach the poorest and least connected first instead of last; language is never the barrier.
- **Economic** — less crop lost to undetected pest and missed irrigation; less diesel burnt on empty fishing trips; fewer boats seized.
- **Environmental** — faster fire response means smaller burns; encroachment and effluent become visible and accountable, so they deter.

### Measurable outcomes
`< 10 s` satellite detection → citizen alert · `15 min` fire hotspot refresh · `100%` population reachable · `₹0` cost to citizen

---

## 13. DATA SOURCES & REFERENCES

| Source | URL | Provides |
|---|---|---|
| ISRO Bhuvan | bhuvan.nrsc.gov.in | Cartosat, RISAT SAR, Oceansat, INSAT-3D/3DR thermal |
| ESA Copernicus | dataspace.copernicus.eu | Sentinel-1 C-band SAR, Sentinel-2 10 m, 5-day revisit |
| NASA Earthdata | earthdata.nasa.gov | Landsat 8/9 archive, MODIS, VIIRS active fire |
| INCOIS | incois.gov.in | Potential Fishing Zone advisories, ocean state forecast |
| CelesTrak | celestrak.org | Live TLE orbital elements |
| Bhashini | bhashini.gov.in | Government NLP stack for Indian-language alerts |
| BigEarthNet | bigearth.net | Sentinel-2 benchmark corpus for land-cover training |

### Competitors studied
| Solution | What it is | How we differ |
|---|---|---|
| BigEarth.net | EU benchmark dataset for Sentinel-2 land-cover | Research corpus for scientists. We train on it, then turn imagery into a citizen sentence. |
| Google Earth Engine | Planetary-scale raster compute in a code editor | Needs JavaScript and remote-sensing skill. VaanEye needs only a phone number. |
| Bhuvan / MOSDAC | Official ISRO map viewers | Single-domain viewers, no personal alerting. We fuse six domains and push. |
| Sentinel Hub / EO Browser | Commercial imagery APIs | Paid tiers for analysts. We stay free at the point of use. |
| mKisan / Meghdoot | Government SMS agro-advisory | Generic text, no live satellite verification of the user's own field. |

### Literature
- **NDVI** — Rouse et al., 1974 — (NIR−Red)/(NIR+Red) vegetation vigour
- **NDWI** — McFeeters, 1996 — surface water delineation for flood staging
- **SGP4/SDP4** — Hoots & Roehrich, 1980 — NORAD orbital propagation
- **SAR change detection** — pixel-wise backscatter differencing
- **PFZ methodology** — INCOIS SST + chlorophyll convergence model

---

## 14. DESIGN LANGUAGE

- **Tone:** premium product, not a student project. Template-grade polish.
- **Bilingual everywhere:** Tamil + English on every screen title, switchable.
- **Never confusing:** two options offered before any input; verification is always a separate screen.
- **Fonts:** Sora (display), Inter (body), Noto Sans Tamil (Tamil).
- **Logo:** circular navy + gold emblem — globe with India in gold, satellite in orbit, mandala ring, lotus base.

---

## 15. DELIVERABLES BUILT

| Path | What |
|---|---|
| `site/` | Live 3D Earth — real NASA textures, 7,906 satellites from live TLEs, drag to rotate, click for details, bilingual navbar |
| `vaaneye-pro.html` | 6-step bilingual onboarding + dashboard |
| `VaanEye_SIH2026_Idea_Presentation.pptx` / `.pdf` | Official 6-slide SIH deck |
| `ppt/build.py` | Regenerates the deck |
| `prompts/` | The four master prompts |
