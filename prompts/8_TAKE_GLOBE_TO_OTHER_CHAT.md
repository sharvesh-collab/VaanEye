# 8 — NAMMA 3D EARTH-A ANDHA CHAT-KU KONDU POGA

> **Idha ANDHA chat-la paste pannunga**, globe files-a upload panna pinnadi.
> Namma 3D Earth module-a unga platform-la integrate panna idhu pothum.

---

## Mudhalla — 12 file-a upload pannunga

`site/` folder-la irundhu ivai mattum:

```
globe.js                 20 KB    the module
sats.json               1.5 MB    7,679 satellites (TLE)
satmeta.json             4 KB     category counts
tex/day.jpg                       NASA Blue Marble
tex/night.jpg                     city lights
tex/clouds.png                    cloud layer
tex/bump.jpg                      elevation
tex/spec.png                      ocean specular
tex/stars.png                     starfield
vendor/three.module.js            three.js r160 (ESM)
vendor/OrbitControls.js           camera controls
vendor/satellite.min.js           SGP4 propagator
```

**Mothatham ≈ 12.6 MB.** Zip panni upload pannunga, illa GitHub-la push panni URL kudunga.

**Ivai upload pannaadheenga:** `index.html`, `app.js`, `style.css` — ivai namma demo landing page. Unga platform-ku sondha design iruku.

---

## Appuram idha paste pannunga

