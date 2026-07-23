/* ==========================================================================
   BYTE — living website mascot engine (Phase 2: full body + world play)
   Rigged SVG puppet: head, antenna, headphones, eyes, arms, LEGS (walk cycle).
   Plugin behaviors via BYTE.add({name,weight,run}). Zero dependencies.
   Honors reduced-motion, pauses on typing/menus/hidden tab, lighter on mobile.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__byteLoaded) return; window.__byteLoaded = true;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = matchMedia('(hover: none)').matches || innerWidth < 640;

  var CW = 76, CH = 96;                 // character box
  var W = innerWidth, H = innerHeight;
  function floorY(){ return H - CH - 6; }

  /* ---------- STYLES ---------- */
  var css =
  '#byte{position:fixed;left:0;top:0;width:'+CW+'px;height:'+CH+'px;z-index:350;cursor:pointer;'+
    'will-change:transform;filter:drop-shadow(0 7px 12px rgba(20,15,10,.25));}'+
  '#byte .b-flip{width:100%;height:100%;transition:transform .18s ease;}'+
  '#byte svg{width:100%;height:100%;overflow:visible;display:block;}'+
  '#byte .b-eyes{transform-box:fill-box;transform-origin:center;transition:transform .12s ease;}'+
  '#byte .b-track{transition:transform .18s ease-out;}'+
  '#byte.blink .b-eyes{transform:scaleY(.1);}'+
  '#byte .b-arm{transform-box:fill-box;transform-origin:top center;transition:transform .25s ease;}'+
  '#byte .b-leg{transform-box:fill-box;transform-origin:top center;}'+
  '#byte .b-ant{transform-box:fill-box;transform-origin:bottom center;animation:byAnt 2.8s ease-in-out infinite;}'+
  '#byte .b-all{transform-box:fill-box;transform-origin:center bottom;animation:byBreathe 3.6s ease-in-out infinite;}'+
  '@keyframes byBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}'+
  '@keyframes byAnt{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}'+
  '@keyframes byLegL{0%,100%{transform:rotate(24deg)}50%{transform:rotate(-24deg)}}'+
  '@keyframes byLegR{0%,100%{transform:rotate(-24deg)}50%{transform:rotate(24deg)}}'+
  '@keyframes byArmSwing{0%,100%{transform:rotate(-16deg)}50%{transform:rotate(16deg)}}'+
  '#byte.walking .b-leg-l{animation:byLegL .38s linear infinite;}'+
  '#byte.walking .b-leg-r{animation:byLegR .38s linear infinite;}'+
  '#byte.walking .b-arm-l{animation:byArmSwing .38s linear infinite;}'+
  '#byte.walking .b-arm-r{animation:byArmSwing .38s linear infinite reverse;}'+
  '#byte.running .b-leg-l{animation:byLegL .2s linear infinite;}'+
  '#byte.running .b-leg-r{animation:byLegR .2s linear infinite;}'+
  '#byte.armsUp .b-arm-l{transform:rotate(150deg);}#byte.armsUp .b-arm-r{transform:rotate(-150deg);}'+
  '#byte.pointR .b-arm-r{transform:rotate(-95deg);}'+
  '#byte.wave .b-arm-r{transform:rotate(-140deg);}'+
  '#byte.fallen .b-flip{transform:rotate(84deg) translateY(14px);}'+
  '#byte.fallen.faceL .b-flip{transform:scaleX(-1) rotate(84deg) translateY(14px);}'+
  '#byte.faceL .b-flip{transform:scaleX(-1);}'+
  '#byte.sleep .b-eyes{transform:scaleY(.08);}'+
  '#byte.shake{animation:byShake .4s ease;}'+
  '@keyframes byShake{0%,100%{margin-left:0}25%{margin-left:-5px}75%{margin-left:5px}}'+
  '#byte .b-fx{position:absolute;left:50%;top:-10px;transform:translateX(-50%);font-size:16px;opacity:0;'+
    'transition:opacity .25s ease,transform .8s ease;pointer-events:none;white-space:nowrap;}'+
  '#byte .b-fx.go{opacity:1;transform:translate(-50%,-18px);}'+
  '#byte .b-say{position:absolute;bottom:'+(CH+6)+'px;left:50%;transform:translateX(-50%) scale(.7);opacity:0;'+
    'background:#fff;border:1.5px solid rgba(20,15,10,.15);color:#1c1517;border-radius:12px;padding:6px 11px;'+
    'font:700 12px Archivo,sans-serif;white-space:nowrap;pointer-events:none;transition:all .25s cubic-bezier(.34,1.5,.5,1);'+
    'box-shadow:0 6px 16px rgba(20,15,10,.14);}'+
  '#byte .b-say:after{content:"";position:absolute;top:100%;left:50%;margin-left:-5px;border:5px solid transparent;border-top-color:#fff;}'+
  '#byte .b-say.show{opacity:1;transform:translateX(-50%) scale(1);}'+
  '#byte .b-prop{position:absolute;font-size:17px;opacity:0;transition:opacity .2s;pointer-events:none;left:8px;top:'+(CH-44)+'px;}'+
  '#byte .b-prop.show{opacity:1;}'+
  '#byteBall{position:fixed;width:26px;height:26px;border-radius:50%;z-index:349;pointer-events:none;display:none;'+
    'background:radial-gradient(circle at 34% 30%,#f3893d,#d9530e 70%);box-shadow:inset -2px -3px 5px rgba(0,0,0,.25),0 4px 8px rgba(20,15,10,.25);}'+
  '#byteBall:after{content:"";position:absolute;inset:0;border-radius:50%;border-left:1.6px solid rgba(60,25,5,.5);border-top:1.6px solid rgba(60,25,5,.5);transform:rotate(24deg);}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- PUPPET ---------- */
  var el = document.createElement('div'); el.id = 'byte'; el.setAttribute('aria-hidden','true');
  el.innerHTML =
  '<span class="b-say" id="bySay"></span>'+
  '<span class="b-fx" id="byFx"></span>'+
  '<span class="b-prop" id="byProp"></span>'+
  '<div class="b-flip"><svg viewBox="0 0 120 150">'+
    '<defs><linearGradient id="byG" x1="0" y1="0" x2="0" y2="1">'+
      '<stop offset="0" stop-color="#FF9042"/><stop offset="1" stop-color="#E85C0F"/></linearGradient></defs>'+
    '<g class="b-all">'+
      /* legs (behind body) */
      '<g class="b-leg b-leg-l"><rect x="42" y="116" width="11" height="22" rx="5.5" fill="#D95410"/><ellipse cx="47.5" cy="139" rx="9" ry="5.5" fill="#c34a0d"/></g>'+
      '<g class="b-leg b-leg-r"><rect x="67" y="116" width="11" height="22" rx="5.5" fill="#D95410"/><ellipse cx="72.5" cy="139" rx="9" ry="5.5" fill="#c34a0d"/></g>'+
      /* body */
      '<rect x="32" y="88" width="56" height="36" rx="15" fill="url(#byG)"/>'+
      '<text x="60" y="111" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#b6440a">&lt;/&gt;</text>'+
      /* arms */
      '<g class="b-arm b-arm-l"><rect x="22" y="92" width="10" height="26" rx="5" fill="#E85C0F"/><circle cx="27" cy="119" r="6" fill="#c9531f"/></g>'+
      '<g class="b-arm b-arm-r"><rect x="88" y="92" width="10" height="26" rx="5" fill="#E85C0F"/><circle cx="93" cy="119" r="6" fill="#c9531f"/></g>'+
      /* head */
      '<g class="b-head">'+
        '<g class="b-ant"><rect x="57.5" y="0" width="5" height="14" rx="2.5" fill="#c9531f"/><circle cx="60" cy="0" r="7" fill="#FF7A2E"/></g>'+
        '<circle cx="16" cy="52" r="12" fill="#df5f1e"/><circle cx="104" cy="52" r="12" fill="#df5f1e"/>'+
        '<circle cx="16" cy="52" r="5.5" fill="#b34a15"/><circle cx="104" cy="52" r="5.5" fill="#b34a15"/>'+
        '<rect x="16" y="14" width="88" height="76" rx="26" fill="url(#byG)"/>'+
        '<rect x="28" y="26" width="64" height="54" rx="19" fill="#f6e7d0"/>'+
        '<g class="b-track"><g class="b-eyes">'+
          '<ellipse cx="47" cy="50" rx="9.5" ry="12" fill="#1c1517"/>'+
          '<ellipse cx="73" cy="50" rx="9.5" ry="12" fill="#1c1517"/>'+
          '<circle cx="44" cy="45" r="3.2" fill="#fff"/><circle cx="70" cy="45" r="3.2" fill="#fff"/>'+
          '<circle cx="49.5" cy="53" r="1.7" fill="#fff" opacity=".8"/><circle cx="75.5" cy="53" r="1.7" fill="#fff" opacity=".8"/>'+
        '</g></g>'+
        '<circle cx="35" cy="66" r="5" fill="#ff9a6a" opacity=".6"/><circle cx="85" cy="66" r="5" fill="#ff9a6a" opacity=".6"/>'+
        '<path class="b-mouth" d="M52 70 Q60 76 68 70" stroke="#1c1517" stroke-width="3" fill="none" stroke-linecap="round"/>'+
      '</g>'+
    '</g>'+
  '</svg></div>';
  var flip = el.querySelector('.b-flip'), mouth = el.querySelector('.b-mouth'),
      track = el.querySelector('.b-track'), fx = el.querySelector('#byFx'),
      say = el.querySelector('#bySay'), prop = el.querySelector('#byProp');
  var ball = document.createElement('div'); ball.id = 'byteBall';

  var MOUTHS = { smile:'M52 70 Q60 76 68 70', grin:'M50 68 Q60 80 70 68', o:'M60 69 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0',
    flat:'M52 71 L68 71', sad:'M52 74 Q60 67 68 74', nom:'M54 70 Q60 75 66 70 Q60 79 54 70' };
  function setMouth(k){ mouth.setAttribute('d', MOUTHS[k] || MOUTHS.smile); }

  /* ---------- CORE STATE ---------- */
  var pos = { x: W - CW - 22, y: 0 };
  var busy = false, sleeping = false, faceL = false;
  function apply(){ el.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)'; }
  function setY(y){ pos.y = y; apply(); }
  function setX(x){ pos.x = Math.max(4, Math.min(W - CW - 4, x)); apply(); }
  function face(left){ faceL = left; el.classList.toggle('faceL', left); }
  function popFx(t){ fx.textContent = t; fx.classList.remove('go'); void fx.offsetWidth; fx.classList.add('go'); setTimeout(function(){ fx.classList.remove('go'); }, 1150); }
  function speak(t, ms){ say.textContent = t; say.classList.add('show'); setTimeout(function(){ say.classList.remove('show'); }, ms || 1600); }

  /* walkTo: real walk with leg cycle, auto flip, speed px/s */
  function walkTo(tx, speed, cb){
    tx = Math.max(4, Math.min(W - CW - 4, tx));
    var dist = Math.abs(tx - pos.x); if (dist < 6){ if (cb) cb(); return; }
    face(tx < pos.x);
    var dur = dist / (speed || 90);
    el.classList.add(speed > 160 ? 'running' : 'walking');
    el.style.transition = 'transform ' + dur + 's linear';
    setX(tx);
    setTimeout(function(){
      el.style.transition = ''; el.classList.remove('walking'); el.classList.remove('running');
      if (cb) cb();
    }, dur * 1000 + 30);
  }

  /* ---------- EYE TRACKING ---------- */
  var mx = 0, my = 0, pmx = 0, pmy = 0, ex = 0, ey = 0, lastMove = 0;
  addEventListener('mousemove', function(e){ pmx = mx; pmy = my; mx = e.clientX; my = e.clientY; lastMove = Date.now(); markActive(); cursorCheck(); }, { passive:true });
  (function eyeLoop(){
    var cx = pos.x + CW/2, cy = pos.y + 36;
    var dx = Math.max(-1, Math.min(1, (mx - cx)/240)), dy = Math.max(-1, Math.min(1, (my - cy)/240));
    ex += (dx*3.4 - ex)*0.16; ey += (dy*3.6 - ey)*0.16;
    if (!sleeping) track.style.transform = 'translate(' + ex.toFixed(2) + 'px,' + ey.toFixed(2) + 'px)';
    requestAnimationFrame(eyeLoop);
  })();

  /* cursor pounce-scare: fast cursor lands on him → jump + squeak */
  var scaredAt = 0;
  function cursorCheck(){
    if (busy || sleeping || reduce) return;
    var speed = Math.hypot(mx - pmx, my - pmy);
    var over = mx > pos.x - 8 && mx < pos.x + CW + 8 && my > pos.y - 8 && my < pos.y + CH + 8;
    if (over && speed > 55 && Date.now() - scaredAt > 6000){
      scaredAt = Date.now(); busy = true;
      setMouth('o'); popFx('😱'); el.classList.add('shake');
      var jump = pos.x + (mx < pos.x + CW/2 ? 90 : -90);
      setTimeout(function(){ el.classList.remove('shake'); walkTo(jump, 240, function(){ setMouth('smile'); speak('phew!'); busy = false; }); }, 380);
    }
  }

  /* ---------- BLINK ---------- */
  (function blink(){
    if (!sleeping) { el.classList.add('blink'); setTimeout(function(){ el.classList.remove('blink'); }, 130); }
    setTimeout(blink, 2500 + Math.random()*3800);
  })();

  /* ---------- GUARDS ---------- */
  function guardsBlock(){
    var a = document.activeElement;
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT' || a.isContentEditable)) return true;
    if (document.body.classList.contains('menu-open')) return true;
    if (document.hidden) return true;
    return false;
  }

  /* ---------- BALL PHYSICS (only while active) ---------- */
  var B = { x:0, y:0, vx:0, vy:0, on:false, raf:false };
  function ballLoop(){
    if (!B.on){ B.raf = false; return; }
    B.raf = true;
    B.vy += 0.55; B.x += B.vx; B.y += B.vy;
    var fy = H - 30;
    if (B.y > fy){ B.y = fy; B.vy = -B.vy * 0.62; B.vx *= 0.98; }
    if (B.x < 4){ B.x = 4; B.vx = -B.vx * 0.7; }
    if (B.x > W - 30){ B.x = W - 30; B.vx = -B.vx * 0.7; }
    ball.style.transform = 'translate(' + B.x + 'px,' + B.y + 'px)';
    requestAnimationFrame(ballLoop);
  }
  function ballShow(x, y){ B.x = x; B.y = y; B.vx = 0; B.vy = 0; ball.style.display = 'block'; ball.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
  function ballHide(){ B.on = false; ball.style.display = 'none'; }

  /* ---------- BEHAVIORS (plugins) ---------- */
  var BEHAVIORS = [

    /* wander somewhere new */
    { name:'stroll', weight:3, mobileOk:false, run:function(done){
        setMouth('smile'); walkTo(30 + Math.random()*(W - CW - 60), 85 + Math.random()*40, done);
      }},

    /* walks into the wall, bonks, rubs head */
    { name:'wallBump', weight:1.6, mobileOk:false, run:function(done){
        var left = pos.x > W/2; setMouth('grin'); speak('wheee!');
        walkTo(left ? 4 : W - CW - 4, 190, function(){
          el.classList.add('shake'); setMouth('o'); popFx('💥'); speak('ouch!');
          setTimeout(function(){
            el.classList.remove('shake'); el.classList.add('armsUp'); setMouth('sad');
            setTimeout(function(){
              el.classList.remove('armsUp'); setMouth('smile');
              walkTo(pos.x + (left ? 70 : -70), 80, done);
            }, 900);
          }, 450);
        });
      }},

    /* trips mid-walk, looks around hoping nobody saw, blushes */
    { name:'trip', weight:1.6, mobileOk:false, run:function(done){
        setMouth('smile');
        walkTo(pos.x + (Math.random()<.5?-1:1)*(120+Math.random()*80), 120, null);
        setTimeout(function(){
          el.style.transition = ''; el.classList.remove('walking');
          el.classList.add('fallen'); setMouth('o'); popFx('💫'); speak('oof!');
          setTimeout(function(){
            mx = pos.x - 150; setTimeout(function(){ mx = pos.x + 220; }, 420);  // eyes dart around
            setTimeout(function(){
              el.classList.remove('fallen'); setMouth('flat'); speak('nobody saw that', 1500); popFx('😳');
              setTimeout(function(){ setMouth('smile'); done(); }, 1100);
            }, 900);
          }, 800);
        }, 650);
      }},

    /* sneaky snack: looks both ways, munches, hides evidence */
    { name:'snack', weight:2, mobileOk:true, run:function(done){
        setMouth('flat');
        mx = pos.x - 200; setTimeout(function(){ mx = pos.x + 240; }, 500);  // shifty eyes
        setTimeout(function(){
          prop.textContent = '🍫'; prop.classList.add('show'); speak('shh...', 1100);
          var n = 0;
          (function chew(){
            setMouth(n % 2 ? 'nom' : 'o'); if (++n < 6) return setTimeout(chew, 240);
            prop.classList.remove('show'); setMouth('grin'); popFx('😋'); speak('what? nothing.', 1500);
            setTimeout(function(){ setMouth('smile'); done(); }, 1200);
          })();
        }, 1000);
      }},

    /* guide: points at the WhatsApp button */
    { name:'pointWhatsApp', weight:1.6, mobileOk:true, run:function(done){
        var wa = document.querySelector('.wa-float, #waFloat, a[aria-label="WhatsApp"]');
        if (!wa){ return done(); }
        var r = wa.getBoundingClientRect();
        walkTo(r.left - CW - 14, 110, function(){
          face(false); el.classList.add('pointR'); setMouth('grin');
          speak('message us here! 💬', 2200); popFx('👉');
          setTimeout(function(){ el.classList.remove('pointR'); setMouth('smile');
            walkTo(pos.x - 90, 80, done); }, 2300);
        });
      }},

    /* basketball saga: dribble → mighty throw → ball bonks head → runs away */
    { name:'ballSaga', weight:2, mobileOk:false, run:function(done){
        setMouth('grin'); speak('ball time! 🏀', 1300);
        ballShow(pos.x + (faceL ? -20 : CW + 2), H - 34);
        var d = 0;
        (function dribble(){                                    // dribble bounces
          B.on = true; B.vy = -7.5; B.vx = 0; if (!B.raf) ballLoop();
          setTimeout(function(){
            if (++d < 3) return dribble();
            B.on = false; setMouth('flat'); speak('okay... focus.', 1200);   // determined
            setTimeout(function(){
              el.classList.add('armsUp'); setMouth('o'); speak('HNNGG!', 900);
              B.on = true; B.vy = -16 - Math.random()*3; B.vx = (Math.random()*2 - 1); if (!B.raf) ballLoop();  // straight UP — too much power
              setTimeout(function(){ el.classList.remove('armsUp'); }, 500);
              setTimeout(function(){                             // ball returns → BONK
                B.vx = 0; B.x = pos.x + CW/2 - 13;               // gravity finds his head
                var check = setInterval(function(){
                  if (B.y > pos.y - 10){
                    clearInterval(check);
                    B.vy = -6; B.vx = faceL ? 6 : -6;
                    el.classList.add('shake'); setMouth('o'); popFx('💥'); speak('BONK!', 900);
                    setTimeout(function(){
                      el.classList.remove('shake'); setMouth('sad'); popFx('😵');
                      walkTo(pos.x + (faceL ? 260 : -260), 260, function(){   // RUN AWAY
                        speak('the ball is evil!!', 1800); setMouth('flat');
                        setTimeout(function(){ ballHide(); setMouth('smile'); done(); }, 1900);
                      });
                    }, 500);
                  }
                }, 60);
              }, 700);
            }, 1300);
          }, 620);
        })();
      }},

    /* peeks off the edge of the screen and pops back */
    { name:'peek', weight:1.4, mobileOk:false, run:function(done){
        var left = pos.x < W/2;
        setMouth('grin'); speak('brb', 900);
        walkTo(left ? -CW*0.6 : W - CW*0.4, 200, function(){
          setTimeout(function(){
            popFx('👀');
            walkTo(left ? 26 : W - CW - 26, 130, function(){ speak('did you miss me?', 1600); done(); });
          }, 1400);
        });
      }},

    /* little dance */
    { name:'dance', weight:1.6, mobileOk:true, run:function(done){
        setMouth('grin'); popFx('🎵'); var n = 0;
        (function bop(){
          el.classList.toggle('armsUp'); face(!faceL);
          if (++n < 6) return setTimeout(bop, 300);
          el.classList.remove('armsUp'); face(false); setMouth('smile'); done();
        })();
      }},

    /* stretch + yawn */
    { name:'stretch', weight:1.4, mobileOk:true, run:function(done){
        el.classList.add('armsUp'); setMouth('o'); popFx('🥱'); speak('yaaawn', 1300);
        setTimeout(function(){ el.classList.remove('armsUp'); setMouth('smile'); done(); }, 1500);
      }},

    { name:'wave', weight:1.6, mobileOk:true, run:function(done){
        setMouth('grin'); el.classList.add('wave'); popFx('👋'); speak('hi!', 1100);
        setTimeout(function(){ el.classList.remove('wave');
          setTimeout(function(){ el.classList.add('wave');
            setTimeout(function(){ el.classList.remove('wave'); setMouth('smile'); done(); }, 300); }, 170); }, 320);
      }},

    { name:'lookAround', weight:2.4, mobileOk:true, run:function(done){
        setMouth('smile'); var n = 0;
        (function look(){ if (n++ > 2) return done();
          mx = pos.x + (Math.random()<.5?-220:240); my = pos.y - 60 + Math.random()*140; setTimeout(look, 650); })();
      }}
  ];
  /* shuffle-bag: every behavior plays once before any repeats — guaranteed variety */
  var bag = [];
  function pick(){
    var pool = BEHAVIORS.filter(function(b){ return mobile ? b.mobileOk : true; });
    if (!bag.length){
      bag = pool.slice();
      for (var i = bag.length - 1; i > 0; i--){ var j = Math.floor(Math.random()*(i+1)); var t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
    }
    return bag.pop();
  }

  /* ---------- SLEEP ---------- */
  var lastActive = Date.now();
  function markActive(){ lastActive = Date.now(); if (sleeping) wake(); }
  addEventListener('scroll', markActive, { passive:true });
  addEventListener('keydown', markActive);
  addEventListener('touchstart', markActive, { passive:true });
  function goSleep(){ sleeping = true; el.classList.add('sleep'); setMouth('flat');
    (function z(){ if (!sleeping) return; popFx('💤'); setTimeout(z, 2500); })(); }
  function wake(){ sleeping = false; el.classList.remove('sleep'); setMouth('o'); popFx('❗');
    setTimeout(function(){ setMouth('smile'); }, 650); }

  /* ---------- SCHEDULER ---------- */
  function tick(){
    setTimeout(function(){
      if (reduce) return tick();
      if (Date.now() - lastActive > 25000 && !sleeping){ if (!busy) goSleep(); return tick(); }
      if (busy || sleeping || guardsBlock()) return tick();
      var b = pick(); busy = true;
      var released = false;
      function release(){ if (!released){ released = true; busy = false; } }
      try { b.run(release); } catch(e){ release(); }
      setTimeout(release, 12000);                             // safety
      tick();
    }, (mobile ? 7000 : 2600) + Math.random()*3500);
  }

  /* ---------- CLICK / TAP = delight ---------- */
  var clickN = 0;
  el.addEventListener('click', function(){
    if (sleeping){ wake(); return; }
    var acts = [
      function(){ setMouth('grin'); popFx('❤️'); speak('hehe!'); },
      function(){ el.classList.add('shake'); popFx('😄'); setTimeout(function(){ el.classList.remove('shake'); }, 400); },
      function(){ setMouth('o'); popFx('✨'); speak('again! again!'); setTimeout(function(){ setMouth('grin'); }, 500); },
      function(){ el.classList.add('armsUp'); popFx('🙌'); setTimeout(function(){ el.classList.remove('armsUp'); }, 600); }
    ];
    acts[clickN++ % acts.length]();
    setTimeout(function(){ setMouth('smile'); }, 1100);
  });

  /* ---------- RESIZE ---------- */
  addEventListener('resize', function(){ W = innerWidth; H = innerHeight; setY(floorY()); setX(Math.min(pos.x, W - CW - 4)); });

  /* ---------- BOOT ---------- */
  function boot(){
    document.body.appendChild(el); document.body.appendChild(ball);
    setY(floorY()); setX(W - CW - 26); setMouth('smile');
    setTimeout(function(){ el.classList.add('wave'); popFx('👋'); speak('hi, I\'m BYTE!', 1900);
      setTimeout(function(){ el.classList.remove('wave'); }, 700); }, 900);
    tick();
  }
  if (document.readyState === 'complete') setTimeout(boot, 500);
  else addEventListener('load', function(){ setTimeout(boot, 500); });

  /* ---------- public API ---------- */
  window.BYTE = { el:el, behaviors:BEHAVIORS, add:function(b){ BEHAVIORS.push(b); },
    walkTo:walkTo, speak:speak, popFx:popFx, setMouth:setMouth,
    play:function(name){ var b = BEHAVIORS.find(function(x){ return x.name === name; });
      if (b && !busy){ busy = true; b.run(function(){ busy = false; }); } } };
})();
