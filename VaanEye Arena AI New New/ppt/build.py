#!/usr/bin/env python3
"""
VaanEye · SIH 2026 IDEA Presentation
EXACT official SIH2026 template chrome, our content inside.

Template rules honoured (from the official PDF, slide 7):
  1. max 6 slides incl. title      2. no paragraphs — points/diagrams/infographics
  3. precise + easy to understand  4. unique & novel
  5. official pointers unchanged   6. upload as PDF

Template chrome reproduced 1:1:
  - 960x540 pt slide (13.333 x 7.5 in)
  - SIH 2026 logo top-right on every slide
  - "Your Team Name" purple ellipse top-left on slides 2-6  -> our VaanEye logo + name
  - centred black serif ALL-CAPS section heading
  - blue footer bar: "@SIH Idea submission- Template" centred, slide number right
  - title slide: navy serif "SMART INDIA HACKATHON 2026" top, no footer bar
"""
from pptx import Presentation
from pptx.util import Inches as I, Pt
from pptx.dml.color import RGBColor as C
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
import os

W, H = 13.333, 7.5
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
SIH_LOGO = os.path.join(A, "sih_logo.png")
VE_LOGO  = os.path.join(A, "vaaneye_logo.png")

# --- official template palette ---
NAVY  = C(0x1F,0x38,0x64)   # title-slide serif heading
BLACK = C(0x00,0x00,0x00)   # section headings
FBAR  = C(0x0B,0x71,0xC1)   # official blue footer bar
PURP  = C(0x7B,0x68,0xA6)   # team-name ellipse outline
# --- our content palette (kept sober to match a white official deck) ---
BLUE  = C(0x1F,0x4E,0x79)
ACC   = C(0x2E,0x74,0xB5)
DARK  = C(0x1A,0x1A,0x1A)
BODY  = C(0x2B,0x2B,0x2B)
GREY  = C(0x60,0x60,0x60)
LINE  = C(0xD4,0xDC,0xE6)
SOFT  = C(0xF3,0xF7,0xFC)
SOFT2 = C(0xE9,0xF0,0xFA)
GRN   = C(0x1E,0x7A,0x4C); GRNBG = C(0xEA,0xF6,0xEF)
RED   = C(0xB3,0x2A,0x36); REDBG = C(0xFD,0xEE,0xEF)
ORG   = C(0xA8,0x6A,0x0A); ORGBG = C(0xFD,0xF4,0xE3)
PUR   = C(0x5B,0x3A,0x8E); PURBG = C(0xF2,0xEE,0xFA)
TEAL  = C(0x0E,0x6B,0x75); TEALBG= C(0xE8,0xF6,0xF7)
WHT   = C(0xFF,0xFF,0xFF)

SERIF = "Times New Roman"   # template heading face
SANS  = "Arial"             # template body face
TAM   = "Nirmala UI"

TEAM  = "VaanEye"

prs = Presentation(); prs.slide_width=I(W); prs.slide_height=I(H)
BL = prs.slide_layouts[6]
N=[0]

# ───────────────────────── helpers ─────────────────────────
def rect(s,x,y,w,h,fill=None,line=None,lw=0.75,r=None,shp=MSO_SHAPE.RECTANGLE):
    if r is not None: shp=MSO_SHAPE.ROUNDED_RECTANGLE
    o=s.shapes.add_shape(shp,I(x),I(y),I(w),I(h))
    if r is not None:
        try: o.adjustments[0]=r
        except: pass
    if fill: o.fill.solid(); o.fill.fore_color.rgb=fill
    else: o.fill.background()
    if line: o.line.color.rgb=line; o.line.width=Pt(lw)
    else: o.line.fill.background()
    o.shadow.inherit=False; o.text_frame.text=""
    return o

def oval(s,x,y,w,h,fill,line=None,lw=0.75):
    return rect(s,x,y,w,h,fill,line,lw,shp=MSO_SHAPE.OVAL)

def T(s,x,y,w,h,t,sz=12,c=BODY,b=False,al=PP_ALIGN.LEFT,f=SANS,ln=1.2,sa=0,it=False):
    tb=s.shapes.add_textbox(I(x),I(y),I(w),I(h)); tf=tb.text_frame
    tf.word_wrap=True
    tf.margin_left=tf.margin_right=tf.margin_top=tf.margin_bottom=0
    for i,l in enumerate(str(t).split("\n")):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph()
        p.alignment=al; p.line_spacing=ln
        if sa: p.space_after=Pt(sa)
        r=p.add_run(); r.text=l
        r.font.size=Pt(sz); r.font.bold=b; r.font.italic=it
        r.font.color.rgb=c; r.font.name=f
    return tb

