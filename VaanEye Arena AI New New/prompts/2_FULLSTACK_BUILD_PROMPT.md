# MASTER PROMPT 2 — BUILD VaanEye (FULL STACK)
> Paste this whole file into Cursor / Claude Code / Windsurf / v0 / any coding AI.
> It is written as a direct instruction to the AI. Nothing else is needed.

---

You are a senior full-stack engineer. Build a production-grade web application called **VaanEye** (வான்கண், "The Eye in the Sky"). Follow this specification exactly. Do not substitute technologies. Do not simplify the design.

## THE PRODUCT IN ONE LINE
A geo-intelligence platform that reads free ISRO / NASA / ESA satellite data and delivers ONE actionable sentence to any Indian citizen — in their own language, on any phone, including a 2G feature phone.

---

## MANDATORY TECHNOLOGY STACK

```
Frontend    Next.js 14 (App Router, TypeScript) · Tailwind CSS · Mapbox GL JS
3D Globe    three.js r160 + satellite.js 5.0.0 (SGP4 propagation)
Backend     Express (TypeScript) on Node.js 20
Database    Supabase — PostgreSQL 15 + PostGIS extension
Alerts      Firebase Cloud Messaging (FCM) + Firebase Auth
Last mile   SMS gateway (Twilio/MSG91) + IVR Tamil voice broadcast
Processing  Python 3.11 workers — GDAL, Rasterio, Fiona, NumPy, SciPy,
            PyTorch, OpenCV
Deploy      Vercel (frontend) · Render (API + workers)
```

**Do not replace Supabase with Firestore, or Firebase with Supabase Realtime. Both are required and each has a distinct job:**
- **Supabase = the brain.** PostGIS R-Tree spatial index answers *"is this farmer's polygon inside today's flood mask?"* in under a millisecond. Stores land boundaries, sea zones, alert history, analytics.
- **Firebase = the mouth.** FCM is the only way to wake a **closed** app. Supabase Realtime only reaches an app that is open and connected — useless for a 2 a.m. fire alert. Firebase also handles offline cache for fishermen at sea.

---

## REPOSITORY STRUCTURE

```
vaaneye/
├── apps/
│   ├── web/                      # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (marketing)/page.tsx        # 3D globe landing
│   │   │   ├── onboarding/[step]/page.tsx  # 6-step flow
│   │   │   ├── dashboard/page.tsx          # six-pillar dashboard
│   │   │   └── api/                        # route handlers → proxy to Express
│   │   ├── components/
│   │   │   ├── globe/                      # three.js Earth + satellites
│   │   │   ├── onboarding/                 # step components
│   │   │   ├── dashboard/                  # pillar cards, alert feed, map
│   │   │   └── ui/                         # design system primitives
│   │   ├── lib/
│   │   │   ├── supabase.ts   firebase.ts   i18n.ts
│   │   └── public/tex/                     # NASA Earth textures
│   └── api/                      # Express backend
│       ├── src/routes/           # auth, places, alerts, satellites, pillars
│       ├── src/services/         # supabase, fcm, sms, ivr, tle
│       └── src/middleware/
├── workers/                      # Python geospatial pipeline
│   ├── ingest/     analyse/     detect/     match/     dispatch/
└── supabase/migrations/          # SQL schema + PostGIS
```

---

## DATABASE SCHEMA (Supabase / PostgreSQL + PostGIS)

```sql
create extension if not exists postgis;

create table users (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  mobile        varchar(10) unique not null,
  language      text not null default 'ta',   -- 'ta' | 'en'
  roles         text[] not null default '{}', -- public|farmer|fisherman
  occupation    text,
  work_area     text,                          -- 'inside' | 'outside'
  fcm_token     text,
  alert_sms     boolean default true,
  alert_ivr     boolean default true,
  alert_push    boolean default true,
  created_at    timestamptz default now()
);

create table places (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  label         text not null,
  kind          text not null,   -- farm | sea_zone | home | village | custom
  geom          geography(Polygon, 4326),
  centroid      geography(Point, 4326),
  area_sqm      double precision,
  survey_no     text,
  boat_no       text,
  terrain       text,            -- satellite-reported land type
  verified      boolean default false,
  created_at    timestamptz default now()
);
create index places_geom_idx on places using gist (geom);

create table hazards (
  id            uuid primary key default gen_random_uuid(),
  pillar        text not null,   -- disaster|agri|marine|climate|infra|env
  kind          text not null,   -- flood|fire|pest|heat|encroachment|spill
  severity      int not null check (severity between 1 and 5),
  geom          geography(Polygon, 4326),
  detected_at   timestamptz not null,
  source        text not null,   -- sentinel-1 | viirs | insat-3d ...
  confidence    double precision,
  confirmed_by  text[]           -- two-sensor confirmation
);
create index hazards_geom_idx on hazards using gist (geom);

create table alerts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  place_id      uuid references places(id) on delete cascade,
  hazard_id     uuid references hazards(id),
  sentence_ta   text not null,   -- the ONE Tamil sentence
  sentence_en   text not null,
  severity      int not null,
  channels      text[],          -- push|sms|ivr
  delivered_at  timestamptz,
  read_at       timestamptz,
  created_at    timestamptz default now()
);

create table satellites (
  norad_id      int primary key,
  name          text not null,
  category      text not null,
  tle_line1     text not null,
  tle_line2     text not null,
  updated_at    timestamptz default now()
);
```

