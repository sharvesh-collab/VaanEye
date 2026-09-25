# NAAN PANRADHELLAM — NEENGA EPPADI MANUAL-A PANRADHU

> Naan panra ovvoru velaiyum inga iruku. Ovvonnukkum: **enna tool**, **enna type panradhu**, **eppadi sariya nu check panradhu**.

---

# PART 0 — MUDHALLA IVAI INSTALL PANNUNGA

Moonu thaan. Ore thadava. 20 nimisham.

### 1. VS Code — code edit panna
https://code.visualstudio.com → Download → install.

Adhukkulla rendu extension (left side square icon → search → Install):
- **Live Server** (Ritwick Dey) — server-a thaana start pannum
- **Prettier** — code-a neat-a aakkum

### 2. Python — server + scripts
https://python.org/downloads → Download

> ⚠️ **Install panra podhu mudhal screen-la "Add Python to PATH" tick pannunga.** Idha vitta appuram ellame velai seyyaadhu.

Check: Command Prompt (Windows key → `cmd`) thirandhu:
```
python --version
```
`Python 3.12.x` madhiri vara vendum. `not recognized` nu vandhaa → PATH tick pannala, thirumba install pannunga.

### 3. Git — GitHub-ku push panna
https://git-scm.com/downloads → install (ellame Next Next).

Check: `git --version`

**Oru thadava setup:**
```
git config --global user.name "Unga Peru"
git config --global user.email "unga@email.com"
```

---

# PART 1 — FILES-A LOCAL-LA EDUTHUKKARADHU

1. Indha workspace-la irundhu **ellaa file-um download** pannunga
2. `D:\VaanEye` (illa `~/VaanEye`) folder-la podunga
3. VS Code thiranga → **File → Open Folder** → andha folder

Left-la file tree theriyanum:
```
VaanEye/
├─ site/          ← website
├─ prompts/       ← 7 AI prompts
├─ scripts/       ← python scripts
├─ ppt/           ← deck generator
├─ brand/         ← logo PNGs
├─ README.md
└─ netlify.toml
```

---

# PART 2 — WEBSITE-A LOCAL-LA RUN PANRADHU

**Naan panradhu:** `python3 -m http.server 8080`

**Neenga panradhu — rendu vazhi:**

### Vazhi A — VS Code (easy)
`site/index.html` mela **right-click → "Open with Live Server"**. Mudinjadhu.

### Vazhi B — double-click
`site/START_WINDOWS.bat` (illa `START_MAC_LINUX.command`) double-click.

### ❌ Idha pannaadheenga
`index.html`-a **direct-a double-click pannaadheenga**. Globe varaadhu, loading-la nikkum. `file://` la browser JS modules-a block pannum. Server kandippa venum.

---

# PART 3 — CODE EDIT PANRADHU

Naan `python` script vechu patch panren (fast-a irukka). **Neenga VS Code-la direct-a edit pannunga** — adhu thaan normal vazhi.

### Oru varthai-a thedi maathanum
1. VS Code-la **Ctrl+Shift+F** (Mac: Cmd+Shift+F)
2. Thedara text type pannunga, eg `body.lang-ta h1`
3. Result click → andha line-ku pogum
4. Edit panni **Ctrl+S**
5. Browser-la **Ctrl+Shift+R** (hard refresh)

> **Ctrl+R podhaadhu** — pazhaiya CSS cache-la irundhu varum. Kandippa **Ctrl+Shift+R**.

### Endha file-la enna iruku

| Maathanum | File |
|---|---|
| Text, button, section | `site/index.html` |
| Colour, size, spacing, layout | `site/style.css` |
| Button click, language, drawer | `site/app.js` |
| 3D Earth, satellites, camera | `site/globe.js` |

---

# PART 4 — NAAN PANNA ELLA MAATRAMUM — MANUAL VERSION

## 4.1 — Ore mozhi mattum (EN xor தமிழ்)

