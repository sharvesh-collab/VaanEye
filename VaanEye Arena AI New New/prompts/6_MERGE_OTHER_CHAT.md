# 6 — ANDHA CHAT-LA IRUKKURA PLATFORM-A EPPADI SERKARADHU

> **Unga kelvi:** "innoru chat-la already oru full platform build panniten. Inga panna ellathaiyum anga eppadi kondu poi full-a build panradhu? Illa ingaye panna mudiyuma?"

---

## Munnadi — enakku andha platform theriyaadhu

Andha chat vera session. Naan adha paakka mudiyaadhu. **Aana adhu problem illa** — kondu varadhu romba easy.

Rendu vazhi iruku. **Vazhi A thaan best.**

---

# ✅ VAZHI A — Andha platform-a ULLA kondu vaanga (recommend panren)

Idhu thaan sari, yaen-na:
- Naanga inga build panna 3D Earth **oru page mattum** (`site/index.html`)
- Andha chat-la irukkuradhu **full platform** — periyathu
- **Chinna-thai periya-thukkulla** podanum, thirumbi illa

### Step 1 — Andha chat-la irundhu code-a edunga

Andha chat-la ippadi kelunga:
```
Namma build panna platform-oda full file structure-a kudu.
Ovvoru file-oda path-um, ulla irukkura code-um venum.
Onnu kooda vidaadhe.
```

Illa GitHub-la irundhaa `git clone` pannunga.

### Step 2 — Namma 3D Earth-a andha platform-ku ulla podunga

Namma `site/` folder-la **6 file thaan** mukkiyam:

| File | Size | Enna |
|---|---|---|
| `globe.js` | 16 KB | three.js Earth + SGP4 + focusSat + markGround |
| `sats.json` | 1.5 MB | 7,679 satellites |
| `satmeta.json` | 4 KB | counts |
| `tex/` | 9 MB | NASA textures (6 images) |
| `vendor/` | 2 MB | three.js + satellite.js |
| `style.css`-la globe CSS | — | `.hero`, `.hud`, `.drw`, `.cine-*` |

**Ivai mattum copy pannunga.** `index.html`, `app.js` vendaam — adhu namma landing page, unga platform-ku thevai illa.

### Step 3 — Andha chat-la indha prompt-a kudunga

```
Naan oru 3D Earth satellite globe module-a kondu vandhirukken.
Adha namma platform-oda landing page-la integrate pannanum.

FILES:
  globe.js        — ESM module, exports initGlobe()
  sats.json       — 7,679 satellites {n,t1,t2,c,id}
  satmeta.json    — category counts
  tex/            — 6 NASA Earth textures (4096x2048)
  vendor/         — three.js r160 (ESM) + satellite.js 5.0.0

EPPADI VELAI SEYYUDHU:
  import { initGlobe } from './globe.js';
  const G = initGlobe(canvasElement, tooltipElement, onSatelliteClick);
  G.loadSats('sats.json', count => console.log(count));

  G.focusSat(index)               — camera-va andha satellite-ku kondu pogum
  G.focusGround(lat, lon)         — andha ground point-a camera-ku munnadi kondu varum
  G.markGround(lat, lon)          — globe-la pulsing marker podum
  G.getSatLatLon(index)           — {lat, lon, alt} kudukkum
  G.setFilter(Set)                — category filter
  G.setTimeScale(n)               — 1x / 60x / 600x / 3000x
  G.getStats()                    — {time, scale, cam}

MUKKIYAM:
  - satellite.min.js-a globe.js-ku MUNNADI load pannanum (global `satellite`)
  - globe.js ESM — <script type="module">
  - Earth mesh-a rotate PANNAATHEENGA. Satellites Earth-fixed frame-la
    irukku, mesh-a suthina ellame misalign aagidum. Camera-va mattum move
    pannunga (focusSat / focusGround adhe thaan pannudhu).
  - Canvas full-bleed-a irukkanum, parent-ku position:relative

INDHA VELAI PANNU:
  1. Files-a namma project structure-ku ulla sariyaana idathula podu
  2. Landing page-la hero section-a indha globe-oda maathu
  3. Satellite click panna namma design system-oda detail panel kaatanum
  4. Namma existing routing, auth, language system-a odaikka koodaadhu
```

