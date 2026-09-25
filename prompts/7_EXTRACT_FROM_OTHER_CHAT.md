# 7 — ANDHA CHAT-LA IRUNDHU ELLATHAIYUM VELIYE EDUKKA

> **Idha ANDHA chat-la paste pannunga.** Keezha `====` kku ulla irukkuradha muzhusaa copy pannunga.
> Andha chat unga platform-a full-a veliye kudukkum, appuram adha inga kondu vandhu serkkalaam.

---

## Eppadi use panradhu

1. Keezha irukkura prompt-a **muzhusaa** copy pannunga
2. **Andha chat-la** paste pannunga
3. Adhu kudukkura output-a **muzhusaa** copy panni **inga** paste pannunga
4. Periyathaa irundhaa adhu part-part-a kudukkum — ovvondraiyum inga kondu vaanga

---

```
====================== IDHA COPY PANNUNGA ======================

Namma indha chat-la build panna ellathaiyum naan innoru idathukku
kondu poganum. Naan unga memory-a kondu poga mudiyaadhu — files-a
mattum thaan kondu poga mudiyum. So ellathaiyum full-a, ethaiyum
vidaama veliye kudunga.

Keezha irukkura 7 pகுதியum ORDER-la kudunga.

──────────────────────────────────────────────
PAGUTHI 1 — FILE TREE
──────────────────────────────────────────────
Namma project-oda full folder structure-a kudunga. Ovvoru file-oda
size-um, oru varthaila adhu enna nu-um kudunga.

Idhu maadhiri:

  project/
  ├─ package.json          2 KB   deps + scripts
  ├─ app/
  │  ├─ layout.tsx         3 KB   root layout
  │  └─ page.tsx           8 KB   landing page
  └─ ...

──────────────────────────────────────────────
PAGUTHI 2 — ELLA CODE FILES
──────────────────────────────────────────────
Ovvoru file-um ippadi kudunga:

  ### FILE: app/page.tsx
  ```tsx
  (muzhu code, mudhal line-la irundhu kadaisi varai)
  ```

VIDHIGAL — idhu romba mukkiyam:
  • "// ...rest of code" / "// unchanged" / "// same as before"
    madhiri ETHAIYUM ezhudhaadheenga. MUZHU CODE venum.
  • Summary vendaam. Explanation vendaam. CODE MATTUM.
  • Chinna file-aa irundhaalum kudunga — config, types, utils ellame.
  • package.json, tsconfig.json, tailwind.config, next.config,
    .env.example — ellame kudunga.
  • node_modules, .next, build, dist — ivai MATTUM vendaam.

──────────────────────────────────────────────
PAGUTHI 3 — DATABASE
──────────────────────────────────────────────
  • Ella table-oda full SQL schema (CREATE TABLE ...)
  • Ella RLS policy
  • Ella migration file
  • Seed data / sample rows
  • Supabase-la manual-a pannadhu edhaachum irundhaa (bucket,
    auth provider, extension) — adha list pannunga

──────────────────────────────────────────────
PAGUTHI 4 — ENVIRONMENT
──────────────────────────────────────────────
  • Ella environment variable NAME (value vendaam)
  • Ovvonnum enna-kku, enga irundhu vaangaradhu
  • Endhadhu NEXT_PUBLIC_, endhadhu server-only

──────────────────────────────────────────────
PAGUTHI 5 — DESIGN SYSTEM
──────────────────────────────────────────────
  • Colour palette — exact hex codes, ovvondrum enga use aagudhu
  • Fonts — peru, weights, enga load aagudhu
  • Spacing scale, border radius, shadows
  • Component patterns — button variants, card, input style
  • Dark mode iruka? eppadi implement panneenga?
  • Kadaisila: "indha design-a oru puthu page-la thodara naan
    kandippa follow panna vendiya 5 vidhigal enna?"

──────────────────────────────────────────────
PAGUTHI 6 — MUDIVUGAL (DECISIONS)
──────────────────────────────────────────────
Indha chat-la naanga edutha mukkiyamana mudivugal enna, appuram
yaen appadi mudivu panneenga?

  • Architecture mudivugal (yaen indha structure)
  • Naanga TRY PANNI VELAI SEYYAADHA vazhigal (idhu romba mukkiyam —
    thirumba andha thappa naan panna koodaadhu)
  • Known bugs / innum mudikkaadha velai
  • Workaround / hack edhaachum irundhaa, yaen adhu venum

──────────────────────────────────────────────
PAGUTHI 7 — RUN PANRA VAZHI
──────────────────────────────────────────────
  • Exact commands: install, dev, build
  • Node version, package manager (npm/pnpm/yarn)
  • Setup order — edhu munnadi pannanum
  • Deploy panniruntha: enga, enna settings

──────────────────────────────────────────────
OUTPUT MURAI
──────────────────────────────────────────────
Ellame oru message-la adangaadhu. Paravaayilla.

  • Ovvoru message kadaisilayum: "PART n / m — THODARUM"
    illa "PART n / m — MUDINJADHU"
  • Naan "continue" nu solluven, adutha paguthi kudunga
  • Message naduvula code-a வெட்டாdheenga — oru file muzhusaa
    oru message-la varanum
  • Mothathula ethana message aagum nu munnadiye sollunga

PAGUTHI 1-la irundhu ippove aarambinga.

====================== INGA MUDIYUDHU ======================
```

---

## Andha chat "romba periyathu" nu sonnaa

Ippadi sollunga:

```
Paravaayilla. Ippadi pirichu kudunga:

  Message 1 → PAGUTHI 1 (file tree) + PAGUTHI 7 (run commands)
  Message 2 → backend / API files ellame
  Message 3 → frontend pages ellame
  Message 4 → components ellame
  Message 5 → PAGUTHI 3,4,5,6 (db, env, design, decisions)

Message 1-la irundhu aarambinga. Naan "continue" solluven.
```

## Andha chat file-a summary panna aarambichaa

Odane niruthunga:

```
Niruthunga. Neenga code-a summarise panreenga.
"// ...rest unchanged" nu ezhudhineenga — adhu enakku velai seyyaadhu.
Andha file-a MUZHUSAA, mudhal line-la irundhu kadaisi varai
thirumba kudunga.
```

## Andha chat marandhuduchu nu sonnaa

```
Paravaayilla. Innum ungalukku theriyaradha kudunga.
Theriyaadha-thukku "[MISSING - naan thirumba build pannanum]"
nu mark pannunga.
```

---

## Inga kondu vandha pinnadi

Naan indha order-la pannuven:

1. Files-a `/home/user/platform/`-la sariyaa podren
2. Enna missing nu check panren
3. `npm install` panni run panni paakren
4. Namma 3D Earth-a landing page-la integrate panren
5. Browser-la test panni screenshot kaatren
6. Master prompt-oda compare panni gap-a list panren
7. Netlify / Vercel-la deploy panren

**Neenga onnume panna vendaam — paste mattum pannunga.**