def RT(s,x,y,w,h,parts,sz=10.5,ln=1.22,al=PP_ALIGN.LEFT,sa=3,f=SANS):
    tb=s.shapes.add_textbox(I(x),I(y),I(w),I(h)); tf=tb.text_frame
    tf.word_wrap=True
    tf.margin_left=tf.margin_right=tf.margin_top=tf.margin_bottom=0
    for i,line in enumerate(parts):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph()
        p.alignment=al; p.line_spacing=ln; p.space_after=Pt(sa)
        for (t,col,bo) in line:
            r=p.add_run(); r.text=t; r.font.size=Pt(sz)
            r.font.color.rgb=col; r.font.bold=bo; r.font.name=f
    return tb

def arrow(s,x,y,w,h,col=ACC,shp=MSO_SHAPE.RIGHT_ARROW):
    a=s.shapes.add_shape(shp,I(x),I(y),I(w),I(h))
    a.fill.solid(); a.fill.fore_color.rgb=col; a.line.fill.background()
    a.shadow.inherit=False; a.text_frame.text=""
    return a

def sih_logo(s):
    """Official SIH 2026 logo, top-right, exactly as the template places it."""
    s.shapes.add_picture(SIH_LOGO, I(10.80), I(0.10), width=I(2.38))

def team_badge(s):
    """Template's 'Your Team Name' ellipse, top-left -> our logo + team name."""
    oval(s,0.26,0.10,1.52,0.86,WHT,PURP,1.25)
    s.shapes.add_picture(VE_LOGO, I(0.36), I(0.19), height=I(0.68))
    T(s,1.02,0.30,0.70,0.44,"Vaan\nEye",10,NAVY,True,PP_ALIGN.CENTER,f=SERIF,ln=1.02)

def footer(s):
    """Official blue footer bar."""
    N[0]+=1
    rect(s,0,H-0.40,W,0.40,fill=FBAR)
    T(s,4.2,H-0.31,4.9,0.24,"@SIH Idea submission- Template",10.5,WHT,False,PP_ALIGN.CENTER)
    T(s,W-1.10,H-0.31,0.65,0.24,str(N[0]),10.5,WHT,True,PP_ALIGN.RIGHT)

def sec(heading, pointers, ptr_y=1.08, ptr_sz=11):
    """Official content slide: logo, team badge, centred serif caps heading,
       official pointers verbatim, blue footer."""
    s=prs.slides.add_slide(BL)
    rect(s,0,0,W,H,fill=WHT)
    sih_logo(s); team_badge(s)
    T(s,1.95,0.22,8.75,0.55,heading,31,BLACK,True,PP_ALIGN.CENTER,f=SERIF)
    y=ptr_y
    for p in pointers:
        T(s,0.55,y,12.2,0.22,"•  "+p,ptr_sz,GREY,False,f=SANS,it=True)
        y+=0.245
    footer(s)
    return s, y

# ════════════════════════════════════════════════════════════════
# SLIDE 1 · TITLE PAGE   (official fields ONLY — nothing else)
# ════════════════════════════════════════════════════════════════
s=prs.slides.add_slide(BL)
rect(s,0,0,W,H,fill=WHT)
sih_logo(s)
T(s,0.40,0.26,10.2,0.66,"SMART INDIA HACKATHON 2026",36,NAVY,True,PP_ALIGN.CENTER,f=SERIF)
T(s,0.40,1.14,10.2,0.52,"TITLE PAGE",29,BLACK,True,PP_ALIGN.CENTER,f=SERIF)

# VaanEye emblem, centred under the heading block on the right
s.shapes.add_picture(VE_LOGO, I(9.95), I(2.05), height=I(2.30))
T(s,9.35,4.48,3.55,0.40,"VaanEye",26,NAVY,True,PP_ALIGN.CENTER,f=SERIF)
T(s,9.35,4.90,3.55,0.26,"வான்கண்",13,ACC,False,PP_ALIGN.CENTER,f=TAM)
T(s,9.35,5.20,3.55,0.22,"THE EYE IN THE SKY",9.5,GREY,True,PP_ALIGN.CENTER)

FIELDS=[("Problem Statement ID –","SIH26209"),
        ("Problem Statement Title-","Student Innovation — Space Technology"),
        ("Theme-","Space Technology"),
        ("PS Category-","Software"),
        ("Team ID-","< fill after portal registration >"),
        ("Team Name (Registered on portal)-","VaanEye")]