### Step 4 — Namma extra features-a andha chat-ku sollunga

```
Indha features-um venum:

1. CINEMATIC ENTRY
   Load aana odane Earth mattum theriyanum, mathathu ellame hide.
   "Enter" button illa Home click illa scroll panna thaan content varanum.
   body-la 'cine' class podunga, CSS-la adha vechu hide pannunga.

2. LANGUAGE — ore mozhi mattum
   EN / தமிழ் rendu button. Ore samayathula ore mozhi thaan.
   Rendum onnaa kaattakoodaadhu.
   Elements-la data-en + data-ta attribute vachu swap pannunga.
   localStorage-la save pannunga.

3. VIEW ON EARTH
   Satellite drawer-la "View on Earth" button.
   Click panna: G.getSatLatLon(i) → G.focusGround(lat,lon) → G.markGround(lat,lon)
   Andha satellite keezha irukkura ground point camera-ku munnadi varum,
   pulsing green marker podum, lat/lon display aagum.
```

### Step 5 — Ellathaiyum onnaa serunga

```
[prompts/1_MASTER_PROMPT_FULL.md muzhusaa paste]

---
Mela irukkurathu namma product-oda full spec.
Namma platform-la ellame indha spec-oda match aagudhaanu check pannu:
  - 6 pillars ellame iruka?
  - Stack correct-a? Next.js + Express + Node + Supabase + Firebase?
  - Onboarding 6 steps iruka, bilingual-a?
  - Missing enna?

Missing-a irukkuradha list pannu, appuram onnu onnaa build pannu.
```

---

# ⚠️ VAZHI B — Andha platform-a INGA kondu varadhu

Mudiyum, **aana recommend pannala.**

### Yaen best illa

| Problem | Vivaram |
|---|---|
| Neenga ellame paste pannanum | Full platform code — niraya messages |
| Context limit | Periya platform-naa context niraiñjidum |
| Naan andha design-a paakala | Unga design decisions enakku theriyaadhu |
| Andha chat-la history iruku | Yaen ippadi build panneenga nu andha chat-ku thaan theriyum |

### Eppo idhu sari

- Andha platform **chinna-thaa** irundhaa (10-15 files)
- Andha chat **dead-a** irundhaa
- Neenga **fresh-a** aarambikka nenachaa

Appadi-na ippadi pannunga:
```
Naan innoru chat-la platform build panniruken. Inga kondu varen.

[file 1 path + code]
[file 2 path + code]
...

Ellame paste pannitten. Ippo namma 3D Earth-a idhoda integrate pannu.
```

---

# 📊 Endha vazhi — decide pannunga

| Unga nilamai | Vazhi |
|---|---|
| Andha platform periyathu (20+ files) | **A** |
| Andha chat innum active | **A** |
| Andha platform GitHub-la iruku | **A** |
| Andha platform chinnathu (< 15 files) | A illa B |
| Andha chat poidichu / reply varala | **B** |

**90% case-la Vazhi A thaan.**

---

# 🎯 Ondru mattum nyabagam vechukonga

Naan inga build panna 3D Earth **oru component mattum**. Unga platform thaan main.

```
❌ Unga platform-a indha site-ku ulla kondu varadhu
✅ Indha site-la irukkura globe-a unga platform-ku ulla kondu poradhu
```

Namma `site/index.html` oru **demo** — globe-a eppadi use panradhu nu kaatta.
Unga real platform-la landing page already irukkum. Andha hero section-a
globe-oda maathunga. Adhu pothum.

---

# 📦 Copy panna vendiya files — checklist

```
globe.js                    ← the module
sats.json                   ← 1.5 MB satellite data
satmeta.json                ← counts
scripts/refresh_tle.py      ← daily data refresh
tex/day.jpg
tex/night.jpg
tex/clouds.png
tex/bump.jpg
tex/spec.jpg
tex/stars.jpg
vendor/three.module.js
vendor/OrbitControls.js
vendor/satellite.min.js
```

**Total ≈ 12.5 MB.** Zip panni upload pannunga, illa GitHub-la push panni clone pannunga.

**Copy panna vendaam:** `index.html`, `app.js`, `style.css` — ivai namma demo landing page. Unga platform-ku sondha design irukkum.
