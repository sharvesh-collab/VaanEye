/* ===================================================================
   VaanEye · Real Earth + 7,900 live satellites  (three.js + satellite.js)
   =================================================================== */
import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

const R = 100;                        // earth radius in scene units
const KM = R / 6371;                  // km -> scene
const C = {
  starlink:0x4fa3ff, oneweb:0x9b6bff, nav:0xffc53d, geo:0xff8a3d,
  isro:0xff5a5a, eo:0x2ee6a8, comm:0x36d3e6, station:0xffffff,
  sci:0xff6bd6, other:0x8fa6c4
};
const LBL = {
  starlink:['Starlink','ஸ்டார்லிங்க்'], oneweb:['OneWeb','ஒன்வெப்'],
  nav:['Navigation','வழிசெலுத்தல்'], geo:['Geostationary','புவிநிலை'],
  isro:['ISRO','இஸ்ரோ'], eo:['Earth Observation','பூமி கண்காணிப்பு'],
  comm:['Communication','தொடர்பு'], station:['Space Station','விண்வெளி நிலையம்'],
  sci:['Science','அறிவியல்'], other:['Other','மற்றவை']
};

let scene, cam, renderer, controls, earth, clouds, glow, satPts, satMesh;
let sats = [], raycaster, mouse = new THREE.Vector2(), hovered = -1;
let simTime = new Date(), timeScale = 1, paused = false;
let canvas, tip, onPick = null, ready = false, flying = false, cloudOffset = 0;
let visible = new Set(Object.keys(C));

export function initGlobe(el, opts = {}) {
  canvas = el;
  scene = new THREE.Scene();

  cam = new THREE.PerspectiveCamera(42, el.clientWidth / el.clientHeight, 1, 8000);
  cam.position.set(0, 78, 352);

  renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(el.clientWidth, el.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  controls = new OrbitControls(cam, el);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.rotateSpeed = 0.42;
  controls.minDistance = 128;
  controls.maxDistance = 900;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.26;

  // ---------- lights ----------
  const sun = new THREE.DirectionalLight(0xfff4e6, 2.5);
  sun.position.set(-420, 130, 320);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x2a3a55, 0.5));
  const rim = new THREE.DirectionalLight(0x4f8fd8, 0.55);
  rim.position.set(340, -90, -260); scene.add(rim);

  const L = new THREE.TextureLoader();
  const tx = p => { const t = L.load(p); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

  // ---------- starfield ----------
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(4000, 48, 48),
    new THREE.MeshBasicMaterial({ map: tx('tex/stars.png'), side: THREE.BackSide, color: 0x9fb4d8 })
  );
  scene.add(sky);

  // ---------- earth (day/night shader) ----------
  const dayT = tx('tex/day.jpg'), nightT = tx('tex/night.jpg');
  const bumpT = L.load('tex/bump.jpg'), specT = L.load('tex/spec.png');

  const mat = new THREE.MeshPhongMaterial({
    map: dayT, bumpMap: bumpT, bumpScale: 0.85,
    specularMap: specT, specular: new THREE.Color(0x2f4d70), shininess: 17
  });
  // inject city lights on the night side
  mat.onBeforeCompile = sh => {
    sh.uniforms.nightMap = { value: nightT };
    sh.uniforms.sunDir = { value: sun.position.clone().normalize() };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform sampler2D nightMap; uniform vec3 sunDir; varying vec3 vWN;`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
        float d = dot(normalize(vWN), normalize(sunDir));
        float night = smoothstep(0.16, -0.24, d);
        vec3 lights = texture2D(nightMap, vMapUv).rgb;
        lights = pow(lights, vec3(1.35)) * vec3(1.22, 0.98, 0.66);
        gl_FragColor.rgb += lights * night * 1.5;
        float atmo = pow(1.0 - abs(dot(normalize(vWN), normalize(cameraPosition))), 2.0);
        gl_FragColor.rgb += vec3(0.16,0.34,0.62) * atmo * 0.10;`);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n varying vec3 vWN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n vWN = normalize(mat3(modelMatrix) * normal);');
  };
  earth = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 128), mat);
  earth.rotation.y = -Math.PI / 2;
  scene.add(earth);

  // ---------- clouds ----------
  clouds = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.006, 96, 96),
    new THREE.MeshLambertMaterial({ map: tx('tex/clouds.png'), transparent: true, opacity: 0.42, depthWrite: false })
  );
  scene.add(clouds);

  // ---------- atmosphere ----------
  glow = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.055, 72, 72),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
      uniforms: { c: { value: new THREE.Color(0x3c7fd8) } },
      vertexShader: `varying vec3 vN; varying vec3 vP;
        void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0);
        vP=mv.xyz; gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 c; varying vec3 vN; varying vec3 vP;
        void main(){ float i=pow(0.62 - dot(vN, normalize(-vP)), 4.4);
        gl_FragColor=vec4(c, clamp(i,0.0,1.0)*0.55); }`
    })
  );
  scene.add(glow);

  raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 2.4;

  tip = opts.tooltip; onPick = opts.onPick;
  el.addEventListener('pointermove', onMove);
  el.addEventListener('click', onClick);
  addEventListener('resize', resize);

  animate();
  return { loadSats, setFilter, setTimeScale, setPaused, focusSat, focusGround, setAutoRotate, getStats, getSatLatLon, markGround, resetView };
}