**The core spatial query — this is the heart of the product:**
```sql
select p.id, p.user_id, p.label, h.kind, h.severity,
       st_distance(p.centroid, st_centroid(h.geom::geometry)::geography)/1000 as km
from   places p
join   hazards h on st_intersects(p.geom, h.geom)
where  h.detected_at > now() - interval '1 hour';
```

---

## FEATURE 1 — 3D GLOBE LANDING PAGE

- Real NASA Earth textures: day map, night lights, clouds, bump, specular, star field (4096×2048).
- three.js sphere radius `R=100`, `KM = R/6371`, camera at `(0, 78, 352)` fov 42, OrbitControls distance 128–900, **pan disabled**, `autoRotate` speed `0.26`.
- Atmosphere shell ×1.055 scale, colour `0x3c7fd8`, fragment `pow(0.62 - dot(normal, viewDir), 4.4)`, alpha 0.55.
- Load live TLEs from `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle`, propagate with satellite.js SGP4 in a `Points` buffer geometry, update every frame.
- **The globe and satellites must rotate continuously from page load, before any interaction.**
- Drag to rotate. Click a satellite → drawer with its name, NORAD ID, category, inclination, RAAN, eccentricity, mean motion, derived altitude, velocity, orbital period, launch year, and a short history narrative.

Derived-orbit maths (parse from TLE line 2):
```
inclination = t2[8:16]   RAAN = t2[17:25]
ecc = "0." + t2[26:33]   meanMotion = t2[52:63]
alt    = cbrt(398600.4418 / (mm*2π/86400)²) − 6371      // km
vel    = sqrt(398600.4418 / (alt + 6371))               // km/s
period = 1440 / mm                                      // minutes
launchYear = t1[9:11]
```

Satellite categories — colour + Tamil label:
| Category | Colour | Tamil |
|---|---|---|
| starlink | `#4fa3ff` | ஸ்டார்லிங்க் |
| oneweb | `#9b6bff` | ஒன்வெப் |
| nav | `#ffc53d` | வழிசெலுத்தல் |
| geo | `#ff8a3d` | புவிநிலை |
| isro | `#ff5a5a` | இஸ்ரோ |
| eo | `#2ee6a8` | பூமி கண்காணிப்பு |
| comm | `#36d3e6` | தொடர்பு |
| station | `#ffffff` | விண்வெளி நிலையம் |
| sci | `#ff6bd6` | அறிவியல் |
| other | `#8fa6c4` | மற்றவை |

Navbar (all bilingual-switchable): **Home · About Us · Features · Satellites**.

---

## FEATURE 2 — SIX-STEP BILINGUAL ONBOARDING

**Every screen shows its own name in Tamil AND English at the top. Never confusing. Never make the user feel they entered the same thing twice.**

**Step 1 — Login / உள்நுழைவு**
Name, 10-digit mobile, language selector (Tamil/English), OTP verification.

**Step 2 — Location / இருப்பிடம்**
Present **two options first**, then a GPS shortcut:
- Option A: cascade country → state → district → taluk → village
- Option B: 6-digit PIN code
- GPS shortcut button

**Step 3 — Map Verification / வரைபட உறுதிப்படுத்தல்**
A **separate, separately-named screen**. Show the located point on a satellite basemap, state the satellite-reported land type ("This looks like agricultural land"), ask Yes / No.

