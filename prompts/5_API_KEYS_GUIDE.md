# MASTER PROMPT 5 — API KEYS: enna vaangurathu, eppadi use panrathu

---

## ⚠️ MUKKIYAM — IPPO API KEY VAANGA VENDAAM

Ippo namma site **API key illaama** velai seyyudhu. CelesTrak free, key illa, limit illa.

**API key eppo vaanganum?** Slide 3-la irukkura pipeline-a **niyamavaa build panra podhu** thaan — adhaavadhu satellite *imagery* (photo) download panni analyse panra podhu.

**Ippo namma panradhu:** satellite *positions* (enga iruku) — adhukku key thevai illa.

---

## 1. IPPO USE PANRATHU — KEY ILLA ✅

| Service | URL | Key? | Limit |
|---|---|---|---|
| **CelesTrak TLE** | `celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle` | ❌ vendaam | Hard limit illa. Oru naalaikku 1-2 thadava fetch panna sollraanga. Namma daily 1 thadava thaan. |

Idhu `scripts/refresh_tle.py`-la irukku. GitHub Action daily 07:00 IST-ku thaana run aagum.

**Manual-a run panna:**
```bash
python3 scripts/refresh_tle.py
```

---

## 2. APPURAM VAANGA VENDIYA KEYS (pipeline build panra podhu)

### 🛰️ A. Copernicus Data Space (Sentinel-1 SAR + Sentinel-2)
**Idhu thaan mukkiyam** — flood, crop, encroachment ellaathukkum idhu thaan.

```
Register : https://dataspace.copernicus.eu/
Cost     : FREE forever
Limit    : 20 requests/second · 60 GB/month download
Type     : OAuth2 client_id + client_secret
```

**Eppadi vaangurathu:**
1. `dataspace.copernicus.eu` → Register (email + password)
2. Login → **User Settings → OAuth clients → Create new client**
3. `client_id` + `client_secret` kedaikkum → copy pannunga

---

### 🌍 B. NASA Earthdata (Landsat, MODIS, VIIRS fire)
```
Register : https://urs.earthdata.nasa.gov/users/new
Cost     : FREE forever
Limit    : practical limit illa
Type     : username + password (illa bearer token)
```

**FIRMS fire API** (idhu separate, romba easy):
```
Register : https://firms.modaps.eosdis.nasa.gov/api/area/
Cost     : FREE
Limit    : 5000 transactions / 10 minutes
Type     : MAP_KEY (oru string)
```

---

### 🇮🇳 C. ISRO Bhuvan
```
Register : https://bhuvan-app3.nrsc.gov.in/api/
Cost     : FREE
Limit    : published illa, reasonable use
Type     : token (email-la varum, 1-2 naal aagum)
```
> Approval konjam late aagum. Munnadiye apply pannunga.

---

### 🗺️ D. Mapbox (map kaatarthukku)
```
Register : https://account.mapbox.com/auth/signup/
Cost     : FREE up to 50,000 map loads/month
Limit    : adhukku mela $5 per 1000 loads
Type     : public token (pk.xxx)
```
> Free tier namma pilot-ku pothum. Illana **MapLibre + OpenStreetMap** use pannunga — fully free, key illa.

---

### 🔔 E. Firebase (push notification)
```
Register : https://console.firebase.google.com/
Cost     : FREE (Spark plan)
Limit    : FCM unlimited messages FREE
Type     : config object + service account JSON
```

**Eppadi:**
1. Firebase Console → Add project
2. Project Settings → General → Your apps → Web app add pannunga → **config object** copy
3. Project Settings → **Service accounts → Generate new private key** → JSON download

---

### 🗄️ F. Supabase (database)
```
Register : https://supabase.com/dashboard
Cost     : FREE tier
Limit    : 500 MB DB · 1 GB storage · 50,000 monthly active users
Type     : project URL + anon key + service_role key
```

**Eppadi:** New project → Settings → API → URL + keys copy. PostGIS on panna: SQL Editor-la `create extension postgis;`

---

### 📱 G. SMS + IVR (last mile)
```
MSG91 (India, cheap)  : https://msg91.com/  — auth key
Twilio (global)       : https://twilio.com/ — SID + auth token, $15 free credit
Exotel (India IVR)    : https://exotel.com/ — IVR-ku best
```
> **Demo-kku:** SMS/IVR mock pannunga — console-la print pannunga. Real gateway money aagum, judges-ku demo-kku thevai illa.

---

## 3. KEYS-A EPPADI PROJECT-LA KONDUVARATHU

### ⛔ PANNA KOODATHU
```js
// IDHU ROMBA THAPPU — key GitHub-la poidum, yaarum edukkalaam
const KEY = "sk_live_abc123xyz";
```

### ✅ SARIYANA VAZHI — `.env` file