/* ---------- satellites ---------- */
async function loadSats(url, cb) {
  const raw = await (await fetch(url)).json();
  const geo = new THREE.BufferGeometry();
  const n = raw.length;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), siz = new Float32Array(n);

  raw.forEach((s, i) => {
    let rec = null;
    try { rec = satellite.twoline2satrec(s.t1, s.t2); } catch (e) {}
    sats.push({ ...s, rec, ok: !!rec });
    const c = new THREE.Color(C[s.c] || C.other);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    siz[i] = s.c === 'station' ? 11.5 : (s.c === 'isro' || s.c === 'sci') ? 8.6
           : (s.c === 'starlink' || s.c === 'oneweb') ? 4.6 : 6.4;
  });
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(siz, 1));

  const sprite = makeDot();
  satPts = new THREE.Points(geo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.NormalBlending,
    uniforms: { map: { value: sprite }, pr: { value: Math.min(devicePixelRatio, 2) } },
    vertexShader: `attribute float size; varying vec3 vC; varying float vA; uniform float pr;
      void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.0);
      vA = position.x==0.0&&position.y==0.0&&position.z==0.0 ? 0.0 : 1.0;
      gl_PointSize = size*pr*(330.0/-mv.z); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform sampler2D map; varying vec3 vC; varying float vA;
      void main(){ vec4 t=texture2D(map,gl_PointCoord); if(t.a<0.04||vA<0.5) discard;
      gl_FragColor=vec4(vC*(0.55+0.45*t.a),t.a); }`,
    vertexColors: true
  }));
  satPts.frustumCulled = false;
  scene.add(satPts);

  // highlight marker
  satMesh = new THREE.Mesh(new THREE.RingGeometry(2.0, 2.5, 40),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.95 }));
  satMesh.visible = false; scene.add(satMesh);

  ready = true;
  cb && cb(sats.length);
}