```
====================== IDHA COPY PANNUNGA ======================

Naan oru 3D Earth satellite globe module-a upload panniruken.
Adha namma platform-la integrate pannanum.

──────────────────────────────────────────────
IDHU ENNA
──────────────────────────────────────────────
three.js r160 vechu build panna real-time 3D Earth. NASA textures,
7,679 real satellites — SGP4 vechu live TLE-la irundhu propagate
aagudhu. CelesTrak data. Mouse-la rotate panna, satellite click
panna details varum.

Idhu already build panni test panniyachu. Zero console errors.
Accuracy verify panniyachu — ISS position live API-oda compare
panna 0.31 km error. Idhu velai seyyum code, demo illa.

──────────────────────────────────────────────
FILES
──────────────────────────────────────────────
globe.js              ESM module, exports initGlobe()
sats.json             7,679 sats — [{n:name, t1:tle1, t2:tle2, c:category, id:noradId}]
satmeta.json          {total, categories:{...}}
tex/*                 6 NASA textures (day, night, clouds, bump, spec, stars)
vendor/*              three.module.js + OrbitControls.js + satellite.min.js

──────────────────────────────────────────────
API — idhu thaan muzhu interface
──────────────────────────────────────────────

import { initGlobe } from './globe.js';

const G = initGlobe(canvasElement, {
  tooltip: tooltipDivElement,      // hover-la satellite peru kaatta
  onPick:  (sat) => { ... }        // satellite click panna callback
});

await G.loadSats('sats.json', (count) => console.log(count + ' loaded'));

METHODS:
  G.loadSats(url, onProgress)    satellites load panni propagate pannum
  G.setFilter(Set | null)        category filter. null = ellame kaatu
  G.setTimeScale(n)              1 | 60 | 600 | 3000 (time warp)
  G.setPaused(bool)              orbit clock-a niruthu / odavidu
  G.setAutoRotate(bool)          Earth thaana suthurathu
  G.focusSat(index, opts)        camera andha satellite-ku pogum
  G.focusGround(lat, lon, ms, alt)  andha ground point-a camera munnadi
  G.markGround(lat, lon)         globe mela pulsing green marker
  G.getSatLatLon(index)          {lat, lon, alt} — illaina null
  G.getStats()                   {time, scale, cam}
  G.resetView(ms)                opening camera position-ku thirumbu

onPick callback-ku varra object:
  { n, id, c, lat, lon, alt, vel, t1, t2 }

──────────────────────────────────────────────
KANDIPPA FOLLOW PANNA VENDIYA VIDHIGAL
──────────────────────────────────────────────

1. satellite.min.js -a globe.js-ku MUNNADI load pannanum.
   Adhu global `satellite` variable set pannum, globe.js adha
   ethirpaakudhu. Idha maathitteenga-na SGP4 crash aagum.

   <script src="/vendor/satellite.min.js"></script>
   <script type="module" src="/your-globe-init.js"></script>

2. globe.js ESM. type="module" venum, illa bundler import.

3. ★★★ EARTH MESH-A ROTATE PANNAADHEENGA ★★★
   Satellite positions Earth-fixed frame-la calculate aagudhu —
   texture endha frame-lo adhe frame. Mesh-a suthina ovvoru
   satellite-um adhoda unmaiyana ground point-la irundhu
   nagarndhudum. Idhu munnadi nadandha bug. Camera-va mattum
   move pannunga — focusSat / focusGround rendum adhe pannudhu.

4. Canvas-ku parent kandippa position:relative venum, canvas
   inset:0 absolute. Illaina hover/click hit-testing thappaagum.

5. Textures periyathu (9 MB). Immutable cache headers podunga:
   Cache-Control: public, max-age=31536000, immutable

6. sats.json 1.5 MB. Landing page-la mattum load pannunga,
   globally-a illa.

──────────────────────────────────────────────
NEXT.JS LA POTTA (App Router)
──────────────────────────────────────────────
three.js browser-la mattum odum. SSR disable panna vendum:

  'use client';
  import dynamic from 'next/dynamic';
  const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

Files enga podanum:
  public/tex/*           →  '/tex/day.jpg'
  public/vendor/*        →  '/vendor/satellite.min.js'
  public/sats.json       →  '/sats.json'
  components/globe.js    →  (illa lib/globe.js)

globe.js-la texture paths relative-a iruku. Next.js-la absolute
'/tex/...' nu maathunga.

──────────────────────────────────────────────
NEENGA PANNA VENDIYADHU
──────────────────────────────────────────────

1. Files-a namma project structure-la sariyaana idathula podunga
2. Globe-a oru component-a wrap pannunga (namma framework padi)
3. Landing page hero-va indha globe-oda maathunga
4. Satellite click panna NAMMA design system-oda oru panel kaatunga —
   namma component library, namma colours, namma typography.
   Namma globe demo-oda drawer style-a copy pannaadheenga.
5. Namma existing routing, auth, i18n, theme — edhaiyum odaikka koodaadhu
6. Loading state podunga — sats.json 1.5 MB, 2-4 vinaadi aagum

──────────────────────────────────────────────
INDHA BEHAVIOUR-UM VENUM
──────────────────────────────────────────────

A) CINEMATIC ENTRY
   Mudhal load-la Earth mattum theriyanum — hero text, nav content,
   ellame hide. Visitor "Enter" click panna illa nav link click panna
   thaan content varanum.

   body-la 'cine' class podunga, CSS-la opacity/visibility vechu hide
   pannunga. Cinematic-la irukkum podhu page scroll-a lock pannunga.

   ★ MUKKIYAM: wheel / keydown-la exit pannaadheenga. Click mattum.
     Munnadi scroll-la exit pannum padi irundhadhu — konjam scroll
     panna odane content vandhudum, romba mosam.

B) EARTH VIEW BUTTON
   Ulla ponapuram, navbar-la "Earth view" button kaatunga.
   Click panna: panel close → resetView() → cinematic-ku thirumbu.
   Cinematic-la irukkum podhu indha button theriya koodaadhu.

C) SATELLITE SELECT PANNA FREEZE
   Oru satellite select panna scene muzhusum nikkanum:
     G.setPaused(true); G.setAutoRotate(false);
   Ekkaranathaala nikkudhu nu user-ku oru indicator kaatunga.
   Deselect panna: setPaused(false); setAutoRotate(true);

D) VIEW ON EARTH
   Satellite panel-la oru button:
     const p = G.getSatLatLon(i);
     G.focusGround(p.lat, p.lon, 1500, 235);
     G.markGround(p.lat, p.lon);
   Lat/lon-a 4 decimal + N/S/E/W-oda kaatunga.

──────────────────────────────────────────────
BILINGUAL (EN / தமிழ்)
──────────────────────────────────────────────
Namma platform-ku already i18n irundhaa, adhe use pannunga.
Illaina:
  <span data-bi data-en="Home" data-ta="முகப்பு">Home</span>
body-la lang-en / lang-ta class, CSS-la matthadhu hide.
Ore samayathula ore mozhi mattum.

★ Tamil glyphs English-a vida uyaram jaasthi. Tamil-ku hero
  font sizes-a korainga, illa overflow aagum:
  body.lang-ta h1 { font-size: clamp(22px, 2.15vw, 32px) }

──────────────────────────────────────────────
MUDHALLA IDHA PANNUNGA
──────────────────────────────────────────────
Code ezhudhara munnadi, idha confirm pannunga:

  1. Files enga poga pogudhu (namma structure padi)
  2. Globe component-oda props/interface
  3. Globe-a wrap panna endha existing component use panreenga
  4. Satellite detail panel — namma endha component pattern

Naan sari sonna pinnadi code ezhudhunga.

====================== INGA MUDIYUDHU ======================
```

---

## Andha chat vera direction-la ponaa

**globe.js-a thirumba ezhudha aarambichaa:**
```
Niruthunga. globe.js already velai seyyudhu, test panniyachu.
Adha edit pannaadheenga. Adhoda irukkura API-a use pannunga.
Integration code mattum ezhudhunga.
```

**Earth mesh-a rotate panna aarambichaa:**
```
Niruthunga. Earth mesh rotation kandippa koodaadhu — satellite
positions Earth-fixed frame-la iruku, mesh suthina ellame
misalign aagum. focusSat / focusGround camera-va move pannum.
Adhe use pannunga.
```

**Namma demo drawer design-a copy pannaa:**
```
Andha drawer namma demo-oda design. Namma platform-ku sondha
design system iruku — adhe use pannunga. Globe-la irundhu data
mattum edunga, style vendaam.
```

---

## Ithukku appuram

Andha chat integrate panna pinnadi, inga thirumba vaanga:
- Globe sariya velai seyyudhaanu naan verify panren
- Namma master prompt-oda compare panni gap list panren
- TLE refresh automation (`scripts/refresh_tle.py` + GitHub Actions) setup panren
- Accuracy proof (`scripts/verify_accuracy.py`) demo-ku ready pannren