**Rule:** ovvoru bilingual element-kum:
```html
<span data-bi data-en="Home" data-ta="முகப்பு">Home</span>
```
Inline HTML (`<b>`, `<br>`) irundhaa `data-bih`:
```html
<p data-bih data-en="Free <b>NASA</b> data" data-ta="இலவச <b>NASA</b> தரவு">Free <b>NASA</b> data</p>
```

**Purpose:** `app.js`-la `applyLang()` indha attributes-a padichu text-a swap pannum. `body`-la `lang-en` illa `lang-ta` class podum. `localStorage`-la save aagum.

**Puthu text serkanum-na:** andha rendu attribute-a add pannunga, podhum. Automatic-a velai seyyum.

## 4.2 — Tamil text overflow aanaal

Tamil letters English-a vida **uyaram jaasthi** — hero-va thaandi poidum.

`style.css` last-la:
```css
body.lang-ta h1{font-size:clamp(22px,2.15vw,32px);line-height:1.26}
body.lang-ta .hsub{font-size:14px;line-height:1.6}
```

**Eppadi kandupidikradhu:** browser-la **F12** → Tamil-ku switch → element mela right-click → Inspect → height paarunga. Periyathaa irundhaa `clamp()` value-a korainga.

## 4.3 — Layout overlap (buttons mela stats)

**Mool kaaranam:** rendu element-um `position:absolute` — onnukku onnu theriyaadhu, mothidum.

**Sari panra vazhi:** parent-a flex column aakunga, children-a normal flow-la vidunga:
```css
.hbox{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center}
.hcopy{max-width:min(520px,44vw)}
.hstats{margin-top:clamp(26px,3.4vh,44px)}
```

**Golden rule:** onnukku onnu keezha vara vendiya elements-a **rendaiyum `absolute` pannaadheenga**. Parent mattum absolute, children flow.

**Overlap-a kandupidikka** — F12 → Console:
```js
const a=document.querySelector('.hcta').getBoundingClientRect();
const b=document.querySelector('.hstats').getBoundingClientRect();
console.log('gap:', Math.round(b.top-a.bottom));
```
**Negative-na overlap.** Positive-na sari.

## 4.4 — Cinematic mode (Earth mattum mudhalla)

**CSS** — hide panradhu:
```css
body.cine .hbox, body.cine .hud{opacity:0;visibility:hidden;pointer-events:none}
.hbox,.hud{transition:opacity .75s cubic-bezier(.22,1,.36,1)}
```

**JS** — `app.js` last-la:
```js
document.body.classList.add('cine');
document.documentElement.style.overflow='hidden';  // scroll lock
document.body.style.overflow='hidden';

window.enterSite = function(){
  document.body.classList.remove('cine');
  document.documentElement.style.overflow='';
  document.body.style.overflow='';
};
```

> **Mukkiyam:** `wheel` / `keydown` listener **podaadheenga**. Munnadi adhu irundhadhu — konjam scroll panna odane site-ku ulla vandhudum. Click mattum thaan enter panna vendum.

## 4.5 — Satellite select panna ellame freeze

`app.js`:
```js
function freeze(on){
  G.setPaused(on);           // orbit clock nikkum
  G.setAutoRotate(!on);      // Earth spin nikkum
  document.body.classList.toggle('frozen', on);
}
```
Drawer thirandhaa `freeze(true)`, moodinaa `freeze(false)`.

CSS-la pachai bar:
```css
.frzbar{display:none}
body.frozen .frzbar{display:flex}
```

**Test:** satellite click → clock 3 vinaadi maaraama iruntha sari.

## 4.6 — Earth view button (thirumba pogum)

`index.html` navbar-la:
```html
<button class="nbtn earthb" id="earthB" onclick="return backToEarth()">
  <span data-bi data-en="Earth view" data-ta="பூமி காட்சி">Earth view</span>
</button>
```

`app.js`:
```js
window.backToEarth = function(){
  document.getElementById('drw').classList.remove('on');
  freeze(false);
  if (G && G.resetView) G.resetView();
  document.body.classList.add('cine');
  document.documentElement.style.overflow='hidden';
  document.body.style.overflow='hidden';
  return false;
};
```