function makeDot() {
  /* Real satellite silhouette: bus + two solar-panel wings + dish + antenna.
     Drawn white so the per-point vertexColor tints it by category. */
  const S = 128, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.clearRect(0, 0, S, S);
  const cx = S / 2, cy = S / 2;

  // soft halo so small sizes still read as a glowing object
  const halo = g.createRadialGradient(cx, cy, 0, cx, cy, S * 0.5);
  halo.addColorStop(0, 'rgba(255,255,255,0.55)');
  halo.addColorStop(0.34, 'rgba(255,255,255,0.14)');
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = halo; g.fillRect(0, 0, S, S);

  g.save(); g.translate(cx, cy); g.rotate(-0.32);

  // ---- solar panel wings ----
  const pw = 40, ph = 21, gap = 11;
  [-1, 1].forEach(side => {
    const x = side === -1 ? -gap - pw : gap;
    g.fillStyle = 'rgba(255,255,255,0.93)';
    g.fillRect(x, -ph / 2, pw, ph);
    // cell grid cut-outs give it the panel texture
    g.globalCompositeOperation = 'destination-out';
    g.fillStyle = 'rgba(0,0,0,1)';
    for (let i = 1; i < 5; i++) g.fillRect(x + i * (pw / 5) - 1.1, -ph / 2, 2.2, ph);
    g.fillRect(x, -1.1, pw, 2.2);
    g.globalCompositeOperation = 'source-over';
    // boom connecting wing to bus
    g.fillStyle = 'rgba(255,255,255,0.95)';
    g.fillRect(side === -1 ? -gap : gap - 3, -1.6, 3, 3.2);
  });

  // ---- central bus ----
  g.fillStyle = '#ffffff';
  g.fillRect(-11, -13, 22, 26);
  g.fillStyle = 'rgba(255,255,255,0.62)';
  g.fillRect(-11, -13, 22, 6);

  // ---- dish antenna ----
  g.beginPath(); g.ellipse(0, 19, 9.5, 5.2, 0, 0, Math.PI * 2);
  g.fillStyle = 'rgba(255,255,255,0.95)'; g.fill();
  g.fillRect(-1.4, 12, 2.8, 7);

  // ---- whip antenna ----
  g.fillRect(-1.1, -24, 2.2, 11);
  g.beginPath(); g.arc(0, -25, 2.6, 0, Math.PI * 2); g.fill();

  g.restore();

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function gmst(d) { return satellite.gstime(d); }

function propagate() {
  if (!ready) return;
  const p = satPts.geometry.attributes.position.array;
  const g = gmst(simTime);
  for (let i = 0; i < sats.length; i++) {
    const s = sats[i];
    if (!s.ok || (visible && !visible.has(s.c))) { p[i*3] = p[i*3+1] = p[i*3+2] = 0; continue; }
    let e;
    try { e = satellite.propagate(s.rec, simTime); } catch (err) { s.ok = false; continue; }
    if (!e || !e.position) { p[i*3] = p[i*3+1] = p[i*3+2] = 0; continue; }
    const gd = satellite.eciToGeodetic(e.position, g);
    const lat = gd.latitude, lon = gd.longitude, alt = gd.height;
    const r = (6371 + alt) * KM;
    s.lat = lat * 180 / Math.PI; s.lon = lon * 180 / Math.PI; s.alt = alt;
    s.vel = Math.hypot(e.velocity.x, e.velocity.y, e.velocity.z);
    p[i*3]   = r * Math.cos(lat) * Math.cos(lon);
    p[i*3+1] = r * Math.sin(lat);
    p[i*3+2] = -r * Math.cos(lat) * Math.sin(lon);
  }
  satPts.geometry.attributes.position.needsUpdate = true;
}

/* ---------- interaction ---------- */
function onMove(ev) {
  const r = canvas.getBoundingClientRect();
  mouse.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
  mouse.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
}
function onClick() {
  if (hovered >= 0 && onPick) onPick(sats[hovered]);
}
function pick() {
  if (!ready || !satPts) return;
  raycaster.setFromCamera(mouse, cam);
  const hit = raycaster.intersectObject(satPts, false);
  let idx = -1;
  if (hit.length) { for (const h of hit) { const s = sats[h.index]; if (s && s.ok && (!visible || visible.has(s.c))) { idx = h.index; break; } } }
  hovered = idx;
  canvas.style.cursor = idx >= 0 ? 'pointer' : 'grab';
  if (idx >= 0) {
    const p = satPts.geometry.attributes.position.array;
    const v = new THREE.Vector3(p[idx*3], p[idx*3+1], p[idx*3+2]);
    satMesh.position.copy(v); satMesh.lookAt(cam.position); satMesh.visible = true;
    const s = sats[idx];
    if (tip) {
      const pr = v.clone().project(cam), r = canvas.getBoundingClientRect();
      tip.style.left = ((pr.x + 1) / 2 * r.width) + 'px';
      tip.style.top = ((-pr.y + 1) / 2 * r.height) + 'px';
      tip.style.opacity = 1;
      tip.innerHTML = `<b>${s.n}</b><i>${LBL[s.c][0]} · ${LBL[s.c][1]}</i>
        <span>${s.alt ? s.alt.toFixed(0) : '—'} km · ${s.vel ? s.vel.toFixed(2) : '—'} km/s</span>
        <em>click for full details</em>`;
    }
  } else { satMesh.visible = false; if (tip) tip.style.opacity = 0; }
}

/* ---------- api ---------- */
function setFilter(set) { visible = (set && set.size !== undefined) ? set : null; }
function setTimeScale(x) { timeScale = x; }
function setPaused(p) { paused = p; }
function setAutoRotate(b) { controls.autoRotate = b; }

/* Glide back to the opening camera position and clear any ground marker. */
function resetView(ms) {
  if (groundMk) groundMk.visible = false;
  const from = cam.position.clone();
  const to   = new THREE.Vector3(0, 78, 352);
  const dur  = ms || 1400, t0 = performance.now();
  flying = true;
  (function step() {
    const k = Math.min(1, (performance.now() - t0) / dur);
    const e = k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3) / 2;
    cam.position.lerpVectors(from, to, e);
    cam.lookAt(0, 0, 0); controls.target.set(0, 0, 0);
    if (k < 1) requestAnimationFrame(step);
    else { flying = false; controls.autoRotate = true; }
  })();
  return true;
}
function getStats() { return { time: simTime, scale: timeScale, cam: cam.position.length() }; }
function focusSat(i, opts) {
  /* Move the CAMERA so the satellite — and the ground directly beneath it —
     face us. The Earth mesh must never be rotated here: satellite positions are
     computed in the same Earth-fixed frame as the texture, so spinning the mesh
     would slide every satellite off its true ground point. */
  opts = opts || {};
  const arr = satPts.geometry.attributes.position.array;
  const v = new THREE.Vector3(arr[i*3], arr[i*3+1], arr[i*3+2]);
  if (v.length() < 1) return false;

  controls.autoRotate = false;

  // sit outside the satellite along its nadir line -> the map under it is centred
  const dist   = Math.max(190, v.length() + (opts.pad || 120));
  const target = v.clone().normalize().multiplyScalar(dist);

  const from = cam.position.clone();
  const dur  = opts.ms || 1600, t0 = performance.now();

  flying = true;
  (function fly(now) {
    const t = Math.min(1, ((now || performance.now()) - t0) / dur);
    const e = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;   // easeInOutCubic
    // slerp around the globe so the camera arcs over the surface
    const p = from.clone().normalize().lerp(target.clone().normalize(), e).normalize();
    cam.position.copy(p.multiplyScalar(from.length() + (dist - from.length()) * e));
    controls.update();
    if (t < 1) requestAnimationFrame(fly);
    else { flying = false; if (opts.then) opts.then(); }
  })();
  return true;
}

