import { initGlobe } from './globe.js';

const C = { starlink:'#4fa3ff', oneweb:'#9b6bff', nav:'#ffc53d', geo:'#ff8a3d', isro:'#ff5a5a',
            eo:'#2ee6a8', comm:'#36d3e6', station:'#ffffff', sci:'#ff6bd6', other:'#8fa6c4' };
const L = { starlink:['Starlink','ஸ்டார்லிங்க்'], oneweb:['OneWeb','ஒன்வெப்'],
  nav:['Navigation','வழிசெலுத்தல்'], geo:['Geostationary','புவிநிலை'], isro:['ISRO','இஸ்ரோ'],
  eo:['Earth Observation','பூமி கண்காணிப்பு'], comm:['Communication','தொடர்பு'],
  station:['Space Station','விண்வெளி நிலையம்'], sci:['Science','அறிவியல்'], other:['Other','மற்றவை'] };

const HIST = {
  isro:['Indian Space Research Organisation','ISRO satellites are the backbone of VaanEye. The Cartosat series delivers sub-metre imagery for encroachment mapping, RISAT carries C-band SAR that sees through monsoon cloud, Oceansat tracks chlorophyll for fishing zones, and the geostationary INSAT-3D/3DR pair refreshes thermal imagery over India every 15 minutes — which is how we detect wildfires so quickly. All of this data is published free through the Bhuvan portal.'],
  eo:['Earth Observation','These are the eyes VaanEye borrows. ESA\'s Sentinel-2 provides the 10 m multispectral bands behind every NDVI crop score, Sentinel-1 adds all-weather radar, and NASA/USGS Landsat gives a continuous archive stretching back to 1972 — essential for proving how a lake shoreline has shifted over decades. Open, free, and refreshed every few days.'],
  nav:['Global Navigation','GPS, GLONASS, Galileo, BeiDou and India\'s own NavIC constellation broadcast the timing signals that let a phone know exactly where it is. VaanEye depends on them twice over: once when a farmer walks his boundary to record the polygon, and again when a fishing boat needs to know how close it is drifting to the maritime line.'],
  geo:['Geostationary Orbit','At 35,786 km a satellite orbits in exactly one sidereal day, so it appears to hang motionless above one spot on Earth. That is why weather satellites like INSAT-3D, Meteosat and GOES live here — they can stare at the same region continuously. VaanEye layers this constant thermal watch over faster low-orbit passes to eliminate blind gaps.'],
  comm:['Communications','From Intelsat\'s geostationary giants to Iridium\'s cross-linked low-orbit mesh, these relay voice and data worldwide. They matter to VaanEye because our alerts must reach a fisherman 80 km offshore where no cell tower reaches — satellite messaging is the fallback when GSM runs out.'],
  station:['Crewed Spacecraft','The International Space Station orbits at roughly 400 km, circling Earth every 92 minutes at 7.66 km/s. China\'s Tiangong station shares similar altitude. Both carry Earth-observation instruments and serve as testbeds for the sensors that later fly on dedicated satellites.'],
  sci:['Space Science','Hubble, JWST, Chandra and their peers look outward rather than down. They are here because the same orbital mechanics, ground-station networks and open-data policies that serve astronomy also underpin the Earth-observation programmes VaanEye relies on.'],
  starlink:['Starlink','SpaceX\'s low-orbit broadband constellation — over 10,000 active spacecraft at roughly 550 km, by far the largest ever built. For VaanEye it represents the future of rural connectivity: direct-to-cell satellite links could one day carry our alerts to villages with no tower at all.'],
  oneweb:['OneWeb','A 650-plus satellite constellation at 1,200 km, now operated with Eutelsat and backed by Bharti. India is a major stakeholder and several batches launched on ISRO\'s LVM3 from Sriharikota. It targets rural broadband — exactly the connectivity gap VaanEye is designed to work around.'],
  other:['Active Satellite','One of the thousands of operational spacecraft currently in orbit — cubesats, technology demonstrators, military assets and ageing platforms still transmitting. Every object shown here is propagated from a real Two-Line Element set published by CelesTrak.']
};

