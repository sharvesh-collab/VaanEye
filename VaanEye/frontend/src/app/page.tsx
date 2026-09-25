'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  return (
    <>
      {/* ══════════ NAVBAR ══════════ */}
      <nav className="nav" id="nav">
        <a href="#home" className="logo">
          <span className="mk"><img src="img/logo.png" alt="VaanEye" className="mkimg" /></span>
          <span className="tw"><span className="n1">VaanEye</span><span className="n2" data-bi="true" data-en="The Eye in the Sky" data-ta="வான்கண் · வானத்தில் ஒரு கண்">The Eye in the Sky</span></span>
        </a>

        <div className="nlinks" id="nlinks">
          <a href="#home" className="nl on" data-s="home">Home<span className="s ta">முகப்பு</span></a>
          <a href="#about" className="nl" data-s="about">About Us<span className="s ta">எங்களைப் பற்றி</span></a>
          <a href="#features" className="nl" data-s="features">Features<span className="s ta">அம்சங்கள்</span></a>
          <a href="#sats" className="nl" data-s="sats">Satellites<span className="s ta">செயற்கைக்கோள்கள்</span></a>
          <a href="#how" className="nl" data-s="how">How It Works<span className="s ta">எப்படி</span></a>
          <a href="#impact" className="nl" data-s="impact">Impact<span className="s ta">தாக்கம்</span></a>
        </div>

        <span className="nsp"></span>

        <div className="langsel" role="group" aria-label="Language">
          <button id="lgEn" className="on" onClick={() => (window as any).setLang && (window as any).setLang(0)}>EN</button>
          <button id="lgTa" className="ta" onClick={() => (window as any).setLang && (window as any).setLang(1)}>தமிழ்</button>
        </div>
        <button className="nbtn" onClick={() => (window as any).tgTheme && (window as any).tgTheme()} id="thB">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>
        </button>
        <button className="nbtn earthb" id="earthB" onClick={() => (window as any).backToEarth && (window as any).backToEarth()} title="Back to the Earth view">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/></svg>
          <span data-bi="true" data-en="Earth view" data-ta="பூமி காட்சி">Earth view</span>
        </button>
        <a href="/dashboard" className="nbtn pri" data-bi="true" data-en="Launch App" data-ta="செயலியைத் திற">Launch App</a>
        <button className="burg" onClick={() => document.getElementById('nlinks')?.classList.toggle('open')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
      </nav>

      {/* ══════════ HERO + LIVE GLOBE ══════════ */}
      <section className="hero" id="home">
        <canvas id="glc"></canvas>
        <div id="tip"></div>

        <div className="loadr" id="loadr">
          <div>
            <div className="lring"></div>
            <p>Loading real NASA Earth imagery…</p>
            <p className="t ta">உண்மையான செயற்கைக்கோள் தரவு ஏற்றப்படுகிறது…</p>
          </div>
        </div>

        {/* cinematic: shown only before the user enters the site */}
        <div className="cine-brand">
          <h2>VaanEye</h2>
          <div className="cb-ta">வான்கண் — வானத்தில் ஒரு கண்</div>
          <div className="cb-en">The Eye in the Sky</div>
        </div>

        <div className="cine-cue">
          <div>
            <div className="ct">Live satellites orbiting now</div>
            <div className="cta2">நேரடி செயற்கைக்கோள்கள்</div>
          </div>
          <button className="cine-btn" onClick={() => (window as any).enterSite && (window as any).enterSite()}>
            Enter VaanEye
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M6 13l6 6 6-6"/></svg>
          </button>
        </div>

        <div className="hud">
          <div className="hcard">
            <h5>Constellations <span className="t">விண்மீன் கூட்டங்கள்</span></h5>
            <div className="fl" id="filters"></div>
          </div>
          <div className="hcard">
            <h5>Time warp <span className="t">நேர வேகம்</span></h5>
            <div className="spd">
              <button className="sb on" onClick={(e) => (window as any).spd && (window as any).spd(e.currentTarget, 1)}>1×</button>
              <button className="sb" onClick={(e) => (window as any).spd && (window as any).spd(e.currentTarget, 60)}>60×</button>
              <button className="sb" onClick={(e) => (window as any).spd && (window as any).spd(e.currentTarget, 600)}>600×</button>
              <button className="sb" onClick={(e) => (window as any).spd && (window as any).spd(e.currentTarget, 3000)}>3000×</button>
            </div>
            <div id="gStat" style={{ marginTop: '9px' }}>—</div>
          </div>
        </div>

        <div className="hbox">
          <div className="hcopy">
            <span className="hbadge"><i></i> Live orbital data · CelesTrak</span>
            <div className="hta" data-bi="true" data-en="The Eye in the Sky · Unified space intelligence" data-ta="வான்கண் — வானத்தில் ஒரு கண்">The Eye in the Sky · Unified space intelligence</div>
            <h1 data-bih="true" data-en="One eye on Earth.<br><span class='g'>Every satellite.</span><br>Every citizen." data-ta="பூமியின் மீது ஒரு கண்.<br><span class='g'>ஒவ்வொரு செயற்கைக்கோளும்.</span><br>ஒவ்வொரு குடிமகனும்.">
              One eye on Earth.<br/><span className="g">Every satellite.</span><br/>Every citizen.
            </h1>
            <p className="hsub" data-bih="true" data-en="VaanEye turns <b>free ISRO, NASA and ESA satellite data</b> into simple alerts for farmers, fishermen and families — in their own language, even on a 2G phone." data-ta="வான்கண் <b>இலவச ISRO, NASA, ESA செயற்கைக்கோள் தரவை</b> விவசாயிகள், மீனவர்கள், குடும்பங்களுக்கான எளிய எச்சரிக்கைகளாக மாற்றுகிறது — அவர்களின் சொந்த மொழியில், 2G ஃபோனிலும் கூட.">
              VaanEye turns <b>free ISRO, NASA and ESA satellite data</b> into simple alerts for farmers, fishermen and families — in their own language, even on a 2G phone.
            </p>
            <div className="hcta">
              <a href="/dashboard" className="btn pri">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                <span data-bi="true" data-en="Launch Platform" data-ta="தளத்தைத் திற">Launch Platform</span>
              </a>
              <a href="#sats" className="btn gho">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
                <span data-bi="true" data-en="Explore Satellites" data-ta="செயற்கைக்கோள்களைப் பார்">Explore Satellites</span>
              </a>
            </div>
          </div>

          <div className="hstats">
            <div className="hs"><div className="v g" id="stTot">—</div><div className="l">Live satellites<span className="t ta">நேரடி செயற்கைக்கோள்கள்</span></div></div>
            <div className="hs"><div className="v" id="stTrk">—</div><div className="l">Tracked in 3D<span className="t ta">3D இல் கண்காணிப்பு</span></div></div>
            <div className="hs"><div className="v">151</div><div className="l">Platform features<span className="t ta">அம்சங்கள்</span></div></div>
            <div className="hs"><div className="v gd">₹0</div><div className="l">Data cost<span className="t ta">தரவு செலவு</span></div></div>
          </div>
        </div>
      </section>

      {/* ══════════ SATELLITES ══════════ */}
      <section className="sec" id="sats">
        <div className="shead">
          <span className="skick">Satellites We Use</span>
          <div className="sta">நாங்கள் பயன்படுத்தும் செயற்கைக்கோள்கள்</div>
          <h2>Every object above you, <span className="g">live</span></h2>
          <p>Real Two-Line Element sets from CelesTrak, propagated with the SGP4 model in your browser. Click any row to fly the camera to it — or click a dot on the globe above.</p>
        </div>

        <div className="tbl">
          <div className="tbar">
            <label className="srch">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>
              <input id="q" placeholder="Search by name or NORAD ID — try CARTOSAT, SENTINEL, ISS…" onInput={() => (window as any).renderTbl && (window as any).renderTbl()} />
            </label>
            <select id="cf" onChange={() => (window as any).renderTbl && (window as any).renderTbl()} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid var(--line)', borderRadius: '11px', padding: '10px 14px', fontSize: '13px', outline: 'none' }}>
              <option value="">All categories · அனைத்தும்</option>
              <option value="isro">ISRO · இஸ்ரோ</option>
              <option value="eo">Earth Observation · பூமி கண்காணிப்பு</option>
              <option value="nav">Navigation · வழிசெலுத்தல்</option>
              <option value="geo">Geostationary · புவிநிலை</option>
              <option value="comm">Communication · தொடர்பு</option>
              <option value="station">Space Station · விண்வெளி நிலையம்</option>
              <option value="sci">Science · அறிவியல்</option>
              <option value="starlink">Starlink</option>
              <option value="oneweb">OneWeb</option>
            </select>
            <span style={{ fontSize: '12px', color: 'var(--mu2)', fontWeight: 650 }} id="tCount">—</span>
          </div>
          <div className="tw">
            <table>
              <thead><tr>
                <th>Satellite<span className="t">செயற்கைக்கோள்</span></th>
                <th>Category<span className="t">வகை</span></th>
                <th>NORAD</th>
                <th>Altitude<span className="t">உயரம்</span></th>
                <th>Speed<span className="t">வேகம்</span></th>
                <th>Inclination<span className="t">சாய்வு</span></th>
              </tr></thead>
              <tbody id="tbody"></tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════ SATELLITE DRAWER ══════════ */}
      <div className="drw" id="drw">
        <div className="dhd">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 id="dName">—</h3>
            <div className="ta" id="dCat">—</div>
          </div>
          <button className="dcl" onClick={() => (window as any).closeDrw && (window as any).closeDrw()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="dbd">
          <div className="note" id="dHist"></div>
          <div>
            <h6 style={{ fontSize: '10.5px', letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--mu2)', fontWeight: 700, marginBottom: '8px' }}>
              Live telemetry · நேரடி தரவு</h6>
            <div className="kv" id="dKv"></div>
          </div>
          <div>
            <h6 style={{ fontSize: '10.5px', letterSpacing: '.13em', textTransform: 'uppercase', color: 'var(--mu2)', fontWeight: 700, marginBottom: '8px' }}>
              Two-Line Element set</h6>
            <div className="tle" id="dTle">—</div>
          </div>
          <div className="frzbar" id="frzBar">
              <span className="fdot"></span>
              <span data-bi="true" data-en="Everything is paused while this satellite is selected" data-ta="இந்த செயற்கைக்கோள் தேர்ந்தெடுக்கப்பட்டுள்ளது — அனைத்தும் நிறுத்தப்பட்டுள்ளது">Everything is paused while this satellite is selected</span>
            </div>
            <div className="dact">
            <button className="btn pri" onClick={() => (window as any).viewOnEarth && (window as any).viewOnEarth()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18"/></svg>
              <span data-bi="true" data-en="View on Earth" data-ta="பூமியில் பார்க்க">View on Earth</span></button>
            <button className="btn gho" onClick={() => (window as any).flyTo && (window as any).flyTo()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
              <span data-bi="true" data-en="Focus camera" data-ta="கேமரா குவி">Focus camera</span></button>
          </div>
          <div className="dgeo" id="dGeo"></div>
        </div>
      </div>

      <Script src="/vendor/satellite.min.js" strategy="beforeInteractive" />
      <Script src="/app.js" strategy="lazyOnload" />
    </>
  );
}
