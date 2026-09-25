#!/usr/bin/env python3
"""
Refresh site/sats.json from CelesTrak.

CelesTrak needs NO API KEY and has NO hard quota — it only asks that you
fetch at most a few times a day. This script is safe to run daily.

    python3 scripts/refresh_tle.py
"""
import json, os, sys, urllib.request, datetime

URL = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "site", "sats.json")
META = os.path.join(ROOT, "site", "satmeta.json")

# how many of each category to ship to the browser (keeps the payload ~1.5 MB)
CAP = {"starlink": 2600, "oneweb": 700, "other": 3400}

def categorise(name):
    n = name.upper()
    if n.startswith("STARLINK"): return "starlink"
    if n.startswith("ONEWEB"):   return "oneweb"
    if any(k in n for k in ("GPS", "GLONASS", "GALILEO", "BEIDOU", "NAVSTAR", "IRNSS", "NAVIC")):
        return "nav"
    if any(k in n for k in ("ISS", "CSS", "TIANGONG", "ZARYA")): return "station"
    if any(k in n for k in ("CARTOSAT", "RISAT", "OCEANSAT", "RESOURCESAT", "INSAT",
                            "GSAT", "IRS-", "EOS-", "SCATSAT", "MEGHA", "ASTROSAT",
                            "CHANDRAYAAN", "ADITYA")):
        return "isro"
    if any(k in n for k in ("SENTINEL", "LANDSAT", "TERRA", "AQUA", "SUOMI", "NOAA",
                            "METOP", "MODIS", "VIIRS", "SPOT", "PLEIADES", "WORLDVIEW",
                            "PLANET", "SKYSAT", "DOVE", "FLOCK")):
        return "eo"
    if any(k in n for k in ("HUBBLE", "JWST", "TESS", "SWIFT", "FERMI", "XMM", "CHANDRA")):
        return "sci"
    if any(k in n for k in ("INTELSAT", "SES-", "EUTELSAT", "ASTRA", "TELSTAR",
                            "IRIDIUM", "GLOBALSTAR", "INMARSAT", "THURAYA", "VIASAT")):
        return "comm"
    return "other"

def is_geo(t2):
    try:
        mm = float(t2[52:63])
        return 0.95 < mm < 1.05
    except Exception:
        return False

def main():
    print("fetching", URL)
    req = urllib.request.Request(URL, headers={"User-Agent": "VaanEye/1.0 (SIH2026 student project)"})
    text = urllib.request.urlopen(req, timeout=90).read().decode("utf-8", "replace")
    lines = [l.rstrip() for l in text.splitlines() if l.strip()]
    if len(lines) < 30:
        print("ERROR: response too short, aborting (old sats.json kept)"); sys.exit(1)

    sats, counts = [], {}
    for i in range(0, len(lines) - 2, 3):
        name, t1, t2 = lines[i].strip(), lines[i+1], lines[i+2]
        if not (t1.startswith("1 ") and t2.startswith("2 ")):
            continue
        cat = categorise(name)
        if cat == "other" and is_geo(t2):
            cat = "geo"
        counts[cat] = counts.get(cat, 0) + 1
        try:
            norad = int(t1[2:7])
        except Exception:
            continue
        sats.append({"n": name, "t1": t1, "t2": t2, "c": cat, "id": norad})

    total = len(sats)

    # cap the huge constellations so the browser payload stays small
    kept, seen = [], {}
    for s in sats:
        c = s["c"]
        seen[c] = seen.get(c, 0) + 1
        if c in CAP and seen[c] > CAP[c]:
            continue
        kept.append(s)

    with open(OUT, "w") as f:
        json.dump(kept, f, separators=(",", ":"))
    with open(META, "w") as f:
        json.dump({"total": total, "tracked": len(kept), "counts": counts,
                   "updated": datetime.datetime.now(datetime.timezone.utc).isoformat()}, f)

    print(f"total in catalogue : {total}")
    print(f"shipped to browser : {len(kept)}")
    print(f"written            : {OUT} ({os.path.getsize(OUT)//1024} KB)")
    for k, v in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"   {k:<10} {v}")

if __name__ == "__main__":
    main()