y=2.30
for k,v in FIELDS:
    RT(s,0.85,y,8.4,0.32,[[("\u2022  "+k+" ",BLACK,True),(v,NAVY,True)]],sz=15,sa=0,f=SANS)
    y+=0.56
N[0]+=1

# ════════════════════════════════════════════════════════════════
# SLIDE 2 · IDEA TITLE
# ════════════════════════════════════════════════════════════════
s,_ = sec("IDEA TITLE",
  ["Proposed Solution (Describe your Idea/Solution/Prototype)",
   "Detailed explanation of the proposed solution",
   "How it addresses the problem",
   "Innovation and uniqueness of the solution"], ptr_y=1.02, ptr_sz=10.5)

T(s,0.55,2.06,12.2,0.20,"DETAILED EXPLANATION — six domains on one platform",9.5,BLUE,True)
SIX=[("Flood & Fire","SAR sees through monsoon cloud; thermal SWIR pinpoints hotspots and sends the exact GPS grid.",RED),
     ("Crop Health","Weekly NDVI vigour score, SAR soil moisture for irrigation timing, early pest-stress signals.",GRN),
     ("Sea & Fishing","Fishing zones from sea temperature and chlorophyll; offline alarm before the maritime border.",TEAL),
     ("Heat & Air","Land Surface Temperature drives street-level heatwave warnings, rain nowcast and AQI.",ORG),
     ("Land Change","Yesterday-vs-today pixel differencing exposes illegal construction and lake encroachment.",PUR),
     ("Environment","Oil spills, industrial effluent and deforestation, auto-escalated to the right authority.",ACC)]
