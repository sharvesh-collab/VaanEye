# VaanEye — GitHub + Free Hosting

---

## 🎯 ENTHA HOSTING? → **Netlify**

| | Netlify ✅ | Vercel | GitHub Pages |
|---|---|---|---|
| Free | ✅ 100 GB/month | ✅ | ✅ |
| Repo size limit | ✅ pravanai illa | ✅ | ⚠️ 1 GB soft |
| Big files (namma 9 MB textures) | ✅ nallaa handle pannum | ✅ | ⚠️ slow |
| Custom domain + HTTPS | ✅ free | ✅ free | ✅ free |
| Drag-and-drop deploy | ✅ **git illaamalum mudiyum** | ❌ | ❌ |
| Setup time | **2 nimisham** | 3 nim | 5 nim |

**→ Netlify use pannunga.** Config file (`netlify.toml`) already ready pannitten.

---

## 📁 GITHUB-LA ENNA POTANUM

### ✅ POTANUM

```
vaaneye/
├── site/                    ← MUKKIYAM, idhu thaan website
│   ├── index.html               landing page
│   ├── app.html                 6-step onboarding + dashboard
│   ├── style.css
│   ├── app.js
│   ├── globe.js                 three.js + SGP4
│   ├── sats.json          1.5 MB  satellite data
│   ├── satmeta.json
│   ├── img/                     logo, favicon
│   ├── tex/               9 MB   NASA Earth textures
│   └── vendor/            2 MB   three.js, satellite.js
│
├── ppt/
│   ├── build.py                 deck generate panra script
│   ├── topdf.py
│   └── assets/                  SIH logo + VaanEye logo
│
├── brand/                       high-res logo PNG
├── prompts/                     5 master prompts
├── scripts/refresh_tle.py       daily TLE refresh
├── .github/workflows/           auto-refresh action
│
├── VaanEye_SIH2026_Idea_Presentation.pptx
├── VaanEye_SIH2026_Idea_Presentation.pdf
├── README.md
├── DEPLOY.md
├── .gitignore
├── netlify.toml
└── vercel.json
```

**Total ≈ 18 MB** — GitHub-ku romba chinna size.

### ❌ POTA KOODATHU

| Enna | Yean |
|---|---|
| `.env` | **API keys ulla iruku** — leak aagidum |
| `serviceAccountKey.json` | Firebase admin key |
| `node_modules/` | Ubaram periyathu, `npm install` pannikkalaam |
| `uploads/` | Unga personal files |
| `__pycache__/`, `*.pyc` | Python cache |
| `/tmp/`, `*.log` | Scratch files |

Ivai ellame `.gitignore`-la already podirukken ✅

---

## 🗑️ DELETE PANNITTEN

| File | Yean |
|---|---|
| ~~`vaaneye-app.html`~~ | v2, reject aachu |
| ~~`vaaneye-dashboard.html`~~ | v1, superseded |
| `vaaneye-pro.html` | **delete illa** → `site/app.html`-a move panniten |

`vaaneye-pro.html` thaan unga 6-step onboarding + dashboard. Adhu **thevai** — `site/`-ku ulla kondu vanthuten, ippo "Launch App" click panna adhu open aagum.

---

## 🚀 GITHUB-LA PODRA STEPS

### Step 1 — GitHub-la repo create pannunga
1. github.com → **New repository**
2. Name: `vaaneye`
3. **Public** (Netlify free-ku public nallathu)
4. README, .gitignore add **pannaatheenga** (namma kitta already iruku)
5. Create

### Step 2 — Local-la push pannunga
```bash
cd /path/to/vaaneye

git init
git add .
git commit -m "VaanEye — SIH 2026 satellite intelligence platform"
git branch -M main
git remote add origin https://github.com/UNGA_USERNAME/vaaneye.git
git push -u origin main
```

> **Push panra munnadi check pannunga:**
> ```bash
> git status --short | grep -E "\.env|serviceAccount"
> ```
> Edhuvum varalanna safe ✅

---

## 🌐 NETLIFY-LA HOST PANRATHU

### Vazhi A — GitHub connect (best, auto-deploy)

1. **netlify.com** → Sign up with GitHub
2. **Add new site → Import an existing project**
3. GitHub → `vaaneye` repo select pannunga
4. Settings apadiye vidunga (`netlify.toml`-la already iruku):
   - Publish directory: `site`
   - Build command: *(kaali)*
5. **Deploy site**

✅ 1-2 nimishathula live. URL: `https://random-name.netlify.app`

**Name maatha:** Site settings → Change site name → `vaaneye` → `https://vaaneye.netlify.app`

### Vazhi B — Drag & drop (git venaam, 30 second)

1. **app.netlify.com/drop**
2. `site/` folder-a **izhuthu potunga**
3. Live!

> Aana update panna ovvoru thadavayum thirumba drop pannanum. Vazhi A better.

---

## ✅ DEPLOY PANNITU CHECK PANNUNGA

- [ ] Earth load aaguthaa, suthudhaa?
- [ ] Satellites theriyudhaa?
- [ ] "Enter VaanEye" click panna content varudhaa?
- [ ] Navbar-la About / Features / Satellites velai seyyudhaa?
- [ ] Satellite click panna drawer varudhaa?
- [ ] "Launch App" → onboarding open aaguthaa?
- [ ] Mobile-la paarunga
- [ ] EN/தமிழ் toggle velai seyyudhaa?

---

## 🔄 UPDATE PANRATHU EPPADI

```bash
git add .
git commit -m "enna maathineengalo adha ezhudhunga"
git push
```

Netlify thaana rebuild pannum, 1 nimishathula live.

---

## 🛰️ SATELLITE DATA AUTO-REFRESH

`.github/workflows/refresh-tle.yml` — **daily 07:00 IST** CelesTrak-la irundhu latest TLE edukkum, thaana commit pannum.

**Manual-a run panna:** GitHub → Actions tab → "Refresh satellite TLEs" → Run workflow

**Local-la:**
```bash
python3 scripts/refresh_tle.py
```

> CelesTrak-ku **API key thevai illa**. Limit illa. Daily 1 thadava safe.

---

## 📌 PPT & PDF — GitHub-la vaikkalaama?

**Vaikkalaam** — judges-ku repo kaattum podhu nallaa irukkum. Rendum serndhu 4 MB thaan.

Aana **SIH portal-la upload panradhu** PowerPoint-la export panna PDF thaan (Tamil font correct-a varum).