`globe.js`-la camera-va thirumba kondu varradhu:
```js
function resetView(ms){
  const from = cam.position.clone();
  const to = new THREE.Vector3(0,78,352);   // original position
  const t0 = performance.now(), dur = ms||1400;
  (function step(){
    const k = Math.min(1,(performance.now()-t0)/dur);
    const e = k<.5 ? 4*k*k*k : 1-Math.pow(-2*k+2,3)/2;   // easeInOutCubic
    cam.position.lerpVectors(from,to,e);
    cam.lookAt(0,0,0);
    if(k<1) requestAnimationFrame(step); else controls.autoRotate=true;
  })();
}
```
Adha export list-la serkka marakkaadheenga.

## 4.7 — Drawer navbar-a maraikudhu

**Alaadhu:** z-index. Drawer 200, navbar 100 — drawer mela varum.
```css
.nav{z-index:320}
.drw{top:var(--nav);z-index:200}
```

## 4.8 — Scroll thappana idathula nikkudhu

**Alaadhu:** drawer close aagi hero theriyara podhu **layout height maarum** — ore `scrollTo(0,0)` podhaadhu.

```js
const r = document.documentElement, pv = r.style.scrollBehavior;
r.style.scrollBehavior = 'auto';          // CSS smooth-scroll-a off pannunga
let n = 0;
(function pin(){
  window.scrollTo(0,0);
  if(++n < 20) requestAnimationFrame(pin);
  else r.style.scrollBehavior = pv;
})();
```

> `scroll-behavior:smooth` CSS-la iruntha JS scroll velai seyyaadhu. Kandippa off panni thirumba on pannunga.

---

# PART 5 — TESTING

Naan Playwright script ezhuthi automatic-a test panren. **Neenga browser-la kai-ala pannalaam** — chinna site-ku idhe pothum.

### Kai-ala checklist (2 nimisham)

Ovvoru maatramukkum appuram:

```
□ Ctrl+Shift+R (hard refresh)
□ Earth mattum theriyudha?
□ Scroll panninaa cinematic-la irukkudha? (irukkanum)
□ "Enter VaanEye" click → content varudha?
□ Satellite table-la oru row click → drawer thirakkudha?
□ Clock nikkudha? (3 vinaadi paarunga)
□ "Earth view" click → Earth mattum thirumba varudha?
□ Clock thirumba odudha?
□ தமிழ் click → ellame Tamil-a? English kalakkala?
□ F12 → Console → sivappu error iruka? (irukka koodaadhu)
□ F12 → phone icon → 430px width → overflow iruka?
```

### F12 Console — unga best friend

**F12** → **Console** tab. Sivappu text = error.

| Error | Artham |
|---|---|
| `Cannot read properties of null` | Element illa, illa null-a pass panneenga |
| `404 Not Found` | File path thappu |
| `CORS policy` | `file://` la thirandhirukeenga — server use pannunga |
| `is not a function` | globe.js export list-la add pannala |

Console-la direct-a test pannalaam:
```js
document.body.className          // enna class iruku?
G.getStats()                     // globe status
backToEarth()                    // function-a kai-ala kupdunga
```

---

# PART 6 — GITHUB + DEPLOY

## Mudhal thadava mattum

GitHub.com → Sign up → **New repository** → peru `vaaneye` → **Public** → Create.

VS Code-la **Terminal → New Terminal**:
```bash
cd D:\VaanEye
git init
git add .
git commit -m "VaanEye - 3D Earth satellite platform"
git branch -M main
git remote add origin https://github.com/UNGA-PERU/vaaneye.git
git push -u origin main
```

## Aduthu ovvoru thadavaiyum (3 command)
```bash
git add .
git commit -m "enna maathineengalo adha ezhudhunga"
git push
```

VS Code-la button-um iruku: left-la **Source Control** icon → message type → **✓ Commit** → **Sync Changes**.

## Netlify deploy