let G = null, SATS = [], META = null, LANG = 0;
const $ = i => document.getElementById(i);

/* ---------- boot ---------- */
const api = initGlobe($('glc'), { tooltip: $('tip'), onPick: openSat });
G = api;

(async () => {
  try {
    META = await (await fetch('satmeta.json')).json();
    $('stTot').textContent = META.total.toLocaleString();
  } catch (e) {}
  SATS = await (await fetch('sats.json')).json();
  await api.loadSats('sats.json', n => {
    $('stTrk').textContent = n.toLocaleString();
    $('loadr').classList.add('off');
  });
  buildFilters(); renderTbl();
})();

/* ---------- filters ---------- */
let active = new Set(Object.keys(C));
function buildFilters() {
  const counts = {};
  SATS.forEach(s => counts[s.c] = (counts[s.c] || 0) + 1);
  $('filters').innerHTML = Object.keys(C).filter(k => counts[k]).map(k =>
    `<button class="fb on" data-k="${k}"><i style="background:${C[k]}"></i>${L[k][0]}<span class="c">${counts[k]}</span></button>`
  ).join('');
  $('filters').querySelectorAll('.fb').forEach(b => b.onclick = () => {
    const k = b.dataset.k;
    if (active.has(k)) { active.delete(k); b.classList.remove('on'); }
    else { active.add(k); b.classList.add('on'); }
    G.setFilter(active);
  });
}
window.spd = (el, v) => {
  document.querySelectorAll('.sb').forEach(b => b.classList.remove('on'));
  el.classList.add('on'); G.setTimeScale(v);
};

