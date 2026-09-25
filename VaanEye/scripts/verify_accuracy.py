#!/usr/bin/env python3
"""
Prove our satellite positions are real.

Propagates the ISS TLE we ship in site/sats.json with SGP4 and compares it
against wheretheiss.at — an independent live tracker — at the same instant.

    pip install sgp4 requests
    python3 scripts/verify_accuracy.py
"""
import json, os, math, datetime, sys

try:
    import requests
    from sgp4.api import Satrec, jday
except ImportError:
    sys.exit("pip install sgp4 requests")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SATS = os.path.join(ROOT, "site", "sats.json")
ISS_NORAD = 25544

def eci_to_geodetic(r, gmst):
    x, y, z = r
    a, f = 6378.137, 1/298.257223563
    e2 = f*(2-f)
    lon = math.degrees(math.atan2(y, x) - gmst)
    while lon < -180: lon += 360
    while lon >  180: lon -= 360
    p = math.hypot(x, y)
    lat = math.atan2(z, p)
    for _ in range(8):
        N = a / math.sqrt(1 - e2*math.sin(lat)**2)
        alt = p/math.cos(lat) - N
        lat = math.atan2(z, p*(1 - e2*N/(N+alt)))
    N = a / math.sqrt(1 - e2*math.sin(lat)**2)
    alt = p/math.cos(lat) - N
    return math.degrees(lat), lon, alt

def gmst_from_jd(jd, fr):
    T = (jd + fr - 2451545.0) / 36525.0
    g = 280.46061837 + 360.98564736629*(jd+fr-2451545.0) + 0.000387933*T*T - T*T*T/38710000.0
    return math.radians(g % 360.0)

def main():
    sats = json.load(open(SATS))
    iss = next((s for s in sats if s["id"] == ISS_NORAD), None)
    if not iss:
        sys.exit("ISS not found in sats.json — run scripts/refresh_tle.py first")

    print(f"Our stored TLE : {iss['n']}")
    live = requests.get(f"https://api.wheretheiss.at/v1/satellites/{ISS_NORAD}", timeout=25).json()
    ts = live["timestamp"]
    dt = datetime.datetime.fromtimestamp(ts, datetime.timezone.utc)

    sat = Satrec.twoline2rv(iss["t1"], iss["t2"])
    jd, fr = jday(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second + dt.microsecond/1e6)
    e, r, v = sat.sgp4(jd, fr)
    if e != 0:
        sys.exit(f"SGP4 error {e}")

    lat, lon, alt = eci_to_geodetic(r, gmst_from_jd(jd, fr))
    dlat = abs(lat - live["latitude"])
    dlon = abs(lon - live["longitude"])
    km   = math.hypot(dlat*111.32, dlon*111.32*math.cos(math.radians(lat)))

    print(f"\ntimestamp      : {dt.isoformat()}")
    print(f"live API       : lat {live['latitude']:+.4f}  lon {live['longitude']:+.4f}  alt {live['altitude']:.1f} km")
    print(f"our SGP4       : lat {lat:+.4f}  lon {lon:+.4f}  alt {alt:.1f} km")
    print(f"\ndelta          : {dlat:.4f}° lat · {dlon:.4f}° lon")
    print(f"GROUND ERROR   : {km:.2f} km")
    print("\n" + ("PASS — positions are real and accurate." if km < 5 else "CHECK — larger error than expected."))

if __name__ == "__main__":
    main()