1. https://netlify.com → **Sign up with GitHub**
2. **Add new site → Import an existing project → GitHub**
3. `vaaneye` repo select
4. Settings:
   - Build command: **காலியா vidunga**
   - Publish directory: **`site`**
5. **Deploy**

60 vinaadila live. Link: `random-name.netlify.app` — **Site settings → Change site name**-la maathalaam.

**Ippo ovvoru `git push`-kum thaana re-deploy aagum.**

### Seekiram venumaa (GitHub vendaam)
https://app.netlify.com/drop → **`site` folder-a drag pannunga**. 30 vinaadila live.

---

# PART 7 — PYTHON SCRIPTS

## Satellite data refresh
```bash
cd D:\VaanEye
pip install requests
python scripts/refresh_tle.py
```
CelesTrak-la irundhu pudhu TLE eduthu `site/sats.json` update pannum. **API key vendaam.** Vaaram oru thadava pothum.

## Accuracy proof (demo-la kaatta)
```bash
pip install sgp4 requests
python scripts/verify_accuracy.py
```
Namma SGP4 calculation-a live ISS API-oda compare pannum. **0.31 km** error kaatum — judges-ku idhu strong proof.

## PPT regenerate
```bash
pip install python-pptx pymupdf
python ppt/build.py
python ppt/topdf.py
```

> `pip` velai seyyalaina `python -m pip` use pannunga.

---

# PART 8 — SIKKAL VANDHAA

| Problem | Seiya vendiyadhu |
|---|---|
| Globe varave illa, loading nikkudhu | Server illaama thirandhirukeenga. Live Server use pannunga |
| Maatram theriyala | **Ctrl+Shift+R**. Illaina F12 → Network → "Disable cache" tick |
| Tamil-la text veliya varudhu | `body.lang-ta` font-size korainga |
| Elements overlap | Rendum `absolute`-a? Parent-a flex aakunga |
| Button click aagala | Vera element mela iruku. F12 → element inspect → `z-index` |
| `git push` reject | `git pull --rebase` appuram `git push` |
| Netlify-la white page | Publish directory `site`-aa nu paarunga |
| Phone-la overflow | F12 → 430px → `.nbtn.pri{display:none}` madhiri chinna screen rule |

---

# PART 9 — AI-KITTA EPPADI KEKKARADHU

## ❌ Ippadi kekkaadheenga
> "layout sari illa, sari pannu"

## ✅ Ippadi kelunga
> "`site/index.html`-la hero section-la Launch Platform button-um stats row-um overlap aagudhu, 1600×900 screen-la. `.hcta` and `.hstats` rendum `position:absolute`. Overlap illaama, rendum kandippa theriyara maadhiri sari pannu."

**Moonu ellame kudunga:** எந்த file · enna nadakkudhu · enna nadakkanum.

**Screenshot kuduthaa** — adhu thaan best. Naan udane paathuduven.

## Endha prompt eppo

| Velai | File |
|---|---|
| Pudhu AI-kku full context | `prompts/1_MASTER_PROMPT_FULL.md` |
| Cursor / v0 / Lovable-la build | `prompts/2_FULLSTACK_BUILD_PROMPT.md` |
| PPT regenerate | `prompts/3_PPT_PDF_PROMPT.md` |
| Gemini video clips | `prompts/4_DEMO_VIDEO_PROMPT.md` |
| API keys | `prompts/5_API_KEYS_GUIDE.md` |
| Andha chat-la serkka | `prompts/6_MERGE_OTHER_CHAT.md` |

**Muzhu file-aiyum paste pannunga**, appuram `---`, appuram unga velai. Konjam paste panninaa AI-kku context illa.

---

# PART 10 — DAILY ROUTINE

```
1. VS Code thiranga
2. index.html → right-click → Open with Live Server
3. Edit pannunga → Ctrl+S
4. Browser → Ctrl+Shift+R
5. F12 Console → error iruka nu paarunga
6. Sari-na: git add . && git commit -m "..." && git push
7. Netlify thaana deploy pannum
```

Idhu thaan. Vera onnum illa.