/* ---------- table ---------- */
window.renderTbl = () => {
  const q = ($('q').value || '').toLowerCase().trim();
  const cf = $('cf').value;
  let rows = SATS;
  if (cf) rows = rows.filter(s => s.c === cf);
  if (q) rows = rows.filter(s => s.n.toLowerCase().includes(q) || String(s.id).includes(q));
  $('tCount').textContent = rows.length.toLocaleString() + ' shown';
  const slice = rows.slice(0, 260);
  $('tbody').innerHTML = slice.map(s => {
    const inc = parseFloat(s.t2.slice(8, 16)) || 0;
    const mm = parseFloat(s.t2.slice(52, 63)) || 0;
    const alt = mm > 0 ? (Math.cbrt(398600.4418 / Math.pow(mm * 2 * Math.PI / 86400, 2)) - 6371) : 0;
    const vel = mm > 0 ? Math.sqrt(398600.4418 / (alt + 6371)) : 0;
    return `<tr onclick="openId(${s.id})">
      <td class="nm">${s.n}</td>
      <td><span class="dot"><i style="background:${C[s.c]}"></i>${L[s.c][LANG]}</span></td>
      <td class="num">${s.id}</td>
      <td class="num">${alt.toFixed(0)} km</td>
      <td class="num">${vel.toFixed(2)} km/s</td>
      <td class="num">${inc.toFixed(1)}°</td></tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--mu2)">No satellite matches that search.</td></tr>`;
};

/* ---------- drawer ---------- */
let cur = null;
window.openId = id => { const s = SATS.find(x => x.id === id); if (s) openSat(s); };
function openSat(s) {
  cur = s;
  $('dName').textContent = s.n;
  $('dCat').textContent = L[s.c][0] + ' · ' + L[s.c][1];
  const h = HIST[s.c] || HIST.other;
  $('dHist').innerHTML = `<b>${h[0]}</b>${h[1]}`;
  const inc = parseFloat(s.t2.slice(8, 16)) || 0;
  const raan = parseFloat(s.t2.slice(17, 25)) || 0;
  const ecc = parseFloat('0.' + s.t2.slice(26, 33).trim());
  const mm = parseFloat(s.t2.slice(52, 63)) || 0;
  const per = mm > 0 ? 1440 / mm : 0;
  const alt = mm > 0 ? (Math.cbrt(398600.4418 / Math.pow(mm * 2 * Math.PI / 86400, 2)) - 6371) : 0;
  const yr = parseInt(s.t1.slice(9, 11)); const launch = (yr > 56 ? 1900 + yr : 2000 + yr);
  const rows = [
    ['NORAD ID', 'கேட்டலாக் எண்', s.id],
    ['Altitude', 'உயரம்', alt.toFixed(1) + ' km'],
    ['Orbital period', 'சுற்றுக் காலம்', per.toFixed(1) + ' minutes'],
    ['Orbits per day', 'நாளொன்றுக்கு சுற்று', mm.toFixed(2)],
    ['Inclination', 'சாய்வு கோணம்', inc.toFixed(2) + '°'],
    ['Eccentricity', 'மையவிலகல்', ecc.toFixed(5)],
    ['RAAN', 'வலதேற்ற முடிச்சு', raan.toFixed(2) + '°'],
    ['Launch year', 'ஏவப்பட்ட ஆண்டு', launch],
    ['Live latitude', 'அட்சரேகை', s.lat != null ? s.lat.toFixed(3) + '°' : '—'],
    ['Live longitude', 'தீர்க்கரேகை', s.lon != null ? s.lon.toFixed(3) + '°' : '—'],
    ['Ground speed', 'வேகம்', s.vel ? s.vel.toFixed(3) + ' km/s' : '—']
  ];
  $('dKv').innerHTML = rows.map(r =>
    `<div class="kr"><span class="k">${r[0]}<span class="t ta">${r[1]}</span></span><span class="v">${r[2]}</span></div>`).join('');
  $('dTle').textContent = s.t1 + '\n' + s.t2;
  $('drw').classList.add('on');
  freeze(true);
}

/* Freeze the whole scene while a satellite is selected: orbits stop advancing
   and the Earth stops auto-spinning, so the user can study it. Releasing the
   selection starts everything again. */
function freeze(on){
  if (!G) return;
  G.setPaused(on);
  G.setAutoRotate(!on);
  document.body.classList.toggle('frozen', on);
}
window.closeDrw = () => { $('drw').classList.remove('on'); freeze(false); };
window.flyTo = () => {
  const i = SATS.findIndex(x => x.id === cur.id);
  if (i < 0) return;
  goHome(() => G.focusSat(i));
};

/* "View on Earth": swing the globe so the ground directly beneath this
   satellite faces us, drop a marker there, and report the exact lat/lon. */
window.viewOnEarth = () => {
  const i = SATS.findIndex(x => x.id === cur.id);
  if (i < 0) return;
  const g = G.getSatLatLon(i);
  goHome(() => {
    if (g) {
      G.focusGround(g.lat, g.lon, 1500, 235);
      G.markGround(g.lat, g.lon);
    } else {
      G.focusSat(i);
    }
  });
  if (g) {
    const box = $('dGeo');
    if (box) {
      box.classList.add('on');
      box.innerHTML =
        '<div class="gl">Ground point below satellite</div>' +
        '<div class="gv">' + Math.abs(g.lat).toFixed(4) + '° ' + (g.lat >= 0 ? 'N' : 'S') +
        ' &nbsp; ' + Math.abs(g.lon).toFixed(4) + '° ' + (g.lon >= 0 ? 'E' : 'W') + '</div>' +
        '<div class="gs">Altitude ' + g.alt.toFixed(1) + ' km · marker placed on the globe</div>';
    }
  }
};

/* leave cinematic mode + scroll to the globe, then run the camera move */
function goHome(then) {
  closeDrw();
  if (document.body.classList.contains('cine') && window.enterSite) enterSite();

  // force the page to the globe; retry across a few frames because closing the
  // drawer and revealing the hero both change layout height mid-scroll
  const root = document.documentElement, prev = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  let n = 0;
  (function pin() {
    window.scrollTo(0, 0);
    if (++n < 22) requestAnimationFrame(pin);
    else { root.style.scrollBehavior = prev; if (then) then(); }
  })();
}
addEventListener('keydown', e => { if (e.key === 'Escape') closeDrw(); });

/* ---------- nav / theme / lang ---------- */
addEventListener('scroll', () => {
  $('nav').classList.toggle('scr', scrollY > 30);
  let at = 'home';
  document.querySelectorAll('section[id]').forEach(s => {
    if (scrollY >= s.offsetTop - 140) at = s.id;
  });
  document.querySelectorAll('.nl').forEach(a => a.classList.toggle('on', a.dataset.s === at));
});
document.querySelectorAll('.nl').forEach(a => a.onclick = () => $('nlinks').classList.remove('open'));

window.tgTheme = () => {
  const r = document.documentElement, l = r.getAttribute('data-t') === 'light';
  r.setAttribute('data-t', l ? 'dark' : 'light');
};
/* ══════════ LANGUAGE — one language at a time, never both ══════════
   Every bilingual pair in the markup is <main text> + a companion element
   carrying the other language (.s inside nav links, .ta / .t elsewhere).
   Instead of swapping the strings we now HIDE the companion, so the page
   shows English only, or Tamil only — never the two stacked together. */
const LN = ['EN', 'தமிழ்'];

function applyLang() {
  const ta = LANG === 1;
  document.documentElement.lang = ta ? 'ta' : 'en';
  document.body.classList.toggle('lang-ta', ta);
  document.body.classList.toggle('lang-en', !ta);
  const en = $('lgEn'), tl = $('lgTa');
  if (en) en.classList.toggle('on', !ta);
  if (tl) tl.classList.toggle('on', ta);
  const t = $('langT'); if (t) t.textContent = LN[LANG];

  // ---- nav links ----
  document.querySelectorAll('.nl').forEach(a => {
    const main = a.childNodes[0], sub = a.querySelector('.s');
    if (!sub) return;
    if (!a.dataset.en) { a.dataset.en = main.textContent.trim(); a.dataset.ta = sub.textContent.trim(); }
    main.textContent = ta ? a.dataset.ta : a.dataset.en;
    a.classList.toggle('ta', ta);
    sub.style.display = 'none';              // companion never shown
  });

  // ---- section headings ----
  document.querySelectorAll('.shead').forEach(h => {
    const sta = h.querySelector('.sta'), h2 = h.querySelector('h2');
    if (!h2) return;
    if (!h.dataset.sw) {
      h.dataset.en = h2.innerHTML;
      h.dataset.ta = sta ? sta.textContent.trim() : '';
      h.dataset.sw = 1;
    }
    if (ta && h.dataset.ta) { h2.textContent = h.dataset.ta; h2.classList.add('ta'); }
    else { h2.innerHTML = h.dataset.en; h2.classList.remove('ta'); }
    if (sta) sta.style.display = 'none';
  });

  // ---- every other bilingual companion (.ta / .t sub-labels) ----
  document.querySelectorAll('[data-bi]').forEach(el => {
    const en = el.dataset.en || '', tam = el.dataset.ta || '';
    el.textContent = ta ? (tam || en) : en;
    el.classList.toggle('ta', ta && !!tam);
  });

  // rich bilingual blocks (allow inline HTML)
  document.querySelectorAll('[data-bih]').forEach(el => {
    const v = ta ? (el.dataset.ta || el.dataset.en) : el.dataset.en;
    el.innerHTML = v;
    el.classList.toggle('ta', ta);
  });

  if (typeof renderTbl === 'function') renderTbl();
}

/* Pair up the remaining companion labels once, so applyLang can drive them. */
function initBilingual() {
  document.querySelectorAll('.hs .l, .hcard h5, thead th, .kr .k, .fr, .stp, .loadr div')
    .forEach(host => {
      const comp = host.querySelector('.t, .ta');
      if (!comp || comp.dataset.done) return;
      const tamil = comp.textContent.trim();
      comp.remove();
      const first = [...host.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      const english = first ? first.textContent.trim() : host.textContent.trim();
      if (first) first.textContent = '';
      const span = document.createElement('span');
      span.dataset.bi = 1; span.dataset.en = english; span.dataset.ta = tamil;
      span.dataset.done = 1;
      host.insertBefore(span, host.firstChild);
    });
}

window.cycLang = () => { LANG = LANG ? 0 : 1; try { localStorage.setItem('ve_lang', LANG); } catch (e) {} applyLang(); };
window.setLang = (v) => { LANG = v ? 1 : 0; try { localStorage.setItem('ve_lang', LANG); } catch (e) {} applyLang(); };

function bootLang() {
  try { const v = localStorage.getItem('ve_lang'); if (v !== null) LANG = +v; } catch (e) {}
  initBilingual();
  applyLang();
}
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', bootLang);
else bootLang();

window.goApp = () => { location.href = 'app.html'; return false; };

/* Return to the opening shot — Earth alone, exactly as on first load. */
window.backToEarth = function () {
  $('drw').classList.remove('on');
  freeze(false);
  if (G && G.resetView) G.resetView();
  const r = document.documentElement, pv = r.style.scrollBehavior;
  r.style.scrollBehavior = 'auto';
  let n = 0;
  (function pin(){ window.scrollTo(0,0);
    if (++n < 20) requestAnimationFrame(pin); else r.style.scrollBehavior = pv; })();
  document.body.classList.add('cine');
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  try { history.replaceState(null, '', ' '); } catch (e) {}
  return false;
};


/* ══════════ CINEMATIC ENTRY ══════════
   Start with nothing but the rotating Earth. The hero copy, HUD and the rest
   of the page only appear once the visitor chooses to enter — or clicks Home. */
(function () {
  document.body.classList.add('cine');
  // hold the page still — the Earth is the only thing on screen
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';

  window.enterSite = function () {
    if (!document.body.classList.contains('cine')) return;
    document.body.classList.remove('cine');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    // releasing the scroll lock can restore a stale offset — pin to the top
    var r = document.documentElement, pv = r.style.scrollBehavior;
    r.style.scrollBehavior = 'auto';
    var n = 0;
    (function pin(){ window.scrollTo(0,0);
      if (++n < 20) requestAnimationFrame(pin); else r.style.scrollBehavior = pv; })();
    try { history.replaceState(null, '', '#home'); } catch (e) {}
  };

  // Home in the navbar: if we are still in cinematic mode, reveal the page.
  // If we already entered, behave like a normal anchor back to the top.
  document.querySelectorAll('.nl[data-s="home"], .logo').forEach(function (el) {
    el.addEventListener('click', function (ev) {
      if (document.body.classList.contains('cine')) {
        ev.preventDefault();
        enterSite();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Any other nav link (About, Features, …) leaves cinematic mode first, then
  // scrolls to its section. CSS smooth-scroll is disabled for the jump so the
  // repeated position fixes (layout grows as the hero reveals) cannot fight it.
  document.querySelectorAll('.nl:not([data-s="home"])').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      if (!document.body.classList.contains('cine')) return;
      ev.preventDefault();
      enterSite();

      var id = a.getAttribute('href');
      var root = document.documentElement;
      var prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';

      var tries = 0;
      (function land() {
        var t = document.querySelector(id);
        if (t) window.scrollTo(0, t.getBoundingClientRect().top + window.pageYOffset - 72);
        if (++tries < 50) requestAnimationFrame(land);
        else root.style.scrollBehavior = prev;
      })();
    });
  });

  // Cinematic mode is left ONLY by an explicit choice — clicking "Enter
  // VaanEye", Home, the logo or any nav link. Scrolling and key presses must
  // not dismiss it, so the Earth stays alone until the visitor decides.
  // Page scrolling is locked while the Earth is on its own.
})();