**Step 1 — root-la `.env` file create pannunga:**
```bash
# ══ Copernicus (Sentinel) ══
COPERNICUS_CLIENT_ID=your_client_id
COPERNICUS_CLIENT_SECRET=your_secret

# ══ NASA ══
NASA_EARTHDATA_USER=your_username
NASA_EARTHDATA_PASS=your_password
NASA_FIRMS_MAP_KEY=your_map_key

# ══ ISRO Bhuvan ══
BHUVAN_TOKEN=your_token

# ══ Supabase ══
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ══ Firebase ══
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vaaneye
FIREBASE_SERVICE_ACCOUNT_JSON=./serviceAccountKey.json

# ══ Mapbox ══
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# ══ SMS / IVR ══
MSG91_AUTH_KEY=your_key
```

**Step 2 — `.gitignore`-la `.env` irukka confirm pannunga** (naan already add pannitten ✅)

**Step 3 — `.env.example` commit pannunga** (values illaama, team-ku guide):
```bash
COPERNICUS_CLIENT_ID=
COPERNICUS_CLIENT_SECRET=
NASA_FIRMS_MAP_KEY=
```

---

### `NEXT_PUBLIC_` prefix — idhu enna?

| Prefix | Enga theriyum | Edhukku |
|---|---|---|
| `NEXT_PUBLIC_xxx` | **Browser-la theriyum** | Mapbox token, Supabase anon key — ivai public-a irukkalaam |
| `xxx` (prefix illa) | **Server-la mattum** | Service role key, Copernicus secret — ivai **kandippa** secret |

> **Rule:** service_role key, Copernicus secret, Firebase admin JSON — ivai **enna aanalum** `NEXT_PUBLIC_` podaatheenga. Podutta, yaarum unga database-a delete pannidalaam.

---

### Code-la eppadi use panradhu

**Python worker:**
```python
import os
from dotenv import load_dotenv
load_dotenv()

CID = os.environ["COPERNICUS_CLIENT_ID"]
CSEC = os.environ["COPERNICUS_CLIENT_SECRET"]

def get_token():
    r = requests.post(
        "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
        data={"grant_type": "client_credentials",
              "client_id": CID, "client_secret": CSEC})
    return r.json()["access_token"]
```

**Next.js (server-side only):**
```js
// app/api/sentinel/route.ts
const id = process.env.COPERNICUS_CLIENT_ID;   // NEXT_PUBLIC_ illa = server only
```

**Next.js (browser):**
```js
const mb = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;  // idhu browser-la sari
```

---

## 4. DEPLOY PANRA PODHU KEYS

**Vercel:**
```
Project → Settings → Environment Variables → ovvondraa add pannunga
```

**Netlify:**
```
Site settings → Environment variables → Add a variable
```

**GitHub Actions:**
```
Repo → Settings → Secrets and variables → Actions → New repository secret
```

> Local `.env` file **eppovum** upload aaga koodaadhu. Dashboard-la thaan podanum.

---

## 5. AI-KKU KEYS KUDUKKALAAMA?

**❌ Koodaadhu.** Cursor/Claude-kku real key kudukkaatheenga.

**✅ Ippadi pannunga** — placeholder kudunga:
```
Build the Copernicus ingest worker.
Read credentials from environment variables:
  COPERNICUS_CLIENT_ID, COPERNICUS_CLIENT_SECRET
Never hardcode. Use python-dotenv.
Also write a .env.example with empty values.
```

AI code ezhudhum, neenga `.env`-la real value podunga. AI-kku key theriya vendiya avasiyam illa.

---

## 6. RATE LIMIT — worry panna vendaama?

| Service | Free limit | Namma pilot-ku pothuma? |
|---|---|---|
| CelesTrak | few/day | ✅ daily 1 thaan |
| Copernicus | 60 GB/month | ✅ 2 district-ku romba pothum |
| NASA FIRMS | 5000 / 10 min | ✅ ubaram |
| Firebase FCM | unlimited | ✅ |
| Supabase | 500 MB | ✅ 5,000 users-ku pothum |
| Mapbox | 50k loads/month | ✅ |

**Limit thaanda aagalanu paakka:**
- Worker-la fetch count log pannunga
- Result-a cache pannunga (same tile-a rendu thadava download pannaatheenga)
- District-level batching — ovvoru user-kkum thaniyaa fetch pannaatheenga

---

## ✅ SUMMARY

| Ippo | Appuram |
|---|---|
| CelesTrak mattum — **key illa** | Copernicus + NASA + Firebase + Supabase |
| Site ippove velai seyyudhu | Pipeline build panra podhu |
| Daily auto-refresh GitHub Action-la | `.env`-la keys, dashboard-la deploy |

**Ippo edhuvum vaanga vendaam.** Site ready. Keys later, pipeline build panra podhu.