/* Swing the camera to look straight down at a lat/lon on the globe. */
function focusGround(lat, lon, ms, alt) {
  controls.autoRotate = false;
  const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
  const dir = new THREE.Vector3(
    Math.cos(la) * Math.cos(lo),
    Math.sin(la),
   -Math.cos(la) * Math.sin(lo)
  ).normalize();

  const dist = alt || 210;
  const target = dir.multiplyScalar(dist);
  const from = cam.position.clone();
  const t0 = performance.now(), dur = ms || 1400;
  (function fly(now) {
    const t = Math.min(1, ((now || performance.now()) - t0) / dur);
    const e = t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
    const p = from.clone().normalize().lerp(target.clone().normalize(), e).normalize();
    cam.position.copy(p.multiplyScalar(from.length() + (dist - from.length()) * e));
    controls.update();
    if (t < 1) requestAnimationFrame(fly);
  })();
}

/* Current sub-satellite ground point (deg) for the given index. */
function getSatLatLon(i) {
  const s0 = sats[i];
  if (!s0 || !s0.ok) return null;
  let e; try { e = satellite.propagate(s0.rec, simTime); } catch (err) { return null; }
  if (!e || !e.position) return null;
  const gd = satellite.eciToGeodetic(e.position, satellite.gstime(simTime));
  return { lat: satellite.degreesLat(gd.latitude), lon: satellite.degreesLong(gd.longitude),
           alt: gd.height };
}

/* Drop / move a pulsing marker on the Earth's surface at lat/lon. */
let groundMk = null;
function markGround(lat, lon) {
  const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
  const pos = new THREE.Vector3(
    Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)
  ).multiplyScalar(R * 1.004);

  if (!groundMk) {
    groundMk = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.3, 48),
      new THREE.MeshBasicMaterial({ color: 0x2ee6a8, side: THREE.DoubleSide,
        transparent: true, opacity: 0.95, depthTest: false }));
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(2.6, 3.1, 48),
      new THREE.MeshBasicMaterial({ color: 0x2ee6a8, side: THREE.DoubleSide,
        transparent: true, opacity: 0.5, depthTest: false }));
    pulse.name = 'pulse';
    groundMk.add(ring, dot, pulse);
    groundMk.renderOrder = 999;
    scene.add(groundMk);
  }
  groundMk.visible = true;
  groundMk.position.copy(pos);
  groundMk.lookAt(0, 0, 0);
  groundMk.visible = true;
  groundMk.userData.t0 = performance.now();
}

function animateMarker() {
  if (!groundMk || !groundMk.visible) return;
  const p = groundMk.getObjectByName('pulse');
  if (!p) return;
  const t = ((performance.now() - (groundMk.userData.t0 || 0)) % 2000) / 2000;
  p.scale.setScalar(1 + t * 1.5);
  p.material.opacity = 0.5 * (1 - t);
}

function ringScale(){
  if(!satMesh||!satMesh.visible) return;
  const d = cam.position.distanceTo(satMesh.position);
  satMesh.scale.setScalar(Math.max(0.28, Math.min(2.4, d/300)));
}

function resize() {
  if (!canvas) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  cam.aspect = w / h; cam.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

let last = performance.now(), acc = 0, fps = 0, fc = 0, ft = 0;
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now(), dt = (now - last) / 1000; last = now;
  fc++; ft += dt; if (ft > 0.5) { fps = fc / ft; fc = 0; ft = 0; }

  if (!paused) simTime = new Date(simTime.getTime() + dt * 1000 * timeScale);
  acc += dt;
  if (acc > 0.05) { propagate(); acc = 0; }   // 20 Hz orbital update

  if (clouds) clouds.rotation.y += dt * 0.0042;
  controls.update();
  ringScale();
  animateMarker();
  pick();
  renderer.render(scene, cam);

  const el = document.getElementById('gStat');
  if (el) el.textContent = `${fps.toFixed(0)} FPS · ${simTime.toUTCString().slice(5, 25)} UTC`;
}
