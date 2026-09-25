# 0 — INDHA PROMPTS-A EPPADI USE PANRATHU

> **Ungaloda doubt:** "indha AI-kku thaana namma project theriyum, new AI-kku eppadi theriyum?"
>
> **Badhil:** New AI-kku theriyaadhu. **Adhanaala thaan indha files.** Andha file-a paste panna, andha AI-kku theriyum. File thaan memory.

---

## 1. Munnadi idhu puriyanum

AI-kku **ninaivu kidaiyaadhu**. Ovvoru chat-um pudhusaa aarambikkum.

Naan ipo unga project pathi pesaradhu — adhu naan "gnabagam vechiruken" nu illa. Ovvoru message-lum, **namma munnadi pesina ellame thirumba enakku anuppapadudhu**. Adhu thaan en memory.

**Indha prompt files = adhe velai, aana file-a.**

```
Neenga andha file-a paste pannunga
        ↓
Andha AI padikkum
        ↓
Ippo adhukku unga project muzhusaa theriyum
        ↓
Velai pannum
```

Enakku theriyara ellame andha file-la irukku. **Andha file kuduthaa, edha AI-um ennaiya maathiri velai pannum.**

---

## 2. Sariyaana vazhi vs thappana vazhi

### ❌ THAPPU
```
ChatGPT-la:
  "VaanEye-ku login page pannu"

ChatGPT: "VaanEye enna? Enna stack? Enna design?"
```
→ Puriyalai. Yaen? Adhukku edhuvume theriyaadhu.

### ✅ SARI
```
ChatGPT-la:

  [2_FULLSTACK_BUILD_PROMPT.md - full file paste]

  ---
  Mela irukkura spec-a padichitu, login page (Step 1) mattum pannu.

ChatGPT: "sari — Next.js 14, Tamil+English bilingual header,
          name + 10-digit mobile + language + OTP, Supabase auth..."
```
→ Velai pannudhu. Yaen? Ellame andha file-la irukku.

---

## 3. Padi padiyaa

### Padi 1 — Endha file nu paarunga

| Neenga panradhu | Endha file |
|---|---|
| Code build pannanum | `2_FULLSTACK_BUILD_PROMPT.md` |
| PPT maathanum | `3_PPT_PDF_PROMPT.md` |
| Video pannanum | `4_DEMO_VIDEO_PROMPT.md` |
| API keys | `5_API_KEYS_GUIDE.md` |
| Pothuvaa edhachum kekkanum | `1_MASTER_PROMPT_FULL.md` |

### Padi 2 — File-a open panni **muzhusaa** copy pannunga

`Ctrl+A` → `Ctrl+C`. **Konjam illa — muzhusaa.**

### Padi 3 — AI-la paste pannunga, appuram unga kelvi

```
[PASTE FULL FILE]

---
[UNGA KELVI INGA]
```

Andha `---` line mukkiyam. "Mela irukkurathu context, keezha irukkurathu velai" nu AI-kku puriyum.

---

## 4. Nijamaana examples

### Example A — Cursor-la code
```
[2_FULLSTACK_BUILD_PROMPT.md full paste]

---
Mela irukkura spec-oda padi Supabase schema + PostGIS migration files-a
create pannu. supabase/migrations/ folder-la podu.
```

### Example B — ChatGPT-la doubt
```
[1_MASTER_PROMPT_FULL.md full paste]

---
Judges kekkalaam: "yaen rendu database? Supabase-la mattum pannirukkalaame?"
Idhukku 30 second-la sollura maathiri badhil kudu.
```

### Example C — Gemini-la video
```
[4_DEMO_VIDEO_PROMPT.md-la CLIP 1 section mattum copy]
```
> Video-ku mattum thaan partial copy. Veto ellaam full file.

### Example D — v0/Lovable-la UI
```
[2_FULLSTACK_BUILD_PROMPT.md full paste]

---
"FEATURE 3 — SIX-PILLAR DASHBOARD" section-a mattum edu.
Andha dashboard-a Next.js + Tailwind-la build pannu.
Design requirements section-a follow pannu.
```

---

## 5. Endha AI-la enna

| AI | Edhukku | File |
|---|---|---|
| **Cursor** | Code (best) | 2 |
| **Claude** | Code, doubt, logic | 1 illa 2 |
| **ChatGPT** | Pothu kelvi, PPT content | 1 |
| **Gemini** | Video generate | 4 |
| **v0 / Lovable** | UI screens | 2 |
| **Windsurf** | Code | 2 |

Ellame same maathiri velai seyyum — **file-a paste pannaa pothum**.

---

## 6. File periyathu, adhukkulla podumaa?

| AI | Limit | Namma file |
|---|---|---|
| ChatGPT / Claude / Gemini | ~100,000+ words | 2,141 words ✅ |
| Cursor / Windsurf | full file support | ✅ |

**Ubaram idam iruku.** Kavalai vendaam.

Ore oru problem varum — **romba periya chat**-la, appuram AI munnadi paste pannadha marakkalaam. Appo:
```
Nyabagapaduthuren — [file-a thirumba paste pannunga]

Ippo indha velai pannu: ...
```

---

## 7. Andha files-la enna irukku (naan yaen ivlo periyaa ezhudhinen)

`1_MASTER_PROMPT_FULL.md` — 2,141 words:
- Product enna, PS ID, theme, deadline
- 3 problems, 3 solutions
- 6 pillars + ovvondrukkum enna data
- USP 4
- Full stack + **Supabase vs Firebase table**
- Alert flow 5 steps
- Onboarding 6 steps **muzhu vivaram**
- 0.3 km accuracy proof
- Feasibility 4 + risks table
- Viability 4 + 5 phases
- Impact 4 audience + benefits
- 7 data sources, 5 competitors, literature
- Colours, fonts, design rules

**Idhu ellame naan unga kitta irundhu 20+ messages-la therinjadhu.** Ellathaiyum andha file-la potten — adhanaala new AI-kku edhuvum missing aagaadhu.

---

## 8. Mukkiya rules

| ✅ | ❌ |
|---|---|
| File-a **muzhusaa** paste | Konjam mattum |
| `---` line podunga | Neeraga kelunga |
| Pudhu chat = thirumba paste | "munnadi sonnen" nu solradhu |
| Padi padiyaa kelunga | "full app pannu" |
| Code-a check pannunga | Kannai moodi nambaradhu |

---

## 9. Neenga project-a maathina?

Andha files-a **update pannunga**.

Udhaaranam: Mapbox-a vittu MapLibre-ku maarina —
`2_FULLSTACK_BUILD_PROMPT.md`-la Mapbox-a MapLibre nu maathunga.

**Andha files thaan unga project-oda unmaiyaana source.** Adha update-a vechuko, endha AI-lum velai pannum.

---

## ✅ Summary

**Ungaloda doubt sari** — new AI-kku unga project theriyaadhu.

**Adhukku thaan andha files.** Andha file = naan ippo therinjukittu irukkura ellame, ezhuthi vechadhu.

**File-a paste pannunga → andha AI-kkum theriyum.**

Andha files-ku yaarum thevai illa — ennaiyum, indha chat-aiyum. Neenga, andha file, edhachum oru AI. Adhu pothum.