for i,(t,d,c) in enumerate(SIX):
    x=0.55+(i%3)*4.10; y=2.28+(i//3)*0.80
    rect(s,x,y,3.90,0.72,fill=WHT,line=LINE,r=0.09)
    rect(s,x,y,0.045,0.72,fill=c)
    T(s,x+0.20,y+0.07,3.5,0.20,t,10.5,c,True)
    T(s,x+0.20,y+0.27,3.58,0.40,d,8.3,BODY,ln=1.18)

T(s,0.55,3.94,12.2,0.20,"HOW IT ADDRESSES THE PROBLEM — how one alert is born",9.5,BLUE,True)
rect(s,0.55,4.16,12.25,0.92,fill=SOFT,line=LINE,r=0.05)
FL=[("Satellite pass","ISRO / ESA / NASA\nraw open imagery"),
    ("Analyse","NDVI · SAR · thermal\nAI change detection"),
    ("Match your land","PostGIS finds YOUR field\ninside the danger zone"),
    ("Plain sentence","\"Fire 12 km away —\nmove north now\""),
    ("Reaches you","App push · SMS ·\nTamil voice call")]
for i,(t,d) in enumerate(FL):
    x=0.72+i*2.40; bw=2.08
    rect(s,x,4.26,bw,0.72,fill=WHT,line=ACC,r=0.10)
    T(s,x+0.07,4.32,bw-0.14,0.20,t,9.3,BLUE,True,PP_ALIGN.CENTER)
    T(s,x+0.07,4.53,bw-0.14,0.38,d,7.8,BODY,False,PP_ALIGN.CENTER,ln=1.18)
    if i<4: arrow(s,x+bw+0.05,4.54,0.21,0.15,C(0x9D,0xB6,0xD1))

T(s,0.55,5.18,12.2,0.20,"INNOVATION AND UNIQUENESS",9.5,BLUE,True)
UQ=[("₹0","Zero data cost","We launch no satellite. Public feeds are consumed through open APIs, so the core map stays free for the citizen forever.",ORG,ORGBG),
    ("100%","Reaches 2G phones","Every rival needs a smartphone and 4G. Our IVR and SMS path reaches the rural majority they structurally cannot serve.",GRN,GRNBG),
    ("6 → 1","One window, not ten","Ten disconnected agency portals collapse into one dashboard answering with a single plain Tamil sentence.",PUR,PURBG)]
for i,(big,t,d,c,bgc) in enumerate(UQ):
    x=0.55+i*4.10
    rect(s,x,5.40,3.90,0.98,fill=bgc,line=None,r=0.08)
    rect(s,x,5.40,3.90,0.04,fill=c)
    T(s,x+0.20,5.50,1.12,0.28,big,14,c,True)
    T(s,x+1.34,5.54,2.40,0.20,t,10,DARK,True)
    T(s,x+0.20,5.80,3.55,0.50,d,8.3,BODY,ln=1.2)

rect(s,0.55,6.48,12.25,0.42,fill=SOFT2,line=None,r=0.12)
RT(s,0.76,6.58,11.9,0.24,[[
  ("Working prototype today:  ",DARK,True),
  ("live 3D Earth tracking 7,906 real satellites from live TLEs — verified to 0.3 km against independent ISS telemetry — plus full bilingual onboarding and the six-pillar dashboard.",BODY,False)]],sz=9.2)

# ════════════════════════════════════════════════════════════════
# SLIDE 3 · TECHNICAL APPROACH
# ════════════════════════════════════════════════════════════════
s,_ = sec("TECHNICAL APPROACH",
  ["Technologies to be used (e.g. programming languages, frameworks, hardware)",
   "Methodology and process for implementation (Flow Charts/Images/ working prototype)"],
  ptr_y=1.02, ptr_sz=10.5)

T(s,0.55,1.62,12.2,0.20,"1 · OPEN SATELLITE DATA SOURCES",9.3,BLUE,True)
SRC=[("ISRO Bhuvan","Cartosat · RISAT SAR\nOceansat · INSAT-3D"),
     ("ESA Copernicus","Sentinel-1 SAR\nSentinel-2 10 m optical"),
     ("NASA Earthdata","Landsat 8/9 · MODIS\nVIIRS active fire"),
     ("INCOIS / IMD","Fishing zone advisory\nOcean state forecast")]
for i,(t,d) in enumerate(SRC):
    x=0.55+i*3.09
    rect(s,x,1.82,2.89,0.66,fill=SOFT,line=ACC,r=0.09)
    T(s,x+0.08,1.88,2.73,0.20,t,9.8,BLUE,True,PP_ALIGN.CENTER)
    T(s,x+0.08,2.09,2.73,0.34,d,7.9,BODY,False,PP_ALIGN.CENTER,ln=1.18)
    arrow(s,x+1.34,2.50,0.21,0.17,C(0xB6,0xC6,0xDA),MSO_SHAPE.DOWN_ARROW)

T(s,0.55,2.72,12.2,0.20,"2 · GEOSPATIAL PROCESSING ENGINE  ·  Python workers",9.3,BLUE,True)
rect(s,0.55,2.92,12.25,1.06,fill=SOFT,line=LINE,r=0.05)
PR=[("Ingest","GDAL · Rasterio\nFiona · cloud mask"),
    ("Index maths","NumPy · SciPy\nNDVI / NDWI / LST"),
    ("AI detection","PyTorch CNN on SWIR\nOpenCV temporal diff"),
    ("Spatial match","PostGIS R-Tree\npolygon intersection"),
    ("Rule engine","Threshold + two-sensor\nconfirmation")]
for i,(t,d) in enumerate(PR):
    x=0.72+i*2.40; bw=2.08
    rect(s,x,3.02,bw,0.86,fill=WHT,line=LINE,r=0.10)
    oval(s,x+bw/2-0.12,3.07,0.24,0.24,BLUE)
    T(s,x+bw/2-0.12,3.10,0.24,0.18,str(i+1),8,WHT,True,PP_ALIGN.CENTER)
    T(s,x+0.07,3.34,bw-0.14,0.19,t,9.3,DARK,True,PP_ALIGN.CENTER)
    T(s,x+0.07,3.53,bw-0.14,0.32,d,7.7,BODY,False,PP_ALIGN.CENTER,ln=1.18)
    if i<4: arrow(s,x+bw+0.05,3.34,0.20,0.15,C(0xB6,0xC6,0xDA))

T(s,0.55,4.04,12.2,0.20,"3 · DUAL DATABASE — each does what the other cannot",9.3,BLUE,True)
rect(s,0.55,4.24,6.05,1.06,fill=GRNBG,line=GRN,r=0.06)
T(s,0.76,4.32,5.6,0.20,"SUPABASE  ·  the brain",10.2,GRN,True)
RT(s,0.76,4.55,5.65,0.68,[
  [("PostgreSQL + PostGIS",DARK,True),(" — an R-Tree spatial index answers",BODY,False)],
  [("\"is this farmer's polygon inside today's flood mask?\" in under a millisecond.",BODY,False)],
  [("Holds land boundaries, sea zones, alert history, auth and analytics.",BODY,False)]],sz=8.4,ln=1.22,sa=1)
rect(s,6.75,4.24,6.05,1.06,fill=ORGBG,line=ORG,r=0.06)
T(s,6.96,4.32,5.6,0.20,"FIREBASE  ·  the mouth",10.2,ORG,True)
RT(s,6.96,4.55,5.65,0.68,[
  [("FCM push + offline cache",DARK,True),(" — Supabase Realtime only reaches",BODY,False)],
  [("an OPEN app. Only FCM wakes a CLOSED app at 2 a.m. when fire starts.",BODY,False)],
  [("Also carries offline sync at sea, where there is no signal at all.",BODY,False)]],sz=8.4,ln=1.22,sa=1)

T(s,0.55,5.36,12.2,0.20,"4 · APPLICATION STACK & LAST-MILE DELIVERY",9.3,BLUE,True)
ST=[("Frontend","Next.js 14 · React\nMapbox GL · Vercel",ACC),
    ("Backend","Node.js runtime\nExpress API broker",PUR),
    ("Realtime","Supabase channels\nFirebase FCM",TEAL),
    ("Smartphone","Push notification\ninteractive map",GRN),
    ("2G phone","SMS + IVR Tamil\nvoice broadcast",ORG)]
for i,(t,d,c) in enumerate(ST):
    x=0.55+i*2.47
    rect(s,x,5.56,2.28,0.72,fill=WHT,line=LINE,r=0.10)
    rect(s,x,5.56,2.28,0.04,fill=c)
    T(s,x+0.08,5.64,2.12,0.19,t,9.3,c,True,PP_ALIGN.CENTER)
    T(s,x+0.08,5.84,2.12,0.36,d,7.9,BODY,False,PP_ALIGN.CENTER,ln=1.18)

rect(s,0.55,6.40,12.25,0.50,fill=SOFT2,line=None,r=0.12)
T(s,0.76,6.48,11.9,0.34,
  "All-weather resilience:  when monsoon cloud blinds optical sensors the pipeline auto-switches to Sentinel-1 C-band SAR, "
  "fused with INSAT-3D thermal refreshing every 15 minutes over India — so an alert never fails for want of a clear sky.",
  8.6,BODY,ln=1.25)

# ════════════════════════════════════════════════════════════════
# SLIDE 4 · FEASIBILITY AND VIABILITY
# ════════════════════════════════════════════════════════════════
s,_ = sec("FEASIBILITY AND VIABILITY",
  ["Analysis of the feasibility of the idea",
   "Potential challenges and risks",
   "Strategies for overcoming these challenges"], ptr_y=1.02, ptr_sz=10.5)

rect(s,0.55,1.84,6.05,0.28,fill=GRNBG,line=None,r=0.18)
T(s,0.74,1.885,5.8,0.20,"ANALYSIS OF FEASIBILITY  ·  can it be built today?",9.8,GRN,True)
FE=[("Technology is already in orbit","We build and launch nothing. Multi-billion-dollar public satellites are consumed through open REST APIs that are live right now."),
    ("Skills are mainstream","Next.js + Express + Node is a standard stack, and the Python geospatial libraries (GDAL, Rasterio, PyTorch) are mature and documented."),
    ("Zero capital expenditure","Only open-source packages and free tiers — Vercel plus Render carry the pilot. No licence fees and no hardware to purchase."),
    ("Legally clear","Fully within the National Geospatial Policy 2021: we parse only civilian-grade public telemetry released for public good.")]
yy=2.20
for t,d in FE:
    rect(s,0.55,yy,6.05,0.68,fill=WHT,line=LINE,r=0.08)
    rect(s,0.55,yy,0.045,0.68,fill=GRN)
    oval(s,0.74,yy+0.12,0.23,0.23,GRN)
    T(s,0.74,yy+0.145,0.23,0.18,"✓",7.6,WHT,True,PP_ALIGN.CENTER)
    T(s,1.06,yy+0.07,5.3,0.20,t,10.2,DARK,True)
    T(s,1.06,yy+0.29,5.38,0.34,d,8.2,BODY,ln=1.18)
    yy+=0.76

T(s,0.55,5.28,6.05,0.20,"CHALLENGES / RISKS  →  STRATEGIES TO OVERCOME",8.8,BLUE,True)
rect(s,0.55,5.48,6.05,1.04,fill=SOFT,line=LINE,r=0.05)
CH=[("Cloud blocks optical imagery","auto-fallback to SAR radar"),
    ("Satellite revisit time gaps","fuse geostationary INSAT-3D"),
    ("Villages with no internet","SMS + IVR voice pathway"),
    ("False alarms erode trust","two-sensor confirm before dispatch"),
    ("Scaling compute cost","tile caching + district batching")]
yy=5.57
for a,b in CH:
    T(s,0.72,yy,2.75,0.18,"• "+a,8,BODY)
    T(s,3.42,yy,0.2,0.18,"→",8,ACC,True)
    T(s,3.66,yy,2.85,0.18,b,8,GRN,True)
    yy+=0.19

rect(s,6.75,1.84,6.05,0.28,fill=PURBG,line=None,r=0.18)
T(s,6.94,1.885,5.8,0.20,"VIABILITY  ·  will it sustain long-term?",9.8,PUR,True)
VI=[("The need repeats every single year","Monsoons, crop cycles and fishing seasons return annually, so retention is structural — not a one-time utility people uninstall.",ACC),
    ("Free core, paid precision","Map and public alerts stay free forever. ₹15–20/month buys custom-drawn asset boundaries and daily automated monitoring.",PUR),
    ("Government contracts (B2G)","State Disaster cells and municipalities license sprawl timelines and encroachment evidence on multi-year institutional terms.",TEAL),
    ("A moat rivals cannot cross","Competitors are smartphone-and-4G only. Our IVR and SMS layer reaches the rural majority they cannot serve at any price.",ORG)]
yy=2.20
for t,d,c in VI:
    rect(s,6.75,yy,6.05,0.68,fill=WHT,line=LINE,r=0.08)
    rect(s,6.75,yy,0.045,0.68,fill=c)
    T(s,6.96,yy+0.07,5.6,0.20,t,10.2,DARK,True)
    T(s,6.96,yy+0.29,5.65,0.34,d,8.2,BODY,ln=1.18)
    yy+=0.76

T(s,6.75,5.28,6.05,0.20,"SCALE PATH",8.8,BLUE,True)
rect(s,6.75,5.48,6.05,1.04,fill=SOFT,line=LINE,r=0.05)
SC=[("Phase 1","Tamil Nadu pilot — 2 districts, 5,000 users"),
    ("Phase 2","All coastal states — Tamil + 4 languages"),
    ("Phase 3","Pan-India — 12 languages, state DM integration"),
    ("Phase 4","Open API for panchayats, NGOs, researchers"),
    ("Phase 5","Institutional B2G licensing at state scale")]
yy=5.57
for a,b in SC:
    T(s,6.92,yy,0.92,0.18,a,8,PUR,True)
    T(s,7.84,yy,4.85,0.18,b,8,BODY)
    yy+=0.19

rect(s,0.55,6.60,12.25,0.36,fill=SOFT2,line=None,r=0.14)
for i,(v,l) in enumerate([("₹0","CapEx to launch"),("7,906","satellites live now"),
                          ("0.3 km","verified accuracy"),("2G","minimum device"),
                          ("100%","open data, no licences")]):
    x=0.78+i*2.44
    RT(s,x,6.68,2.4,0.20,[[(v+"  ",NAVY,True),(l,GREY,False)]],sz=8.8)

# ════════════════════════════════════════════════════════════════
# SLIDE 5 · IMPACT AND BENEFITS
# ════════════════════════════════════════════════════════════════
s,_ = sec("IMPACT AND BENEFITS",
  ["Potential impact on the target audience",
   "Benefits of the solution (social, economic, environmental, etc.)"],
  ptr_y=1.02, ptr_sz=10.5)

T(s,0.55,1.62,12.2,0.20,"POTENTIAL IMPACT ON THE TARGET AUDIENCE",9.3,BLUE,True)
IM=[("Farmers","A weekly crop health score and irrigation timing replace guesswork. Land is walked once with GPS and saved forever. Pest stress is flagged before it spreads field to field.","2.5 crore+ farm households",GRN,GRNBG),
    ("Fishermen","Fishing-zone bearings before departure end wasted fuel on empty trips, and the offline maritime-border alarm prevents arrests and boat seizures far out at sea.","40 lakh+ coastal livelihoods",TEAL,TEALBG),
    ("Families & workers","Heatwave, air-quality and flood warnings for their own street — and for their hometown village if they work in another city, so family is never left unwatched.","Every citizen in the area",ORG,ORGBG),
    ("Authorities","Fire coordinates arrive automatically instead of by phone call. Encroachment gets timestamped satellite evidence. Urban sprawl is tracked year over year.","State DM cells, municipalities",PUR,PURBG)]
for i,(t,d,who,c,bgc) in enumerate(IM):
    x=0.55+(i%2)*6.20; y=1.84+(i//2)*1.00
    rect(s,x,y,6.05,0.90,fill=WHT,line=LINE,r=0.07)
    rect(s,x,y,0.045,0.90,fill=c)
    T(s,x+0.20,y+0.07,3.1,0.20,t,11.5,DARK,True)
    rect(s,x+3.34,y+0.09,2.55,0.23,fill=bgc,r=0.3)
    T(s,x+3.34,y+0.12,2.55,0.18,who,7.6,c,True,PP_ALIGN.CENTER)
    T(s,x+0.20,y+0.36,5.65,0.48,d,8.4,BODY,ln=1.2)

T(s,0.55,3.94,12.2,0.20,"BENEFITS OF THE SOLUTION  (social, economic, environmental)",9.3,BLUE,True)
BN=[("SOCIAL","Lives protected","Warnings reach the poorest and least connected first instead of last, and language is never the barrier — the alert speaks Tamil, by voice if needed.",GRN,GRNBG),
    ("ECONOMIC","Losses prevented","Less crop lost to undetected pest and missed irrigation. Less diesel burnt on empty fishing trips. Fewer boats seized and fewer livelihoods wiped out.",ORG,ORGBG),
    ("ENVIRONMENTAL","Damage caught early","Faster fire response means smaller burns. Encroachment, effluent discharge and deforestation become visible and accountable, so they deter.",TEAL,TEALBG)]
for i,(tag,t,d,c,bgc) in enumerate(BN):
    x=0.55+i*4.10
    rect(s,x,4.16,3.90,1.02,fill=WHT,line=LINE,r=0.07)
    rect(s,x,4.16,3.90,0.04,fill=c)
    rect(s,x+0.18,4.27,1.28,0.23,fill=bgc,r=0.3)
    T(s,x+0.18,4.30,1.28,0.18,tag,7.6,c,True,PP_ALIGN.CENTER)
    T(s,x+0.18,4.57,3.5,0.20,t,10.5,DARK,True)
    T(s,x+0.18,4.79,3.58,0.36,d,8.2,BODY,ln=1.2)

T(s,0.55,5.30,12.2,0.20,"MEASURABLE OUTCOMES",9.3,BLUE,True)
for i,(v,l) in enumerate([("< 10 s","from satellite detection to citizen alert"),
                          ("15 min","fire hotspot refresh cycle over India"),
                          ("100%","of the population reachable, 2G included"),
                          ("₹0","cost to the citizen, permanently")]):
    x=0.55+i*3.09
    rect(s,x,5.50,2.89,0.78,fill=SOFT,line=LINE,r=0.07)
    T(s,x,5.58,2.89,0.28,v,16,NAVY,True,PP_ALIGN.CENTER)
    T(s,x+0.10,5.89,2.69,0.32,l,7.9,BODY,False,PP_ALIGN.CENTER,ln=1.18)

rect(s,0.55,6.40,12.25,0.50,fill=SOFT2,line=None,r=0.12)
T(s,0.76,6.49,11.9,0.34,
  "The real outcome:  a farmer who cannot read a raster and a fisherman with no signal both receive the same intelligence "
  "a government analyst gets — as one sentence, in Tamil, on the phone already in their pocket.",
  8.8,BODY,ln=1.25)

# ════════════════════════════════════════════════════════════════
# SLIDE 6 · RESEARCH AND REFERENCES
# ════════════════════════════════════════════════════════════════
s,_ = sec("RESEARCH  AND REFERENCES",
  ["Details / Links of the reference and research work"], ptr_y=1.02, ptr_sz=10.5)

T(s,0.55,1.40,6.05,0.20,"OPEN DATA SOURCES WE BUILD ON",9.3,BLUE,True)
DS=[("ISRO Bhuvan","bhuvan.nrsc.gov.in","Cartosat, RISAT SAR, Oceansat, INSAT-3D/3DR thermal"),
    ("ESA Copernicus","dataspace.copernicus.eu","Sentinel-1 C-band SAR, Sentinel-2 10 m, 5-day revisit"),
    ("NASA Earthdata","earthdata.nasa.gov","Landsat 8/9 archive, MODIS, VIIRS active fire"),
    ("INCOIS","incois.gov.in","Potential Fishing Zone advisories, ocean state forecast"),
    ("CelesTrak","celestrak.org","Live TLE orbital elements powering our 3D tracker"),
    ("Bhashini","bhashini.gov.in","Government NLP stack for Indian-language alerts"),
    ("BigEarthNet","bigearth.net","Sentinel-2 benchmark corpus for land-cover training")]
yy=1.60
for n,u,d in DS:
    rect(s,0.55,yy,6.05,0.45,fill=WHT,line=LINE,r=0.10)
    rect(s,0.70,yy+0.10,0.05,0.25,fill=ACC)
    T(s,0.86,yy+0.05,2.3,0.18,n,9,DARK,True)
    T(s,0.86,yy+0.23,2.4,0.16,u,7,ACC)
    T(s,3.28,yy+0.10,3.22,0.30,d,7.4,BODY,ln=1.12)
    yy+=0.50

T(s,6.75,1.40,6.05,0.20,"EXISTING SOLUTIONS STUDIED  ·  and how VaanEye differs",9.3,BLUE,True)
EX=[("BigEarth.net / BigEarthNet","EU benchmark dataset for Sentinel-2 land-cover classification.","A research corpus for scientists. We train on it, then turn the same imagery into a citizen sentence."),
    ("Google Earth Engine","Planetary-scale raster computation inside a code editor.","Requires JavaScript and remote-sensing skill. VaanEye requires only a phone number."),
    ("Bhuvan / MOSDAC portals","Official ISRO map viewers and data download portals.","Single-domain viewers, no personal alerting. We fuse six domains and push to the user."),
    ("Sentinel Hub / EO Browser","Commercial imagery browsing and processing APIs.","Paid tiers aimed at analysts. We stay free at the point of use for the citizen."),
    ("mKisan / Meghdoot","Government SMS agro-advisory services.","Generic advisory text with no live satellite verification of the user's own field.")]
yy=1.60
for n,w,d in EX:
    rect(s,6.75,yy,6.05,0.64,fill=WHT,line=LINE,r=0.08)
    rect(s,6.75,yy,0.045,0.64,fill=PUR)
    T(s,6.96,yy+0.04,5.6,0.19,n,9.2,DARK,True)
    T(s,6.96,yy+0.23,5.6,0.17,w,7.3,GREY,it=True)
    RT(s,6.96,yy+0.41,5.66,0.19,[[("→  ",ACC,True),(d,BODY,False)]],sz=7.4,ln=1.08)
    yy+=0.70

T(s,0.55,5.22,6.05,0.20,"VALIDATED METHODS & LITERATURE",9.3,BLUE,True)
ME=[("NDVI","Rouse et al., 1974 — (NIR−Red)/(NIR+Red) vegetation vigour"),
    ("NDWI","McFeeters, 1996 — surface water delineation for flood staging"),
    ("SGP4 / SDP4","Hoots & Roehrich, 1980 — NORAD orbital propagation"),
    ("SAR change detection","Pixel-wise backscatter differencing for encroachment"),
    ("PFZ methodology","INCOIS SST + chlorophyll convergence advisory model")]
yy=5.42
for a,b in ME:
    rect(s,0.55,yy,6.05,0.21,fill=SOFT,line=None,r=0.2)
    T(s,0.70,yy+0.025,1.72,0.16,a,7.8,BLUE,True)
    T(s,2.45,yy+0.03,4.05,0.16,b,7.3,BODY)
    yy+=0.24

T(s,6.75,5.22,6.05,0.20,"SIH 2026 SPACE-TECH CONTEXT  &  PROTOTYPE STATUS",9.3,BLUE,True)
PT=[("Related SIH 2026 PS studied","SIH26227 multi-temporal change analysis · SIH26192 flash-flood prediction · SIH26191 hazard red zones"),
    ("Live 3D Earth prototype","7,906 real satellites, SGP4 in-browser, verified 0.3 km vs live ISS telemetry"),
    ("Bilingual onboarding built","6 steps Tamil + English, GPS land walking, sea-zone picker, multi-location watch")]
yy=5.42
for a,b in PT:
    rect(s,6.75,yy,6.05,0.45,fill=WHT,line=GRN,r=0.10)
    oval(s,6.92,yy+0.11,0.21,0.21,GRN)
    T(s,6.92,yy+0.135,0.21,0.17,"✓",7,WHT,True,PP_ALIGN.CENTER)
    T(s,7.22,yy+0.04,5.4,0.17,a,8.3,DARK,True)
    T(s,7.22,yy+0.22,5.45,0.20,b,7.2,BODY,ln=1.08)
    yy+=0.51

prs.save("/home/user/VaanEye_SIH2026_Idea_Presentation.pptx")
print("saved · slides =", len(prs.slides._sldIdLst))
