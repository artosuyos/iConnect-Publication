/* ==========================================================================
   iCONNECT — ECOSYSTEM GRAPH STUDIO MANAGER (js/ecosystem-studio.js)
   Full CRUD: Add, Edit, Delete Nodes, Node Movement / Dragging, Animated Connections,
   Top Explanatory Cards, Section Titles & Subtitles, Live Publish & Code Export
   ========================================================================== */

(function (window) {
  'use strict';

  var EcosystemStudio = {
    bgEffect: 'cyber-matrix',
    allowDrag: false,

    init: function () {
      this.header = window.getEcosystemHeader();
      this.cards = window.getEcosystemTopCards();
      this.nodes = window.getEcosystemNodes();
      this.connections = window.getEcosystemConnections();
      this.bgEffect = window.getEcosystemBgEffect();
      this.bgOpacity = (typeof window.getEcosystemBgOpacity === 'function') ? window.getEcosystemBgOpacity() : 0.6;
      this.pathOpacity = (typeof window.getEcosystemPathOpacity === 'function') ? window.getEcosystemPathOpacity() : 0.20;
      this.allowDrag = window.getEcosystemAllowDrag();

      if (this.nodes.length > 0) {
        this.selectedNodeId = this.nodes[0].id;
      }

      this.cacheDOM();
      this.bindEvents();
      this.renderAll();
      this.updateDragBtnState();
      this.updateBgEffectSelectState();

      if (window.StudioVisibility) {
        window.StudioVisibility.init('ecosystem');
      }

      this.startStudioAnimation();
    },

    startStudioAnimation: function () {
      var self = this;
      this.pulseTime = 0;
      if (this._animId) cancelAnimationFrame(this._animId);
      function loop() {
        self.pulseTime = (self.pulseTime || 0) + 1;
        self.renderStudioCanvas();
        self._animId = requestAnimationFrame(loop);
      }
      this._animId = requestAnimationFrame(loop);
    },

    toggleAllowDrag: function () {
      this.allowDrag = !this.allowDrag;
      if (!this.allowDrag) {
        var defaults = window.defaultEcosystemNodesData || [];
        for (var i = 0; i < this.nodes.length; i++) {
          for (var j = 0; j < defaults.length; j++) {
            if (this.nodes[i].id === defaults[j].id) {
              this.nodes[i].x = defaults[j].x;
              this.nodes[i].y = defaults[j].y;
              break;
            }
          }
        }
        if (this.editingNodeId) {
          this.selectNodeForEditing(this.editingNodeId);
        }
      }
      window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections, this.bgEffect, this.bgOpacity, this.pathOpacity, this.allowDrag);
      this.updateDragBtnState();
      this.renderStudioCanvas();
      if (this.allowDrag) {
        alert('🔓 Node Dragging Unlocked!\n\nYou can now drag nodes directly on the canvas to reposition them.');
      } else {
        alert('🔒 Node Dragging Locked!\n\nNode positions have been reset to their original hexagonal layout.');
      }
    },

    updateDragBtnState: function () {
      var btn = document.getElementById('drag-toggle-btn');
      if (!btn) return;
      if (this.allowDrag) {
        btn.innerHTML = '🔓 Dragging ON (Custom Repositioning)';
        btn.style.background = 'rgba(0, 240, 255, 0.2)';
        btn.style.borderColor = '#00f0ff';
        btn.style.color = '#00f0ff';
      } else {
        btn.innerHTML = '🔒 Dragging OFF (Original Layout)';
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        btn.style.color = '#ffffff';
      }
    },

    updateBgEffect: function (val) {
      if (!val) return;
      this.bgEffect = val;
      window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections, this.bgEffect, this.bgOpacity, this.pathOpacity, this.allowDrag);
      this.renderStudioCanvas();
    },

    updateBgOpacity: function (val) {
      var pct = parseInt(val, 10);
      this.bgOpacity = pct / 100;
      var v1 = document.getElementById('eco-bg-opacity-val');
      var v2 = document.getElementById('eco-bg-opacity-val-settings');
      var s1 = document.getElementById('eco-bg-opacity');
      var s2 = document.getElementById('eco-bg-opacity-settings');
      if (v1) v1.textContent = pct + '%';
      if (v2) v2.textContent = pct + '%';
      if (s1) s1.value = pct;
      if (s2) s2.value = pct;
      localStorage.setItem('iconnect_ecosystem_bg_opacity', this.bgOpacity.toString());
      this.renderStudioCanvas();
    },

    updatePathOpacity: function (val) {
      var pct = parseInt(val, 10);
      this.pathOpacity = pct / 100;
      var v1 = document.getElementById('eco-path-opacity-val');
      var v2 = document.getElementById('eco-path-opacity-val-settings');
      var s1 = document.getElementById('eco-path-opacity');
      var s2 = document.getElementById('eco-path-opacity-settings');
      if (v1) v1.textContent = pct + '%';
      if (v2) v2.textContent = pct + '%';
      if (s1) s1.value = pct;
      if (s2) s2.value = pct;
      localStorage.setItem('iconnect_ecosystem_path_opacity', this.pathOpacity.toString());
      this.renderStudioCanvas();
    },

    updateBgEffectSelectState: function () {
      var s1 = document.getElementById('eco-bg-effect');
      var s2 = document.getElementById('eco-bg-effect-settings');
      if (s1 && this.bgEffect) s1.value = this.bgEffect;
      if (s2 && this.bgEffect) s2.value = this.bgEffect;

      // sync bg opacity sliders
      var pct = Math.round((this.bgOpacity || 0.6) * 100);
      var ov1 = document.getElementById('eco-bg-opacity-val');
      var ov2 = document.getElementById('eco-bg-opacity-val-settings');
      var os1 = document.getElementById('eco-bg-opacity');
      var os2 = document.getElementById('eco-bg-opacity-settings');
      if (ov1) ov1.textContent = pct + '%';
      if (ov2) ov2.textContent = pct + '%';
      if (os1) os1.value = pct;
      if (os2) os2.value = pct;

      // sync path opacity sliders
      var ppct = Math.round((this.pathOpacity || 0.20) * 100);
      var pv1 = document.getElementById('eco-path-opacity-val');
      var pv2 = document.getElementById('eco-path-opacity-val-settings');
      var ps1 = document.getElementById('eco-path-opacity');
      var ps2 = document.getElementById('eco-path-opacity-settings');
      if (pv1) pv1.textContent = ppct + '%';
      if (pv2) pv2.textContent = ppct + '%';
      if (ps1) ps1.value = ppct;
      if (ps2) ps2.value = ppct;
    },

    drawCanvasBackground: function (cCtx, cWidth, cHeight, effect, time) {
      if (effect === 'digital-pulse') {
        cCtx.lineWidth = 1.2;
        var centerX = cWidth / 2;
        var centerY = cHeight / 2;
        for (var r = 0; r < 4; r++) {
          var radius = ((time * 0.8 + r * 100) % 400);
          var opacity = Math.max(0, (1 - radius / 400) * 0.15);
          cCtx.beginPath();
          cCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          cCtx.strokeStyle = 'rgba(0, 240, 255, ' + opacity + ')';
          cCtx.stroke();
        }
      } else if (effect === 'quantum-rain') {
        cCtx.fillStyle = 'rgba(0, 240, 255, 0.08)';
        cCtx.font = '10px monospace';
        for (var c = 0; c < cWidth; c += 40) {
          var dropY = ((time * 1.5 + c * 7) % cHeight);
          cCtx.fillText(c % 3 === 0 ? '1' : '0', c + 15, dropY);
          cCtx.fillText(c % 2 === 0 ? '0' : '1', c + 15, (dropY + 40) % cHeight);
        }
      } else if (effect === 'starlight-nebula') {
        for (var s = 0; s < 25; s++) {
          var sx = (s * 57 + 30) % cWidth;
          var sy = (s * 83 + 20) % cHeight;
          var sparkle = Math.abs(Math.sin(time * 0.03 + s));
          cCtx.beginPath();
          cCtx.arc(sx, sy, 1.2 + sparkle * 1.5, 0, Math.PI * 2);
          cCtx.fillStyle = 'rgba(244, 180, 26, ' + (0.1 + sparkle * 0.25) + ')';
          cCtx.fill();
        }
      } else if (effect === 'hex-honeycomb') {
        cCtx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
        cCtx.lineWidth = 1;
        var size = 35;
        for (var hx = 0; hx < cWidth + size; hx += size * 1.5) {
          for (var hy = 0; hy < cHeight + size; hy += size * 1.732) {
            cCtx.beginPath();
            for (var side = 0; side < 6; side++) {
              var angle = side * Math.PI / 3;
              var px = hx + size * 0.8 * Math.cos(angle);
              var py = hy + size * 0.8 * Math.sin(angle);
              if (side === 0) cCtx.moveTo(px, py); else cCtx.lineTo(px, py);
            }
            cCtx.closePath();
            cCtx.stroke();
          }
        }
      } else if (effect === 'neural-network') {
        // Synaptic nodes + connecting lines
        var nn = 14;
        for (var ni = 0; ni < nn; ni++) {
          var nx2 = (ni * 137 + 40) % cWidth, ny2 = (ni * 97 + 30) % cHeight;
          var np = Math.abs(Math.sin(time * 0.02 + ni));
          cCtx.beginPath(); cCtx.arc(nx2, ny2, 2 + np * 2, 0, Math.PI*2);
          cCtx.fillStyle = 'rgba(0,240,255,' + (op * (0.2 + np * 0.4)) + ')'; cCtx.fill();
          for (var nj = ni + 1; nj < nn; nj++) {
            var nx3 = (nj * 137 + 40) % cWidth, ny3 = (nj * 97 + 30) % cHeight;
            var dist = Math.hypot(nx2-nx3, ny2-ny3);
            if (dist < 120) {
              cCtx.beginPath(); cCtx.moveTo(nx2,ny2); cCtx.lineTo(nx3,ny3);
              cCtx.strokeStyle = 'rgba(0,240,255,' + (op * (1-dist/120) * 0.18) + ')';
              cCtx.lineWidth = 0.8; cCtx.stroke();
            }
          }
        }
      } else if (effect === 'circuit-board') {
        // PCB horizontal/vertical traces with junction dots
        cCtx.strokeStyle = 'rgba(0,240,255,' + (op*0.09) + ')'; cCtx.lineWidth = 1.2;
        var step = 45;
        for (var ci2 = 0; ci2 < cWidth; ci2 += step) {
          cCtx.beginPath(); cCtx.moveTo(ci2,0); cCtx.lineTo(ci2,cHeight); cCtx.stroke();
          // junction dot
          var jy = (ci2 * 3 + time * 0.5) % cHeight;
          cCtx.beginPath(); cCtx.arc(ci2, jy, 3, 0, Math.PI*2);
          cCtx.fillStyle = 'rgba(244,180,26,' + (op*0.35) + ')'; cCtx.fill();
        }
        for (var ri = 0; ri < cHeight; ri += step) {
          cCtx.beginPath(); cCtx.moveTo(0,ri); cCtx.lineTo(cWidth,ri); cCtx.stroke();
        }
      } else if (effect === 'data-stream') {
        // Horizontal flowing packets
        for (var di = 0; di < 12; di++) {
          var dy3 = (di * 35 + 20) % cHeight;
          var dx3 = ((time * 2 + di * 80) % (cWidth + 60)) - 30;
          var dlen = 30 + (di % 3) * 15;
          var dop = op * (0.15 + (di % 3) * 0.08);
          cCtx.beginPath(); cCtx.moveTo(dx3, dy3); cCtx.lineTo(dx3 + dlen, dy3);
          cCtx.strokeStyle = di % 2 === 0 ? 'rgba(0,240,255,'+dop+')' : 'rgba(244,180,26,'+dop+')';
          cCtx.lineWidth = 1.5; cCtx.stroke();
          cCtx.beginPath(); cCtx.arc(dx3 + dlen, dy3, 2.5, 0, Math.PI*2);
          cCtx.fillStyle = di % 2 === 0 ? 'rgba(0,240,255,'+(dop*2)+')' : 'rgba(244,180,26,'+(dop*2)+')';
          cCtx.fill();
        }
      } else if (effect === 'fiber-optic') {
        // Shooting light beams from left edge
        for (var fi = 0; fi < 8; fi++) {
          var fy = (fi * 55 + 25) % cHeight;
          var fprog = ((time * 3 + fi * 40) % (cWidth + 100)) / (cWidth + 100);
          var fx = fprog * cWidth;
          var fop = op * Math.sin(fprog * Math.PI) * 0.7;
          var grad = cCtx.createLinearGradient(fx - 80, fy, fx, fy);
          grad.addColorStop(0, 'rgba(0,240,255,0)');
          grad.addColorStop(1, 'rgba(0,240,255,' + fop + ')');
          cCtx.beginPath(); cCtx.moveTo(fx-80, fy); cCtx.lineTo(fx, fy);
          cCtx.strokeStyle = grad; cCtx.lineWidth = 1.5; cCtx.stroke();
        }
      } else if (effect === 'constellation') {
        // Fixed star points with connecting lines
        var stars = [[0.1,0.2],[0.3,0.1],[0.6,0.15],[0.85,0.3],[0.9,0.6],[0.7,0.85],[0.4,0.9],[0.15,0.75],[0.5,0.5],[0.25,0.5]];
        stars.forEach(function(st, si) {
          var sxp = st[0]*cWidth, syp = st[1]*cHeight;
          var sp2 = Math.abs(Math.sin(time*0.015+si));
          cCtx.beginPath(); cCtx.arc(sxp, syp, 1.5+sp2*1.5, 0, Math.PI*2);
          cCtx.fillStyle='rgba(255,255,255,'+(op*(0.3+sp2*0.5))+')'; cCtx.fill();
          // connect to next
          var next = stars[(si+1)%stars.length];
          cCtx.beginPath(); cCtx.moveTo(sxp,syp); cCtx.lineTo(next[0]*cWidth,next[1]*cHeight);
          cCtx.strokeStyle='rgba(0,240,255,'+(op*0.1)+')'; cCtx.lineWidth=0.7; cCtx.stroke();
        });
      } else if (effect === 'blockchain') {
        // Horizontal chain of blocks
        var bsize = 40, bgap = 20;
        var boff = ((time * 0.6) % (bsize + bgap));
        for (var bi = -1; bi < Math.ceil(cWidth/(bsize+bgap))+1; bi++) {
          var bx = bi*(bsize+bgap) - boff + 10;
          var by = cHeight/2 - bsize/2;
          cCtx.strokeRect(bx, by, bsize, bsize);
          cCtx.strokeStyle='rgba(0,240,255,'+(op*0.15)+')';
          cCtx.lineWidth=1;
          // chain link
          if (bi >= 0) {
            cCtx.beginPath(); cCtx.moveTo(bx-bgap, cHeight/2); cCtx.lineTo(bx, cHeight/2);
            cCtx.strokeStyle='rgba(244,180,26,'+(op*0.25)+')'; cCtx.lineWidth=1.5; cCtx.stroke();
          }
          var bcol = (bi%2===0) ? 'rgba(0,240,255,'+(op*0.1)+')' : 'rgba(244,180,26,'+(op*0.08)+')';
          cCtx.fillStyle = bcol; cCtx.fillRect(bx,by,bsize,bsize);
        }
      } else if (effect === 'signal-radar') {
        var rcx=cWidth/2, rcy=cHeight/2, rmx=Math.min(cWidth,cHeight)*0.42;
        // concentric rings
        for(var ri2=1; ri2<=4; ri2++){
          cCtx.beginPath(); cCtx.arc(rcx,rcy,rmx*(ri2/4),0,Math.PI*2);
          cCtx.strokeStyle='rgba(0,240,255,'+(op*0.08)+')'; cCtx.lineWidth=1; cCtx.stroke();
        }
        // sweep arm
        var rang = (time*0.025)%(Math.PI*2);
        var grad2=cCtx.createConicalGradient ? null : null;
        cCtx.beginPath(); cCtx.moveTo(rcx,rcy);
        cCtx.arc(rcx,rcy,rmx,rang-0.5,rang);
        cCtx.closePath();
        cCtx.fillStyle='rgba(0,240,255,'+(op*0.12)+')';
        cCtx.fill();
        // sweep line
        cCtx.beginPath(); cCtx.moveTo(rcx,rcy);
        cCtx.lineTo(rcx+Math.cos(rang)*rmx, rcy+Math.sin(rang)*rmx);
        cCtx.strokeStyle='rgba(0,240,255,'+(op*0.5)+')'; cCtx.lineWidth=1.5; cCtx.stroke();
      } else if (effect === 'network-topology') {
        // Tree-like mesh emanating from center top
        var roots = [[0.5,0.08],[0.25,0.35],[0.75,0.35],[0.12,0.65],[0.38,0.65],[0.62,0.65],[0.88,0.65]];
        roots.forEach(function(r,ri3){
          var rpx=r[0]*cWidth, rpy=r[1]*cHeight;
          cCtx.beginPath(); cCtx.arc(rpx,rpy,3,0,Math.PI*2);
          var rp=Math.abs(Math.sin(time*0.02+ri3));
          cCtx.fillStyle='rgba(0,240,255,'+(op*(0.2+rp*0.3))+')'; cCtx.fill();
          if(ri3>0){
            var parent=roots[Math.floor((ri3-1)/2)];
            cCtx.beginPath(); cCtx.moveTo(parent[0]*cWidth,parent[1]*cHeight);
            cCtx.lineTo(rpx,rpy);
            cCtx.strokeStyle='rgba(0,240,255,'+(op*0.12)+')'; cCtx.lineWidth=1; cCtx.stroke();
          }
        });
      } else if (effect === 'warp-speed') {
        // Streaking lines from center
        var wcx=cWidth/2, wcy=cHeight/2;
        for(var wi=0;wi<20;wi++){
          var wa=(wi/20)*Math.PI*2;
          var wstart=50+((time*2+wi*30)%200);
          var wend=wstart+15+wi*4;
          var wx1=wcx+Math.cos(wa)*wstart, wy1=wcy+Math.sin(wa)*wstart;
          var wx2=wcx+Math.cos(wa)*Math.min(wend,Math.max(cWidth,cHeight));
          var wy2=wcy+Math.sin(wa)*Math.min(wend,Math.max(cWidth,cHeight));
          cCtx.beginPath(); cCtx.moveTo(wx1,wy1); cCtx.lineTo(wx2,wy2);
          cCtx.strokeStyle=wi%3===0?'rgba(244,180,26,'+(op*0.2)+')':'rgba(0,240,255,'+(op*0.15)+')';
          cCtx.lineWidth=0.8+wi%2; cCtx.stroke();
        }
      } else if (effect === 'dna-helix') {
        // Double helix across canvas
        var step2=8;
        for(var xi=0;xi<cWidth;xi+=step2){
          var t2=xi*0.04+time*0.03;
          var y1h=cHeight/2+Math.sin(t2)*cHeight*0.28;
          var y2h=cHeight/2+Math.sin(t2+Math.PI)*cHeight*0.28;
          cCtx.beginPath(); cCtx.arc(xi,y1h,2,0,Math.PI*2);
          cCtx.fillStyle='rgba(0,240,255,'+(op*0.3)+')'; cCtx.fill();
          cCtx.beginPath(); cCtx.arc(xi,y2h,2,0,Math.PI*2);
          cCtx.fillStyle='rgba(244,180,26,'+(op*0.3)+')'; cCtx.fill();
          if(xi%24===0){
            cCtx.beginPath(); cCtx.moveTo(xi,y1h); cCtx.lineTo(xi,y2h);
            cCtx.strokeStyle='rgba(255,255,255,'+(op*0.1)+')'; cCtx.lineWidth=0.8; cCtx.stroke();
          }
        }
      } else {
        // Default cyber-matrix
        cCtx.strokeStyle = 'rgba(255, 255, 255, ' + (op*0.03) + ')';
        cCtx.lineWidth = 1;
        var gridSize = 40;
        for (var gx = 0; gx < cWidth; gx += gridSize) {
          cCtx.beginPath(); cCtx.moveTo(gx, 0); cCtx.lineTo(gx, cHeight); cCtx.stroke();
        }
        for (var gy = 0; gy < cHeight; gy += gridSize) {
          cCtx.beginPath(); cCtx.moveTo(0, gy); cCtx.lineTo(cWidth, gy); cCtx.stroke();
        }
        for (var d = 0; d < 18; d++) {
          var dx = (d * 73 + time * 0.2) % cWidth;
          var dy = (d * 41 + time * 0.15) % cHeight;
          cCtx.beginPath();
          cCtx.arc(dx, dy, 1.5, 0, Math.PI * 2);
          cCtx.fillStyle = d % 2 === 0 ? 'rgba(0, 240, 255, ' + (op*0.12) + ')' : 'rgba(244, 180, 26, ' + (op*0.12) + ')';
          cCtx.fill();
        }
      }
    },

    renderStudioCanvas: function () {
      if (!this.canvas || !this.ctx) return;
      var ctx = this.ctx;
      var width = this.canvas.width;
      var height = this.canvas.height;
      var self = this;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle background canvas effect
      this.drawCanvasBackground(ctx, width, height, this.bgEffect, this.pulseTime);

      // 1. Draw Connections
      this.connections.forEach(function (conn) {
        var fromNode = null, toNode = null;
        self.nodes.forEach(function (n) {
          if (n.id === conn.from) fromNode = n;
          if (n.id === conn.to) toNode = n;
        });

        if (!fromNode || !toNode) return;

        var p1 = { x: fromNode.x * width, y: fromNode.y * height };
        var p2 = { x: toNode.x * width, y: toNode.y * height };

        var isFromActive = (self.selectedNodeId === fromNode.id);
        var isToActive   = (self.selectedNodeId === toNode.id);
        var isConnectedToActive = isFromActive || isToActive;

        // Dynamic perspective-based color calculation:
        // Outgoing relative to active node -> Cheddar Yellow (#f4b41a)
        // Incoming relative to active node -> Cyan (#00f0ff)
        var dynamicColor = conn.color || '#00f0ff';
        var startPt = p1, endPt = p2;

        if (isConnectedToActive) {
          if (isFromActive) {
            if (conn.direction === 'incoming') {
              dynamicColor = '#00f0ff'; // Incoming to active node
              startPt = p2; endPt = p1;
            } else {
              dynamicColor = '#f4b41a'; // Outgoing from active node
              startPt = p1; endPt = p2;
            }
          } else if (isToActive) {
            if (conn.direction === 'incoming') {
              dynamicColor = '#f4b41a'; // Outgoing from active node
              startPt = p2; endPt = p1;
            } else {
              dynamicColor = '#00f0ff'; // Incoming to active node
              startPt = p1; endPt = p2;
            }
          }
        } else {
          if (conn.direction === 'incoming') {
            startPt = p2; endPt = p1;
          }
        }

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (isConnectedToActive) {
          ctx.strokeStyle = dynamicColor;
          ctx.lineWidth = 2.4;
          ctx.shadowBlur = 12;
          ctx.shadowColor = dynamicColor;
        } else {
          ctx.strokeStyle = 'rgba(0, 240, 255, ' + (self.pathOpacity !== undefined ? self.pathOpacity : 0.2) + ')';
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Animated Moving Pulse Packet
        var progress = (self.pulseTime * 0.015 * (conn.speed || 1.0)) % 1;
        var packetX = startPt.x + (endPt.x - startPt.x) * progress;
        var packetY = startPt.y + (endPt.y - startPt.y) * progress;

        ctx.beginPath();
        ctx.arc(packetX, packetY, isConnectedToActive ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isConnectedToActive ? dynamicColor : 'rgba(0, 240, 255, ' + (self.pathOpacity !== undefined ? Math.min(1, self.pathOpacity * 1.5) : 0.3) + ')';
        ctx.shadowBlur = isConnectedToActive ? 14 : Math.round(7 * (self.pathOpacity !== undefined ? self.pathOpacity : 0.2));
        ctx.shadowColor = isConnectedToActive ? dynamicColor : 'rgba(0, 240, 255, ' + (self.pathOpacity !== undefined ? self.pathOpacity : 0.2) + ')';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Draw Nodes
      this.nodes.forEach(function (node, idx) {
        var nx = node.x * width;
        var ny = node.y * height;
        var isSelected = (node.id === self.selectedNodeId);

        var radius = isSelected ? 18 : 13;

        // Outer Aura
        ctx.beginPath();
        ctx.arc(nx, ny, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(244, 180, 26, 0.25)' : 'rgba(0, 240, 255, 0.1)';
        ctx.fill();

        // Node Circle
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? (node.color || '#f4b41a') : '#0a1128';
        ctx.strokeStyle = node.color || '#00f0ff';
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = isSelected ? 16 : 6;
        ctx.shadowColor = node.color || '#00f0ff';
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Text Label
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.75)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label || 'Node', nx, ny + radius + 14);
      });
    },

    handleCanvasMouseDown: function (e) {
      if (!this.canvas) return;
      var rect = this.canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var width = this.canvas.width;
      var height = this.canvas.height;

      var found = null;
      for (var i = 0; i < this.nodes.length; i++) {
        var n = this.nodes[i];
        var nx = n.x * width;
        var ny = n.y * height;
        var dist = Math.hypot(mx - nx, my - ny);
        if (dist <= 25) {
          found = n;
          break;
        }
      }

      if (found) {
        this.selectNodeForEditing(found.id);
        if (this.allowDrag) {
          this.isDragging = true;
          this.dragNode = found;
        }
      }
    },

    cacheDOM: function () {
      this.canvas = document.getElementById('studio-graph-canvas');
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
      }

      // Node form
      this.nodeIdInput = document.getElementById('node-id');
      this.nodeLabelInput = document.getElementById('node-label');
      this.nodeColorInput = document.getElementById('node-color');
      this.nodeXInput = document.getElementById('node-x');
      this.nodeYInput = document.getElementById('node-y');
      this.nodeDescInput = document.getElementById('node-desc');
      this.nodeOutgoingInput = document.getElementById('node-outgoing');
      this.nodeIncomingInput = document.getElementById('node-incoming');
      this.nodeFormTitle = document.getElementById('node-form-title');
      this.nodeSaveBtn = document.getElementById('node-save-btn');
      this.nodeDeleteBtn = document.getElementById('node-delete-btn');

      // Connections form
      this.connFromSelect = document.getElementById('conn-from');
      this.connToSelect = document.getElementById('conn-to');
      this.connColorSelect = document.getElementById('conn-color');
      this.connDirectionSelect = document.getElementById('conn-direction');
      this.connListContainer = document.getElementById('studio-connections-list');

      // Top Cards form
      this.cardIdInput = document.getElementById('topcard-id');
      this.cardBadgeInput = document.getElementById('topcard-badge');
      this.cardTitleInput = document.getElementById('topcard-title');
      this.cardContentInput = document.getElementById('topcard-content');
      this.cardFormTitle = document.getElementById('topcard-form-title');
      this.cardSaveBtn = document.getElementById('topcard-save-btn');
      this.cardDeleteBtn = document.getElementById('topcard-delete-btn');
      this.topCardsGrid = document.getElementById('top-cards-studio-grid');

      // Header form
      this.headerBadgeInput = document.getElementById('eco-header-badge');
      this.headerTitleInput = document.getElementById('eco-header-title');
      this.headerSubtitleInput = document.getElementById('eco-header-subtitle');

      // Export modal
      this.exportModal = document.getElementById('eco-export-modal');
      this.exportCodeBlock = document.getElementById('eco-export-code');
    },

    bindEvents: function () {
      var self = this;

      if (this.canvas) {
        this.canvas.addEventListener('mousedown', function (e) { self.handleCanvasMouseDown(e); });
        this.canvas.addEventListener('mousemove', function (e) { self.handleCanvasMouseMove(e); });
        window.addEventListener('mouseup', function () { self.handleCanvasMouseUp(); });
      }

      if (this.connFromSelect) {
        this.connFromSelect.addEventListener('change', function (e) {
          if (e.target.value && e.target.value !== self.selectedNodeId) {
            self.selectNodeForEditing(e.target.value);
          }
        });
      }

      window.addEventListener('resize', function () {
        self.resizeStudioCanvas();
      });
    },

    selectNodeForEditing: function (id) {
      this.selectedNodeId = id;
      var node = null;
      for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].id === id) { node = this.nodes[i]; break; }
      }
      if (!node) return;

      this.editingNodeId = node.id;
      if (this.nodeIdInput) this.nodeIdInput.value = node.id;
      if (this.nodeLabelInput) this.nodeLabelInput.value = node.label || '';
      if (this.nodeColorInput) this.nodeColorInput.value = node.color || '#00f0ff';
      if (this.nodeXInput) this.nodeXInput.value = node.x;
      if (this.nodeYInput) this.nodeYInput.value = node.y;
      if (this.nodeDescInput) this.nodeDescInput.value = node.description || '';
      if (this.nodeOutgoingInput) this.nodeOutgoingInput.value = node.outgoing || '';
      if (this.nodeIncomingInput) this.nodeIncomingInput.value = node.incoming || '';

      var xValEl = document.getElementById('node-x-val');
      var yValEl = document.getElementById('node-y-val');
      if (xValEl) xValEl.textContent = Math.round(node.x * 100) + '%';
      if (yValEl) yValEl.textContent = Math.round(node.y * 100) + '%';

      if (this.nodeFormTitle) this.nodeFormTitle.textContent = '✏️ Edit Node: ' + node.label;
      if (this.nodeSaveBtn) this.nodeSaveBtn.textContent = '💾 Update Node';
      if (this.nodeDeleteBtn) this.nodeDeleteBtn.style.display = 'inline-block';

      this.populateConnNodeSelects();
      this.renderConnectionList();
      this.renderNodesBadgeList();
      this.renderStudioInspectorCard();
      this.renderStudioCanvas();
    },

    resetNodeForm: function () {
      this.editingNodeId = null;
      if (this.nodeIdInput) this.nodeIdInput.value = '';
      if (this.nodeLabelInput) this.nodeLabelInput.value = '';
      if (this.nodeColorInput) this.nodeColorInput.value = '#00f0ff';
      if (this.nodeXInput) this.nodeXInput.value = 0.50;
      if (this.nodeYInput) this.nodeYInput.value = 0.50;
      if (this.nodeDescInput) this.nodeDescInput.value = '';
      if (this.nodeOutgoingInput) this.nodeOutgoingInput.value = '';
      if (this.nodeIncomingInput) this.nodeIncomingInput.value = '';

      var xValEl = document.getElementById('node-x-val');
      var yValEl = document.getElementById('node-y-val');
      if (xValEl) xValEl.textContent = '50%';
      if (yValEl) yValEl.textContent = '50%';

      if (this.nodeFormTitle) this.nodeFormTitle.textContent = '➕ Add New Graph Node';
      if (this.nodeSaveBtn) this.nodeSaveBtn.textContent = '➕ Save Node';
      if (this.nodeDeleteBtn) this.nodeDeleteBtn.style.display = 'none';
    },

    saveNode: function () {
      var label = this.nodeLabelInput ? this.nodeLabelInput.value.trim() : '';
      if (!label) { alert('Please enter a Node Label Name.'); return; }

      var color = this.nodeColorInput ? this.nodeColorInput.value : '#00f0ff';
      var x = parseFloat(this.nodeXInput ? this.nodeXInput.value : '0.5');
      var y = parseFloat(this.nodeYInput ? this.nodeYInput.value : '0.5');
      var desc = this.nodeDescInput ? this.nodeDescInput.value.trim() : '';
      var outgoing = this.nodeOutgoingInput ? this.nodeOutgoingInput.value.trim() : '';
      var incoming = this.nodeIncomingInput ? this.nodeIncomingInput.value.trim() : '';

      var id = this.editingNodeId || label.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!id) id = 'node-' + Date.now();

      var nodeObj = {
        id: id,
        label: label,
        description: desc || (label + ' channel node of iConnect Publication.'),
        outgoing: outgoing || ('Yellow Line Motion: Outgoing data signals stream from ' + label + '.'),
        incoming: incoming || ('Blue Line Motion: Incoming telemetry feeds into ' + label + '.'),
        x: x,
        y: y,
        color: color
      };

      if (this.editingNodeId) {
        for (var i = 0; i < this.nodes.length; i++) {
          if (this.nodes[i].id === this.editingNodeId) {
            this.nodes[i] = nodeObj;
            break;
          }
        }
      } else {
        this.nodes.push(nodeObj);
      }

      this.selectedNodeId = nodeObj.id;
      window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections);
      this.populateConnNodeSelects();
      this.renderConnectionList();
      this.renderNodesBadgeList();
      this.renderStudioCanvas();
      this.resetNodeForm();
      alert('✅ Node "' + label + '" saved successfully and published live!');
    },

    deleteSelectedNode: function () {
      if (!this.editingNodeId) return;
      var id = this.editingNodeId;
      var self = this;

      if (confirm('Delete node "' + id + '" and all connecting animated lines?')) {
        this.nodes = this.nodes.filter(function (n) { return n.id !== id; });
        this.connections = this.connections.filter(function (c) { return c.from !== id && c.to !== id; });

        if (this.nodes.length > 0) {
          this.selectedNodeId = this.nodes[0].id;
        } else {
          this.selectedNodeId = null;
        }

        window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections);
        this.populateConnNodeSelects();
        this.renderConnectionList();
        this.renderNodesBadgeList();
        this.renderStudioCanvas();
        this.resetNodeForm();
      }
    },

    renderNodesBadgeList: function () {
      var container = document.getElementById('studio-nodes-badge-list');
      if (!container) return;
      var self = this;

      var html = this.nodes.map(function (n) {
        var isSelected = (n.id === self.selectedNodeId);
        var activeStyle = isSelected
          ? 'background:rgba(244,180,26,0.2); border-color:#f4b41a; color:#f4b41a;'
          : 'background:rgba(255,255,255,0.04); border-color:rgba(255,255,255,0.1); color:var(--text-subtle);';

        return '<button type="button" class="toolbar-btn" style="' + activeStyle + ' padding:0.35rem 0.75rem; font-size:0.78rem; font-weight:700; border-radius:999px;" onclick="EcosystemStudio.selectNodeForEditing(\'' + n.id + '\')">' +
          '📍 ' + n.label +
        '</button>';
      }).join('');

      container.innerHTML = html;
    },

    /* --- ANIMATED CONNECTIONS (Independent Per Selected Node) --- */
    populateConnNodeSelects: function () {
      if (!this.connFromSelect || !this.connToSelect) return;
      var self = this;

      var selNode = null;
      if (this.selectedNodeId) {
        this.nodes.forEach(function (n) { if (n.id === self.selectedNodeId) selNode = n; });
      }

      var fromHtml = this.nodes.map(function (n) {
        var isSel = (n.id === self.selectedNodeId);
        return '<option value="' + n.id + '"' + (isSel ? ' selected' : '') + '>' + n.label + (isSel ? ' (Active Selected Node)' : '') + '</option>';
      }).join('');
      this.connFromSelect.innerHTML = fromHtml;

      if (this.selectedNodeId) {
        this.connFromSelect.value = this.selectedNodeId;
      }

      var toNodes = this.nodes.filter(function (n) {
        return n.id !== self.selectedNodeId;
      });
      var toHtml = toNodes.map(function (n) {
        return '<option value="' + n.id + '">' + n.label + '</option>';
      }).join('');
      this.connToSelect.innerHTML = toHtml;
    },

    addConnection: function () {
      var from = (this.connFromSelect && this.connFromSelect.value) ? this.connFromSelect.value : this.selectedNodeId;
      var to = this.connToSelect ? this.connToSelect.value : '';
      if (!from || !to) { alert('Please select a target To Node.'); return; }
      if (from === to) { alert('From Node and To Node cannot be the same.'); return; }

      var color = this.connColorSelect ? this.connColorSelect.value : '#f4b41a';
      var direction = this.connDirectionSelect ? this.connDirectionSelect.value : 'outgoing';

      var connObj = {
        from: from,
        to: to,
        color: color,
        speed: 1.0,
        direction: direction
      };

      this.connections.push(connObj);
      window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections);
      this.renderConnectionList();
      this.renderStudioCanvas();
    },

    deleteConnection: function (idx) {
      if (idx >= 0 && idx < this.connections.length) {
        this.connections.splice(idx, 1);
        window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections);
        this.renderConnectionList();
        this.renderStudioCanvas();
      }
    },

    renderConnectionList: function () {
      if (!this.connListContainer) return;
      var self = this;

      var selNode = null;
      if (this.selectedNodeId) {
        this.nodes.forEach(function (n) { if (n.id === self.selectedNodeId) selNode = n; });
      }

      var nodeName = selNode ? selNode.label : 'Selected Node';

      // FILTER STRICTLY FOR LINES OWNED/ORIGINATING FROM THIS SPECIFIC NODE:
      var filtered = this.connections.filter(function (c) {
        if (!self.selectedNodeId) return true;
        return c.from === self.selectedNodeId;
      });

      if (filtered.length === 0) {
        this.connListContainer.innerHTML = '<div style="color:var(--text-subtle); font-size:0.8rem; text-align:center; padding:1.25rem 1rem; background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); border-radius:10px;">' +
          '⚡ No custom connection lines configured for <strong>' + nodeName + '</strong> yet.<br><span style="font-size:0.75rem; opacity:0.75; display:inline-block; margin-top:0.35rem;">Add a connection line above to define independent line flow for this node.</span>' +
        '</div>';
        return;
      }

      var html = filtered.map(function (c) {
        var realIdx = self.connections.indexOf(c);

        var fromNode = null, toNode = null;
        self.nodes.forEach(function (n) {
          if (n.id === c.from) fromNode = n;
          if (n.id === c.to) toNode = n;
        });

        var fromLabel = fromNode ? fromNode.label : c.from;
        var toLabel = toNode ? toNode.label : c.to;
        var dirText = (c.direction === 'both') ? 'bi-directional' : (c.direction === 'incoming' ? 'incoming' : 'outgoing');
        var arrowSymbol = (c.direction === 'both') ? ' ↔️ ' : (c.direction === 'incoming' ? ' ⬅️ ' : ' ➔ ');

        return '<div style="display:flex; align-items:center; justify-content:space-between; padding:0.5rem 0.8rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; font-size:0.82rem; margin-bottom:0.4rem;">' +
          '<div>' +
            '<span style="color:' + (c.color || '#f4b41a') + '; font-weight:700;">' + fromLabel + arrowSymbol + toLabel + '</span> ' +
            '<span style="font-size:0.7rem; color:var(--text-subtle); background:rgba(255,255,255,0.06); padding:0.15rem 0.45rem; border-radius:4px; margin-left:0.35rem;">(' + dirText + ')</span>' +
          '</div>' +
          '<button type="button" class="ed-btn ed-btn-del" onclick="EcosystemStudio.deleteConnection(' + realIdx + ')" style="padding:0.22rem 0.55rem; font-size:0.74rem;">🗑 Delete</button>' +
        '</div>';
      }).join('');

      this.connListContainer.innerHTML = html;
    },

    switchTab: function (tabId, btnEl) {
      var panes = document.querySelectorAll('.tab-pane');
      panes.forEach(function (p) { p.classList.remove('active'); });

      var btns = document.querySelectorAll('.tab-btn');
      btns.forEach(function (b) { b.classList.remove('active'); });

      var target = document.getElementById(tabId);
      if (target) target.classList.add('active');
      if (btnEl) btnEl.classList.add('active');

      if (tabId === 'nodes-tab') {
        setTimeout(function () { self.resizeStudioCanvas(); }, 50);
      }
    },

    renderAll: function () {
      this.populateConnNodeSelects();
      this.renderConnectionList();
      this.renderNodesBadgeList();
      this.renderStudioInspectorCard();
      this.renderTopCardsGrid();
      this.loadHeaderSettingsForm();
      this.resizeStudioCanvas();
    },

    updateNodeDraftLive: function () {
      if (!this.selectedNodeId) return;
      var label = this.nodeLabelInput ? this.nodeLabelInput.value.trim() : '';
      var desc = this.nodeDescInput ? this.nodeDescInput.value.trim() : '';
      var outgoing = this.nodeOutgoingInput ? this.nodeOutgoingInput.value.trim() : '';
      var incoming = this.nodeIncomingInput ? this.nodeIncomingInput.value.trim() : '';

      for (var i = 0; i < this.nodes.length; i++) {
        if (this.nodes[i].id === this.selectedNodeId) {
          if (label) this.nodes[i].label = label;
          this.nodes[i].description = desc;
          this.nodes[i].outgoing = outgoing;
          this.nodes[i].incoming = incoming;
          break;
        }
      }

      this.renderStudioInspectorCard();
      this.renderStudioCanvas();
    },

    renderStudioInspectorCard: function () {
      var panel = document.getElementById('studio-inspector-panel');
      if (!panel) return;

      var node = null;
      var self = this;
      if (this.selectedNodeId) {
        for (var i = 0; i < this.nodes.length; i++) {
          if (this.nodes[i].id === this.selectedNodeId) { node = this.nodes[i]; break; }
        }
      }
      if (!node && this.nodes.length > 0) {
        node = this.nodes[0];
      }
      if (!node) {
        panel.innerHTML = '<p style="color:var(--text-subtle); text-align:center;">No node created yet.</p>';
        return;
      }

      var rawOutgoing = node.outgoing || 'Yellow signals stream student articles, code proposals, and campus insights outward into the publication network.';
      var rawIncoming = node.incoming || 'Blue signals deliver published news stories, editorial feedback, and technical updates back to the BSCS student body.';

      var cleanOutgoing = rawOutgoing.replace(/^(Yellow Line Motion:\s*)+/gi, '').trim();
      var cleanIncoming = rawIncoming.replace(/^(Blue Line Motion:\s*)+/gi, '').trim();

      panel.innerHTML =
        '<div>' +
          '<h3 style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:var(--cheddar-yellow); margin:0 0 0.85rem 0; display:flex; align-items:center; gap:0.6rem;">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cheddar-yellow)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
            (node.label || 'Node') +
          '</h3>' +
          '<p style="color:var(--text-muted); font-size:0.88rem; line-height:1.6; margin:0 0 1.25rem 0;">' +
            (node.description || 'No description entered yet.') +
          '</p>' +

          '<div style="background:rgba(5,11,26,0.6); border:1px solid rgba(244,180,26,0.25); border-radius:12px; padding:1rem; margin-bottom:0.85rem;">' +
            '<span style="font-family:var(--font-mono); font-size:0.7rem; font-weight:800; color:var(--cheddar-yellow); background:rgba(244,180,26,0.15); padding:0.2rem 0.6rem; border-radius:999px; letter-spacing:0.08em; text-transform:uppercase; display:inline-block; margin-bottom:0.4rem;">OUTWARD FLOW</span>' +
            '<p style="font-size:0.82rem; line-height:1.5; color:#fff; margin:0;">' +
              '<strong style="color:var(--cheddar-yellow);">Yellow Line Motion:</strong> ' + cleanOutgoing +
            '</p>' +
          '</div>' +

          '<div style="background:rgba(5,11,26,0.6); border:1px solid rgba(0,240,255,0.25); border-radius:12px; padding:1rem;">' +
            '<span style="font-family:var(--font-mono); font-size:0.7rem; font-weight:800; color:#00f0ff; background:rgba(0,240,255,0.15); padding:0.2rem 0.6rem; border-radius:999px; letter-spacing:0.08em; text-transform:uppercase; display:inline-block; margin-bottom:0.4rem;">INWARD FLOW</span>' +
            '<p style="font-size:0.82rem; line-height:1.5; color:#fff; margin:0;">' +
              '<strong style="color:#00f0ff;">Blue Line Motion:</strong> ' + cleanIncoming +
            '</p>' +
          '</div>' +
        '</div>';
    },

    /* --- CANVAS & INTERACTIVE NODE DRAGGING --- */
    resizeStudioCanvas: function () {
      if (!this.canvas) return;
      var parent = this.canvas.parentElement;
      var rect = parent ? parent.getBoundingClientRect() : { width: 600, height: 480 };
      this.canvas.width = Math.max(300, rect.width || this.canvas.offsetWidth || 600);
      this.canvas.height = Math.max(350, rect.height || this.canvas.offsetHeight || 480);
      this.renderStudioCanvas();
    },

    startStudioAnimation: function () {
      var self = this;
      function loop() {
        self.pulseTime += 1;
        self.renderStudioCanvas();
        self.animFrame = requestAnimationFrame(loop);
      }
      loop();
    },

    renderStudioCanvas: function () {
      if (!this.ctx || !this.canvas) return;
      var ctx = this.ctx;
      if (!this.canvas.width || !this.canvas.height || this.canvas.width <= 0 || this.canvas.height <= 0) {
        this.resizeStudioCanvas();
      }
      var width = this.canvas.width;
      var height = this.canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (var x = 0; x < width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (var y = 0; y < height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      var self = this;
      var activeNode = null;
      for (var n = 0; n < this.nodes.length; n++) {
        if (this.nodes[n].id === this.selectedNodeId) { activeNode = this.nodes[n]; break; }
      }

      // 1. Draw Connection Lines
      this.connections.forEach(function (conn) {
        var fromNode = null, toNode = null;
        self.nodes.forEach(function (node) {
          if (node.id === conn.from) fromNode = node;
          if (node.id === conn.to) toNode = node;
        });

        if (!fromNode || !toNode) return;

        var p1 = { x: fromNode.x * width, y: fromNode.y * height };
        var p2 = { x: toNode.x * width, y: toNode.y * height };

        var isConnectedToActive = activeNode && (activeNode.id === fromNode.id || activeNode.id === toNode.id);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        var color = conn.color || '#00f0ff';
        if (isConnectedToActive) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.shadowBlur = 12;
          ctx.shadowColor = color;
        } else {
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
          ctx.lineWidth = 1.2;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Animated Moving Pulse Packet
        var progress = (self.pulseTime * 0.018 * (conn.speed || 1.0)) % 1;

        var drawPulsePacket = function (prg, dir) {
          var startPt = p1, endPt = p2;
          if (dir === 'incoming') { startPt = p2; endPt = p1; }

          var packetX = startPt.x + (endPt.x - startPt.x) * prg;
          var packetY = startPt.y + (endPt.y - startPt.y) * prg;

          ctx.beginPath();
          ctx.arc(packetX, packetY, isConnectedToActive ? 5.5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.shadowBlur = 16;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.shadowBlur = 0;
        };

        if (conn.direction === 'both') {
          drawPulsePacket(progress, 'outgoing');
          drawPulsePacket((progress + 0.5) % 1, 'incoming');
        } else {
          drawPulsePacket(progress, conn.direction);
        }
      });

      // 2. Draw Nodes
      this.nodes.forEach(function (node, idx) {
        var nx = node.x * width;
        var ny = node.y * height;
        var isSelected = (node.id === self.selectedNodeId);

        var radius = isSelected ? 18 : 13;

        // Outer Aura
        ctx.beginPath();
        ctx.arc(nx, ny, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(244, 180, 26, 0.25)' : 'rgba(0, 240, 255, 0.1)';
        ctx.fill();

        // Node Circle
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? (node.color || '#f4b41a') : '#0a1128';
        ctx.strokeStyle = node.color || '#00f0ff';
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = isSelected ? 16 : 6;
        ctx.shadowColor = node.color || '#00f0ff';
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Text Label
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255,255,255,0.75)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label || 'Node', nx, ny + radius + 14);
      });
    },

    handleCanvasMouseDown: function (e) {
      if (!this.canvas) return;
      var rect = this.canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var width = this.canvas.width;
      var height = this.canvas.height;

      var found = null;
      for (var i = 0; i < this.nodes.length; i++) {
        var n = this.nodes[i];
        var nx = n.x * width;
        var ny = n.y * height;
        var dist = Math.hypot(mx - nx, my - ny);
        if (dist <= 25) {
          found = n;
          break;
        }
      }

      if (found) {
        this.isDragging = true;
        this.dragNode = found;
        this.selectNodeForEditing(found.id);
      }
    },

    handleCanvasMouseMove: function (e) {
      if (!this.isDragging || !this.dragNode || !this.canvas) return;
      var rect = this.canvas.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var width = this.canvas.width;
      var height = this.canvas.height;

      var normX = Math.max(0.05, Math.min(0.95, mx / width));
      var normY = Math.max(0.05, Math.min(0.95, my / height));

      this.dragNode.x = parseFloat(normX.toFixed(2));
      this.dragNode.y = parseFloat(normY.toFixed(2));

      if (this.nodeXInput) this.nodeXInput.value = this.dragNode.x;
      if (this.nodeYInput) this.nodeYInput.value = this.dragNode.y;
      var xValEl = document.getElementById('node-x-val');
      var yValEl = document.getElementById('node-y-val');
      if (xValEl) xValEl.textContent = Math.round(this.dragNode.x * 100) + '%';
      if (yValEl) yValEl.textContent = Math.round(this.dragNode.y * 100) + '%';

      this.renderStudioCanvas();
    },

    handleCanvasMouseUp: function () {
      if (this.isDragging) {
        window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections);
      }
      this.isDragging = false;
      this.dragNode = null;
    },

    /* --- TOP EXPLANATORY CARDS --- */
    renderTopCardsGrid: function () {
      if (!this.topCardsGrid) return;
      var self = this;

      var html = this.cards.map(function (c, idx) {
        var isCyan = (idx === 1);
        var topBorder = isCyan ? '#00f0ff' : '#f4b41a';
        var badgeBg = isCyan ? 'rgba(0,240,255,0.15)' : 'rgba(244,180,26,0.15)';
        var badgeText = isCyan ? '#00f0ff' : 'var(--cheddar-yellow)';
        var badgeBorder = isCyan ? 'rgba(0,240,255,0.3)' : 'rgba(244,180,26,0.3)';
        return '<div class="about-feature-card" style="flex-direction:column; align-items:flex-start; position:relative; border-top:4px solid ' + topBorder + ';">' +
          '<span class="feature-tag" style="background:' + badgeBg + '; color:' + badgeText + '; border:1px solid ' + badgeBorder + '; font-size:0.72rem; padding:0.2rem 0.6rem; border-radius:999px; font-family:var(--font-mono); font-weight:700; margin-bottom:0.6rem;">' + c.badge + '</span>' +
          '<h3 class="feature-title" style="font-size:1.05rem; margin-bottom:0.5rem;">' + c.title + '</h3>' +
          '<p class="feature-desc" style="font-size:0.85rem; line-height:1.5;">' + c.content + '</p>' +
          '<div style="display:flex; gap:0.5rem; margin-top:1rem; width:100%; justify-content:flex-end;">' +
            '<button type="button" class="ed-btn ed-btn-edit" onclick="EcosystemStudio.editTopCard(\'' + c.id + '\')">✏️ Edit Card</button>' +
            '<button type="button" class="ed-btn ed-btn-del" onclick="EcosystemStudio.deleteTopCard(\'' + c.id + '\')">🗑 Delete</button>' +
          '</div>' +
        '</div>';
      }).join('');

      this.topCardsGrid.innerHTML = html;
    },

    editTopCard: function (id) {
      var card = null;
      for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].id === id) { card = this.cards[i]; break; }
      }
      if (!card) return;

      this.editingCardId = card.id;
      if (this.cardIdInput) this.cardIdInput.value = card.id;
      if (this.cardBadgeInput) this.cardBadgeInput.value = card.badge || '';
      if (this.cardTitleInput) this.cardTitleInput.value = card.title || '';
      if (this.cardContentInput) this.cardContentInput.value = card.content || '';

      if (this.cardFormTitle) this.cardFormTitle.textContent = '✏️ Edit Explanatory Card';
      if (this.cardSaveBtn) this.cardSaveBtn.textContent = '💾 Update Card';
      if (this.cardDeleteBtn) this.cardDeleteBtn.style.display = 'inline-block';
    },

    resetTopCardForm: function () {
      this.editingCardId = null;
      if (this.cardIdInput) this.cardIdInput.value = '';
      if (this.cardBadgeInput) this.cardBadgeInput.value = '';
      if (this.cardTitleInput) this.cardTitleInput.value = '';
      if (this.cardContentInput) this.cardContentInput.value = '';

      if (this.cardFormTitle) this.cardFormTitle.textContent = '➕ Add Explanatory Card';
      if (this.cardSaveBtn) this.cardSaveBtn.textContent = '➕ Save Card';
      if (this.cardDeleteBtn) this.cardDeleteBtn.style.display = 'none';
    },

    saveTopCard: function () {
      var badge = this.cardBadgeInput ? this.cardBadgeInput.value.trim() : '';
      var title = this.cardTitleInput ? this.cardTitleInput.value.trim() : '';
      var content = this.cardContentInput ? this.cardContentInput.value.trim() : '';

      if (!badge || !title || !content) {
        alert('Please fill in all card fields.');
        return;
      }

      var cardObj = {
        id: this.editingCardId || ('top-card-' + Date.now()),
        badge: badge,
        title: title,
        content: content
      };

      if (this.editingCardId) {
        for (var i = 0; i < this.cards.length; i++) {
          if (this.cards[i].id === this.editingCardId) {
            this.cards[i] = cardObj;
            break;
          }
        }
      } else {
        this.cards.push(cardObj);
      }

      window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections);
      this.renderTopCardsGrid();
      this.resetTopCardForm();
      alert('✅ Explanatory Card Saved and published live!');
    },

    deleteTopCard: function (id) {
      if (confirm('Delete this explanatory card?')) {
        this.cards = this.cards.filter(function (c) { return c.id !== id; });
        window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections);
        this.renderTopCardsGrid();
        this.resetTopCardForm();
      }
    },

    deleteSelectedTopCard: function () {
      if (this.editingCardId) this.deleteTopCard(this.editingCardId);
    },

    /* --- HEADER SETTINGS --- */
    loadHeaderSettingsForm: function () {
      if (this.headerBadgeInput) this.headerBadgeInput.value = this.header.badge || '';
      if (this.headerTitleInput) this.headerTitleInput.value = this.header.title || '';
      if (this.headerSubtitleInput) this.headerSubtitleInput.value = this.header.subtitle || '';
    },

    saveHeaderSettings: function () {
      var badge = this.headerBadgeInput ? this.headerBadgeInput.value.trim() : '';
      var title = this.headerTitleInput ? this.headerTitleInput.value.trim() : '';
      var subtitle = this.headerSubtitleInput ? this.headerSubtitleInput.value.trim() : '';

      if (!title) { alert('Please enter Section Title.'); return; }

      this.header = {
        badge: badge || 'INTERACTIVE PUBLICATION ECOSYSTEM',
        title: title,
        subtitle: subtitle
      };

      window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections, this.bgEffect, this.bgOpacity, this.allowDrag);
      alert('✅ Header Settings Saved and published live!');
    },

    /* --- PUBLISH & EXPORT --- */
    publishLive: function () {
      window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections, this.bgEffect, this.bgOpacity, this.allowDrag);
      alert('🎉 Ecosystem Graph Live Sync Complete!\n\nAll node coordinates, animated connection lines, cards, and section titles are now published live across iConnect.');
    },

    openExportModal: function () {
      if (!this.exportModal || !this.exportCodeBlock) return;
      var jsCode = '/* Copy & Paste into js/ecosystem.js */\n\n' +
        'window.ecosystemHeaderData = ' + JSON.stringify(this.header, null, 2) + ';\n\n' +
        'window.ecosystemTopCardsData = ' + JSON.stringify(this.cards, null, 2) + ';\n\n' +
        'window.ecosystemNodesData = ' + JSON.stringify(this.nodes, null, 2) + ';\n\n' +
        'window.ecosystemConnectionsData = ' + JSON.stringify(this.connections, null, 2) + ';\n';

      this.exportCodeBlock.textContent = jsCode;
      this.exportModal.classList.add('open');
    },

    closeExportModal: function () {
      if (this.exportModal) this.exportModal.classList.remove('open');
    },

    copyExportCode: function () {
      if (!this.exportCodeBlock) return;
      var text = this.exportCodeBlock.textContent;
      navigator.clipboard.writeText(text).then(function () {
        alert('📋 Ecosystem JS Code Copied to Clipboard!');
      });
    },

    downloadUpdatedEcosystemJS: function () {
      var content = '/* ==========================================================================\n' +
        '   iCONNECT PUBLICATION — ECOSYSTEM GRAPH DATASTORE (js/ecosystem.js)\n' +
        '   Updated via Ecosystem Studio Manager\n' +
        '   ========================================================================== */\n\n' +
        'window.ecosystemHeaderData = ' + JSON.stringify(this.header, null, 2) + ';\n\n' +
        'window.ecosystemTopCardsData = ' + JSON.stringify(this.cards, null, 2) + ';\n\n' +
        'window.ecosystemNodesData = ' + JSON.stringify(this.nodes, null, 2) + ';\n\n' +
        'window.ecosystemConnectionsData = ' + JSON.stringify(this.connections, null, 2) + ';\n';

      var blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'ecosystem.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    resetDefaults: function () {
      if (confirm('Reset Ecosystem Graph to factory default nodes and connections?')) {
        this.header = window.defaultEcosystemHeaderData;
        this.cards = window.defaultEcosystemTopCardsData;
        this.nodes = window.defaultEcosystemNodesData;
        this.connections = window.defaultEcosystemConnectionsData;

        window.saveEcosystemData(this.header, this.cards, this.nodes, this.connections);
        this.renderAll();
        alert('🔄 Ecosystem Graph Reset to Factory Defaults!');
      }
    }
  };

  window.EcosystemStudio = EcosystemStudio;

  document.addEventListener('DOMContentLoaded', function () {
    EcosystemStudio.init();
  });

})(window);