**Step 4 — Your Role / உங்கள் பங்கு**
Multi-select Public / Farmer / Fisherman, plus occupation and inside/outside work area.

**Step 5 — Mark Your Place / உங்கள் இடத்தைக் குறிக்கவும்**
Role-branched:
- **Farmer** — walk the boundary with GPS, ride, draw on map, or enter survey number. Must support **skip**, and **pause/resume** while walking. Show live area in acres and m².
- **Fisherman** — pick from 4 sea zones including the IMBL maritime border, plus harbour and boat number.
- **Public** — GPS or drag a pin.

**Step 6 — Review / மறுபரிசீலனை**
Show everything entered, allow **unlimited watched places**, choose alert channels (push / SMS / IVR), then Finish → dashboard.

Demo path for testing: mobile `9876543210`, PIN `627501`, Farmer + Fisherman + Outside, 2.40 acres / 9,712 m², 8.7642° N 78.1348° E.

---

## FEATURE 3 — SIX-PILLAR DASHBOARD

Design brief: **simple, user-friendly for everyone, every function placed perfectly and easy to understand.** An illiterate farmer and a district collector must both find what they need in under five seconds.

| Pillar | Card shows |
|---|---|
| Disaster | active flood/fire zones near the user, distance, direction, severity |
| Agriculture | NDVI trend sparkline, irrigation advice, pest-risk badge |
| Marine | today's fishing zone bearing, sea state, IMBL distance |
| Climate | heat index, AQI, rain nowcast for the user's street |
| Infrastructure | change-detection thumbnails, encroachment flags |
| Environment | spill/effluent/deforestation alerts |

Plus: live alert feed (newest first), map with layer toggles, watched-place switcher, language toggle, theme toggle.

Every alert renders as **one sentence first**, with detail collapsed behind a tap.

---

## FEATURE 4 — THE ALERT PIPELINE (Python workers)

```
1. INGEST     GDAL/Rasterio pull scenes, cloud-mask, reproject to EPSG:4326
2. ANALYSE    NumPy/SciPy compute NDVI, NDWI, LST
3. DETECT     PyTorch CNN on SWIR bands; OpenCV temporal differencing
4. MATCH      Write hazard polygons to PostGIS; ST_Intersects against places
5. DISPATCH   Generate the Tamil sentence → FCM push → SMS → IVR
```

**Rules:**
- **Two-sensor confirmation** before any alert is dispatched — never trust a single detection.
- If cloud blocks optical, **auto-fallback to Sentinel-1 SAR**.
- Fuse INSAT-3D geostationary thermal, which refreshes every 15 minutes over India.
- Target: **under 10 seconds** from detection to citizen alert.

Sentence generation must be template-based and unambiguous:
```
ta: "{hazard} {distance} கி.மீ {direction} உள்ளது — {action}"
en: "{hazard} {distance} km {direction} — {action}"
```

---

## FEATURE 5 — LAST-MILE DELIVERY

Three tiers, always attempted in order:
1. **FCM push** — smartphone, works when app is closed
2. **SMS** — any phone with a signal
3. **IVR voice call in Tamil** — 2G feature phone, works for non-readers

Log delivery status per channel in `alerts.channels` and `alerts.delivered_at`.

---

## DESIGN REQUIREMENTS

- **Premium, template-grade.** Do not produce generic AI-looking UI. If it looks like a bootstrap demo, it is wrong.
- Bilingual Tamil + English everywhere, instantly switchable.
- Fonts: Sora (display), Inter (body), Noto Sans Tamil (Tamil).
- Colour tokens: ink `#050914`, card `#10182E`, line `#27334E`, text `#EEF3FB`, muted `#93A3C0`, primary `#4F8CFF`, violet `#A06BFF`, cyan `#22D3EE`, success `#2EE6A8`, warn `#FFC53D`, danger `#FF6B81`, gold `#E8B563`.
- Fully responsive; the dashboard must be usable one-handed on a low-end Android phone.
- Accessibility: large tap targets, high contrast, voice-first fallbacks.

---

## BUILD ORDER

1. Supabase schema + PostGIS migrations
2. Express API skeleton with auth + places CRUD
3. Next.js shell, i18n, design system
4. 3D globe landing page
5. Six-step onboarding
6. Dashboard with six pillar cards
7. Python workers + alert pipeline
8. FCM / SMS / IVR dispatch
9. Seed demo data, end-to-end test the demo path

Deliver working code with `.env.example`, migrations, seed script and a README explaining local setup.
