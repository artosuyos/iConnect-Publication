/* ==========================================================================
   iCONNECT PUBLICATION — NETWORK CANVAS VISUALIZERS
   Organic Undulating Visibility Waves: Slow Cluster Illumination & Fading
   Interactive "We Connect Beyond Limits" Node Graph
   ========================================================================== */

(function () {
  'use strict';

  // Check reduced motion accessibility
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     1. HERO & PAGE BACKGROUND: ORIGINAL DYNAMIC MOVING NODES NETWORK
     -------------------------------------------------------------------------- */
  function initBgCanvas() {
    const bgCanvas = document.getElementById('bg-canvas');
    if (!bgCanvas) return;
    if (bgCanvas._initialized) return;
    bgCanvas._initialized = true;

    const ctx = bgCanvas.getContext('2d');
    let width, height;
    let dots = [];

    // Check if current page is article reading page
    const isArticlePage = document.body.classList.contains('article-page') ||
                          window.location.pathname.toLowerCase().indexOf('article') !== -1 ||
                          document.getElementById('single-article-render') !== null;

    const dotCount = prefersReducedMotion ? 25 : (isArticlePage ? 55 : (window.innerWidth < 768 ? 45 : 75));
    const maxConnectDistance = isArticlePage ? 165 : 185;
    let mouse = { x: null, y: null, radius: 200 };
    let time = 0;

    function resizeBgCanvas() {
      width = bgCanvas.width = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeBgCanvas);
    resizeBgCanvas();

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', function () {
      mouse.x = null;
      mouse.y = null;
    });

    class NetworkDot {
      constructor(id) {
        this.id = id;
        this.reset(true);
      }

      reset(init) {
        this.x = Math.random() * (width || window.innerWidth);
        this.y = Math.random() * (height || window.innerHeight);
        const speed = (isArticlePage ? 0.35 : 0.55) * (0.6 + Math.random() * 0.8);
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.pulseSpeed = 0.015 + Math.random() * 0.025;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.isDataHub = Math.random() < 0.22;
        this.isYellow = Math.random() < 0.35;
        this.baseRadius = this.isDataHub ? (isArticlePage ? 3.0 : 3.8) : (isArticlePage ? 1.6 : 2.2);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen with small margin
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;

        // Gentle mouse repulsion
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let dist = Math.hypot(dx, dy);
          if (dist < mouse.radius && dist > 0) {
            let force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.8;
            this.y -= (dy / dist) * force * 1.8;
          }
        }
      }

      draw() {
        const pulse = Math.sin(time * this.pulseSpeed + this.pulsePhase);
        const baseAlpha = this.isDataHub ? 0.85 : 0.65;
        const alpha = Math.max(0.25, baseAlpha + pulse * 0.25) * (isArticlePage ? 0.75 : 1.0);
        const r = Math.max(1, this.baseRadius + pulse * 0.8);

        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);

        if (this.isYellow) {
          ctx.fillStyle = `rgba(244, 180, 26, ${alpha})`;
          if (this.isDataHub) {
            ctx.shadowBlur = isArticlePage ? 8 : 14;
            ctx.shadowColor = 'rgba(244, 180, 26, 0.8)';
          }
        } else {
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
          if (this.isDataHub) {
            ctx.shadowBlur = isArticlePage ? 8 : 14;
            ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
          }
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function initDots() {
      dots = [];
      for (let i = 0; i < dotCount; i++) {
        dots.push(new NetworkDot(i));
      }
    }
    initDots();

    function animateNetwork() {
      ctx.clearRect(0, 0, width, height);
      time += 1;

      // 1. Update and draw nodes
      for (let i = 0; i < dots.length; i++) {
        dots[i].update();
        dots[i].draw();
      }

      const lineMultiplier = isArticlePage ? 0.60 : 0.95;

      // 2. Draw connecting mesh lines between nearby nodes
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          let dx = dots[i].x - dots[j].x;
          let dy = dots[i].y - dots[j].y;
          let dist = Math.hypot(dx, dy);

          if (dist < maxConnectDistance) {
            let opacity = (1 - (dist / maxConnectDistance)) * lineMultiplier;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);

            if (dots[i].isYellow || dots[j].isYellow) {
              ctx.strokeStyle = `rgba(244, 180, 26, ${opacity * 0.45})`;
              ctx.lineWidth = (dots[i].isDataHub || dots[j].isDataHub) ? 1.1 : 0.7;
            } else {
              ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.45})`;
              ctx.lineWidth = (dots[i].isDataHub || dots[j].isDataHub) ? 1.0 : 0.6;
            }
            ctx.stroke();

            // Animated Data Packets along active links
            if (!prefersReducedMotion && (i + j) % 3 === 0 && dist < maxConnectDistance * 0.8) {
              let packetProgress = (time * 0.008 + i * 0.15) % 1;
              let px = dots[i].x + (dots[j].x - dots[i].x) * packetProgress;
              let py = dots[i].y + (dots[j].y - dots[i].y) * packetProgress;
              let packetAlpha = Math.sin(packetProgress * Math.PI) * opacity * (isArticlePage ? 0.6 : 0.9);

              ctx.beginPath();
              ctx.arc(px, py, isArticlePage ? 1.6 : 2.2, 0, Math.PI * 2);
              const pColor = (dots[i].isYellow || dots[j].isYellow)
                ? `rgba(255, 255, 255, ${packetAlpha})`
                : `rgba(0, 240, 255, ${packetAlpha})`;
              ctx.fillStyle = pColor;
              ctx.shadowBlur = 6;
              ctx.shadowColor = pColor;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }

        // Interactive mouse connection lines
        if (mouse.x !== null && mouse.y !== null) {
          let dx = dots[i].x - mouse.x;
          let dy = dots[i].y - mouse.y;
          let dist = Math.hypot(dx, dy);
          if (dist < mouse.radius) {
            let opacity = (1 - (dist / mouse.radius)) * 0.55;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(244, 180, 26, ${opacity})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateNetwork);
    }

    animateNetwork();
  }

  /* --------------------------------------------------------------------------
     2. DYNAMIC INTERACTIVE NETWORK GRAPH ("We Connect Beyond Limits")
        Reads ALL settings from localStorage via ecosystem.js so every change
        made in Ecosystem Studio reflects live on index.html.
     -------------------------------------------------------------------------- */
  var _animID   = null;
  var _booted   = false;

  function initEcosystem() {
    // Cancel any previous animation loop
    if (_animID) { cancelAnimationFrame(_animID); _animID = null; }
    _booted = false;

    var canvas = document.getElementById('interactive-network-canvas');
    if (!canvas) return;

    var ctx2 = canvas.getContext('2d');
    var W = 0, H = 0;

    function resize() {
      var inspPanel = document.getElementById('ecosystem-inspector-panel');
      var canvasBox = document.getElementById('ecosystem-canvas-box') || canvas.parentElement;
      if (inspPanel && canvasBox && window.innerWidth >= 992) {
        var sideHeight = inspPanel.offsetHeight;
        if (sideHeight > 200) {
          canvasBox.style.height = sideHeight + 'px';
        }
      } else if (canvasBox && window.innerWidth < 992) {
        canvasBox.style.height = '420px';
      }

      var par = canvasBox || canvas.parentElement;
      var w = par ? (par.clientWidth || par.offsetWidth || canvas.offsetWidth) : canvas.offsetWidth;
      var h = par ? (par.clientHeight || par.offsetHeight || canvas.offsetHeight) : canvas.offsetHeight;
      if (!w || w < 300) w = (par ? par.getBoundingClientRect().width : 0) || 600;
      if (!h || h < 250) h = (par ? par.getBoundingClientRect().height : 0) || 450;
      w = Math.max(300, w);
      h = Math.max(250, h);
      if (canvas.width  !== Math.round(w)) canvas.width  = Math.round(w);
      if (canvas.height !== Math.round(h)) canvas.height = Math.round(h);
      W = canvas.width;
      H = canvas.height;
    }
    window.addEventListener('resize', resize);

    // --- read latest data from ecosystem.js / localStorage ---
    function readData() {
      var header = (typeof window.getEcosystemHeader      === 'function') ? window.getEcosystemHeader()      : (window.ecosystemHeaderData      || {});
      var cards  = (typeof window.getEcosystemTopCards    === 'function') ? window.getEcosystemTopCards()    : (window.ecosystemTopCardsData    || []);
      var nodes  = (typeof window.getEcosystemNodes       === 'function') ? window.getEcosystemNodes()       : (window.ecosystemNodesData       || []);
      var conns  = (typeof window.getEcosystemConnections === 'function') ? window.getEcosystemConnections() : (window.ecosystemConnectionsData || []);
      var bgFx   = (typeof window.getEcosystemBgEffect    === 'function') ? window.getEcosystemBgEffect()    : 'cyber-matrix';
      var bgOp   = (typeof window.getEcosystemBgOpacity   === 'function') ? window.getEcosystemBgOpacity()   : 0.6;
      var pathOp = (typeof window.getEcosystemPathOpacity === 'function') ? window.getEcosystemPathOpacity() : 0.20;

      if (!Array.isArray(nodes) || nodes.length === 0) nodes = window.ecosystemNodesData       || [];
      if (!Array.isArray(conns) || conns.length === 0) conns = window.ecosystemConnectionsData || [];

      return { header: header, cards: cards, nodes: nodes, conns: conns, bgFx: bgFx, bgOp: bgOp, pathOp: pathOp };
    }

    // --- render header + top cards ---
    function renderSections(header, cards) {
      var hEl = document.getElementById('ecosystem-header');
      if (hEl && header && header.title) {
        hEl.innerHTML =
          '<span class="section-tag">' + (header.badge || 'INTERACTIVE PUBLICATION ECOSYSTEM') + '</span>' +
          '<h2 class="section-title">' + header.title + '</h2>' +
          '<p class="section-desc">'  + (header.subtitle || '') + '</p>';
      }
      var cEl = document.getElementById('ecosystem-top-cards');
      if (cEl && Array.isArray(cards) && cards.length > 0) {
        cEl.innerHTML = cards.map(function(c, idx) {
          var isCyan = (idx === 1);
          var topBorder = isCyan ? '#00f0ff' : '#f4b41a';
          var badgeBg = isCyan ? 'rgba(0,240,255,0.15)' : 'rgba(244,180,26,0.15)';
          var badgeText = isCyan ? '#00f0ff' : 'var(--cheddar-yellow)';
          var badgeBorder = isCyan ? 'rgba(0,240,255,0.3)' : 'rgba(244,180,26,0.3)';
          return '<div class="about-feature-card" style="flex-direction:column;align-items:flex-start;border-top:4px solid ' + topBorder + ';">' +
            '<span class="feature-tag" style="background:' + badgeBg + ';color:' + badgeText + ';border:1px solid ' + badgeBorder + ';font-size:0.72rem;padding:0.2rem 0.6rem;border-radius:999px;font-family:var(--font-mono);font-weight:700;margin-bottom:0.6rem;">' + c.badge + '</span>' +
            '<h3 class="feature-title" style="font-size:1.05rem;margin-bottom:0.5rem;">' + c.title + '</h3>' +
            '<p class="feature-desc" style="font-size:0.85rem;line-height:1.5;color:var(--text-muted);">' + c.content + '</p>' +
            '</div>';
        }).join('');
      }
    }

    // --- inspector card: updates only the 3 named targets, never wipes the whole card ---
    function renderInspector(node, nodesList) {
      var n = node || (nodesList && nodesList[0]);
      if (!n) return;

      var rawOut = n.outgoing || 'Yellow signals stream student articles, code proposals, and campus insights outward into the publication network.';
      var rawIn  = n.incoming || 'Blue signals deliver published news stories, editorial feedback, and technical updates back to the BSCS student body.';
      var cOut = rawOut.replace(/^(Yellow Line Motion:\s*)+/gi, '').trim();
      var cIn  = rawIn.replace(/^(Blue Line Motion:\s*)+/gi,  '').trim();

      // Update title (keep the SVG icon, just swap the text node after it)
      var titleEl = document.getElementById('insp-node-title');
      if (titleEl) {
        var svgEl = titleEl.querySelector('svg');
        // Clear children then re-append svg + text
        while (titleEl.firstChild) titleEl.removeChild(titleEl.firstChild);
        if (svgEl) titleEl.appendChild(svgEl);
        var textNode = document.createTextNode(' ' + n.label);
        titleEl.appendChild(textNode);
      }

      // Update description
      var descEl = document.getElementById('insp-node-desc');
      if (descEl) descEl.textContent = n.description;

      // Update outward flow text
      var outEl = document.getElementById('insp-outflow');
      if (outEl) {
        outEl.innerHTML = '<strong style="color:var(--cheddar-yellow);">Yellow Line Motion:</strong> ' + cOut;
      }

      // Update inward flow text
      var inEl = document.getElementById('insp-inflow');
      if (inEl) {
        inEl.innerHTML = '<strong style="color:#00f0ff;">Blue Line Motion:</strong> ' + cIn;
      }

      // Re-sync canvas box height to match side card container height exactly
      setTimeout(resize, 0);
    }

    // --- default positions ---
    var DEF = {
      students:   { x: 0.25, y: 0.35 },
      stories:    { x: 0.50, y: 0.20 },
      ideas:      { x: 0.75, y: 0.35 },
      technology: { x: 0.25, y: 0.65 },
      campus:     { x: 0.75, y: 0.65 },
      community:  { x: 0.50, y: 0.80 }
    };

    function coords(node) {
      var fb = DEF[node.id] || { x: 0.5, y: 0.5 };
      var nx = (typeof node.x === 'number' && !isNaN(node.x)) ? node.x : fb.x;
      var ny = (typeof node.y === 'number' && !isNaN(node.y)) ? node.y : fb.y;
      return { x: nx * W, y: ny * H };
    }

    // --- background effect ---
    function drawBg(t, effect, opacityVal) {
      var op = (typeof opacityVal === 'number') ? opacityVal : 0.6;
      if (effect === 'digital-pulse') {
        var cx = W / 2, cy = H / 2;
        for (var r = 0; r < 4; r++) {
          var rad = ((t * 0.8 + r * 100) % 400);
          var dop  = Math.max(0, (1 - rad / 400) * 0.15 * op);
          ctx2.beginPath(); ctx2.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx2.strokeStyle = 'rgba(0,240,255,' + dop + ')'; ctx2.lineWidth = 1.2; ctx2.stroke();
        }
      } else if (effect === 'quantum-rain') {
        ctx2.fillStyle = 'rgba(0,240,255,' + (0.08 * op) + ')'; ctx2.font = '10px monospace';
        for (var c = 0; c < W; c += 40) {
          var dy = ((t * 1.5 + c * 7) % H);
          ctx2.fillText(c % 3 === 0 ? '1' : '0', c + 15, dy);
          ctx2.fillText(c % 2 === 0 ? '0' : '1', c + 15, (dy + 40) % H);
        }
      } else if (effect === 'starlight-nebula') {
        for (var s = 0; s < 30; s++) {
          var sx = (s * 57 + 30) % W, sy = (s * 83 + 20) % H;
          var sp = Math.abs(Math.sin(t * 0.03 + s));
          ctx2.beginPath(); ctx2.arc(sx, sy, 1.2 + sp * 1.5, 0, Math.PI * 2);
          ctx2.fillStyle = 'rgba(244,180,26,' + ((0.1 + sp * 0.25) * op) + ')'; ctx2.fill();
        }
      } else if (effect === 'hex-honeycomb') {
        ctx2.strokeStyle = 'rgba(0,240,255,' + (0.06 * op) + ')'; ctx2.lineWidth = 1;
        var sz = 35;
        for (var hx = 0; hx < W + sz; hx += sz * 1.5) {
          for (var hy = 0; hy < H + sz; hy += sz * 1.732) {
            ctx2.beginPath();
            for (var sd = 0; sd < 6; sd++) {
              var a = sd * Math.PI / 3;
              var px = hx + sz * 0.8 * Math.cos(a), py = hy + sz * 0.8 * Math.sin(a);
              if (sd === 0) ctx2.moveTo(px, py); else ctx2.lineTo(px, py);
            }
            ctx2.closePath(); ctx2.stroke();
          }
        }
      } else if (effect === 'neural-network') {
        var nn = 14;
        for (var ni = 0; ni < nn; ni++) {
          var nx2 = (ni * 137 + 40) % W, ny2 = (ni * 97 + 30) % H;
          var np = Math.abs(Math.sin(t * 0.02 + ni));
          ctx2.beginPath(); ctx2.arc(nx2, ny2, 2 + np * 2, 0, Math.PI*2);
          ctx2.fillStyle = 'rgba(0,240,255,' + (op * (0.2 + np * 0.4)) + ')'; ctx2.fill();
          for (var nj = ni + 1; nj < nn; nj++) {
            var nx3 = (nj * 137 + 40) % W, ny3 = (nj * 97 + 30) % H;
            var dist = Math.hypot(nx2-nx3, ny2-ny3);
            if (dist < 120) {
              ctx2.beginPath(); ctx2.moveTo(nx2,ny2); ctx2.lineTo(nx3,ny3);
              ctx2.strokeStyle = 'rgba(0,240,255,' + (op * (1-dist/120) * 0.18) + ')';
              ctx2.lineWidth = 0.8; ctx2.stroke();
            }
          }
        }
      } else if (effect === 'circuit-board') {
        ctx2.strokeStyle = 'rgba(0,240,255,' + (op*0.09) + ')'; ctx2.lineWidth = 1.2;
        var step = 45;
        for (var ci2 = 0; ci2 < W; ci2 += step) {
          ctx2.beginPath(); ctx2.moveTo(ci2,0); ctx2.lineTo(ci2,H); ctx2.stroke();
          var jy = (ci2 * 3 + t * 0.5) % H;
          ctx2.beginPath(); ctx2.arc(ci2, jy, 3, 0, Math.PI*2);
          ctx2.fillStyle = 'rgba(244,180,26,' + (op*0.35) + ')'; ctx2.fill();
        }
        for (var ri = 0; ri < H; ri += step) {
          ctx2.beginPath(); ctx2.moveTo(0,ri); ctx2.lineTo(W,ri); ctx2.stroke();
        }
      } else if (effect === 'data-stream') {
        for (var di = 0; di < 12; di++) {
          var dy3 = (di * 35 + 20) % H;
          var dx3 = ((t * 2 + di * 80) % (W + 60)) - 30;
          var dlen = 30 + (di % 3) * 15;
          var dop = op * (0.15 + (di % 3) * 0.08);
          ctx2.beginPath(); ctx2.moveTo(dx3, dy3); ctx2.lineTo(dx3 + dlen, dy3);
          ctx2.strokeStyle = di % 2 === 0 ? 'rgba(0,240,255,'+dop+')' : 'rgba(244,180,26,'+dop+')';
          ctx2.lineWidth = 1.5; ctx2.stroke();
          ctx2.beginPath(); ctx2.arc(dx3 + dlen, dy3, 2.5, 0, Math.PI*2);
          ctx2.fillStyle = di % 2 === 0 ? 'rgba(0,240,255,'+(dop*2)+')' : 'rgba(244,180,26,'+(dop*2)+')';
          ctx2.fill();
        }
      } else if (effect === 'fiber-optic') {
        for (var fi = 0; fi < 8; fi++) {
          var fy = (fi * 55 + 25) % H;
          var fprog = ((t * 3 + fi * 40) % (W + 100)) / (W + 100);
          var fx = fprog * W;
          var fop = op * Math.sin(fprog * Math.PI) * 0.7;
          var grad = ctx2.createLinearGradient(fx - 80, fy, fx, fy);
          grad.addColorStop(0, 'rgba(0,240,255,0)');
          grad.addColorStop(1, 'rgba(0,240,255,' + fop + ')');
          ctx2.beginPath(); ctx2.moveTo(fx-80, fy); ctx2.lineTo(fx, fy);
          ctx2.strokeStyle = grad; ctx2.lineWidth = 1.5; ctx2.stroke();
        }
      } else if (effect === 'constellation') {
        var stars = [[0.1,0.2],[0.3,0.1],[0.6,0.15],[0.85,0.3],[0.9,0.6],[0.7,0.85],[0.4,0.9],[0.15,0.75],[0.5,0.5],[0.25,0.5]];
        stars.forEach(function(st, si) {
          var sxp = st[0]*W, syp = st[1]*H;
          var sp2 = Math.abs(Math.sin(t*0.015+si));
          ctx2.beginPath(); ctx2.arc(sxp, syp, 1.5+sp2*1.5, 0, Math.PI*2);
          ctx2.fillStyle='rgba(255,255,255,'+(op*(0.3+sp2*0.5))+')'; ctx2.fill();
          var next = stars[(si+1)%stars.length];
          ctx2.beginPath(); ctx2.moveTo(sxp,syp); ctx2.lineTo(next[0]*W,next[1]*H);
          ctx2.strokeStyle='rgba(0,240,255,'+(op*0.1)+')'; ctx2.lineWidth=0.7; ctx2.stroke();
        });
      } else if (effect === 'blockchain') {
        var bsize = 40, bgap = 20;
        var boff = ((t * 0.6) % (bsize + bgap));
        for (var bi = -1; bi < Math.ceil(W/(bsize+bgap))+1; bi++) {
          var bx = bi*(bsize+bgap) - boff + 10;
          var by = H/2 - bsize/2;
          ctx2.strokeRect(bx, by, bsize, bsize);
          ctx2.strokeStyle='rgba(0,240,255,'+(op*0.15)+')';
          ctx2.lineWidth=1;
          if (bi >= 0) {
            ctx2.beginPath(); ctx2.moveTo(bx-bgap, H/2); ctx2.lineTo(bx, H/2);
            ctx2.strokeStyle='rgba(244,180,26,'+(op*0.25)+')'; ctx2.lineWidth=1.5; ctx2.stroke();
          }
          var bcol = (bi%2===0) ? 'rgba(0,240,255,'+(op*0.1)+')' : 'rgba(244,180,26,'+(op*0.08)+')';
          ctx2.fillStyle = bcol; ctx2.fillRect(bx,by,bsize,bsize);
        }
      } else if (effect === 'signal-radar') {
        var rcx=W/2, rcy=H/2, rmx=Math.min(W,H)*0.42;
        for(var ri2=1; ri2<=4; ri2++){
          ctx2.beginPath(); ctx2.arc(rcx,rcy,rmx*(ri2/4),0,Math.PI*2);
          ctx2.strokeStyle='rgba(0,240,255,'+(op*0.08)+')'; ctx2.lineWidth=1; ctx2.stroke();
        }
        var rang = (t*0.025)%(Math.PI*2);
        ctx2.beginPath(); ctx2.moveTo(rcx,rcy);
        ctx2.arc(rcx,rcy,rmx,rang-0.5,rang);
        ctx2.closePath();
        ctx2.fillStyle='rgba(0,240,255,'+(op*0.12)+')';
        ctx2.fill();
        ctx2.beginPath(); ctx2.moveTo(rcx,rcy);
        ctx2.lineTo(rcx+Math.cos(rang)*rmx, rcy+Math.sin(rang)*rmx);
        ctx2.strokeStyle='rgba(0,240,255,'+(op*0.5)+')'; ctx2.lineWidth=1.5; ctx2.stroke();
      } else if (effect === 'network-topology') {
        var roots = [[0.5,0.08],[0.25,0.35],[0.75,0.35],[0.12,0.65],[0.38,0.65],[0.62,0.65],[0.88,0.65]];
        roots.forEach(function(r,ri3){
          var rpx=r[0]*W, rpy=r[1]*H;
          ctx2.beginPath(); ctx2.arc(rpx,rpy,3,0,Math.PI*2);
          var rp=Math.abs(Math.sin(t*0.02+ri3));
          ctx2.fillStyle='rgba(0,240,255,'+(op*(0.2+rp*0.3))+')'; ctx2.fill();
          if(ri3>0){
            var parent=roots[Math.floor((ri3-1)/2)];
            ctx2.beginPath(); ctx2.moveTo(parent[0]*W,parent[1]*H);
            ctx2.lineTo(rpx,rpy);
            ctx2.strokeStyle='rgba(0,240,255,'+(op*0.12)+')'; ctx2.lineWidth=1; ctx2.stroke();
          }
        });
      } else if (effect === 'warp-speed') {
        var wcx=W/2, wcy=H/2;
        for(var wi=0;wi<20;wi++){
          var wa=(wi/20)*Math.PI*2;
          var wstart=50+((t*2+wi*30)%200);
          var wend=wstart+15+wi*4;
          var wx1=wcx+Math.cos(wa)*wstart, wy1=wcy+Math.sin(wa)*wstart;
          var wx2=wcx+Math.cos(wa)*Math.min(wend,Math.max(W,H));
          var wy2=wcy+Math.sin(wa)*Math.min(wend,Math.max(W,H));
          ctx2.beginPath(); ctx2.moveTo(wx1,wy1); ctx2.lineTo(wx2,wy2);
          ctx2.strokeStyle=wi%3===0?'rgba(244,180,26,'+(op*0.2)+')':'rgba(0,240,255,'+(op*0.15)+')';
          ctx2.lineWidth=0.8+wi%2; ctx2.stroke();
        }
      } else if (effect === 'dna-helix') {
        var step2=8;
        for(var xi=0;xi<W;xi+=step2){
          var t2=xi*0.04+t*0.03;
          var y1h=H/2+Math.sin(t2)*H*0.28;
          var y2h=H/2+Math.sin(t2+Math.PI)*H*0.28;
          ctx2.beginPath(); ctx2.arc(xi,y1h,2,0,Math.PI*2);
          ctx2.fillStyle='rgba(0,240,255,'+(op*0.3)+')'; ctx2.fill();
          ctx2.beginPath(); ctx2.arc(xi,y2h,2,0,Math.PI*2);
          ctx2.fillStyle='rgba(244,180,26,'+(op*0.3)+')'; ctx2.fill();
          if(xi%24===0){
            ctx2.beginPath(); ctx2.moveTo(xi,y1h); ctx2.lineTo(xi,y2h);
            ctx2.strokeStyle='rgba(255,255,255,'+(op*0.1)+')'; ctx2.lineWidth=0.8; ctx2.stroke();
          }
        }
      } else {
        // Default: cyber-matrix grid + floating ambient dots
        ctx2.strokeStyle = 'rgba(255,255,255,' + (0.03 * op) + ')'; ctx2.lineWidth = 1;
        var gs = 40;
        for (var gx = 0; gx < W; gx += gs) { ctx2.beginPath(); ctx2.moveTo(gx, 0); ctx2.lineTo(gx, H); ctx2.stroke(); }
        for (var gy = 0; gy < H; gy += gs) { ctx2.beginPath(); ctx2.moveTo(0, gy); ctx2.lineTo(W, gy); ctx2.stroke(); }
        for (var d = 0; d < 22; d++) {
          var dx2 = (d * 73 + t * 0.25) % W, dy2 = (d * 41 + t * 0.18) % H;
          ctx2.beginPath(); ctx2.arc(dx2, dy2, 1.8, 0, Math.PI * 2);
          ctx2.fillStyle = d % 2 === 0 ? 'rgba(0,240,255,' + (0.15 * op) + ')' : 'rgba(244,180,26,' + (0.15 * op) + ')';
          ctx2.fill();
        }
      }
    }

    // --- state ---
    var pulseTime   = 0;
    var hoveredNode = null;
    var selectedNode = null;
    var nodes = [], conns = [], bgFx = 'cyber-matrix', bgOp = 0.6, pathOp = 0.20;

    // --- animation frame ---
    function frame() {
      resize();
      if (W <= 0 || H <= 0) { _animID = requestAnimationFrame(frame); return; }

      ctx2.clearRect(0, 0, W, H);
      drawBg(pulseTime, bgFx, bgOp);

      var active = hoveredNode || selectedNode;

      // Draw connections + moving pulses dynamically based on hovered/selected node perspective
      for (var ci = 0; ci < conns.length; ci++) {
        var conn = conns[ci];
        var fn = null, tn = null;
        for (var ni = 0; ni < nodes.length; ni++) {
          if (nodes[ni].id === conn.from) fn = nodes[ni];
          if (nodes[ni].id === conn.to)   tn = nodes[ni];
        }
        if (!fn || !tn) continue;

        var p1 = coords(fn), p2 = coords(tn);
        var isFromActive = active && (active.id === fn.id);
        var isToActive   = active && (active.id === tn.id);
        var isAct        = isFromActive || isToActive;

        // Dynamic perspective-based color calculation:
        // Outgoing relative to active node -> Cheddar Yellow (#f4b41a)
        // Incoming relative to active node -> Cyan (#00f0ff)
        var dynamicColor = conn.color || '#00f0ff';
        var sp2 = p1, ep2 = p2;

        if (isAct) {
          if (isFromActive) {
            if (conn.direction === 'incoming') {
              dynamicColor = '#00f0ff'; // Incoming to active node
              sp2 = p2; ep2 = p1;
            } else {
              dynamicColor = '#f4b41a'; // Outgoing from active node
              sp2 = p1; ep2 = p2;
            }
          } else if (isToActive) {
            if (conn.direction === 'incoming') {
              dynamicColor = '#f4b41a'; // Outgoing from active node
              sp2 = p2; ep2 = p1;
            } else {
              dynamicColor = '#00f0ff'; // Incoming to active node
              sp2 = p1; ep2 = p2;
            }
          }
        } else {
          if (conn.direction === 'incoming') {
            sp2 = p2; ep2 = p1;
          }
        }

        // Base line
        ctx2.beginPath(); ctx2.moveTo(p1.x, p1.y); ctx2.lineTo(p2.x, p2.y);
        ctx2.strokeStyle = isAct ? dynamicColor : 'rgba(0,240,255,' + pathOp + ')';
        ctx2.lineWidth   = isAct ? 2.4 : 1.0;
        ctx2.shadowBlur  = isAct ? 14 : 0;
        ctx2.shadowColor = dynamicColor;
        ctx2.stroke(); ctx2.shadowBlur = 0;

        // Moving packet
        var prog = (pulseTime * 0.012 * (conn.speed || 1.0)) % 1;
        var pkx = sp2.x + (ep2.x - sp2.x) * prog;
        var pky = sp2.y + (ep2.y - sp2.y) * prog;

        ctx2.beginPath(); ctx2.arc(pkx, pky, isAct ? 4.8 : 2.8, 0, Math.PI * 2);
        ctx2.fillStyle   = isAct ? dynamicColor : 'rgba(0,240,255,' + Math.min(1, pathOp * 1.5) + ')';
        ctx2.shadowBlur  = isAct ? 14 : Math.round(7 * pathOp);
        ctx2.shadowColor = isAct ? dynamicColor : 'rgba(0,240,255,' + pathOp + ')';
        ctx2.fill(); ctx2.shadowBlur = 0;
      }

      // Draw nodes
      for (var ni2 = 0; ni2 < nodes.length; ni2++) {
        var node = nodes[ni2];
        var c = coords(node);
        var isHov = hoveredNode && hoveredNode.id === node.id;
        var isSel = selectedNode && selectedNode.id === node.id;
        var isA   = isHov || isSel;

        var pulse = Math.sin(pulseTime * 0.03 + ni2) * 1.5;
        var rad   = isA ? 22 : 16 + Math.max(0, pulse);

        // Outer glow ring
        ctx2.beginPath(); ctx2.arc(c.x, c.y, rad + 10, 0, Math.PI * 2);
        ctx2.fillStyle = isA ? 'rgba(244,180,26,0.25)' : 'rgba(0,240,255,0.08)';
        ctx2.fill();

        // Node fill + stroke
        ctx2.beginPath(); ctx2.arc(c.x, c.y, rad, 0, Math.PI * 2);
        ctx2.fillStyle   = isA ? (node.color || '#f4b41a') : '#0a1128';
        ctx2.strokeStyle = isA ? '#ffffff' : (node.color || '#00f0ff');
        ctx2.lineWidth   = 2.5;
        ctx2.shadowBlur  = isA ? 22 : 10;
        ctx2.shadowColor = node.color || '#00f0ff';
        ctx2.fill(); ctx2.stroke(); ctx2.shadowBlur = 0;

        // Label
        ctx2.font         = '600 ' + (isA ? '14px' : '12px') + ' "Space Grotesk", sans-serif';
        ctx2.fillStyle    = isA ? '#ffffff' : '#94a3b8';
        ctx2.textAlign    = 'center';
        ctx2.textBaseline = 'middle';
        ctx2.fillText(node.label, c.x, c.y + rad + 18);
      }

      pulseTime += 1;
      _animID = requestAnimationFrame(frame);
    }

// --- responsive mouse + touch/pointer events ---

function getCanvasPoint(e) {
  var r = canvas.getBoundingClientRect();

  // Convert CSS/display coordinates to the canvas's internal coordinates.
  var scaleX = canvas.width / r.width;
  var scaleY = canvas.height / r.height;

  return {
    x: (e.clientX - r.left) * scaleX,
    y: (e.clientY - r.top) * scaleY
  };
}

function findNodeAtPoint(x, y) {
  // Slightly larger hit area for touch devices.
  var hitRadius = window.innerWidth <= 768 ? 42 : 32;

  for (var i = 0; i < nodes.length; i++) {
    var c = coords(nodes[i]);

    if (Math.hypot(x - c.x, y - c.y) < hitRadius) {
      return nodes[i];
    }
  }

  return null;
}

// Mouse hover — desktop only.
canvas.addEventListener('mousemove', function(e) {
  var point = getCanvasPoint(e);
  var found = findNodeAtPoint(point.x, point.y);

  if (found !== hoveredNode) {
    hoveredNode = found;
    renderInspector(hoveredNode || selectedNode, nodes);
  }
});

// Remove hover state when the mouse leaves the graph.
canvas.addEventListener('mouseleave', function() {
  hoveredNode = null;
  renderInspector(selectedNode, nodes);
});

// Unified pointer interaction.
// Works with mouse, touchscreen and stylus.
canvas.addEventListener('pointerdown', function(e) {
  var point = getCanvasPoint(e);
  var found = findNodeAtPoint(point.x, point.y);

  if (found) {
    selectedNode = found;
    hoveredNode = found;

    renderInspector(selectedNode, nodes);

    // Prevent the browser from interpreting the interaction
    // as another gesture.
    e.preventDefault();
  }
});

// Make the canvas explicitly touch-friendly.
canvas.style.touchAction = 'manipulation';
canvas.style.cursor = 'pointer';

    // --- auto-refresh when ecosystem-studio publishes ---
    window.addEventListener('storage', function(e) {
      if (e.key && e.key.startsWith('iconnect_ecosystem')) {
        var fresh = readData();
        nodes  = fresh.nodes;
        conns  = fresh.conns;
        bgFx   = fresh.bgFx;
        bgOp   = fresh.bgOp;
        pathOp = fresh.pathOp;
        if (nodes.length > 0 && !nodes.some(function(n) { return selectedNode && n.id === selectedNode.id; })) {
          selectedNode = nodes[0];
        }
        renderSections(fresh.header, fresh.cards);
        renderInspector(selectedNode, nodes);
      }
    });

    // --- boot ---
    function boot() {
      var d = readData();
      nodes  = d.nodes;
      conns  = d.conns;
      bgFx   = d.bgFx;
      bgOp   = d.bgOp;
      pathOp = d.pathOp;
      selectedNode = nodes[0] || null;
      renderSections(d.header, d.cards);
      renderInspector(selectedNode, nodes);
      if (_animID) cancelAnimationFrame(_animID);
      _animID = requestAnimationFrame(frame);
      _booted = true;
    }

    boot();
  }

  // Initialize both background canvas and ecosystem graph on DOMContentLoaded & window load
  function bootAll() {
    initBgCanvas();
    initEcosystem();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }

  window.addEventListener('load', function() {
    bootAll();
  });

})();
