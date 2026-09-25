# MASTER PROMPT 3 — THE SIH 2026 PPT & PDF
> Deck already ready irukku. Idhu adha **regenerate / maatha** panna vendiya prompt + instructions.

---

## 📁 READY FILES

| File | Edhukku |
|---|---|
| `VaanEye_SIH2026_Idea_Presentation.pptx` | Edit panna (PowerPoint-la open pannunga) |
| `VaanEye_SIH2026_Idea_Presentation.pdf` | Preview / QA |
| `ppt/build.py` | Deck-a regenerate panra python script |
| `ppt/topdf.py` | PPTX → PDF convert panra script |
| `ppt/assets/sih_logo.png` | Official SIH 2026 logo (template PDF-la irundhu 300 dpi) |
| `ppt/assets/vaaneye_logo.png` | VaanEye emblem |

---

## ⚠️ UPLOAD PANRATHUKKU MUNNADI — 2 VELAI

**1. Team ID fill pannunga**
Slide 1-la `< fill after portal registration >` nu iruku. Portal-la register pannadhuku appuram andha Team ID-a podunga.

**2. PDF-a PowerPoint-la irundhu export pannunga**
```
PowerPoint-la .pptx open pannunga
  → File
  → Export
  → Create PDF/XPS Document
  → Publish
```
Andha PDF-a thaan portal-la upload pannanum.

> **Naan kuduthа PDF-a neeraga upload pannaatheenga.** Adhu QA-kku mattum — sandbox-la Tamil font illatha-naala Tamil text சரியா varaadhu. PowerPoint-la export panna correct-a varum.

---

## 📋 OFFICIAL RULES (template page 7) — ellame follow panniten

| # | Rule | Status |
|---|---|---|
| 1 | Max 6 slides including title | ✅ exactly 6 |
| 2 | No paragraphs — points / diagrams / infographics | ✅ cards + flows mattum |
| 3 | Precise and easy to understand | ✅ headline + one line |
| 4 | Idea should be unique and novel | ✅ ₹0 cost, 2G reach, 6-in-1 |
| 5 | Only provided template, pointers unchanged | ✅ verbatim pointers |
| 6 | Save as PDF and upload — no PPT/Word | ✅ PDF export pannunga |

Template-oda 7-vathu "Important Instructions" slide — adha generate panname, delete pannanum nu rule.

---

## 🎨 TEMPLATE CHROME — official-a 1:1

| Element | Official template | Namma deck |
|---|---|---|
| Slide size | 960×540 pt | 13.333×7.5 in — same |
| SIH 2026 logo | top-right ellaa slide-layum | ✅ template PDF-la irundhu extract |
| "Your Team Name" ellipse | top-left purple outline, slides 2-6 | ✅ ulla VaanEye logo + name |
| Heading | centre, black serif ALL-CAPS | ✅ Times New Roman |
| Official pointers | italic bullets heading keezha | ✅ **oru ezhuthu kooda maathal** |
| Footer | blue bar, "@SIH Idea submission- Template", number right | ✅ same blue #0B71C1 |
| Title slide | navy serif banner, footer bar illa | ✅ same |

---

## 📑 SLIDE-BY-SLIDE

**Slide 1 — TITLE PAGE** *(official fields mattum, vera onnum illa)*
- Problem Statement ID – SIH26209
- Problem Statement Title- Student Innovation — Space Technology
- Theme- Space Technology
- PS Category- Software
- Team ID- *(fill pannanum)*
- Team Name (Registered on portal)- VaanEye
- Valathu pakkam VaanEye logo + "வான்கண்" + THE EYE IN THE SKY

**Slide 2 — IDEA TITLE**
6 domain cards → "How one alert is born" 5-step flow → 3 uniqueness cards (₹0 / 100% 2G / 6→1)

**Slide 3 — TECHNICAL APPROACH** *(full diagram, text illa)*
4 data sources ↓ 5-stage Python pipeline → **Supabase brain vs Firebase mouth** → stack + delivery

**Slide 4 — FEASIBILITY AND VIABILITY**
Feasibility 4 cards (munnadi, strongest) + risk→strategy table; appuram Viability 4 cards + 5-phase scale path

**Slide 5 — IMPACT AND BENEFITS**
4 audience cards reach numbers-oda → social/economic/environmental → measurable outcomes

**Slide 6 — RESEARCH AND REFERENCES**
7 data sources URL-oda · BigEarth.net uttpada 5 competitors + namma differentiation · literature citations · prototype proof

---

## 🔄 REGENERATE PANNA

```bash
cd /home/user
python3 ppt/build.py    # → .pptx
python3 ppt/topdf.py    # → .pdf + QA images /tmp/p1..p6.png
```

---

## ✏️ CONTENT MAATHA VENDUMNA (AI-kku kudukkura prompt)

```
`ppt/build.py` open pannu. Adhu python-pptx use panni SIH 2026 official
template-la VaanEye deck generate pannudhu.

Ivai MAATHA KOODAADHU:
- Official section headings: TITLE PAGE, IDEA TITLE, TECHNICAL APPROACH,
  FEASIBILITY AND VIABILITY, IMPACT AND BENEFITS, RESEARCH AND REFERENCES
- sec() function-ku pass panra official bullet pointers — verbatim irukkanum
- Template chrome: sih_logo(), team_badge(), footer() functions
- 6 slides — adhikam illa, kammi illa
- Slide 1-la official 6 fields mattum, vera content vendaam

Naan maatha solradhu: [UNGA CHANGE INGE]

Maathitu `python3 ppt/build.py && python3 ppt/topdf.py` run pannu,
appuram /tmp/p1..p6.png paathu overflow illannu confirm pannu.
```

---

## 🏆 JUDGES-AI IMPRESS PANRA 3 POINT

Deck-la ivai thaan namma strongest weapon — present panra podhu ivatha highlight pannunga:

1. **0.3 km verified accuracy** — "namma prototype already velai seyyudhu, live ISS telemetry-oda compare panni prove pannirukom"
2. **Supabase vs Firebase split** — "enna rendu database?" nu kettaa: Supabase = PostGIS spatial brain, Firebase = closed app-a wake panra mouth. Idhu architecture depth kaatudhu.
3. **2G / IVR reach** — ellaa competitor-um smartphone+4G mattum. Namma IVR voice call-la illiterate farmer-kum alert pogum. Idhu thaan moat.
