/* ==========================================================================
   BYTE — a living website mascot engine (Phase 1 foundation)
   Modular, plugin-based. Drop new behaviors into BEHAVIORS[] — no other change.
   Self-contained: injects its own CSS + SVG puppet. No dependencies.
   Respects prefers-reduced-motion, reduces on mobile, pauses on typing/modals.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__byteLoaded) return; window.__byteLoaded = true;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = matchMedia('(hover: none)').matches || innerWidth < 640;

  /* ---------- 1. STYLES ---------- */
  var css =
  '#byte{position:fixed;left:0;top:0;width:64px;height:75px;z-index:350;pointer-events:auto;cursor:pointer;' +
    'will-change:transform;transition:transform .6s cubic-bezier(.34,1.4,.5,1),opacity .4s ease;filter:drop-shadow(0 8px 14px rgba(20,15,10,.22));}' +
  '#byte.walk{transition:transform 1.1s cubic-bezier(.45,0,.55,1);}' +
  '#byte.hop{transition:transform .5s cubic-bezier(.3,1.6,.5,1);}' +
  '#byte svg{width:100%;height:100%;overflow:visible;display:block;}' +
  '#byte .b-eyes{transform-box:fill-box;transform-origin:center;transition:transform .12s ease;}' +
  '#byte .b-track{transition:transform .18s ease-out;}' +
  '#byte .b-arm{transform-box:fill-box;transform-origin:top center;transition:transform .25s ease;}' +
  '#byte .b-ant{transform-box:fill-box;transform-origin:bottom center;}' +
  '#byte.blink .b-eyes{transform:scaleY(.12);}' +
  '#byte .b-fx{position:absolute;left:50%;top:-6px;transform:translateX(-50%);font-size:15px;opacity:0;' +
    'transition:opacity .3s ease,transform .8s ease;pointer-events:none;white-space:nowrap;}' +
  '#byte .b-fx.go{opacity:1;transform:translate(-50%,-16px);}' +
  '@keyframes byteBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}' +
  '#byte .b-body{animation:byteBreathe 3.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center bottom;}' +
  '@keyframes byteAnt{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}' +
  '#byte .b-ant{animation:byteAnt 2.6s ease-in-out infinite;}' +
  '#byte.wave .b-arm-r{transform:rotate(-125deg);}' +
  '#byte.sleep .b-eyes{transform:scaleY(.1);}' +
  '#byte.sleep .b-body{animation:byteBreathe 4.6s ease-in-out infinite;}' +
  '#byte.reduced .b-body,#byte.reduced .b-ant{animation:none;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 2. THE PUPPET (rigged SVG) ---------- */
  var el = document.createElement('div'); el.id = 'byte'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
  '<span class="b-fx" id="byteFx"></span>' +
  '<svg viewBox="0 0 120 140">' +
    '<defs><linearGradient id="bG" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#FF8A3D"/><stop offset="1" stop-color="#EB5E10"/></linearGradient></defs>' +
    '<g class="b-body">' +
      '<g class="b-ant"><rect x="57.5" y="6" width="5" height="18" rx="2.5" fill="#c9531f"/><circle cx="60" cy="6" r="7.5" fill="#FF7A2E"/></g>' +
      '<circle cx="19" cy="74" r="14" fill="#df5f1e"/><circle cx="101" cy="74" r="14" fill="#df5f1e"/>' +
      '<circle cx="19" cy="74" r="6.5" fill="#b34a15"/><circle cx="101" cy="74" r="6.5" fill="#b34a15"/>' +
      '<rect x="17" y="28" width="86" height="84" rx="27" fill="url(#bG)"/>' +
      '<rect x="30" y="42" width="60" height="58" rx="21" fill="#f6e7d0"/>' +
      '<g class="b-track">' +
        '<g class="b-eyes">' +
          '<ellipse cx="49" cy="68" rx="9" ry="11.5" fill="#1c1517"/>' +
          '<ellipse cx="71" cy="68" rx="9" ry="11.5" fill="#1c1517"/>' +
          '<circle cx="46" cy="63.5" r="3.1" fill="#fff"/><circle cx="68" cy="63.5" r="3.1" fill="#fff"/>' +
        '</g>' +
      '</g>' +
      '<path class="b-mouth" d="M51 87 Q60 94 69 87" stroke="#1c1517" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="37" cy="84" r="5" fill="#ff9a6a" opacity=".55"/><circle cx="83" cy="84" r="5" fill="#ff9a6a" opacity=".55"/>' +
      '<rect class="b-arm b-arm-l" x="12" y="98" width="9" height="24" rx="4.5" fill="#EB5E10"/>' +
      '<rect class="b-arm b-arm-r" x="99" y="98" width="9" height="24" rx="4.5" fill="#EB5E10"/>' +
    '</g>' +
  '</svg>';
  var mouth = el.querySelector('.b-mouth'), track = el.querySelector('.b-track'), fx = el.querySelector('#byteFx');
  var MOUTHS = { happy:'M51 87 Q60 94 69 87', smile:'M52 87 Q60 91 68 87', o:'M60 86 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0', flat:'M52 88 L68 88', grin:'M50 85 Q60 97 70 85' };
  function setMouth(k){ mouth.setAttribute('d', MOUTHS[k] || MOUTHS.smile); }

  /* ---------- 3. STATE + POSITIONING ---------- */
  var W = innerWidth, H = innerHeight;
  var pos = { x: W - 96, y: H - 96 };           // current home
  var busy = false, sleeping = false, paused = false;
  function place(x, y){ pos.x = Math.max(6, Math.min(W - 70, x)); pos.y = Math.max(70, Math.min(H - 80, y)); el.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)'; }
  function popFx(txt){ fx.textContent = txt; fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go'); setTimeout(function(){ fx.classList.remove('go'); }, 1200); }

  /* ---------- 4. EYE TRACKING (rAF, subtle) ---------- */
  var mx = pos.x, my = pos.y, ex = 0, ey = 0;
  addEventListener('mousemove', function (e){ mx = e.clientX; my = e.clientY; markActive(); }, { passive:true });
  (function eyeLoop(){
    var cx = pos.x + 32, cy = pos.y + 40;
    var dx = Math.max(-1, Math.min(1, (mx - cx) / 260)), dy = Math.max(-1, Math.min(1, (my - cy) / 260));
    ex += (dx * 3.2 - ex) * 0.15; ey += (dy * 3.4 - ey) * 0.15;
    if (!sleeping) track.style.transform = 'translate(' + ex.toFixed(2) + 'px,' + ey.toFixed(2) + 'px)';
    requestAnimationFrame(eyeLoop);
  })();

  /* ---------- 5. BLINK ---------- */
  (function blink(){
    if (!sleeping && !paused) { el.classList.add('blink'); setTimeout(function(){ el.classList.remove('blink'); }, 130); }
    setTimeout(blink, 2600 + Math.random() * 3800);
  })();

  /* ---------- 6. GUARDS (typing / modal / visibility) ---------- */
  function guardsBlock(){
    var a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.isContentEditable)) return true;
    if (document.body.classList.contains('menu-open')) return true;
    if (document.hidden) return true;
    return false;
  }

  /* ---------- 7. BEHAVIOR REGISTRY (plugins) ----------
     Each: { name, weight, mobileOk, run(done) }  — drop in new ones freely. */
  var BEHAVIORS = [
    { name:'lookAround', weight:3, mobileOk:true, run:function(done){
        setMouth('smile'); var n=0;
        (function look(){ if(n++>2) return done(); mx = pos.x + (Math.random()<.5?-160:180); my = pos.y + (Math.random()*120-60); setTimeout(look, 700); })();
        setTimeout(done, 2400);
      }},
    { name:'hop', weight:2, mobileOk:false, run:function(done){
        setMouth('grin'); var tx = Math.max(30, Math.min(W-80, pos.x + (Math.random()<.5?-1:1)*(90+Math.random()*120)));
        el.classList.add('hop'); place(tx, pos.y - 34);
        setTimeout(function(){ place(tx, H - 96); setTimeout(function(){ el.classList.remove('hop'); setMouth('smile'); done(); }, 520); }, 300);
      }},
    { name:'wave', weight:2, mobileOk:true, run:function(done){
        setMouth('happy'); el.classList.add('wave'); popFx('👋');
        setTimeout(function(){ el.classList.remove('wave'); setTimeout(function(){ el.classList.add('wave'); setTimeout(function(){ el.classList.remove('wave'); setMouth('smile'); done(); }, 300); }, 180); }, 300);
      }},
    { name:'stroll', weight:3, mobileOk:false, run:function(done){
        setMouth('smile'); var tx = 30 + Math.random() * (W - 110);
        el.classList.add('walk'); el.style.transform = 'translate(' + tx + 'px,' + pos.y + 'px) scaleX(' + (tx < pos.x ? -1 : 1) + ')';
        pos.x = tx; setTimeout(function(){ el.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)'; el.classList.remove('walk'); done(); }, 1150);
      }},
    { name:'spin', weight:1, mobileOk:true, run:function(done){
        popFx('✨'); el.style.transition='transform .7s cubic-bezier(.5,0,.5,1)'; el.style.transform='translate('+pos.x+'px,'+pos.y+'px) rotate(360deg)';
        setTimeout(function(){ el.style.transition=''; el.style.transform='translate('+pos.x+'px,'+pos.y+'px)'; done(); }, 720);
      }},
    { name:'idleCoffee', weight:1, mobileOk:true, run:function(done){ setMouth('flat'); popFx('☕'); setTimeout(function(){ setMouth('smile'); done(); }, 1600); }}
  ];
  function pick(){
    var pool = BEHAVIORS.filter(function(b){ return mobile ? b.mobileOk : true; });
    var tot = pool.reduce(function(s,b){ return s + b.weight; }, 0), r = Math.random() * tot;
    for (var i=0;i<pool.length;i++){ r -= pool[i].weight; if (r <= 0) return pool[i]; } return pool[0];
  }

  /* ---------- 8. SLEEP on inactivity ---------- */
  var lastActive = Date.now();
  function markActive(){ lastActive = Date.now(); if (sleeping) wake(); }
  addEventListener('scroll', markActive, { passive:true });
  addEventListener('keydown', markActive);
  function sleep(){ sleeping = true; el.classList.add('sleep'); setMouth('flat'); (function z(){ if(!sleeping) return; popFx('💤'); setTimeout(z, 2600); })(); }
  function wake(){ sleeping = false; el.classList.remove('sleep'); setMouth('happy'); popFx('!'); setTimeout(function(){ setMouth('smile'); }, 700); }

  /* ---------- 9. SCHEDULER (the "always different" loop) ---------- */
  function tick(){
    var wait = 5000 + Math.random() * 7000;
    setTimeout(function(){
      if (reduce) { return tick(); }                       // reduced-motion: BYTE just sits + blinks
      if (Date.now() - lastActive > 22000 && !sleeping && !mobile) { sleep(); return tick(); }
      if (busy || paused || sleeping || guardsBlock()) { return tick(); }
      busy = true; var b = pick();
      try { b.run(function(){ busy = false; }); } catch(e){ busy = false; }
      setTimeout(function(){ busy = false; }, 4000);        // safety release
      tick();
    }, wait);
  }

  /* ---------- 10. CLICK = happy ---------- */
  el.addEventListener('click', function(){
    if (sleeping) { wake(); return; }
    busy = true; setMouth('grin'); popFx(Math.random()<.5?'❤️':'😄'); el.classList.add('wave');
    setTimeout(function(){ el.classList.remove('wave'); setMouth('smile'); busy = false; }, 700);
  });

  /* ---------- 11. RESIZE ---------- */
  addEventListener('resize', function(){ W = innerWidth; H = innerHeight; place(Math.min(pos.x, W-70), H-96); });

  /* ---------- 12. BOOT (lazy) ---------- */
  function boot(){
    document.body.appendChild(el);
    place(W - 96, H - 96); setMouth('smile');
    if (reduce || mobile) el.classList.add('reduced');
    if (mobile) { /* mobile: BYTE mostly sits + blinks + eye-follow + tap reactions */ }
    setTimeout(function(){ popFx('👋'); }, 900);
    tick();
  }
  if (document.readyState === 'complete') setTimeout(boot, 600);
  else addEventListener('load', function(){ setTimeout(boot, 600); });

  /* ---------- public hook for future world-interaction plugins ---------- */
  window.BYTE = { el:el, behaviors:BEHAVIORS, place:place, popFx:popFx, setMouth:setMouth,
    add:function(b){ BEHAVIORS.push(b); } };
})();
